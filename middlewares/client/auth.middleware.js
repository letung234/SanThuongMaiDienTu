const User = require("../../models/user.model");


module.exports.requireAuth = async (req, res, next) => {
  if (!req.cookies.tokenUser) {
    res.redirect(`/user/login`);
  } else {
    const user = await User.findOne({ tokenUser: req.cookies.tokenUser }).select("-password");
    if (!user) {
      res.redirect(`/user/login`);
    } else {
      res.locals.user = user;
      // _io.once("connection", (socket) => {
      //   console.log("a user connected");
      //   socket.on("disconnect", () => {
      //     console.log("user disconnected");
      //   });
      // });
      next();
    }
  }
};
