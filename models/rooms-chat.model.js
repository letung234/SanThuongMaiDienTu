const mongoose = require("mongoose");

const roomchatSchema = new mongoose.Schema(
  {
    title: String,
    avatar: String,
    typeRoom: {
      type: String,
      enum: ["admin-group", "buyer-seller"],
      required: true,
    },
    status: String,
    users: [
      {
        Account_id: String,
        role: String,
      },
    ], // Dùng cho nhóm quản trị viên
    sellerBuyer: {
      user_id: String,
      account_id: String,
    }, // Dùng cho chat giữa 1 người mua và 1 người bán
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

const RoomChat = mongoose.model("RoomChat", roomchatSchema, "rooms-chat");

module.exports = RoomChat;
