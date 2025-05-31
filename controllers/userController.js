const bcrypt = require("bcryptjs");
const db = require("../db");

// Register Page
exports.getRegisterPage = (req, res) => {
  res.render("register", { errors: [] });
};

// Login Page
exports.getLoginPage = (req, res) => {
  res.render("login");
};

// Register Handle
exports.registerUser = (req, res) => {
  const { username, email, password, password2 } = req.body;

  // Validation
  const errors = [];
  if (!username || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    return res.render("register", {
      errors,
      username,
      email,
      password,
      password2,
    });
  }

  // Check if email is already registered
  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        req.flash("error_msg", "Server error");
        return res.redirect("/users/register");
      }
      if (results.length > 0) {
        req.flash("error_msg", "Email is already registered");
        return res.redirect("/users/register");
      }

      // Hash Password and Save User
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;

          const newUser = { username, email, password: hash, role: "user" }; // Default role is 'user'
          db.query("INSERT INTO users SET ?", newUser, (err) => {
            if (err) {
              console.error("Error saving user:", err);
              req.flash("error_msg", "Server error");
              return res.redirect("/users/register");
            }
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/users/login");
          });
        });
      });
    }
  );
};

// Login Handle
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    req.flash("error_msg", "Please fill in all fields");
    return res.redirect("/users/login");
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      req.flash("error_msg", "Server error");
      return res.redirect("/users/login");
    }
    if (results.length === 0) {
      req.flash("error_msg", "Email is not registered");
      return res.redirect("/users/login");
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        req.flash("error_msg", "Server error");
        return res.redirect("/users/login");
      }
      if (isMatch) {
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role, // Store role in session
        };
        req.flash("success_msg", "Login successful");
        res.redirect(user.role === "admin" ? "/admin/dashboard" : "/posts");
      } else {
        req.flash("error_msg", "Incorrect password");
        res.redirect("/users/login");
      }
    });
  });
};

// Profile Page
exports.getProfilePage = (req, res) => {
  if (req.session.user) {
    res.render("profile", { user: req.session.user });
  } else {
    req.flash("error_msg", "Please log in to view your profile");
    res.redirect("/users/login");
  }
};

// Logout Handle
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      req.flash("error_msg", "Error logging out");
      return res.redirect("/posts");
    }
    res.redirect("/");
  });
};
