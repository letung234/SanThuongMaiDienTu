const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const paginationHelper = require("../../helpers/pagination");
const productsHelper = require("../../helpers/products");

// [GET] /search
module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;
  let newProducts = [];
 
    const regex = new RegExp(keyword, "i");
    const countProducts = await Product.count({
      title: regex,
      deleted: false,
      status: "active",
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
      title: regex,
      deleted: false,
      status: "active",
    })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);
    newProducts = productsHelper.priceNewProducts(products);
    const suppliers = await Account.find({
      role_id: "679269bfbcae23ebfe88bf30",
      fullName: regex,
      deleted: false,
    })

  res.render("client/pages/search/index", {
    pageTitle: "Kết quả tìm kiếm",
    keyword: keyword,
    products: newProducts,
    pagination: objectPagination,
    suppliers: suppliers,
  });
};
