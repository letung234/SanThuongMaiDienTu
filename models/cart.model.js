const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: String,
    products: [
      {
        product_id: String,
        quantity: Number,
        variant: {
          name: String,
          value: String,
        },
        price: Number,
        discountPercentage: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;
