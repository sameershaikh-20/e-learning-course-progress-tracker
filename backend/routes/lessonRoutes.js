const express = require("express");
const router = express.Router({ mergeParams: true });

const lessonController = require("../controllers/lessonController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { checkCourseOwnership, checkLessonOwnership } = require("../middleware/ownershipMiddleware");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

// All routes require authentication and valid courseId parameter
router.use(authMiddleware);
router.use(validateObjectId("courseId"));

// POST /api/courses/:courseId/lessons - Create lesson (instructor & course owner only)
router.post(
  "/",
  roleMiddleware(["instructor"]),
  checkCourseOwnership,
  validate(["title", "content"]),
  lessonController.createLesson
);

// GET /api/courses/:courseId/lessons - Get all lessons for a course (any logged-in user)
router.get("/", lessonController.getLessons);

// PUT /api/courses/:courseId/lessons/:id - Update lesson (instructor & course owner only)
router.put(
  "/:id",
  validateObjectId("id"),
  roleMiddleware(["instructor"]),
  checkLessonOwnership,
  lessonController.updateLesson
);

// DELETE /api/courses/:courseId/lessons/:id - Delete lesson (instructor & course owner only)
router.delete(
  "/:id",
  validateObjectId("id"),
  roleMiddleware(["instructor"]),
  checkLessonOwnership,
  lessonController.deleteLesson
);

module.exports = router;