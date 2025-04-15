const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const roloeSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    permission:{
      type : Array,
      default : []
    },
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
const Role = mongoose.model("Role", roloeSchema, "roles");

module.exports = Role;
