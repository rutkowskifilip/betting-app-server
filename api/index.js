const express = require("express");
const displayRoutes = require("express-routemap");
const routemap = require("express-routemap");
const app = express();
const port = 4000;
const mysql = require("mysql");
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("serwer");
});
app.use("/user", require("./userRouter"));
app.use("/match", require("./matchRouter"));
app.use("/bet", require("./betRouter"));
app.use("/group", require("./groupRouter"));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
