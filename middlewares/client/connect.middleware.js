const User = require("../../models/user.model");

module.exports.connect = async (req, res, next) => {
      _io.once("connection", (socket) => {
        console.log("a user connected");
        socket.once("disconnect", () => {
          console.log("user disconnected");
        })});
      next();
};
