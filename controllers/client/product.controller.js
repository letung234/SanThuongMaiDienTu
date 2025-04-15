// [GET] /products
const productsHelper = require("../../helpers/products");
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const ProductCategoryHelper = require("../../helpers/getSubCategory");
const paginationHelper = require("../../helpers/pagination");
module.exports.index = async (req, res) => {
  const countProducts = await Product.count({
    status: "active",
    deleted: false,
  });

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 20,
    },
    req.query,
    countProducts
  );
  const products = await Product.find({
    status: "active",
    deleted: false,
  })
    .sort({ position: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  const newProducts = productsHelper.priceNewProducts(products);
  // console.log(newProducts);
  res.render("client/pages/products/index", {
    pageTitle: "Danh Sách Sản Phẩm",
    products: newProducts,
    pagination: objectPagination,
  });
};
// [GET] /products/detail/:slugProduct
module.exports.detail = async (req, res) => {
  try {
    const find = {
      slug: req.params.slugProduct,
      deleted: false,
      status: "active",
    };

    const product = await Product.findOne(find);
    
    if (!product) {
      return res.redirect("/products");
    }

    // Lấy danh mục
    if (product.product_category_id) {
      product.category = await ProductCategory.findOne({
        _id: product.product_category_id,
        status: "active",
        deleted: false,
      });
    }



    // Lấy sản phẩm liên quan
    let relatedProducts = [];
    if (product.product_category_id) {
      relatedProducts = await Product.find({
        product_category_id: product.product_category_id,
        _id: { $ne: product._id },
        deleted: false,
        status: "active",
      })
      .limit(8)
      .sort({ createdAt: -1 });
      console.log("giống", relatedProducts);
      
     
    }

    res.render("client/pages/products/detail", {
      pageTitle: product.title,
      product: product,
      relatedProducts: relatedProducts,
    });
  } catch (error) {
    console.log("3", error);
    res.redirect("/products");
  }
};
// [GET] /products/:slugCategory

module.exports.category = async (req, res) => {

  const category = await ProductCategory.findOne({
    slug: req.params.slugCategory,
    status: "active",
    deleted: false,
  });
  
  const listSubCategory = await ProductCategoryHelper.getSubCategory(category.id);
  const listSubCategoryId = listSubCategory.map((item) => item.id);
  const countProducts = await Product.count({
    product_category_id: { $in: [category.id, ...listSubCategoryId] },
    deleted: false,
  });

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 20,
    },
    req.query,
    countProducts
  );
  const products = await Product.find({
    product_category_id: { $in: [category.id, ...listSubCategoryId] },
    deleted: false,
  })
    .sort({ position: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  // console.log(products);
  const newProducts = productsHelper.priceNewProducts(products);
  res.render("client/pages/products/index", {
    pageTitle: `Trang sản phẩm ${category.title}`,
    products: newProducts,
    pagination: objectPagination,
  });
};
