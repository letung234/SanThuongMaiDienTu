const NCC = require("../../models/account.model");
const Product = require("../../models/product.model");
const Category = require("../../models/product-category.model");
const createTreeHelper = require("../../helpers/createTree");
const paginationHelper = require("../../helpers/pagination");
const RoomChat = require("../../models/rooms-chat.model");
const { priceNewProducts } = require("../../helpers/products");

// [GET] /store/:id
module.exports.index = async (req, res) => {
  let categoryProduct = null;

  // Tìm category nếu có keyword
  if (req.query.keyword) {
    const category_slug = req.query.keyword;
    categoryProduct = await Category.findOne({ slug: category_slug });
  }

  const ncc = await NCC.findOne({
    _id: req.params.id,
    role_id: { $in: ["679269bfbcae23ebfe88bf30", "66add3a77a10dbf90af339a2"] },
    deleted: false,
  });

  let roomChat = null;
  if (res.locals.user) {
    roomChat = await RoomChat.findOne({
      typeRoom: "buyer-seller",
      "sellerBuyer.user_id": res.locals.user.id,
      "sellerBuyer.account_id": ncc.id,
    });

    if (!roomChat) {
      roomChat = new RoomChat({
        title: `Chat giữa ${res.locals.user.fullName} và ${ncc.title}`,
        typeRoom: "buyer-seller",
        status: "active",
        sellerBuyer: {
          user_id: res.locals.user.id,
          account_id: ncc.id,
        },
      });
      await roomChat.save();
    }
  }

  // Tạo query cho sản phẩm
  const productQuery = {
    deleted: false,
    status: "active",
    "createdBy.account_id": ncc.id,
  };

  // Thêm điều kiện category nếu có
  if (categoryProduct) {
    productQuery.product_category_id = categoryProduct._id;
  }

  // Đếm số lượng sản phẩm với query đã tạo
  const countProducts = await Product.countDocuments(productQuery);

  // Phân trang
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 20,
    },
    req.query,
    countProducts
  );

  // Lấy danh sách sản phẩm
  const products = await Product.find(productQuery)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  const productsWithPrice = priceNewProducts(products);

  // Lấy danh mục sản phẩm
  const prs = await Product.find({
    deleted: false,
    status: "active",
    "createdBy.account_id": ncc.id,
  });
  const categoryIds = prs.map((item) => item.product_category_id);
  console.log(categoryIds);
  const categories = await Category.find({
    _id: { $in: categoryIds },
    deleted: false,
  });

  const newProductsCategory = createTreeHelper.tree(categories);

  // Sản phẩm nổi bật
  productQuery.featured = "1";
  const productFeatured = await Product.find(productQuery).limit(6);
  const newProductsFeatured = priceNewProducts(productFeatured);

  res.render("client/pages/store/index", {
    pageTitle: `Chào Mừng Đến Với Cửa Hàng ${ncc.title}`,
    ncc: ncc,
    products: productsWithPrice,
    category: newProductsCategory,
    productFeatured: newProductsFeatured,
    pagination: objectPagination,
    roomChat: roomChat,

  });
};
