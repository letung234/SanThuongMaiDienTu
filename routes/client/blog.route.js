const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/blog.controller");
const asyncWrapper = require("../../helpers/asyncWrapper");
router.get("/:slug", asyncWrapper(controller.index))
router.get("/category-blog/:slug", asyncWrapper(controller.category))

module.exports = router;
