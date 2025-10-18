exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "This is the first post",
        description: "This is the description",
      },
    ],
  });
};

exports.createPosts = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  console.log(title, content);
  res.status(201).json({
    message: "Post created successfully",
    post: {
      id: new Date().toISOString(),
      title: title,
      content: content,
    },
  });
};
