const { validationResult } = require("express-validator/check");
const path = require("path");
const fs = require("fs");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "POst fetched successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPosts = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Invalid request");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image found");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");

  try {
    const post = new Post({
      title: title,
      content: content,
      creator: req.userId,
      imageUrl: imageUrl,
    });
    await post.save();

    const userById = await User.findById(req.userId);
    userById.posts.push(post);
    await userById.save();

    res.status(201).json({
      message: "Post created successfully",
      post: post,
      creator: {
        _id: userById._id,
        name: userById.name,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const findPost = await Post.findById(postId);
    if (!findPost) {
      // If you throw an error inside a then() block, it will trigger the next catch() block
      const error = new Error("Post was not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ message: "Post fetched", post: findPost });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Invalid request");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }

  try {
    const findPost = await Post.findById(postId);
    if (!findPost) {
      // If you throw an error inside a then() block, it will trigger the next catch() block
      const error = new Error("Post was not found");
      error.statusCode = 404;
      throw error;
    }
    // Uploaded image are db value are not same. so we remove file specified in db from our server.
    if (imageUrl !== findPost.imageUrl) {
      clearImage(findPost.imageUrl);
    }

    findPost.title = title;
    findPost.imageUrl = imageUrl;
    findPost.content = content;

    const updateResult = await findPost.save();

    return res
      .status(200)
      .json({ message: "Post updated", post: updateResult });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      // If you throw an error inside a then() block, it will trigger the next catch() block
      const error = new Error("Post was not found");
      error.statusCode = 404;
      throw error;
    }

    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);

    const findUser = await User.findById(req.userId);
    findUser.posts.pull(postId);
    await findUser.save();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Would receive filPath from db
const clearImage = (filePath) => {
  // Create directory to image
  filePath = path.join(__dirname, "..", filePath);
  // delete image
  fs.unlink(filePath, (err) => console.log(err));
};
