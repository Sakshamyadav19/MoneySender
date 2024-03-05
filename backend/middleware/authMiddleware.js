const jwtSecret = require("../config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  token = token.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Invalid Access" });
  }

  try {
    const decodeToken = jwt.verify(token, jwtSecret);
    if (decodeToken.userId) req.userId = decodeToken.userId;
    next();
  } catch {
    res.status(403).json({});
  }
};

module.exports = authMiddleware;
