const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const BlogCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    parent_id: {
      default: "",
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
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
      account_id: {
        type: String,
        required: true,
      },
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

const BlogCategory = mongoose.model(
  "BlogCategory",
  BlogCategorySchema,
  "BlogCategory"
);

module.exports = BlogCategory;
