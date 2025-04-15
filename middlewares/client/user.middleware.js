const User = require("../../models/user.model");
module.exports.infoUser = async(req,res,next) =>{
   if (req.cookies.tokenUser){
      const user = await User.findOne({
        tokenUser: req.cookies.tokenUser,
        deleted : false,
      }).select("-password");
      if(user){
         res.locals.user = user;
        
      }
   }
   next();
}

module.exports.connect = async(req,res,next) =>{
 _io.once('connection',(socket) =>{
   socket.on("CLIENT_CLOSE_WEB", async (data) => {
     console.log(data);
   });
 })
   next();
}