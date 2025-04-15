const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/client/home.controller");
router.get("/", asyncWrapper(controller.index));

module.exports = router;
