const { validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");

const User = require("../models/user");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Invalid request");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPwd) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPwd,
      });
      return user.save();
    })
    .then((result) => {
      return res
        .status(201)
        .json({ message: "User  created successfully", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
