const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");

//[GET] /admin/role

module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };
  const records = await Role.find(find);

  res.render("admin/pages/roles/index", {
    pageTitle: "Nhóm quyền",
    records: records,
  });
};

//[GET] /admin/role/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Tạo quyền",
  });
};

//[POST] /admin/role/create
module.exports.createPost = async (req, res) => {
  console.log(req.body);
  const record = new Role(req.body);
  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

//[GET] /admin/role/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    let find = {
      _id: id,
      deleted: false,
    };
    const data = await Role.findOne(find);
    res.render("admin/pages/roles/edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      data: data,
    });
  } catch (error) {
    req.flash("error", "Lỗi khi sửa quyền");
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
  }
};
//[PATCH] /admin/role/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, req.body);
    req.flash("success", "Sửa quyền thành công");
  } catch (error) {
    req.flash("error", "Lỗi khi sửa quyền");
  }
 res.redirect(`${systemConfig.prefixAdmin}/roles`);
};

//[DELETE] /admin/role/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, { deleted: true });
    req.flash("success", "Xóa quyền thành công");
  } catch (error) {
    req.flash("error", "Lỗi khi xóa quyền");
  }
  res.redirect("back");
};
//[GET] /admin/role/detail/:id
module.exports.detail = async (req, res) => {
  res.send("Ok");
};

//[GET] /admin/role/permissions
module.exports.permissions = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await Role.find(find);
  res.render("admin/pages/roles/permissions", {
    pageTitle: "Phân Quyền",
    records: records,
  });
};

//[PATCH] /admin/role/permissions
module.exports.permissionsPatch = async (req, res) => {
  const permissions = JSON.parse(req.body.permissions);
  try {
    for (const item of permissions) {
      await Role.updateOne(
        { _id: item.id },
        {
          permission: item.permissions,
        }
      );
    }
    req.flash("success", "Cập nhật quyền thành công");
  } catch (error) {
    req.flash("error", "Lỗi khi cập nhật quyền");
    
  }
  res.redirect("back");
};
