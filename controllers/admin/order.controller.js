const OrderModel = require('../../models/order.model');
const ProductModel = require('../../models/product.model');
const systemConfig = require("../../config/system");
module.exports.index = async (req, res) => {
  const { page = 1, status, keyword } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;

  const query = { deleted: false };

  if (status) query.status = status;
  if (keyword) {
    query.$or = [
      { "userInfo.fullName": { $regex: keyword, $options: "i" } },
      { "userInfo.phone": { $regex: keyword, $options: "i" } },
      { "userInfo.address": { $regex: keyword, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    OrderModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.render("admin/pages/order/index", {
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

}

module.exports.detail = async (req, res) => {
const order = await OrderModel.findById(req.params.id);
if (!order || order.deleted) {
  req.flash("error", "Không tìm thấy đơn hàng");
  res.redirect(`${systemConfig.prefixAdmin}/orders`);
}
res.render("admin/pages/order/detail", {
  order,
  statusOptions: {
    1: "Đang xử lý",
    2: "Đã thanh toán",
    3: "Đã hủy",
    4: "Hoàn thành",
  },
});
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const o = await OrderModel.findById(
      req.params.id     
    );
    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if(status == 3 && o.status != 3) {
      console.log("Đơn hàng đã hủy");
      const order = await OrderModel.findOne({ _id: req.params.id });

      for (const product of order.products) {
        const productInfo = await ProductModel.findOne({
          _id: product.product_id,
        });

        // Cập nhật tồn kho
        if (product.variant) {
          await ProductModel.updateOne(
            {
              _id: product.product_id,
              "variants.name": product.variant.name,
              "variants.value.value": product.variant.value,
            },
            {
              $inc: {
                "variants.$[variant].value.$[value].stock": +product.quantity,
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
          await ProductModel.updateOne(
            { _id: product.product_id },
            { $inc: { stock: +product.quantity } }
          );
        }
      }
    }
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};