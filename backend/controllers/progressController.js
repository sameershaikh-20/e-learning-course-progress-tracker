const Progress = require("../models/Progress");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// Unified helper function to check course completion and calculate progress metrics
// Total = number of lessons in course.lessons; completed = count of finished lessons currently in course
// The course is completed only if total > 0 and completed === total
async function checkCourseCompletion(course, learnerId) {
  const total = course.lessons ? course.lessons.length : 0;
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0, isCompleted: false };
  }

  // Count only progress documents for lessons that currently exist in the course
  const completedCount = await Progress.countDocuments({
    learner: learnerId,
    course: course._id,
    lesson: { $in: course.lessons },
    completed: true,
  });

  const percentage = Math.round((completedCount / total) * 100);
  const isCompleted = completedCount === total;

  return {
    total,
    completed: completedCount,
    percentage,
    isCompleted,
  };
}

// Mark a lesson as completed (enrolled learner only)
async function completeLesson(req, res) {
  try {
    const lessonId = req.params.id;
    const learnerId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
        data: null,
      });
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: null,
      });
    }

    // Verify learner is enrolled in this lesson's course
    const isEnrolled = course.enrolledLearners.some(
      (id) => id.toString() === learnerId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        message: "Not authorized: you are not enrolled in this course",
        data: null,
      });
    }

    // Double-click safety: atomic findOneAndUpdate with upsert ensures rapid duplicate clicks
    // update the single progress document in place rather than crashing or creating duplicates
    const progress = await Progress.findOneAndUpdate(
      { learner: learnerId, lesson: lessonId },
      {
        $set: { completed: true },
        $setOnInsert: { learner: learnerId, course: lesson.course, lesson: lessonId },
      },
      { new: true, upsert: true }
    );

    // Calculate completion status using the single unified helper
    const { isCompleted } = await checkCourseCompletion(course, learnerId);

    // Return exact contract response
    res.json({
      message: "Lesson marked as completed",
      data: {
        progress,
        courseCompleted: isCompleted,
      },
    });
  } catch (error) {
    console.error("Complete lesson error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Get learner's progress for a course (enrolled learner only)
async function getCourseProgress(req, res) {
  try {
    const courseId = req.params.id;
    const learnerId = req.user._id;

    const course = await Course.findById(courseId).populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: null,
      });
    }

    // Fetch all progress documents for this learner and course
    const progressDocs = await Progress.find({
      learner: learnerId,
      course: courseId,
    });

    // Create a Set of completed lesson IDs for quick lookup
    const completedLessonIds = new Set(
      progressDocs
        .filter((p) => p.completed)
        .map((p) => p.lesson.toString())
    );

    // Dynamically build lesson list from course.lessons so newly added lessons appear
    const lessons = course.lessons.map((lesson) => ({
      lessonId: lesson._id,
      lessonTitle: lesson.title,
      order: lesson.order,
      completed: completedLessonIds.has(lesson._id.toString()),
    }));

    // Calculate overall course statistics using the unified helper
    const { total, completed, percentage, isCompleted } = await checkCourseCompletion(course, learnerId);

    // Return exact contract response
    res.json({
      message: "Course progress retrieved successfully",
      data: {
        courseId,
        courseTitle: course.title,
        totalLessons: total,
        completedLessons: completed,
        percentage,
        isCourseCompleted: isCompleted,
        lessons,
      },
    });
  } catch (error) {
    console.error("Get course progress error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Get course completion rate (course owner instructor only)
async function getCompletionRate(req, res) {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        data: null,
      });
    }

    const totalEnrolled = course.enrolledLearners.length;
    const totalLessons = course.lessons.length;

    // Count how many learners have completed all lessons using the unified helper
    let completedCount = 0;
    for (const learnerId of course.enrolledLearners) {
      const { isCompleted } = await checkCourseCompletion(course, learnerId);
      if (isCompleted) completedCount++;
    }

    const completionRate = totalEnrolled > 0
      ? Math.round((completedCount / totalEnrolled) * 100)
      : 0;

    // Return exact contract response
    res.json({
      message: "Completion rate retrieved successfully",
      data: {
        courseId,
        courseTitle: course.title,
        totalLessons,
        totalEnrolled,
        totalCompleted: completedCount,
        completionRate,
      },
    });
  } catch (error) {
    console.error("Get completion rate error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

module.exports = {
  checkCourseCompletion,
  completeLesson,
  getCourseProgress,
  getCompletionRate,
};