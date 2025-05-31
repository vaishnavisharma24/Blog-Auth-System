const db = require("../db");

// Admin Dashboard
exports.getAdminDashboard = (req, res) => {
  const userId = req.session.user.id;

  // Pagination variables
  const itemsPerPage = 6; // Number of posts per page
  const currentPage = parseInt(req.query.page) || 1; // Current page from query params
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch total number of posts
  db.query("SELECT COUNT(*) AS count FROM posts", (err, countResult) => {
    if (err) {
      console.error("Error fetching post count:", err);
      return res.status(500).send("Server error");
    }

    const totalPosts = countResult[0].count;
    const totalPages = Math.ceil(totalPosts / itemsPerPage);

    // Fetch posts for the current page
    db.query(
      "SELECT * FROM posts LIMIT ? OFFSET ?",
      [itemsPerPage, offset],
      (err, posts) => {
        if (err) {
          console.error("Error fetching posts:", err);
          return res.status(500).send("Server error");
        }

        // Render the dashboard with posts and pagination data
        res.render("admin/dashboard", {
          user: req.session.user,
          posts: posts, // Pass posts to the view
          currentPage: currentPage, // Pass current page
          totalPages: totalPages, // Pass total pages
        });
      }
    );
  });
};

// Get All Users
exports.getAllUsers = (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).send("Server error");
    }
    res.render("admin/users", { users: results });
  });
};

// Delete User
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).send("Server error");
    }
    req.flash("success_msg", "User deleted successfully");
    res.redirect("/admin/users");
  });
};

// Get All Posts
exports.getAllPosts = (req, res) => {
  db.query("SELECT * FROM posts", (err, results) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).send("Server error");
    }
    res.render("admin/approvepost", { posts: results });
  });
};

// Delete Post
exports.deletePost = (req, res) => {
  const postId = req.params.id;
  db.query("DELETE FROM posts WHERE id = ?", [postId], (err) => {
    if (err) {
      console.error("Error deleting post:", err);
      return res.status(500).send("Server error");
    }
    req.flash("success_msg", "Post deleted successfully");
    res.redirect("/admin/posts");
  });
};

// Approve Post
exports.approvePost = (req, res) => {
  const postId = req.params.id;

  db.query(
    "UPDATE posts SET isApproved = TRUE WHERE id = ?",
    [postId],
    (err) => {
      if (err) {
        console.error("Error approving post:", err);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
      res.json({ success: true, message: "Post approved successfully" });
    }
  );
};
