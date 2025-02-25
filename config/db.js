const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0,
});

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully.");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });

module.exports = db;

// const mysql = require("mysql2");
// const dotenv = require("dotenv");
// dotenv.config();
// const db = mysql.createPool({
//   host: process.env.HOST,
//   user: process.env.USER,
//   database: process.env.DATABASE,
//   password: process.env.PASSWORD,
//   waitForConnections: true,
//   connectionLimit: 10, // Maximum number of connections in the pool
//   queueLimit: 0,
// });
// db.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL:", err);
//     process.exit(1);
//   } else {
//     console.log("Connected to MySQL");
//   }
// });

// module.exports = db;
