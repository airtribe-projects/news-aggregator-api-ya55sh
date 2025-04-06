require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // Extract token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecretKey); // Verify token

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = authMiddleware;
