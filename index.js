// Kết nối Express
const express = require("express");
var path = require("path");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var flash = require("express-flash");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var moment = require("moment");
const app = express();
const User = require("./models/user.model");
const Account = require("./models/account.model");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();
const port = process.env.PORT;
app.use(methodOverride("_method"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Flash
app.use(cookieParser("HJSHDJSJJASHDJ"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// End Flash
//TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

// End TinyMCE
// Gọi routes
const routeAdmin = require("./routes/admin/index.route");
const route = require("./routes/client/index.route");

const systemConfig = require("./config/system");
// App local variables
// Tạo ra biến toàn cục (file pub nào cũng dùng được)
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;
// Kêt nối database
const database = require("./config/database");
database.connect();
// Kết nối trang PUG
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
app.use(express.static(`${__dirname}/public`));
//Socket IO
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
global._io = io;
const controller = require("./controllers/client/chat.controller");
const settingGeneral = require("./middlewares/client/setting.middleware");

app.get(
  "/admin/chat/:roomChatId",
  async (req, res, next) => {
    try {
      if (req.cookies.tokenUser) {
        const user = await User.findOne({
          tokenUser: req.cookies.tokenUser,
        }).select("-password");
        if (!user) {
          return res.redirect("/user/login");
        }
        res.locals.user = user;
      } else if (req.cookies.token) {
        const user = await Account.findOne({ token: req.cookies.token }).select(
          "-password"
        );
        if (!user) {
          return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        }
        res.locals.account = user;
      } else {
        return res.redirect("/user/login");
      }

      next();
    } catch (error) {
      console.error("Lỗi khi xác thực người dùng:", error);
      res.status(500).send("Lỗi server");
    }
  },
  settingGeneral.settingGeneral,
  controller.index
);

//End Socket
route(app);
routeAdmin(app);
app.get("*", (req, res) => {
  res.render("client/pages/errors/404", {
    pageTitle: "404 Not Found",
  });
});

app.get("/error", (req, res) => {
  res.render("client/pages/errors/404", {
    pageTitle: "404 Not Found",
  });
});
app.use(errorHandler);

server.listen(port, () => {
  console.log(`App listening on the port : ${port}`);
});
