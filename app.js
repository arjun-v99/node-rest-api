require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(express.json());

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

mongoose.connect(process.env.MONGODB_URL).then(() => {
  app.listen(8080);
});
