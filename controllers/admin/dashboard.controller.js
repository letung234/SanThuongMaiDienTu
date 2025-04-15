const Account = require("../../models/account.model");
const ProductCategory = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const BlogCategory = require("../../models/category-blog.model");
const Blog = require("../../models/blog.model");
const Discount = require("../../models/discount.model");
const Order = require("../../models/order.model");

module.exports.dashboard = async (req, res) => {
  try {
    const currentAccount = res.locals.user;
    const role_id = currentAccount.role_id;
    const statistic = {};

    // Admin - Full quyền
    if (role_id === "66add3a77a10dbf90af339a2") {
      // Product Category
      statistic.categoryProduct = {
        total: await ProductCategory.countDocuments({ deleted: false }),
        active: await ProductCategory.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await ProductCategory.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };

      // Product
      statistic.product = {
        total: await Product.countDocuments({ deleted: false }),
        active: await Product.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await Product.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };

      // Blog Category
      statistic.categoryBlog = {
        total: await BlogCategory.countDocuments({ deleted: false }),
        active: await BlogCategory.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await BlogCategory.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };

      // Blog (All)
      statistic.blog = {
        total: await Blog.countDocuments({ deleted: false }),
        draft: await Blog.countDocuments({ status: "draft", deleted: false }),
        published: await Blog.countDocuments({
          status: "published",
          deleted: false,
        }),
        archived: await Blog.countDocuments({
          status: "archived",
          deleted: false,
        }),
      };

      // Discount
      statistic.discount = {
        total: await Discount.countDocuments({ deleted: false }),
        active: await Discount.countDocuments({
          status: "active",
          deleted: false,
        }),
        expired: await Discount.countDocuments({
          status: "expired",
          deleted: false,
        }),
      };

      // Order
      statistic.order = {
        total: await Order.countDocuments({ deleted: false }),
        paid: await Order.countDocuments({ status: 2, deleted: false }),
        processing: await Order.countDocuments({ status: 1, deleted: false }),
        finished: await Order.countDocuments({ status: 4, deleted: false }),
        canceled: await Order.countDocuments({ status: 3, deleted: false }),
      };

      // Account
      statistic.account = {
        total: await Account.countDocuments({ deleted: false }),
        active: await Account.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await Account.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };

      // User
      statistic.user = {
        total: await User.countDocuments({ deleted: false }),
        active: await User.countDocuments({ status: "active", deleted: false }),
        inactive: await User.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };
    }

    // Quyền đăng sản phẩm
    else if (role_id === "679269bfbcae23ebfe88bf30") {
      statistic.categoryProduct = {
        total: await ProductCategory.countDocuments({ deleted: false }),
        active: await ProductCategory.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await ProductCategory.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };

      statistic.product = {
        total: await Product.countDocuments({ deleted: false }),
        active: await Product.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await Product.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };
    }

    // Quyền phê duyệt bài viết
    else if (role_id === "66add3ba7a10dbf90af339a5") {
      statistic.categoryBlog = {
        total: await BlogCategory.countDocuments({ deleted: false }),
        active: await BlogCategory.countDocuments({
          status: "active",
          deleted: false,
        }),
        inactive: await BlogCategory.countDocuments({
          status: "inactive",
          deleted: false,
        }),
      };

      statistic.blog = {
        total: await Blog.countDocuments({ deleted: false }),
        draft: await Blog.countDocuments({ status: "draft", deleted: false }),
        published: await Blog.countDocuments({
          status: "published",
          deleted: false,
        }),
        archived: await Blog.countDocuments({
          status: "archived",
          deleted: false,
        }),
      };
    }

    // Quyền viết bài
    else if (role_id === "6717615aa508500fd819bcc1") {
      statistic.blog = {
        total: await Blog.countDocuments({
          "createdBy.account_id": currentAccount._id,
          deleted: false,
        }),
        draft: await Blog.countDocuments({
          "createdBy.account_id": currentAccount._id,
          status: "draft",
          deleted: false,
        }),
        published: await Blog.countDocuments({
          "createdBy.account_id": currentAccount._id,
          status: "published",
          deleted: false,
        }),
        archived: await Blog.countDocuments({
          "createdBy.account_id": currentAccount._id,
          status: "archived",
          deleted: false,
        }),
      };
    }
    // Hàm tính toán doanh số
    const calculateOrderStats = async (status, Account) => {
      const matchCondition = {
        status: status,
        deleted: false,
      };

      if (Account) {
        matchCondition["products.supplier_id"] = Account._id;
      }

      const result = await Order.aggregate([
        { $match: matchCondition },
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$products.quantity" },
            totalAmount: { $sum: "$totalAfterDiscount" }, 
          },
        },
        {
          $project: {
            _id: 0,
            totalQuantity: 1,
            totalAmount: 1,
          },
        },
      ]);


      return result[0] || { totalQuantity: 0, totalAmount: 0 };
    };

    // Thống kê đơn hàng cho tất cả quyền
    if (
      ["66add3a77a10dbf90af339a2", "679269bfbcae23ebfe88bf30"].includes(role_id)
    ) {
      statistic.orderDetails = {
        completed: await calculateOrderStats(4, currentAccount),
        canceled: await calculateOrderStats(3, currentAccount),
        processing: await calculateOrderStats(1, currentAccount),
        paid: await calculateOrderStats(2, currentAccount),
      };

      statistic.orderDetails.totalValid = {
        totalQuantity:
          statistic.orderDetails.completed.totalQuantity +
          statistic.orderDetails.processing.totalQuantity +
          statistic.orderDetails.paid.totalQuantity,
        totalAmount:
          statistic.orderDetails.completed.totalAmount +
          statistic.orderDetails.processing.totalAmount +
          statistic.orderDetails.paid.totalAmount,
      };
    }
    // Thông kế cho admin
    if (role_id === "66add3a77a10dbf90af339a2") {
      console.log("vào")
      statistic.orderDetailsAdmin = {
        completed: await calculateOrderStats(4),
        canceled: await calculateOrderStats(3),
        processing: await calculateOrderStats(1),
        paid: await calculateOrderStats(2),
      };
      console.log("qua")
      const allCompletedOrders = await Order.find({
        status: 4,
        deleted: false,
      });
      console.log(allCompletedOrders)

      let totalDiscount = 0;

      allCompletedOrders.forEach((order) => {

        console.log("order", order);
        
        const discountAmount = 0.1 * order.totalAfterDiscount;
        totalDiscount += discountAmount;
      });
      statistic.financial = {
        totalCompleted: statistic.orderDetailsAdmin.completed.totalAmount,
        totalCanceled: statistic.orderDetailsAdmin.canceled.totalAmount,
        totalProcessing: statistic.orderDetailsAdmin.processing.totalAmount,
        totalPaid: statistic.orderDetailsAdmin.paid.totalAmount,
        totalValid:
          statistic.orderDetailsAdmin.completed.totalAmount +
          statistic.orderDetailsAdmin.processing.totalAmount +
          statistic.orderDetailsAdmin.paid.totalAmount,
        totalDiscount: totalDiscount,
      };
    }
    res.render("admin/pages/dashboard/index", {
      pageTitle: "Trang Tổng Quan",
      statistic: statistic,
      account: currentAccount,
      roleName: { title: getRoleTitle(role_id) },
    });
  } catch (error) {
    console.error(error);
    res.redirect("back");
  }
};

function getRoleTitle(role_id) {
  const roles = {
    "66add3a77a10dbf90af339a2": "Quản trị viên",
    "679269bfbcae23ebfe88bf30": "Nhà cung cấp",
    "66add3ba7a10dbf90af339a5": "Biên tập viên",
    "6717615aa508500fd819bcc1": "Người viết blog",
  };
  return roles[role_id] || "Không xác định";
}
