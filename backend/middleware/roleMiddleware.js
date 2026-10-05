// Middleware to check user role
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Not authorized: insufficient permissions",
        data: null,
      });
    }

    next();
  };
}

module.exports = roleMiddleware;