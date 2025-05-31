// filepath: c:\Users\ASUS\OneDrive\Desktop\project\routes\admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { ensureAuthenticated, ensureAdmin } = require("./posts"); // Correct import

// Admin Dashboard
router.get(
  "/dashboard",
  ensureAuthenticated,
  ensureAdmin,
  adminController.getAdminDashboard
);

// Manage Users
router.get(
  "/users",
  ensureAuthenticated,
  ensureAdmin,
  adminController.getAllUsers
);
router.post(
  "/users/delete/:id",
  ensureAuthenticated,
  ensureAdmin,
  adminController.deleteUser
);

// Manage Posts
router.get(
  "/posts",
  ensureAuthenticated,
  ensureAdmin,
  adminController.getAllPosts
);

router.post(
  "/posts/approve/:id",
  ensureAuthenticated,
  ensureAdmin,
  adminController.approvePost
);

module.exports = router;
