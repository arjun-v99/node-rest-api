require("dotenv").config();

const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

// Setting up CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.statusCode;
  const message = error.message;
  res.status(statusCode).json({ message: message });
});

mongoose.connect(process.env.MONGODB_URL).then(() => {
  app.listen(8080);
});
