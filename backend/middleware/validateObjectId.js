const mongoose = require("mongoose");

// Middleware to validate that URL parameters are valid MongoDB ObjectIds
function validateObjectId(...paramNames) {
  return (req, res, next) => {
    for (const param of paramNames) {
      const id = req.params[param];
      if (id && !mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid ID format",
          data: null,
        });
      }
    }
    next();
  };
}

module.exports = validateObjectId;
