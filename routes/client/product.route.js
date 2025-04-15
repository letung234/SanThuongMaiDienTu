const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/client/product.controller");
router.get("/", asyncWrapper(controller.index));

// []
router.get("/detail/:slugProduct", asyncWrapper(controller.detail));

router.get("/:slugCategory", asyncWrapper(controller.category));

module.exports = router;
