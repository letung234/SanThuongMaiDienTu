const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/admin/dashboard.controller");
router.get("/", asyncWrapper(controller.dashboard));

module.exports = router;
