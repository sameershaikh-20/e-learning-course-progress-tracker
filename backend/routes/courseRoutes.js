const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { checkCourseOwnership } = require("../middleware/ownershipMiddleware");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

// All routes require authentication
router.use(authMiddleware);

// POST /api/courses - Create course (instructor only)
router.post(
  "/",
  roleMiddleware(["instructor"]),
  validate(["title"]),
  courseController.createCourse
);

// GET /api/courses - Get all courses (any logged-in user)
router.get("/", courseController.getCourses);

// GET /api/courses/:id - Get course by ID (any logged-in user)
router.get(
  "/:id",
  validateObjectId("id"),
  courseController.getCourseById
);

// PUT /api/courses/:id - Update course (instructor & owner only)
router.put(
  "/:id",
  validateObjectId("id"),
  roleMiddleware(["instructor"]),
  checkCourseOwnership,
  courseController.updateCourse
);

// DELETE /api/courses/:id - Delete course (instructor & owner only)
router.delete(
  "/:id",
  validateObjectId("id"),
  roleMiddleware(["instructor"]),
  checkCourseOwnership,
  courseController.deleteCourse
);

// POST /api/courses/:id/enroll - Enroll in course (learner only)
router.post(
  "/:id/enroll",
  validateObjectId("id"),
  roleMiddleware(["learner"]),
  courseController.enrollInCourse
);

module.exports = router;