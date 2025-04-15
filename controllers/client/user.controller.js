const md5 = require("md5");
const generateHelper = require("../../helpers/generate");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");
const sendMailHelper = require("../../helpers/sendMail");
// [GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản",
  });
};
// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
  });
  if (existEmail) {
    req.flash("error", "Email đã tồn tại");
    res.redirect("back");
    return;
  }
  req.body.password = md5(req.body.password);
  const user = new User(req.body);
  await user.save();
   if (req.cookies.token) {
     res.clearCookie("token");
   }
  res.cookie("tokenUser", user.tokenUser, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.redirect("/");
};

// [GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
  try{
const email = req.body.email;

  const password = req.body.password;
  const user = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`), $options: "i" },
  });
  if (!user) {
    req.flash("error", "Email không tồn tại");
    res.redirect("back");
    return;
  }

  if (!md5(password) === user.password) {
    req.flash("error", "Sai mật khẩu");
    res.redirect("back");
    return;
  }

  if (user.status === "inactive") {
    req.flash("error", "Tài khoản đang bị khóa");
    res.redirect("back");
    return;
  }
  const cart = await Cart.findOne({
    user_id: user.id,
  });
  if (cart) {
    res.cookie("cartId", cart.id);
  } else {
    await Cart.updateOne(
      {
        _id: req.cookies.cartId,
      },
      {
        user_id: user.id,
      }
    );
  }
    if (req.cookies.token) {
      res.clearCookie("token");
    }

  res.cookie("tokenUser", user.tokenUser, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

 

  res.redirect("/");
  }
  catch(error){
    console.log(error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("back");
  }
  
};

// [GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("cartId");
  res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu",
  });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: "false",
  });
  if (!user) {
    req.flash("error", "Email không tồn tại");
    res.redirect("back");
    return;
  }
  //Lưu thông tin vào database
  //--Có thể check xem email cần nhận mã otp đã tồn tại chưa nếu tồn tại cho sau 3p gửi lại
  const otp = generateHelper.generateRandomNumber(8);
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '3m' }  // Thời gian hết hạn là 3m
    },
  };
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  //Nếu tồn tại email thì gửi mã otp qua email
  console.log("Gửi mã OTP qua email ", otp);
  const subject = "Mã OTP xác minh láy lại mật khẩu";
  const html = `Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Thời gian sử dụng là 3 phút`;
  sendMailHelper.sendMail(email, subject, html);
  res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otpPassword
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;
  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email,
  });
};

// [POST] /user/password/otpPasswordPost
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });
  if (!result) {
    req.flash("error", "OTP không hợp lệ!");
    res.redirect("back");
    return;
  }
  const user = await User.findOne({
    email: email,
  });
  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/user/password/reset");
};

// [GET] /user/password/resetPassword
module.exports.resetPassword = async (req, res) => {
  const email = req.query.email;
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

// [POST] /user/password/resetPassword
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;

  await User.updateOne(
    {
      tokenUser: tokenUser,
    },
    {
      password: md5(password),
    }
  );

  res.redirect("/");
};

// [GET] /user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
  });
};


// [GET] /user/edit/:id
module.exports.edit = async (req, res) => {
  res.render("client/pages/user/edit", {
    pageTitle: "Sửa thông tin tài khoản",
  });
};

module.exports.editPatch = async (req, res) => {
  const userId = res.locals.user.id;  
  const { fullName, email, password, phone, avatar} = req.body;


    const user = await User.findById(userId);
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      user.password = md5(req.body.password);
    }

    const updatedUser = await user.save();

    req.flash("success", "Cập nhập thông tin thành công !")
    res.redirect("/user/info");
};