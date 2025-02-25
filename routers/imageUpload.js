const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/multer");

// Upload image to Cloudinary
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads",
    });
    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: result.secure_url,
      result,
    });
  } catch (error) {
    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const db = require("../config/db");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     const fileExtension = path.extname(file.originalname); // Get file extension
//     cb(null, `${uniqueSuffix}${fileExtension}`);
//   },
// });
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed."));
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
// });
// router.get("/upload", (req, res) => {
//   const query = "select * from image";
//   db.query(query, (err, result) => {
//     if (err) {
//       return res.send(err);
//     }
//     return res.send(result);
//   });
// });
// router.post("/upload", upload.single("profileImage"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send({ message: "Please upload an image" });
//   }
//   const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
//     req.file.filename
//   }`;
//   const selectQuery = "insert into image (image) values (?)";
//   db.query(selectQuery, imageUrl, (err, result) => {
//     if (err) {
//       return res.status(403).send(err);
//     }
//     return res.json(result);
//   });
// });

// module.exports = upload;
