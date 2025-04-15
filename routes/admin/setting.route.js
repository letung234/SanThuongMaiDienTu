const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();
const asyncWrapper = require("../../helpers/asyncWrapper");

const controller = require("../../controllers/admin/setting.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware")

//[GET/admin/setting/general
router.get("/general", asyncWrapper(controller.general));

router.patch(
   "/general",
   upload.single("logo"),
   uploadCloud.upload,
   asyncWrapper(controller.generalPatch
));


module.exports = router;
