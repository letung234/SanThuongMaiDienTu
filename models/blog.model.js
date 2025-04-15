const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category_id: {
      default: "",
      type: String,
    },
    content: { type: String, required: true },
    thumbnail: String,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    views: { type: Number, default: 0 },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    deleted: { type: Boolean, default: false },
    createdBy: {
      account_id: String,
      createdAt: { type: Date, default: Date.now },
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", BlogSchema, "Blog");

module.exports = Blog;
