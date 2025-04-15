const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../helpers/asyncWrapper");
const controller = require("../../controllers/client/room-chat.controller");

router.get("/",  asyncWrapper(controller.index));
router.get("/create",  asyncWrapper(controller.create));
router.post("/create",  asyncWrapper(controller.createPost));

module.exports = router;
