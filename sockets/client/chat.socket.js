// const Chat = require("../../models/chat.model");

// const uploadToCloudinary = require("../../helpers/uploadToCloudinary");

// module.exports = (req,res) => {
//   const userId = res.locals.user.id;
//   const fullName = res.locals.user.fullName;

//   const roomChatId = req.params.roomChatId;
//   // Socket IO
//   _io.once("connection", (socket) => {
//     console.log("connect" + socket.id);
//     socket.join(roomChatId);
//     socket.on("CLIENT_SEND_MESSAGE", async (data) => {
//       let images = [];

//       for (const imageBuffer of data.images) {
//         const link = await uploadToCloudinary(imageBuffer);
//         images.push(link);
//       }

//       // Lưu vào dtbase
//       const chat = new Chat({
//         user_id: userId,
//         room_chat_id : roomChatId,
//         content: data.content,
//         images: images,
//       });
//       await chat.save();

//       // Trả data vè client
//       _io.to(roomChatId).emit("SERVER_RETURN_MESSAGE", {
//         userId: userId,
//         fullName: fullName,
//         content: data.content,
//         images: images,
//       });
//     });
//     //Typing
//     socket.on("CLIENT_SEND_TYPING", async (type) => {
//       socket.broadcast.to(roomChatId).emit("SERVER_RETURN_TYPING", {
//         userId: userId,
//         fullName: fullName,
//         type: type,
//       });
//     });
//     //End Typing
//   });
// };
const Chat = require("../../models/chat.model");
const RoomChat = require("../../models/rooms-chat.model");
const uploadToCloudinary = require("../../helpers/uploadToCloudinary");
const User = require('../../models/user.model');
const Account = require('../../models/account.model');
module.exports = (req, res, room) => {
  const userId = res.locals.user?.id;
  const accountId = res.locals.account?.id;
  const fullName = res.locals.user?.fullName || res.locals.account?.fullName;
  const roomChatId = req.params.roomChatId;
  const isAccount = room.typeRoom === "buyer-seller" && accountId;
  _io.once("connection", async (socket) => {
    const room = await RoomChat.findById(roomChatId);
    // Xác định người gửi
    const isAdminGroup = room.typeRoom === "admin-group";

    socket.join(roomChatId);
    if(userId){
      const user = await User.findByIdAndUpdate(userId, {
        status : "online"
      })
    }
 
    socket.on("CLIENT_SEND_MESSAGE", async (data) => {
      let images = [];
      for (const imageBuffer of data.images) {
        const link = await uploadToCloudinary(imageBuffer);
        images.push(link);
      }

      const chatData = {
        room_chat_id: roomChatId,
        content: data.content,
        images: images,
        [isAdminGroup ? "account_id" : isAccount ? "account_id" : "user_id"]:
          isAdminGroup ? accountId : isAccount ? accountId : userId,
      };

      const chat = await Chat.create(chatData);

      // Gửi thông tin về client
      _io.to(roomChatId).emit("SERVER_RETURN_MESSAGE", {
        senderType: isAdminGroup ? "account" : isAccount ? "account" : "user",
        senderId: isAdminGroup ? accountId : isAccount ? accountId : userId,
        fullName: fullName,
        content: data.content,
        images: images,
        avatar: isAdminGroup
          ? res.locals.account?.avatar
          : isAccount
          ? res.locals.account?.avatar
          : res.locals.user?.avatar,
      });
    });

    // Xử lý typing
    socket.on("CLIENT_SEND_TYPING", (type) => {
      socket.broadcast.to(roomChatId).emit("SERVER_RETURN_TYPING", {
        senderType:
          room.typeRoom === "admin-group"
            ? "account"
            : isAccount
            ? "account"
            : "user",
        senderId:
          room.typeRoom === "admin-group"
            ? accountId
            : isAccount
            ? accountId
            : userId,
        fullName: fullName,
        avatar: isAdminGroup
          ? res.locals.account?.avatar
          : isAccount
          ? res.locals.account?.avatar
          : res.locals.user?.avatar,
        type: type,
      });
    });
    socket.on("disconnect", async () => {
      if(userId){
      const user = await User.findByIdAndUpdate(userId, {
        status : "offline"
      })
    }

    console.log("đã ngắt kết nối" + socket.id);
    });
  });
};
