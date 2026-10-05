require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Verify that required environment variables exist
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in your environment variables.");
  process.exit(1);
}

// Import route modules
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const progressRoutes = require("./routes/progressRoutes");

// Initialize database connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Public Health Check Route (placed before protected routes)
app.get("/api/health", (req, res) => {
  res.json({
    message: "E-Learning API is running smoothly",
    data: { status: "OK", timestamp: new Date().toISOString() },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:courseId/lessons", lessonRoutes);
app.use("/api", progressRoutes);

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    data: null,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON body",
      data: null,
    });
  }

  console.error("Server error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    data: null,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});