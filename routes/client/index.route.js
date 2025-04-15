const homeRouters = require("./home.route");
const productRouters = require("./product.route");
const searchRouters = require("./search.route");
const cartRouters = require("./cart.route");
const checkoutRouters = require("./checkout.route");
const userRouters = require("./user.route");
const chatRouters = require("../chat.route");
const UsersRouters = require("./users.route");
const roomsChatRoutes = require("./room-chats.route");
const storeRouters = require("./store.route");
const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");
const settingGeneral = require("../../middlewares/client/setting.middleware");
const BlogRouters = require("./blog.route")
const authenMiddleware = require("../../middlewares/client/auth.middleware");

// const connectMiddleware = require("../../middlewares/client/connect.middleware");

module.exports = (app) => {
  app.use(categoryMiddleware.category);
  app.use(cartMiddleware.cartId);
  app.use(userMiddleware.infoUser);
  // app.use(userMiddleware.connect);

  // app.use(connectMiddleware.connect);

  app.use(settingGeneral.settingGeneral);
  app.use("/blogs", BlogRouters);
  app.use("/", homeRouters);
  app.use("/store", storeRouters);
  app.use("/products", productRouters);
  app.use("/search", searchRouters);
  app.use("/cart", cartRouters);
  app.use("/checkout", checkoutRouters);
  app.use("/user", userRouters);
  app.use("/chat", chatRouters);
  app.use("/messages", authenMiddleware.requireAuth, UsersRouters);
  app.use("/rooms-chat", authenMiddleware.requireAuth, roomsChatRoutes);
};
