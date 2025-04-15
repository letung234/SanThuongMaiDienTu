module.exports.creatPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash("error", "Vui lòng nhập tiêu đề");
    res.redirect("back");
    return;
  }
  if (req.body.title.length < 8) {
    req.flash("error", "Vui lòng nhập tiêu đề ít nhất 8 kí tự");
    res.redirect("back");
    return;
  }
  next();
};
