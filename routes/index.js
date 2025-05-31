// filepath: c:\Users\ASUS\OneDrive\Desktop\project\routes\index.js
const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController"); // Correct import

// Welcome Page with Pagination
router.get("/", indexController.getWelcomePage);

// View Post Page
router.get("/post/:id", indexController.getPostById);

module.exports = router;
