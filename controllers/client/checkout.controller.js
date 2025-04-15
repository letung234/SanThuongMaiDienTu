const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const { VietQR } = require("vietqr");
const Discount = require("../../models/discount.model");
const QRCode = require("qrcode");
require("dotenv").config();
let vietQR = new VietQR({
  clientID: "947f5b7e-41f2-4a02-abc2-d0d78c2c38d7",
  apiKey: "5787eb7f-34c1-43a5-8b6d-3ee7d6b83319",
});
//[GET]/checkout/
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({ _id: cartId }).lean();

  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const product = await Product.findOne({
        _id: item.product_id,
      }).select("title thumbnail variants price discountPercentage slug");

      // Xử lý giá và ảnh cho biến thể
      let price = item.price;
      let discount = item.discountPercentage;
      let thumbnail = product.thumbnail[0];

      if (item.variant) {
        const variantGroup = product.variants.find(
          (v) => v.name === item.variant.name
        );
        if (variantGroup) {
          const variantValue = variantGroup.value.find(
            (v) => v.value === item.variant.value
          );
          if (variantValue) {
            price = variantValue.price;
            discount = variantValue.discountPercentage;
            thumbnail =
              product.thumbnail[variantValue.thumbnailPosition] || thumbnail;
          }
        }
      }

      // Tính toán giá và gán thông tin
      item.productInfo = {
        title: product.title,
        slug: product.slug,
        thumbnail: thumbnail,
        priceNew: (price * (1 - discount / 100)).toFixed(0),
      };

      item.variantDetails = item.variant;
      item.totalPrice = item.productInfo.priceNew * item.quantity;
    }
  }

  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  res.render("client/pages/checkout/index", {
    pageTitle: "Đặt hàng",
    cartDetail: cart,
    helpers: {
      formatNumber: (number) => new Intl.NumberFormat().format(number),
    },
  });
};

// [POST]/checkout/order
module.exports.order = async (req, res) => {
  try {
    const user = res.locals.user;
    const cartId = req.cookies.cartId;
    const userInfo = req.body;
    if (user) userInfo.userId = user.id;

    const cart = await Cart.findOne({ _id: cartId });
    const products = [];

    for (const item of cart.products) {
      const product = await Product.findOne({ _id: item.product_id });

      let price = product.price;
      let discount = product.discountPercentage;
      let variantDetails = null;

      // Xử lý biến thể
      if (item.variant) {
        const variantGroup = product.variants.find(
          (v) => v.name === item.variant.name
        );
        if (variantGroup) {
          const variantValue = variantGroup.value.find(
            (v) => v.value === item.variant.value
          );
          if (variantValue) {
            price = variantValue.price;
            discount = variantValue.discountPercentage;
            variantDetails = {
              name: variantGroup.name,
              value: variantValue.value,
            };

            // Kiểm tra tồn kho biến thể
            if (variantValue.stock < item.quantity || variantValue.stock < 1) {
              req.flash(
                "error",
                `Sản phẩm "${product.title}" - ${variantGroup.name}: ${variantValue.value} không đủ số lượng`
              );
              return res.redirect("back");
            }
          }
        }
      } else {
        // Kiểm tra tồn kho sản phẩm đơn
        if (product.stock < item.quantity || product.stock < 1) {
          req.flash("error", `Sản phẩm "${product.title}" không đủ số lượng`);
          return res.redirect("back");
        }
      }

      const productData = {
        product_id: item.product_id,
        product_title: product.title,
        variant: variantDetails,
        price: price,
        discountPercentage: discount,
        quantity: item.quantity,
        thumbnail: product.thumbnail[0],
        priceNew: (price * (1 - discount / 100)).toFixed(0),
        totalPrice: (price * (1 - discount / 100) * item.quantity).toFixed(0),
        supplier_id: product.createdBy.account_id,
      };
      products.push(productData);
    }

    let totalPrice = products.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );
    const { discountCode } = req.body;
    let discount = null;
    // Xử lý mã giảm giá
    if (discountCode) {
      discount = await Discount.findOne({
        slug: discountCode,
        status: "active",
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!discount) {
        req.flash("error", "Mã giảm giá không hợp lệ hoặc đã hết hạn");
        return res.redirect("back");
      }

      if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
        req.flash("error", "Mã giảm giá đã hết lượt sử dụng");
        return res.redirect("back");
      }
    }

    // Áp dụng giảm giá
    if (discount) {
      let isValid = false;
      let total = -1 ;

      // Kiểm tra điều kiện áp dụng
      switch (discount.discount_type) {
        case "order_amount":
          if (totalPrice >= discount.order_amount) isValid = true;
          break;

        case "product":
          total= 0;
          isValid = products.forEach(
            (p) =>{
              if(p.product_id.toString() === discount.product_id.toString()){
                total += p.totalPrice;
                isValid = true;
              }
            }
          );
          break;

        case "category":
          total= 0; 
          const productIds = await Product.find({
            product_category_id: discount.category_id,
          }).distinct("_id");
          productIds.forEach((e) => {
            products.forEach((p) => {
              if (p.product_id.toString() === e.toString()) {
                total += p.totalPrice;
                isValid = true;
              }
              
            });
          });
          break;
      }

      if (!isValid) {
        req.flash("error", "Mã giảm giá không áp dụng cho đơn hàng này");
        return res.redirect("back");
      }

      // Tính toán giá trị giảm
      let discountAmount = 0;
      if (discount.discount_unit === "percentage") {
        discountAmount = (total != -1 ? total : totalPrice)* (discount.discount_value / 100);
      } else {
        discountAmount = discount.discount_value;
      }
      console.log(discountAmount)

      totalPrice = Math.max(totalPrice - discountAmount, 0);

      await Discount.updateOne(
        { _id: discount._id },
        { $inc: { used_count: 1 } }
      );
    }

    const orderInfo = {
      cart_id: cartId,
      userInfo: userInfo,
      products: products,
      totalPrice: totalPrice,
      status: 1,
      discountCode: discount?.slug,
      discountValue: discount?.discount_value,
      totalAfterDiscount: totalPrice,
      totalPrice: totalPrice,
    };

    const order = new Order(orderInfo);
    await order.save();

    console.log(orderInfo.totalPrice);
    let link = vietQR.genQuickLink({
      bank: "970422",
      accountName: "Lê Thanh Tùng",
      accountNumber: "0347754069",
      amount: `${orderInfo.totalPrice * 23000}`,
      memo: `Thanh toán đơn hàng \n 
     Mã đơn hàng: ${order._id} \n
     Số Tiền là : ${orderInfo.totalPrice * 23000} VNĐ`,
      template: "compact",
      media: ".jpg",
    });

    const qrCode = link;

    await Cart.updateOne({ _id: cartId }, { products: [] });

    res.redirect(
      `/checkout/success/${order._id}?qr=${encodeURIComponent(qrCode)}`
    );
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra khi tạo đơn hàng");
    return res.redirect("back");
  }
};

// [GET]/checkout/success/:orderId
module.exports.success = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId });
    const qrCode = req.query.qr;

    for (const product of order.products) {
      const productInfo = await Product.findOne({ _id: product.product_id });

      // Cập nhật tồn kho
      if (JSON.stringify(product.variant) != "{}") {
        await Product.updateOne(
          {
            _id: product.product_id,
            "variants.name": product.variant.name,
            "variants.value.value": product.variant.value,
          },
          {
            $inc: {
              "variants.$[variant].value.$[value].stock": -product.quantity,
            },
          },
          {
            arrayFilters: [
              { "variant.name": product.variant.name },
              { "value.value": product.variant.value },
            ],
          }
        );
      } else {
        await Product.updateOne(
          { _id: product.product_id },
          { $inc: { stock: -product.quantity } }
        );
      }
    }
    res.render("client/pages/checkout/success", {
      pageTitle: "Đặt hàng thành công",
      order: order,
      qrCode: qrCode,
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Có lỗi xảy ra khi xử lý đơn hàng");
    return res.redirect("back");
  }
};
// [GET] /checkout/history
module.exports.history = async (req, res) => {
  const { page = 1, status, keyword } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;

  const query = { deleted: false, "userInfo.userId": res.locals.user.id };

  if (status) query.status = status;
  if (keyword) {
    query.$or = [
      { "userInfo.fullName": { $regex: keyword, $options: "i" } },
      { "userInfo.phone": { $regex: keyword, $options: "i" } },
      { "userInfo.address": { $regex: keyword, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.render("client/pages/checkout/history.pug", {
    pageTitle: "Đơn hàng của bạn",
    orders,
    currentPage: parseInt(page),
    totalPages,
    statusFilter: status || "",
    keyword: keyword || "",
    statusOptions: {
      1: "Đang xử lý",
      2: "Đã thanh toán",
      3: "Đã hủy",
      4: "Hoàn thành",
    },
  });
};
