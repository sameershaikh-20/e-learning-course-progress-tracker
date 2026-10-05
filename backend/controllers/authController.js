const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Helper function to create a JWT token
function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn }
  );
}

// Register a new user (learner or instructor)
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Check for required fields existence and correct types
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
        data: null,
      });
    }

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        message: "Name must be a non-empty string",
        data: null,
      });
    }

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        message: "Email must be a non-empty string",
        data: null,
      });
    }

    if (typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({
        message: "Password must be a non-empty string",
        data: null,
      });
    }

    if (role !== undefined && typeof role !== "string") {
      return res.status(400).json({
        message: "Role must be a string",
        data: null,
      });
    }

    // EXTRA Validation: Basic email format check and minimum 6 character password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        data: null,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        data: null,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
        data: null,
      });
    }

    // Hash the password with bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const userRole = role === "instructor" ? "instructor" : "learner";
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return response with token and user data (without password)
    return res.status(201).json({
      message: "User registered successfully",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      message: "Server error during registration",
      data: null,
    });
  }
}

// Login an existing user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Check for required fields existence and correct types
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
        data: null,
      });
    }

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        message: "Email must be a non-empty string",
        data: null,
      });
    }

    if (typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({
        message: "Password must be a non-empty string",
        data: null,
      });
    }

    // Find user by email and explicitly select the password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        data: null,
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        data: null,
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return response with token and user data
    return res.json({
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Server error during login",
      data: null,
    });
  }
}

module.exports = {
  register,
  login,
};
