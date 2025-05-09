const BlogCategory = require("../../models/category-blog.model");
const systemConfig = require("../../config/system");
const FilterStatusHelper = require("../../helpers/filterStatus");
const SearchHelper = require("../../helpers/search");
const createTreeHelper = require("../../helpers/createTree");
const Account = require("../../models/account.model");
const paginationHelper = require("../../helpers/pagination");
// [GET] /admin/blog-category
module.exports.index = async (req, res) => {
  const filterStatus = FilterStatusHelper(req.query);
  const objectSearch = SearchHelper(req.query);

  // Tìm danh mục cha (parent_id = "")
  let find = { deleted: false, parent_id: "" };

  if (req.query.status) {
    find.status = req.query.status;
  }
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  // Pagination
  const countProducts = await BlogCategory.count(find);
  let objectPagination = paginationHelper(
    { currentPage: 1, limitItems: 4 },
    req.query,
    countProducts
  );

  // Sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }

  // Tìm danh mục cha
  const parentCategories = await BlogCategory.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  // Lấy danh sách ID của danh mục cha
  const parentIds = parentCategories.map((record) => record.id);

  // Đệ quy tìm tất cả danh mục con
  const getAllChildren = async (parentIds) => {
    let allChildren = [];
    let queue = [...parentIds];

    while (queue.length > 0) {
      const children = await BlogCategory.find({
        deleted: false,
        parent_id: { $in: queue },
      });
      if (children.length > 0) {
        allChildren.push(...children);
        queue = children.map((child) => child.id);
      } else {
        queue = [];
      }
    }

    return allChildren;
  };

  const allChildren = await getAllChildren(parentIds);

  // Kết hợp danh mục cha & tất cả danh mục con
  const allCategories = [...parentCategories, ...allChildren];

  // Lấy thông tin người tạo danh mục
  for (const record of allCategories) {
    const user = await Account.findOne({ _id: record.createdBy.account_id });
    if (user) {
      record.accountFullName = user.fullName;
    }
  }

  // Chuyển danh mục thành cây phân cấp
  const newRecords = createTreeHelper.tree(allCategories);

  // Render kết quả
  res.render("admin/pages/blog-category/index", {
    pageTitle: "Chuyên mục",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

// [PATCH] /admin/blog-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  console.log(req.params);
  const status = req.params.status;
  const id = req.params.id;
  await BlogCategory.updateOne({ _id: id }, { status: status });
  req.flash("success", "Cập nhật trạng thái thành công");
  res.redirect("back");
};

// [PATCH] /admin/blog-category/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(",");
  // console.log(ids);
  switch (type) {
    case "active":
      await BlogCategory.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash("success", `Cập nhật trạng thái hoạt động cho ${ids.length} sản phẩm`);
      break;
    case "inactive":
      await BlogCategory.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      req.flash("success", `Cập nhật trạng thái dừng hoạt cho ${ids.length} sản phẩm`);
      break;
    case "delete-all":
      await BlogCategory.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          deletedAt: Date.now(),
        }
      );
      req.flash("success", `Xóa ${ids.length} sản phẩm thành công`);
      break;
    case "change-position":
      for (const item of ids) {
        const [id, position] = item.split("-");
        await BlogCategory.updateOne(
          { _id: id },
          {
            position: position,
          }
        );
      }
      req.flash("success", `Xóa ${ids.length} sản phẩm thành công`);
      break;

    default:
      break;
  }
  res.redirect("back");
};

// [GET] /admin/blog-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await BlogCategory.find(find);
  const newRecords = createTreeHelper.tree(records);
  console.log(newRecords);
  res.render("admin/pages/blog-category/create", {
    pageTitle: "Tạo danh mục",
    record: newRecords,
  });
};
// [POST] /admin/blog-category/create
module.exports.createCategory = async (req, res) => {
  const permissions = res.locals.role.permission;

  if (permissions.includes("blog-category_create")) {
    if (req.body.position == "") {
      const countProduct = await BlogCategory.count();
      req.body.position = countProduct + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }
    req.body.createdBy = {
      account_id: res.locals.user.id,
    };
    const record = new BlogCategory(req.body);
    await record.save();
    req.flash("success", "Thêm danh mục thành công");
    res.redirect(`${systemConfig.prefixAdmin}/blog-category`);
  } else {
    res.send("403");
    return;
  }
};

// [GET] /admin/blog-category/edit/:id

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await BlogCategory.findOne({
      _id: id,
      deleted: false,
    });
    const records = await BlogCategory.find({ deleted: false });
    const newRecords = createTreeHelper.tree(records);
    res.render("admin/pages/blog-category/edit", {
      pageTitle: "Chỉnh sửa Chuyên mục",
      data: data,
      records: newRecords,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/blog-category`);
  }
};

// [PATCH] /admin/blog-category/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.position = parseInt(req.body.position);
    await BlogCategory.updateOne(
      {
        _id: id,
      },
      req.body
    );
    req.flash("success", "Cập nhật thành công");
    res.redirect(`${systemConfig.prefixAdmin}/blog-category`);
  } catch (error) {
    req.flash("error", "Cập nhật thất bại");
  }
};

// [DELETE] /admin/blog-category/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  try {
    await BlogCategory.updateOne(
      { _id: id },
      {
        deleted: true,
      }
    );
    req.flash("success", "Xóa danh mục thành công");
  } catch (error) {
    req.flash("error", "Xóa danh mục không thành công");
  }
  res.redirect(`${systemConfig.prefixAdmin}/blog-category`);
};

// [GET] /admin/blog-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const find = {
      deleted: false,
      _id: id,
    };
    const record = await BlogCategory.findOne(find);
    let parentCategory = "";
    if (record.parent_id.length > 0) {
      findCategory = {
        _id: record.parent_id,
      };
      parentCategory = await BlogCategory.findOne(findCategory);
    }
    res.render("admin/pages/blog-category/detail", {
      pageTitle: "Chi tiết Chuyên mục",
      record: record,
      parentCategory: parentCategory,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/blog-category`);
  }
};
