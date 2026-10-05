const mongoose = require("mongoose");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// Check if user owns the course (is the instructor)
async function checkCourseOwnership(req, res, next) {
  try {
    const courseId = req.params.id || req.params.courseId;
    if (courseId && !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        message: "Invalid ID format",
        data: null,
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: null,
      });
    }

    // Check if the logged-in user is the instructor of this course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized: you don't own this course",
        data: null,
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error("Course ownership check error:", error.message);
    return res.status(500).json({ message: "Server error", data: null });
  }
}

// Check if user owns the course that the lesson belongs to
async function checkLessonOwnership(req, res, next) {
  try {
    const lessonId = req.params.id;
    if (lessonId && !mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({
        message: "Invalid ID format",
        data: null,
      });
    }

    const lesson = await Lesson.findById(lessonId).populate("course");

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
        data: null,
      });
    }

    // Verify that the lesson belongs to the course specified in the URL (if courseId param is present)
    if (req.params.courseId) {
      const lessonCourseId = lesson.course._id ? lesson.course._id.toString() : lesson.course.toString();
      if (lessonCourseId !== req.params.courseId.toString()) {
        return res.status(404).json({
          message: "Lesson not found in this course",
          data: null,
        });
      }
    }

    // Check if the logged-in user is the instructor of this lesson's course
    const instructorId = lesson.course.instructor
      ? lesson.course.instructor.toString()
      : null;

    if (!instructorId || instructorId !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized: you don't own this lesson's course",
        data: null,
      });
    }

    req.lesson = lesson;
    next();
  } catch (error) {
    console.error("Lesson ownership check error:", error.message);
    return res.status(500).json({ message: "Server error", data: null });
  }
}

// Check if learner is authorized and enrolled in the course
async function checkProgressOwnership(req, res, next) {
  try {
    const courseId = req.params.id;
    if (courseId && !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        message: "Invalid ID format",
        data: null,
      });
    }

    if (req.user.role !== "learner") {
      return res.status(403).json({
        message: "Only learners can access learner progress",
        data: null,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: null,
      });
    }

    // Verify that req.user is in the course's enrolledLearners list
    const isEnrolled = course.enrolledLearners.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        message: "Not authorized: you are not enrolled in this course",
        data: null,
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error("Progress ownership check error:", error.message);
    return res.status(500).json({ message: "Server error", data: null });
  }
}

module.exports = {
  checkCourseOwnership,
  checkLessonOwnership,
  checkProgressOwnership,
};