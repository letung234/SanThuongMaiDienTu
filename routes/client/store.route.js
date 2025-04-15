const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/client/store.controller");
router.get("/:id", asyncWrapper(controller.index));

module.exports = router;
