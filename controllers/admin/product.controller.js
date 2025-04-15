// [GET] /admin/products
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const FilterStatusHelper = require("../../helpers/filterStatus");
const SearchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");

module.exports.index = async (req, res) => {
  // Đoạn bộ lọc
  const filterStatus = FilterStatusHelper(req.query);
  const objectSearch = SearchHelper(req.query);

  let find = {
    deleted: false,
    "createdBy.account_id": res.locals.user._id,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // Pagination
  const countProducts = await Product.count(find);

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );

  //End Pagination
  //sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  // console.log(sort);
  //end sort
  // console.log(objectPagination);
  const products = await Product.find(find).sort(sort).limit(objectPagination.limitItems).skip(objectPagination.skip);

  for (const product of products) {
    const user = await Account.findOne({
      _id: product.createdBy.account_id,
    });
    if (user) {
      product.accountFullName = user.fullName;
    }
    const updateBy = product.updatedBy.slice(-1)[0];
    if(updateBy){
      const userUpdated = await Account.findOne({
        _id : updateBy.account_id
      });
      updateBy.accountFullName = userUpdated.fullName;
    }

  }

  res.render("admin/pages/products/index", {
    pageTitle: "Trang Sản Phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

// [PATCH] /admin/products/change-status/:status/:id

module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  await Product.updateOne(
    { _id: id },
    {
      status: status,
      $push: {
        updatedBy: updatedBy,
      },
    }
  );

  req.flash("success", "Cập nhật trạng thái thành công");
  res.redirect("back");
};
// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(",");
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  switch (type) {
    case "active":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          status: "active",
          $push: {
            updatedBy: updatedBy,
          },
        }
      );
      req.flash("success", `Cập nhật trạng thái hoạt động ${ids.length} sản phẩm thành công`);

      break;
    case "inactive":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          status: "inactive",
          $push: {
            updatedBy: updatedBy,
          },
        }
      );
      req.flash("success", `Cập nhật trạng thái dừng hoạt động ${ids.length} sản phẩm thành công`);

      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          // deleted: true,
          // deletedAt: new Date(),
          deleted: true,
          deleteBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      );
      req.flash("success", `Xóa ${ids.length} sản phẩm thành công`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne(
          { _id: id },
          {
            position: position,
            $push: {
              updatedBy: updatedBy,
            },
          }
        );
        req.flash("success", `Thay đổi vị trí ${ids.length} sản phẩm thành công`);
      }
      break;
    default:
      break;
  }
  res.redirect("back");
};

// [DELETE] /admin/products/delete/id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  // await Product.deleteOne({ _id: id });
  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      deleteBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );
  req.flash("success", "Xóa thành công 1 sản phẩm");
  res.redirect("back");
};

// [GET] /admin/products/create/
module.exports.create = async (req, res) => {
  const category = await ProductCategory.find({ deleted: false });
  const newCategory = createTreeHelper.tree(category);
  res.render(`admin/pages/products/create`, {
    pageTitle: "Thêm mới sản phẩm",
    category: newCategory,
  });
};

module.exports.createVariants = async (req, res) => {
  const category = await ProductCategory.find({ deleted: false });
  const newCategory = createTreeHelper.tree(category);
  res.render(`admin/pages/products/createVariants`, {
    pageTitle: "Thêm mới sản phẩm",
    category: newCategory,
  });
};
// [POST] /admin/products/create/
module.exports.createPost = async (req, res) => {
  console.log(req.body)
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position == "") {
    const countProduct = await Product.count();
    req.body.position = countProduct + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  req.body.createdBy = {
    account_id: res.locals.user.id,
  };

  const product = new Product(req.body);
  await product.save();

  req.flash("success", "Tạo thành công sản phẩm");
  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const category = await ProductCategory.find({ deleted: false });
    const newCategory = createTreeHelper.tree(category);
    const product = await Product.findOne(find);
    console.log(product);
    res.render(`admin/pages/products/edit`, {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      category: newCategory,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
// [GET] /admin/products/editVariants/:id

module.exports.editVariants = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const category = await ProductCategory.find({ deleted: false });
    const newCategory = createTreeHelper.tree(category);
    const product = await Product.findOne(find);
    console.log(product);
    res.render(`admin/pages/products/editVariants`, {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      category: newCategory,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  
  req.body.position = parseInt(req.body.position);
  try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };

    await Product.updateOne(
      { _id: id },
      {
        ...req.body,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
    req.flash("success", "Cập nhật thành công");
  } catch (error) {
    console.log(error)
    req.flash("error", "Cập nhật thất bại");
  }
  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [PATCH] /admin/products/edit-variants/:id
module.exports.editVariantPatch = async (req, res) => {
  const id = req.params.id;
  const {
    title,
    product_category_id,
    description,
    featured,
    variants,
    status,
    position,
    thumbnail,
  } = req.body;
  try {
    const updateData = {
      title,
      product_category_id,
      description,
      featured,
      thumbnail,
      status,
      position,
      updatedAt: Date.now()
    };

    if (variants && variants.length > 0) {
      updateData.variants = variants.map(variant => {
        return {
        name: variant.name,
        
        value: variant.value.map(value => ({
          value: value.value,
          stock: Number(value.stock),
          price: Number(value.price),
          discountPercentage: Number(value.discountPercentage),
          thumbnailPosition: Number(value.thumbnailPosition)
        }))
      }
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      req.flash("error", "Không tìm thấy sản phẩm");
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    req.flash("success", "Cập nhật sản phẩm thành công");
    res.redirect(`${systemConfig.prefixAdmin}/products`);

  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    req.flash("error", "Có lỗi xảy ra khi cập nhật sản phẩm");
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const product = await Product.findOne(find);
    // console.log(product);
    res.render(`admin/pages/products/detail`, {
      pageTitle: "Chi tiết sản phẩm",
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products}`);
  }
};



// [POST] /admin/products/create-variants
module.exports.createVariantsPost = async (req, res) => {
  const { user } = res.locals;
  const {
    title,
    product_category_id,
    description,
    featured,
    variants,
    status,
    position,
    thumbnail,
  } = req.body;
  const countProduct = await Product.count();
  const productData = {
    title,
    product_category_id,
    description,
    featured,
    thumbnail,
    status,
    position : position ? position : countProduct ,
    createdBy: {
      account_id: user.id,
    },
  };
  if (variants && variants.length > 0) {
        productData.variants = variants.map(variant => ({
          name: variant.name,
          value: variant.values.map(value => ({
            value: value.value,
            stock: Number(value.stock),
            price: Number(value.price),
            discountPercentage: Number(value.discountPercentage),
            thumbnailPosition: Number(value.thumbnailPosition)
          }))
        }));
      }
      const newProduct = new Product(productData);
      await newProduct.save();

   req.flash("success", "Tạo thành công sản phẩm");
   res.redirect(`${systemConfig.prefixAdmin}/products`);
};