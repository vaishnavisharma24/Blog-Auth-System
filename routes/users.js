const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Register Page
router.get("/register", userController.getRegisterPage);

// Login Page
router.get("/login", userController.getLoginPage);

// Register Handle
router.post("/register", userController.registerUser);

// Login Handle
router.post("/login", userController.loginUser);

// Profile Page
router.get("/profile", userController.getProfilePage);

// Logout Handle
router.get("/logout", userController.logoutUser);

module.exports = router;
