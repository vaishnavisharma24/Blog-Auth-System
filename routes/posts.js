// filepath: c:\Users\ASUS\OneDrive\Desktop\project\routes\posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const postController = require("../controllers/postController");
const { error } = require("console");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});
// image upload router
router.post("/upload", upload.single("image"), (req, res) => {
  if (req.file) {
   return  res.status(400).json({ error: "No file uploaded" });
}

// return the relative path of the uploaded image
const imagePath = `/uploads/${req.file.filename}`;
res.status(200).send(`READY:${imagePath}`);
});

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/users/login");
  }
}

// Middleware to ensure admin access
function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  } else {
    req.flash("error_msg", "You are not authorized to view this resource");
    res.redirect("/users/login");
  }
}

// Export middleware functions
module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  router,
};

// Routes
router.get("/", ensureAuthenticated, postController.getDashboard);
router.get("/addpost", ensureAuthenticated, postController.getAddPostPage);
router.post(
  "/addpost",
  ensureAuthenticated,
  upload.single("image"),
  postController.addPost
);
router.get("/edit/:id", ensureAuthenticated, postController.getEditPostPage);
router.post(
  "/edit/:id",
  ensureAuthenticated,
  upload.single("image"),
  postController.editPost
);
router.get("/delete/:id", ensureAuthenticated, postController.deletePost);
router.get("/:id", postController.getPostById);

module.exports.router = router;
