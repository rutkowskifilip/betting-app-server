const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();
// app.use(express.static("public"));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", async (req, res) => {
  return res.send("serwer on vercel");
});

app.use("/user", require("./userRouter"));
app.use("/match", require("./matchRouter"));
app.use("/bet", require("./betRouter"));
app.use("/group", require("./groupRouter"));

app.listen(port, "192.168.0.141", () => {
  console.log(`Example app listening on port ${port}`);
});
