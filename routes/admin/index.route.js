const systemConfig = require("../../config/system");

const dashboardRouters = require("./dashboard.route");
const productRouters = require("./product.route");
const productCategory = require("./products-category.route");
const roleRouters = require("./role.router");
const accountRouters = require("./accounts.route");
const authRouters = require("../../routes/admin/auth.route");
const myAccountRouters = require("../../routes/admin/my-account.route");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const settingstRouters = require("./setting.route");
const BlogCategory = require("./blog-category.route");
const blogRouters = require("./blog.route");
const DiscountRouters = require("./discounts.route");
const OrderRouters = require("./order.route");
const RoomChat = require("./room-chat.route");
module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(PATH_ADMIN+ "/rooms", authMiddleware.requireAuth, RoomChat);

  app.use(
    PATH_ADMIN + "/dashboard",
    authMiddleware.requireAuth,
    dashboardRouters
  );
  app.use(PATH_ADMIN + "/orders", authMiddleware.requireAuth, OrderRouters);
  app.use(PATH_ADMIN + "/products", authMiddleware.requireAuth, productRouters);
  app.use(PATH_ADMIN + "/blogs", authMiddleware.requireAuth, blogRouters);
  app.use(
    PATH_ADMIN + "/products-category",
    authMiddleware.requireAuth,
    productCategory
  );

  app.use(
    PATH_ADMIN + "/blog-category",
    authMiddleware.requireAuth,
    BlogCategory
  );
  app.use(PATH_ADMIN + "/discounts", authMiddleware.requireAuth, DiscountRouters);

  app.use(PATH_ADMIN + "/roles", authMiddleware.requireAuth, roleRouters);

  app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountRouters);

  app.use(PATH_ADMIN + "/auth", authRouters);

  app.use(
    PATH_ADMIN + "/my-account",
    authMiddleware.requireAuth,
    myAccountRouters
  );

  app.use(
    PATH_ADMIN + "/settings",
    authMiddleware.requireAuth,
    settingstRouters
  );
};
