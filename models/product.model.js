const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const variantValueSchema = new mongoose.Schema({
  value: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  thumbnailPosition: { type: Number, default: -1 },
  price: { type: Number, required: true, min: 0 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: {
    type: [variantValueSchema],
    default: [],
  },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    product_category_id: { type: String, default: "" },
    description: { type: String, default: "" },
    price: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return this.variants.length === 0 ? v != null : true;
        },
        message: "Sản phẩm đơn cần có giá.",
      },
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      validate: {
        validator: function (v) {
          return this.variants.length === 0 ? v != null : true;
        },
        message: "Sản phẩm đơn cần có mức giảm giá.",
      },
    },
    stock: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return this.variants.length === 0 ? v != null : true;
        },
        message: "Sản phẩm đơn cần có số lượng tồn kho.",
      },
    },
    thumbnail: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Sản phẩm cần có ít nhất một ảnh thumbnail.",
      },
    },
    status: { type: String, default: "active" },
    featured: { type: String, default: "0" },
    position: { type: Number, default: 0 },
    slug: { type: String, slug: "title", unique: true },
    variants: {
      type: [variantSchema],
      default: [],
    },
    createdBy: {
      account_id: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
    deleted: { type: Boolean, default: false },
    deleteBy: {
      account_id: String,
      deletedAt: Date,
    },
    updatedBy: [
      {
        account_id: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
