const express = require("express");
const router = express.Router();
const multer = require("multer");
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/admin/my-account.controller");
const validate = require("../../validaters/admin/auth.validate");
const upload = multer();
const uploadStream = require("../../middlewares/admin/uploadCloud.middleware");

//[GET]/admin/my-account
router.get("/", asyncWrapper(controller.index));

//[GET]/admin/my-account/edit
router.get("/edit", asyncWrapper(controller.edit));

//[PATCH]/admin/my-account/edit
router.patch("/edit", upload.single("avatar"), uploadStream.upload, asyncWrapper(controller.editPatch));

module.exports = router;
