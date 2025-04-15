const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/users.controller");
const asyncWrapper = require("../../helpers/asyncWrapper");
// router.get("/not-friend", controller.notFriend);
// router.get("/request", controller.request);
// router.get("/accept", controller.accept);
router.get("/", asyncWrapper(controller.index));

module.exports = router;
