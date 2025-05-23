const express = require("express");
const router = express.Router();
const multer = require("multer");
const asyncWrapper = require("../../helpers/asyncWrapper");
const upload = multer();
const uploadStream = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/admin/discount.controller");
router.get("/", asyncWrapper(controller.index));
router.get('/create', asyncWrapper(controller.create));
router.post("/create", asyncWrapper(controller.createPost));
router.get("/edit/:id", asyncWrapper(controller.edit));
router.patch("/edit/:id",asyncWrapper(controller.editPatch));
module.exports = router;
