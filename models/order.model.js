const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cart_id: String,
    userInfo: {
      fullName: String,
      phone: String,
      address: String,
      userId: {
        type: String,
        default: null,
      },
    },
    status: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    products: [
      {
        product_id: { type: String, required: true },
        product_title: { type: String, required: true },
        variant: {
          name: String,
          value: String,
        },
        price: { type: Number, required: true },
        discountPercentage: { type: Number, required: true },
        quantity: { type: Number, required: true },
        thumbnail: String,
        supplier_id: { type: String, required: true },
      },
    ],
    discountCode: String,
    discountValue: Number,
    totalAfterDiscount: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
