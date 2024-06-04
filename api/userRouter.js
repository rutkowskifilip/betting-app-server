const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { decryptPass } = require("../utils/bcrypt");
const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");

const mailer = require("../utils/mailer");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT id,password FROM users  WHERE username=?;",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length > 0) {
        const userId = results[0].id;
        if (await decryptPass(password, results[0].password)) {
          const token = await jwt.createToken({ id: userId }, "3h");
          res.setHeader("Authorization", token);
          res.send({ id: userId, token: token });
        } else {
          res.status(409).send("Incorrect password");
        }
      } else {
        res.status(409).send("User with this username doesn't exist");
      }
    }
  );
});
router.post("/setPassword", async (req, res) => {
  const password = await bcrypt.encryptPass(req.body.password);
  const username = req.body.username;
  const auth = req.body.auth;
  const email = await jwt.verifyToken(auth);

  db.query(
    "SELECT * FROM users WHERE username = ?;",
    [username],
    (err, existingUser) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (existingUser.length > 0) {
        // Username already exists
        res
          .status(409)
          .send("Username already in use. Please choose a different one.");
        return;
      }

      db.query(
        "UPDATE users SET password= ?, username=? WHERE email=?;",
        [password, username, email],
        (err, results) => {
          if (err) {
            console.error("Error querying database:", err);
            res.status(500).send("Internal Server Error");
            return;
          }

          if (results.affectedRows > 0) {
            res.status(200).send("Password has been saved");
          } else {
            // Handle unexpected scenario where update might not have affected any rows
            console.warn("Unexpected: Update did not affect any rows.");
            res.status(500).send("Internal Server Error (Update failed)");
          }
        }
      );
    }
  );
});
router.post("/add", async (req, res) => {
  const token = req.cookies.token;
  const email = req.body.email;
  console.log(await jwt.verifyToken(token));
  // Verify JWT token (unchanged)
  if (await jwt.verifyToken(token)) {
    // Check for existing user with the same email before insertion
    db.query(
      "SELECT * FROM users WHERE email = ?",
      email,
      (err, existingUser) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        if (existingUser.length > 0) {
          // User with the same email already exists
          res
            .status(409)
            .send(
              "Email address already in use. Please choose a different one."
            );
          return;
        }

        // Email is available, proceed with user creation
        db.query(
          "INSERT INTO users (email) VALUES (?)",
          email,
          async (err, results) => {
            if (err) {
              console.error("Error querying database:", err);
              res.status(500).send("Internal Server Error");
              return;
            }

            if (results.affectedRows > 0) {
              const auth = await jwt.createToken(email, "72h");
              console.log(auth);
              res.status(201).send("User created successfully"); // Use 201 for created resources
              mailer.sendMail(email, auth);
            } else {
              // Handle unexpected scenario where insert might not have affected any rows
              console.warn("Unexpected: Insert did not affect any rows.");
              res.status(500).send("Internal Server Error (Insert failed)");
            }
          }
        );
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/table", (req, res) => {
  db.query(
    "SELECT * FROM users u WHERE u.id !=0 ORDER BY points DESC, perfectBets DESC, goodBets DESC;",
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Users not found");
        return;
      }
      // console.log(results);
      res.send(results);
      // console.log(results[0]);
      // res.json(results[0]);
    }
  );
  // console.log(req.body);
});

module.exports = router;
