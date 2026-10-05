const express = require("express");
const router = express.Router();

const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  checkCourseOwnership,
  checkProgressOwnership,
} = require("../middleware/ownershipMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// POST /api/lessons/:id/complete - Mark lesson as completed (enrolled learner only)
router.post(
  "/lessons/:id/complete",
  authMiddleware,
  validateObjectId("id"),
  roleMiddleware(["learner"]),
  progressController.completeLesson
);

// GET /api/courses/:id/progress - Get learner's progress for a course (enrolled learner only)
router.get(
  "/courses/:id/progress",
  authMiddleware,
  validateObjectId("id"),
  roleMiddleware(["learner"]),
  checkProgressOwnership,
  progressController.getCourseProgress
);

// GET /api/courses/:id/completion-rate - Get course completion rate (course owner instructor only)
router.get(
  "/courses/:id/completion-rate",
  authMiddleware,
  validateObjectId("id"),
  roleMiddleware(["instructor"]),
  checkCourseOwnership,
  progressController.getCompletionRate
);

module.exports = router;