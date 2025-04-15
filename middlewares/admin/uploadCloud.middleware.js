const uploadToCloudinary = require("../../helpers/uploadToCloudinary");

module.exports.upload = async (req, res, next) => {
  if (req.file) {
    const link = await uploadToCloudinary(req.file.buffer);
    req.body[req.file.fieldname] = link;
  } 
  next();
};
module.exports.uploadMultiple = async (req, res, next) => {
  // Duyệt qua các file và thực hiện upload lên Cloudinary
  const uploadResults = await Promise.all(
    req.files.map(async (file) => {
      const link = await uploadToCloudinary(file.buffer);
      return {
        fieldname: file.fieldname,
        link
      };
    })
  );

  // Gắn kết quả upload vào req.body
  uploadResults.forEach((result) => {
    req.body[result.fieldname] = result.link;
  });
  next();
};
module.exports.uploadArray = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadResults = await Promise.all(
      req.files.map(async (file) => ({
        fieldname: file.fieldname,
        link: await uploadToCloudinary(file.buffer),
      }))
    );

    uploadResults.forEach(({ fieldname, link }) => {
      if (!req.body[fieldname]) {
        req.body[fieldname] = [];
      }
      req.body[fieldname].push(link);
    });

    next();
};