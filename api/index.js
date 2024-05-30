const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
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
