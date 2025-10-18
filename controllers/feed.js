const {
  validationCheck,
  validationResult,
} = require("express-validator/check");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "This is the first post",
        description: "This is the description",
        imageUrl: "images/umbrella.jpg",
        creator: {
          name: "John Doe",
        },
        createdAt: new Date(),
        _id: "1",
      },
    ],
  });
};

exports.createPosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: "Validation failed. Invalid request",
        errors: errors.array(),
      });
  }
  const title = req.body.title;
  const content = req.body.content;
  console.log(title, content);
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: {
        name: "John Doe",
      },
      createdAt: new Date(),
    },
  });
};
