const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/auth.controller");
const validate = require("../../validaters/admin/auth.validate");
const asyncWrapper = require("../../helpers/asyncWrapper");
//[GET/admin/auth
router.get("/login", asyncWrapper(controller.login));

router.post("/login",validate.loginPost ,asyncWrapper(controller.loginPost));

router.get("/logout", asyncWrapper(controller.logout));


module.exports = router;
