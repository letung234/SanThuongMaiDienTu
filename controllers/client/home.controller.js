const { priceNewProducts } = require("../../helpers/products");
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Blog = require("../../models/blog.model");
const BlogCategory = require("../../models/category-blog.model");
const Account = require("../../models/account.model");

module.exports.index = async (req, res) => {
  console.log(res.locals.user)
  const sliderProducts = await Product.find({
    deleted: false,
    status: "active",
  }).sort({position: 1}).limit(5);
  const productCategories = await ProductCategory.find({
    deleted: false,
    status: "active",
    parent_id: ""
  }).limit(8);

  const productFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active",
  }).limit(6);
  const newProducts = priceNewProducts(productFeatured);

  const productsNew = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort({ position: "desc" })
    .limit(6);
  const newProductsNew = priceNewProducts(productsNew);

  const blogCategories = await BlogCategory.find({
    deleted: false,
    status: "active",
  }).limit(4);

  const recentBlogs = await Blog.find({
    deleted: false,
    status: "published",
  })
    .sort({ createdAt: -1 })

  const suppliers = await Account.find({
    deleted: false,
    role_id: { $in: ["679269bfbcae23ebfe88bf30", "66add3a77a10dbf90af339a2"] },
  }).limit(8);


  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    sliderProducts: priceNewProducts(sliderProducts),
    productCategories,
    productFeatured: newProducts,
    newProductsNew,
    blogCategories,
    recentBlogs,
    suppliers,
  });
};
