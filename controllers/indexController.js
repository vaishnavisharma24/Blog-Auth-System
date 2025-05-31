const db = require("../db");

// Controller for Welcome Page with Pagination
exports.getWelcomePage = (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number, default to 1
  const limit = 10; // Number of posts per page
  const offset = (page - 1) * limit; // Calculate offset

  db.query(
    "SELECT COUNT(*) AS total FROM posts WHERE isApproved = TRUE",
    (err, data) => {
      if (err) {
        console.error("Error fetching total posts:", err);
        return res.status(500).send("Server error");
      }

      const totalPosts = data[0].total;
      const totalPages = Math.ceil(totalPosts / limit);

      if (page > totalPages && totalPages > 0) {
        return res.redirect(`/?page=${totalPages}`);
      }

      const query = `
      SELECT posts.id, posts.title, posts.content, users.username, posts.image, posts.caption
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      WHERE posts.isApproved = TRUE
      ORDER BY posts.id DESC
      LIMIT ? OFFSET ?
    `;

      db.query(query, [limit, offset], (err, results) => {
        if (err) {
          console.error("Error fetching posts:", err);
          return res.status(500).send("Server error");
        }

        res.render("welcome", {
          posts: results,
          currentPage: page,
          totalPages: totalPages,
          totalPosts: totalPosts,
          user: req.session.user, // Pass user object to EJS
        });
      });
    }
  );
};

// Controller for Viewing a Single Post
exports.getPostById = (req, res) => {
  const query = `
        SELECT posts.id, posts.title, posts.content, users.username, posts.image
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = ?
    `;

  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).send("Server error");
    }

    if (results.length === 0) {
      return res.status(404).send("Post not found");
    }

    res.render("post", { post: results[0] });
  });
};
