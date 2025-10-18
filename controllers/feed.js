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
