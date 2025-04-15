// const Chat = require("../../models/chat.model");
// const User = require("../../models/user.model");
// const uploadToCloudinary = require("../../helpers/uploadToCloudinary");

// const chatSocket = require("../../sockets/client/chat.socket");
// //GET /chat/:roomChatId

// module.exports.index = async (req, res) => {
//   const roomChatId = req.params.roomChatId;
//   // Socket IO
//   chatSocket(req,res);

//   // End Socket IO

//   // Lấy data từ database
//   const chats = await Chat.find({
//     room_chat_id : roomChatId,
//     deleted: false,
//   });
//   for (const chat of chats) {
//     const inforUser = await User.findOne({
//       _id: chat.user_id,
//     }).select("fullName");
//     chat.inforUser = inforUser;
//   };

//   res.render("client/pages/chat/index", {
//     pageTitle: "Chat",
//     chats: chats,
//   });
// };
// // [DELETE] /delete/:id
// module.exports.deleted = async (req, res) => {
//   const chatId = req.params.id;
//   console.log(chatId);
//   await Chat.findByIdAndUpdate(chatId, {
//     deleted: true,
//   });
//   console.log('ok')
//   res.status(200).json({message : "Deleted chat successfully" })
// }

const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const Account = require("../../models/account.model");
const RoomChat = require("../../models/rooms-chat.model");
const uploadToCloudinary = require("../../helpers/uploadToCloudinary");
const chatSocket = require("../../sockets/client/chat.socket");
module.exports.index = async (req, res) => {
  const roomChatId = req.params.roomChatId;
  const room = await RoomChat.findById(roomChatId);
  if (room) chatSocket(req, res, room);
  else {
    return res.redirect("/error");

  }
  // Lấy thông tin người dùng hiện tại
  const currentUser = res.locals.user;
  const currentAccount = res.locals.account;
  if (room.typeRoom === "buyer-seller") {
    if (currentUser && currentUser.id !== room.sellerBuyer.user_id) {
      return res.redirect("/error");
    }

    if (currentAccount && currentAccount.id !== room.sellerBuyer.account_id) {
      return res.redirect("/error");
    }
  } else {
    const accountExists = room.users.some(
      (user) => user.Account_id === currentAccount.id
    );

    if (!accountExists) {
      return res.redirect("/error");
    }
  }

  // Lấy danh sách tin nhắn
  const chats = await Chat.find({
    room_chat_id: roomChatId,
    deleted: false,
  }).lean();

  // Lấy thông tin người gửi
  for (const chat of chats) {
    if (chat.user_id) {
      chat.senderInfo = await User.findById(chat.user_id).select(
        "fullName avatar"
      );
    } else if (chat.account_id) {
      chat.senderInfo = await Account.findById(chat.account_id).select(
        "fullName avatar"
      );
    }
  }

  res.render("client/pages/chat/index", {
    pageTitle: "Chat",
    chats: chats,
    room: room,
    currentUser: currentUser,
    currentAccount: currentAccount,
  });
};
