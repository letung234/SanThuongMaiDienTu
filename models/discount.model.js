const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const DiscountSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    discount_type: {
      type: String,
      enum: ["category", "product", "order_amount"],
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    order_amount: { type: Number, default: null },
    discount_value: { type: Number, required: true },
    discount_unit: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    usage_limit: { type: Number, default: null },
    used_count: { type: Number, default: 0 },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    deleted: { type: Boolean, default: false },
    createdBy: {
      account_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Discount = mongoose.model("Discount", DiscountSchema, "Discount");

module.exports = Discount;
