const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/client/cart.controller");
router.post("/add", asyncWrapper(controller.addPost));
router.get("/",asyncWrapper(controller.index));
router.delete("/delete/:productId", asyncWrapper(controller.delete));
router.patch("/update/:productId",asyncWrapper(controller.update));
module.exports = router;
