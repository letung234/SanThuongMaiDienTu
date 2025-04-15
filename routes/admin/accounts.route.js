const express = require("express");
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/account.controller");
const upload = multer();
const uploadStream = require("../../middlewares/admin/uploadCloud.middleware");
const validater = require("../../validaters/admin/account.validate")
const asyncWrapper = require("../../helpers/asyncWrapper");
//[GET/admin/accounts
router.get("/",asyncWrapper(controller.index));

router.get("/create",asyncWrapper(controller.create));

router.post("/create", upload.any(), uploadStream.uploadMultiple, validater.creatPost, asyncWrapper(controller.createPost));

router.get("/edit/:id", asyncWrapper(controller.edit));

router.patch(
  "/edit/:id",
  upload.any(),
  uploadStream.uploadMultiple,
  validater.editPatch,
  asyncWrapper(controller.editPatch)
);
router.get("/detail/:id", asyncWrapper(controller.detail));
module.exports = router;