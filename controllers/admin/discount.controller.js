const DisCountModel = require("../../models/discount.model");
const Category = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const SearchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
module.exports.index = async (req, res) => {
  const objectSearch = SearchHelper(req.query);

  let find = {
    deleted: false,
  };
  const total = await DisCountModel.countDocuments(find);
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    total
  );
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  const discounts = await DisCountModel.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .populate("category_id", "title")
    .populate("product_id", "title")
    .sort({ createdAt: -1 });

  res.render("admin/pages/discount/index", {
    pageTitle: "Danh sách mã giảm giá",
    discounts,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

module.exports.create = async (req, res) => {
  const categories = await Category.find({ deleted: false });
  const products = await Product.find({ deleted: false });

  res.render("admin/pages/discount/create", {
    pageTitle: "Tạo mã giảm giá",
    categories,
    products,
  });
};
module.exports.edit = async (req, res) => {
  const discount = await DisCountModel.findById(req.params.id)
    .populate("category_id", "title")
    .populate("product_id", "title");
  const categories = await Category.find({ deleted: false });
  const products = await Product.find({ deleted: false });
  res.render("admin/pages/discount/edit", {
    pageTitle: "Sửa mã giảm giá",
    discount,
    categories,
    products,
  });
};

module.exports.createPost = async (req, res) => {
  try {
    const {
      title,
      description,
      discount_type,
      category_id,
      product_id,
      order_amount,
      discount_value,
      discount_unit,
      start_date,
      end_date,
      usage_limit,
      status,
    } = req.body;

    const newDiscount = new DisCountModel({
      title,
      description,
      discount_type,
      category_id: discount_type === "category" ? category_id : null,
      product_id: discount_type === "product" ? product_id : null,
      order_amount: discount_type === "order_amount" ? order_amount : null,
      discount_value,
      discount_unit,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      usage_limit: usage_limit || null,
      status,
      createdBy: {
        account_id: res.locals.user.id,
      },
    });

    await newDiscount.save();

    req.flash("success", "Tạo mã giảm giá thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/discounts`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Có lỗi xảy ra khi tạo mã giảm giá");
    res.redirect("back");
  }
};

module.exports.editPatch = async (req, res) =>  {
  try {
    const {
      title,
      description,
      discount_type,
      category_id,
      product_id,
      order_amount,
      discount_value,
      discount_unit,
      start_date,
      end_date,
      usage_limit,
      status,
    } = req.body;
    const discount = await DisCountModel.findByIdAndUpdate(req.params.id, {
      title,
      description,
      discount_type,
      category_id: discount_type === "category"? category_id : null,
      product_id: discount_type === "product"? product_id : null,
      order_amount: discount_type === "order_amount"? order_amount : null,
      discount_value,
      discount_unit,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      usage_limit: usage_limit || null,
      status,
      updatedBy: {
        account_id: res.locals.user.id,
      },
    });
    req.flash("success", "Sửa mã giảm giá thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/discounts`);
    
  } catch (error) {
    console.log(error);
    req.flash("error", "Có lỗi xảy ra khi sửa mã giảm giá");
    res.redirect("back");
  }
}