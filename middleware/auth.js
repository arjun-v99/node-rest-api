const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const isAuthenticated = req.get("Authorization");
  if (!isAuthenticated) {
    const error = new Error("Not Authorized");
    error.statusCode = 401;
    throw error;
  }
  const token = isAuthenticated.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not Authorized");
    error.statusCode = 500;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
