const mongoose = require("mongoose");

// User schema for learners and instructors
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ["learner", "instructor"],
      default: "learner",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);