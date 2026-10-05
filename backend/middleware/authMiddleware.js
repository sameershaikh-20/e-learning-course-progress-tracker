const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token from Authorization header and attach user to req.user
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided, authorization denied",
        data: null,
      });
    }

    // Extract the token after 'Bearer '
    const token = authHeader.split(" ")[1];

    // Verify token with JWT secret
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    // Find the user in database using decoded id
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found or token invalid",
        data: null,
      });
    }

    // Attach user document to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token",
      data: null,
    });
  }
}

module.exports = authMiddleware;