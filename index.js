const express = require("express");
const db = require("./db");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const postRoutes = require("./routes/posts").router; // Import router from posts.js
const adminRoutes = require("./routes/admin"); // Import router from admin.js

app.use(express.static("public"));
app.use("/uploads", express.static("public/uploads"));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Connect Flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/posts", postRoutes); // Ensure .router is used if exported as an object
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
