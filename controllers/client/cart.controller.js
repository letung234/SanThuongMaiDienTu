const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const productHelper = require("../../helpers/products");
module.exports.addPost = async (req, res) => {
  try {
    const { productId, quantity, price, discount, variants } = req.body;
    const cartId = req.cookies.cartId;

    if (!cartId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(price);
    const parsedDiscount = parseInt(discount);

    // Xử lý biến thể
    let variantData = null;
    if (variants && variants.name && variants.value) {
      variantData = {
        name: variants.name,
        value: variants.value,
      };
    }

    // Tìm giỏ hàng
    let cart = await Cart.findById(cartId);
    if (!cart) {
      // Tạo mới giỏ hàng nếu không tồn tại
      cart = new Cart({
        _id: cartId,
        products: [],
      });
    }

    // Tìm sản phẩm trùng
   
      if (variantData == null) {
          const existingProductIndex = cart.products.findIndex(
            (item) =>
              item.product_id === productId &&
              item.price === parsedPrice &&
              item.discountPercentage === parsedDiscount
          );
           if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += parsedQuantity;
           }else{
            cart.products.push({
              product_id: productId,
              quantity: parsedQuantity,
              price: parsedPrice,
              discountPercentage: parsedDiscount,
            });
           }
        }
      else {
        const existingProductIndex = cart.products.findIndex(
            (item) =>
              item.product_id === productId &&
              item.price === parsedPrice &&
              item.discountPercentage === parsedDiscount &&
              item.variant.name === variantData.name &&
              item.variant.value === variantData.value 
          );
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += parsedQuantity;
           }else{
            cart.products.push({
              product_id: productId,
              quantity: parsedQuantity,
              variant: variantData,
              price: parsedPrice,
              discountPercentage: parsedDiscount,
            });
           }
      }
        

    await cart.save();

    res.json({
      success: true,
      message: "Thêm vào giỏ hàng thành công",
      cartCount: cart.products.reduce((acc, item) => acc + item.quantity, 0),
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi xử lý giỏ hàng",
    });
  }
};
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({ _id: cartId }).lean();

  if (!cart) {
    return res.render("client/pages/cart/index", {
      pageTitle: "Giỏ hàng",
      cartDetail: { products: [], totalPrice: 0 },
    });
  }

  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productInfo = await Product.findOne({
        _id: item.product_id,
      }).select("title thumbnail slug variants price discountPercentage stock");

      if (productInfo) {
        item.productInfo = productInfo;
        item.totalPrice =
          parseInt(
            ((item.price * (100 - item.discountPercentage)) / 100).toFixed(0)
          ) * item.quantity;

        // Thêm thông tin biến thể chi tiết
        if (item.variant) {
          const variantGroup = productInfo.variants.find(
            (v) => v.name === item.variant.name
          );
          if (variantGroup) {
            item.variantDetails = variantGroup.value.find(
              (val) => val.value === item.variant.value
            );
            console.log(item.variant);
          }
        }
      }
    }
  }

  cart.totalPrice = cart.products.reduce((sum, item) => {
    const originalPrice = item.variantDetails
      ? item.variantDetails.price
      : item.productInfo.price;
    const discount = item.variantDetails
      ? item.variantDetails.discountPercentage
      : item.productInfo.discountPercentage;
    return sum + originalPrice * (1 - discount / 100) * item.quantity;
  }, 0);
  console.log(cart);
  res.render("client/pages/cart/index", {
    pageTitle: "Giỏ hàng",
    cartDetail: cart,
  });
};

// [DELETE] /cart/delete/:productId
module.exports.delete = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const { variant } = req.body;

    // Tạo điều kiện tìm variant
    const variantCondition = variant 
      ? { 
          "products.variant.name": variant.name,
          "products.variant.value": variant.value
        } 
      : { "products.variant": { $exists: false } };

    const result = await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": productId,
        ...variantCondition
      },
      {
        $pull: {
          products: {
            product_id: productId,
            ...(variant && { variant: variant })
          }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ hàng"
      });
    }

    res.json({
      success: true,
      message: "Xóa sản phẩm thành công"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server"
    });
  }
};
module.exports.update = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const { quantity, variant } = req.body;
    console.log(productId, quantity, variant);
    if (quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }

    const cart = await Cart.findOne({ _id: cartId });

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
     let existProduct1 = null;
     let existProduct2 = null;
    if (variant != null) {
       existProduct1 = cart.products.find(
        (item) =>
          item.product_id == productId &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
      );
    }else{
       existProduct2 = cart.products.find(
        (item) => item.product_id == productId
      );
    }

    if (existProduct1) {
      await Cart.updateOne(
        {
          _id: cartId,
          "products.product_id": productId,
          "products.variant": variant,
        },
        {
          $set: { "products.$.quantity": quantity },
        }
      );

      return res.json({ message: "Cập nhật thành công" });
    }
    if (existProduct2) {
      await Cart.updateOne(
        {
          _id: cartId,
          "products.product_id": productId,
        },
        {
          $set: { "products.$.quantity": quantity },
        }
      );

      return res.json({ message: "Cập nhật thành công" });
    }

    res.status(400).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Lỗi server", error });
  }
};
