const Blog = require("../../models/blog.model");
const CategoryBlog = require("../../models/category-blog.model");

module.exports.index = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      deleted: false,
      status: "published",
    });

    const category = await CategoryBlog.findOne({
      _id: blog.category_id,
      deleted: false,
    });

    const relatedBlogs = await Blog.find({
      category_id: blog.category_id,
      _id: { $ne: blog._id },
      deleted: false,
      status: "published",
    }).limit(3);
    // Tăng view
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

    res.render("client/pages/blog/detail", {
      pageTitle: blog.title,
      blog: blog,
      category: category,
      relatedBlogs: relatedBlogs,
    });
  } catch (error) {
    res.redirect("/404");
  }
};

module.exports.category = async (req, res) => {
  try {
    const category = await CategoryBlog.findOne({
      slug: req.params.slug,
      deleted: false,
      status: "active",
    });

    if (!category) return res.redirect("/404");

    const blogs = await Blog.find({
      category_id: category.id,
      deleted: false,
      status: "published",
    }).sort({ createdAt: -1 });

    res.render("client/pages/blog/index", {
      pageTitle: category.title,
      category: category,
      blogs: blogs,
    });
  } catch (error) {
    res.redirect("/404");
  }
};
