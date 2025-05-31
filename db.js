const mysql = require("mysql");

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blog",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

module.exports = db;
