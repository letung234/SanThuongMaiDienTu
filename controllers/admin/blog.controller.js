// [GET] /admin/Blogs
const Blog = require("../../models/blog.model");
const BlogCategory = require("../../models/category-blog.model");
const Account = require("../../models/account.model");
const FilterStatusHelper = require("../../helpers/filterStatus");
const SearchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");

module.exports.index = async (req, res) => {
  const objectSearch = SearchHelper(req.query);

  let find = {
    deleted: false,
  };

  // Lọc theo status
  if (req.query.status) {
    find.status = req.query.status;
  }

  // Tìm kiếm
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // Đếm số lượng theo trạng thái
  const statusCount = {
    all: await Blog.countDocuments({ deleted: false }),
    draft: await Blog.countDocuments({ status: "draft", deleted: false }),
    published: await Blog.countDocuments({
      status: "published",
      deleted: false,
    }),
    archived: await Blog.countDocuments({ status: "archived", deleted: false }),
  };

  // Pagination
  const countBlogs = statusCount.all;
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countBlogs
  );

  // Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.createdAt = "desc";
  }

  const Blogs = await Blog.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const blog of Blogs) {
    const [category, account] = await Promise.all([
      BlogCategory.findOne({ _id: blog.category_id, deleted: false }).select(
        "title"
      ),
      Account.findOne({
        _id: blog.createdBy.account_id,
        deleted: false,
      }).select("fullName email"),
    ]);
    blog.category = category ? category.title : null;
    blog.account = account || null;
  }

  res.render("admin/pages/blogs/index", {
    pageTitle: "Bài viết",
    Blogs: Blogs,
    statusCount,
    filterStatus: [
      { status: "", count: statusCount.all, label: "Tất cả" },
      { status: "draft", count: statusCount.draft, label: "Nháp" },
      {
        status: "published",
        count: statusCount.published,
        label: "Đã xuất bản",
      },
      { status: "archived", count: statusCount.archived, label: "Lưu trữ" },
    ],
    currentStatus: req.query.status || "all",
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

module.exports.create = async (req, res) => {
  const categories = await BlogCategory.find({
    deleted: false,
    status: "active",
  });
  const newCategorys = createTreeHelper.tree(categories);
  res.render("admin/pages/blogs/create", {
    pageTitle: "Thêm bài viết mới",
    categories: newCategorys,
  });
};

module.exports.createPost = async (req, res) => {
  try {
    const { title, category_id, content, status, thumbnail } = req.body;

    const blog = new Blog({
      title: title,
      category_id: category_id,
      content: content,
      status: status,
      createdBy: {
        account_id: res.locals.user.id,
      },
      thumbnail: thumbnail,
    });

    await blog.save();

    req.flash("success", "Thêm bài viết thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/blogs`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Thêm bài viết thất bại! Vui lòng thử lại");
    res.redirect("back");
  }
};

module.exports.changeStatus = async (req, res) => {
  const status = req.query.status;
  await Blog.updateOne({ _id: req.params.id }, { status: status });
  req.flash("success", "Thay đổi trạng thái thành công!");
  res.redirect("back");
};

module.exports.deleteItem = async (req, res) => {
  await Blog.deleteOne({ _id: req.params.id });
  req.flash("success", "Xóa blog thành công!");
  res.redirect("back");
};

module.exports.detail = async (req, res) => {
  const blog = await Blog.findOne({
    _id: req.params.id,
    deleted: false,
  });
  if (!blog) {
    console.log(blog);
  }

  const [category, account] = await Promise.all([
    BlogCategory.findOne({ _id: blog.category_id, deleted: false }).select(
      "title"
    ),
    Account.findOne({
      _id: blog.createdBy.account_id,
      deleted: false,
    }).select("fullName email"),
  ]);
  blog.category = category ? category.title : null;
  blog.account = account || null;

  // Tăng view
  await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

  res.render("admin/pages/blogs/detail", {
    blog,
    title: blog.title,
  });
};

module.exports.edit = async (req, res) => {
  const blog = await Blog.findOne({
    _id: req.params.id,
    deleted: false,
  }).lean();

  const categories = await BlogCategory.find({
    deleted: false,
    status: "active",
  });
  const newCategorys = createTreeHelper.tree(categories);

  res.render("admin/pages/blogs/edit", {
    blog,
    title: "Chỉnh sửa bài viết",
    categories: newCategorys,
  });
};
module.exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: id, deleted: false },
      body,
      { new: true }
    );

    if (!updatedBlog) {
      req.flash("error", "Có lỗi xảy ra khi cập nhật bài viết");
      res.redirect("back");
    }
    req.flash("success", "Cập nhật bài viết thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/blogs`);
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra khi cập nhật bài viết");
    res.redirect("back");
  }
};
