const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
// [GET] /admin/products
const controller = require("../../controllers/admin/role.controller");

router.get("/",asyncWrapper(controller.index));
router.get("/create",asyncWrapper(controller.create));
router.post("/create", asyncWrapper(controller.createPost));
router.get("/edit/:id", asyncWrapper(controller.edit));
router.patch("/edit/:id", asyncWrapper(controller.editPatch));
router.delete("/delete/:id", asyncWrapper(controller.delete));
router.get("/detail/:id", asyncWrapper(controller.detail));
router.get("/permissions", asyncWrapper(controller.permissions));
router.patch("/permissions", asyncWrapper(controller.permissionsPatch));

module.exports = router;
