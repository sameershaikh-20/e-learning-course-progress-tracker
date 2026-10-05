const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");

// Helper to format course response objects consistently across all endpoints:
// Adds `isEnrolled` (true only for enrolled learners), strips internal `enrolledLearners` array,
// and ensures `instructor` only contains `_id` and `name` (no email).
function formatCourse(course, userId, userRole) {
  const courseObj = course.toObject ? course.toObject() : { ...course };

  // Calculate isEnrolled: true only for learners enrolled in this course
  const isEnrolled =
    userRole === "learner" && Array.isArray(courseObj.enrolledLearners)
      ? courseObj.enrolledLearners.some(
          (id) => id.toString() === userId.toString()
        )
      : false;

  // Format instructor: only _id and name
  let instructor = courseObj.instructor;
  if (instructor && typeof instructor === "object" && instructor._id) {
    instructor = {
      _id: instructor._id,
      name: instructor.name,
    };
  }

  // Remove internal enrolledLearners array and Mongoose version key from client response
  delete courseObj.enrolledLearners;
  delete courseObj.__v;

  return {
    ...courseObj,
    instructor,
    isEnrolled,
  };
}

// Create a new course (instructor only)
async function createCourse(req, res) {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title must be a non-empty string",
        data: null,
      });
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
      return res.status(400).json({
        message: "Description must be a string",
        data: null,
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      instructor: req.user._id,
      lessons: [],
      enrolledLearners: [],
    });

    const formatted = formatCourse(
      {
        ...course.toObject(),
        instructor: { _id: req.user._id, name: req.user.name },
      },
      req.user._id,
      req.user.role
    );

    res.status(201).json({
      message: "Course created successfully",
      data: formatted,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message, data: null });
    }
    console.error("Create course error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Get all courses catalog (populated lessons with only title and order)
async function getCourses(req, res) {
  try {
    const courses = await Course.find()
      .populate("instructor", "name")
      .populate("lessons", "title order");

    const formattedCourses = courses.map((course) =>
      formatCourse(course, req.user._id, req.user.role)
    );

    res.json({
      message: "Courses retrieved successfully",
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Get courses error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Get a single course by ID (any logged-in user)
async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({ message: "Course not found", data: null });
    }

    res.json({
      message: "Course retrieved successfully",
      data: formatCourse(course, req.user._id, req.user.role),
    });
  } catch (error) {
    console.error("Get course by ID error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Update a course (owner only)
async function updateCourse(req, res) {
  try {
    const { title, description } = req.body;

    // Validate non-empty / non-whitespace title if provided in PUT payload
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return res.status(400).json({
        message: "Title must be a non-empty string",
        data: null,
      });
    }

    // Validate description type if provided (reject null or non-string)
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        message: "Description must be a string",
        data: null,
      });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate("instructor", "name")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({ message: "Course not found", data: null });
    }

    res.json({
      message: "Course updated successfully",
      data: formatCourse(course, req.user._id, req.user.role),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message, data: null });
    }
    console.error("Update course error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Delete a course (owner only)
async function deleteCourse(req, res) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found", data: null });
    }

    // Cascade delete: delete all lessons associated with this course
    await Lesson.deleteMany({ course: req.params.id });

    // Cascade delete: delete all progress records associated with this course
    await Progress.deleteMany({ course: req.params.id });

    res.json({ message: "Course deleted successfully", data: null });
  } catch (error) {
    console.error("Delete course error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Enroll in a course (learner only)
async function enrollInCourse(req, res) {
  try {
    const courseId = req.params.id;
    const learnerId = req.user._id;

    // Double-click safety: atomic findOneAndUpdate adds learner only if not already enrolled
    const course = await Course.findOneAndUpdate(
      { _id: courseId, enrolledLearners: { $ne: learnerId } },
      { $addToSet: { enrolledLearners: learnerId } },
      { new: true }
    );

    if (!course) {
      // If course is null, determine if course does not exist or user is already enrolled
      const existingCourse = await Course.findById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found", data: null });
      }

      return res.status(400).json({
        message: "Already enrolled in this course",
        data: null,
      });
    }

    // Upsert initial progress documents for all lessons currently in the course
    if (course.lessons && course.lessons.length > 0) {
      const operations = course.lessons.map((lessonId) => ({
        updateOne: {
          filter: { learner: learnerId, lesson: lessonId },
          update: {
            $setOnInsert: {
              learner: learnerId,
              course: courseId,
              lesson: lessonId,
              completed: false,
            },
          },
          upsert: true,
        },
      }));

      await Progress.bulkWrite(operations);
    }

    // Return exact contract response
    res.status(201).json({
      message: "Enrolled successfully",
      data: {
        courseId: course._id,
        totalLessons: course.lessons.length,
      },
    });
  } catch (error) {
    console.error("Enroll in course error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
};