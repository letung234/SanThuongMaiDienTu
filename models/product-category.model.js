const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
    title: String,
    parent_id: {
      default: "",
      type: String,
    },
    description: String,
    thumbnail: String,
    status: String,
    position: Number,
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      account_id: String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);
const ProductCategory = mongoose.model("ProductCategory", productSchema, "products-category");

module.exports = ProductCategory;
