const RoomChat = require("../../models/rooms-chat.model");
const User = require("../../models/user.model");
module.exports.isAccess = async (req, res, next) => {
  const roomChatId = req.params.roomChatId;
  
   const existUserInRoomChat = await RoomChat.findOne({
      _id : roomChatId,
      deleted : false
   })
   
  if(existUserInRoomChat){
    res.locals.roomName = existUserInRoomChat.title;
    next();
  }else{
   res.redirect("/");
  }
};
