const db = require("../db");

// Dashboard with Pagination
exports.getDashboard = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const query = "SELECT COUNT(*) AS total FROM posts WHERE user_id = ?";
  const params = [req.session.user.id];

  db.query(query, params, (err, data) => {
    if (err) {
      console.error("Error fetching posts count:", err);
      return res.status(500).send("Server error");
    }

    const totalPosts = data[0].total;
    const totalPages = Math.ceil(totalPosts / limit);

    const postsQuery = `
      SELECT posts.id, posts.title, posts.content, posts.image, posts.caption, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = ?
      ORDER BY posts.id DESC
      LIMIT ? OFFSET ?
    `;
    const postsParams = [req.session.user.id, limit, offset];

    db.query(postsQuery, postsParams, (err, results) => {
      if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).send("Server error");
      }

      res.render("dashboard", {
        user: req.session.user,
        posts: results,
        currentPage: page,
        totalPages: totalPages,
      });
    });
  });
};

// Add Post Page
exports.getAddPostPage = (req, res) => {
  res.render("addpost");
};

// Add Post Handle
exports.addPost = (req, res) => {
  const { title, content, caption } = req.body;

  const newPost = {
    title,
    content,
    caption,
    user_id: req.session.user.id,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  };

  db.query("INSERT INTO posts SET ?", newPost, (err) => {
    if (err) {
      console.error("Error adding post:", err);
      return res.status(500).send("Server error");
    }

    req.flash("success_msg", "Post added successfully.");
    res.redirect("/posts");
  });
};

// Edit Post Page
exports.getEditPostPage = (req, res) => {
  db.query(
    "SELECT * FROM posts WHERE id = ? AND user_id = ?",
    [req.params.id, req.session.user.id],
    (err, result) => {
      if (err) {
        console.error("Error fetching post:", err);
        return res.status(500).send("Server error");
      }
      if (result.length > 0) {
        res.render("editpost", { post: result[0] });
      } else {
        req.flash("error_msg", "No post found");
        res.redirect("/posts");
      }
    }
  );
};

// Edit Post Handle
exports.editPost = (req, res) => {
  const { title, content, caption } = req.body;
  const updatedPost = { title, content, caption };

  if (req.file) {
    updatedPost.image = `/uploads/${req.file.filename}`;
  }

  db.query(
    "UPDATE posts SET ? WHERE id = ? AND user_id = ?",
    [updatedPost, req.params.id, req.session.user.id],
    (err) => {
      if (err) {
        console.error("Error updating post:", err);
        return res.status(500).send("Server error");
      }
      req.flash("success_msg", "Post updated");
      res.redirect("/posts");
    }
  );
};

// Delete Post Handle
exports.deletePost = (req, res) => {
  db.query(
    "DELETE FROM posts WHERE id = ? AND user_id = ?",
    [req.params.id, req.session.user.id],
    (err) => {
      if (err) {
        console.error("Error deleting post:", err);
        return res.status(500).send("Server error");
      }
      req.flash("success_msg", "Post deleted");
      res.redirect("/posts");
    }
  );
};

// Show Individual Post
exports.getPostById = (req, res) => {
  const postId = req.params.id;
  const query = `
        SELECT posts.id, posts.title, posts.content, posts.image, users.username
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = ?
    `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).send("Server error");
    }

    if (results.length > 0) {
      res.render("post", { post: results[0] });
    } else {
      res.status(404).send("Post not found");
    }
  });
};
