const express = require("express");
const router = express.Router();
const multer = require("multer");
const asyncWrapper = require("../../helpers/asyncWrapper");
const upload = multer();
const uploadStream = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/admin/blog.controller");
router.get("/", asyncWrapper(controller.index));
router.get("/create", asyncWrapper(controller.create));
router.post(
  "/create",
  upload.single("thumbnail"),
  uploadStream.upload,
  asyncWrapper(controller.createPost
));
router.post("/change-status/:id",asyncWrapper(controller.changeStatus));
router.delete("/delete/:id",asyncWrapper(controller.deleteItem));
router.get("/detail/:id", asyncWrapper(controller.detail));
router.get("/edit/:id", asyncWrapper(controller.edit));
router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  uploadStream.upload,
  asyncWrapper(controller.update
));
module.exports = router;
