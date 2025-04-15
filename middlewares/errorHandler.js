
const errorHandler = (err, req, res, next) => {
    res.status(500).render("client/pages/errors/error.pug", {
      message: err.message,
      status: 500,
    });
};

module.exports = errorHandler;
