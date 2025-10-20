const { validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signUp = async (req, res, next) => {
  try {
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

    const hashedPwd = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedPwd,
    });

    const saveUser = await user.save();
    return res
      .status(201)
      .json({ message: "User  created successfully", userId: saveUser._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.logIn = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const error = new Error("User not found");
      error.statusCode = 422;
      throw error;
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      findUser.password
    );
    if (!checkPasswordMatch) {
      const error = new Error("Incorrect password");
      error.statusCode = 422;
      throw error;
    }

    const token = jwt.sign(
      { email: findUser.email, userId: findUser._id.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "4h" }
    );

    return res
      .status(200)
      .json({ token: token, userId: findUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 422;
      throw error;
    }
    return res.status(200).json({ userId: userId, status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const userId = req.userId;
  const status = req.body.status;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;
      throw error;
    }
    user.status = status;

    const saveUserResult = await user.save();
    return res.status(200).json({
      message: "Status updated successfully",
      status: saveUserResult,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
