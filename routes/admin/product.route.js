const express = require("express");
const router = express.Router();
const multer = require("multer");
const validate = require("../../validaters/admin/product.validate");
const asyncWrapper = require("../../helpers/asyncWrapper");
const upload = multer();
const uploadStream = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/admin/product.controller");
router.get("/", asyncWrapper(controller.index));
router.patch("/change-status/:status/:id", asyncWrapper(controller.changeStatus));
router.patch("/change-multi", asyncWrapper(controller.changeMulti));
router.delete("/delete/:id", asyncWrapper(controller.deleteItem));
router.get("/create", asyncWrapper(controller.create));
router.post(
  "/create",
  upload.array("thumbnail"),
  uploadStream.uploadArray,
  validate.creatPost,
  asyncWrapper(controller.createPost
));
router.get("/create-variants", asyncWrapper(controller.createVariants));
router.get("/edit/:id", asyncWrapper(controller.edit));
router.patch(
  "/edit/:id",
  upload.array("thumbnail"),
  uploadStream.uploadArray,
  validate.creatPost,
  asyncWrapper(controller.editPatch
));
router.get("/detail/:id", asyncWrapper(controller.detail));
router.post(
  "/create-variants",
  upload.array("thumbnail"),
  uploadStream.uploadArray,
  asyncWrapper(controller.createVariantsPost
));
router.get("/variantedit/:id", asyncWrapper(controller.editVariants));
router.patch(
  "/edit-variants/:id",
  upload.array("thumbnail"),
  uploadStream.uploadArray,
  asyncWrapper(controller.editVariantPatch
));
module.exports = router;
