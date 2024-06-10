// const mysql = require("mysql");
// require("dotenv").config();

// let db;

// function handleDisconnect() {
//   db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//   });

//   db.connect((err) => {
//     if (err) {
//       console.error("Error connecting to MySQL database:", err);
//       setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
//     } else {
//       console.log("Connected to MySQL database");
//     }
//   });

//   db.on("error", (err) => {
//     if (err.code === "PROTOCOL_CONNECTION_LOST") {
//       console.error("MySQL connection lost. Reconnecting...");
//       handleDisconnect(); // Reconnect if the connection is lost
//     } else {
//       throw err;
//     }
//   });
// }

// handleDisconnect();

// module.exports = db;
const mysql = require("mysql");
require("dotenv").config();

let pool;

function createPool() {
  pool = mysql.createPool({
    connectionLimit: 10, // Dostosuj limit połączeń według potrzeb
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  pool.on("error", (err) => {
    console.error("MySQL pool error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Przy utracie połączenia, ponownie tworzymy pulę połączeń
      createPool();
    } else {
      throw err;
    }
  });

  console.log("MySQL pool created");
}

createPool();

module.exports = {
  query: (sql, values, callback) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return callback(err);
      }
      connection.query(sql, values, (err, results) => {
        connection.release(); // Zwolnij połączenie z puli
        callback(err, results);
      });
    });
  },
};
