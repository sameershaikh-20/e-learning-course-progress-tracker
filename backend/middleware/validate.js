// Simple validation middleware for required fields and string types
function validate(requiredFields) {
  return (req, res, next) => {
    // Check if required fields are missing or not a non-empty string
    const missing = [];
    for (const field of requiredFields) {
      const val = req.body[field];
      if (val === undefined || val === null) {
        missing.push(field);
      } else if (typeof val !== "string" || val.trim() === "") {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        data: { fields: missing },
      });
    }

    next();
  };
}

module.exports = validate;