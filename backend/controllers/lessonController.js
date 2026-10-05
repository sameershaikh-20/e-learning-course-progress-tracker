const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

// Create a new lesson for a course (course owner only)
async function createLesson(req, res) {
  try {
    const { title, content, order } = req.body;
    const courseId = req.params.courseId;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title must be a non-empty string",
        data: null,
      });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        message: "Content must be a non-empty string",
        data: null,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found", data: null });
    }

    // Determine lesson order: use highest existing order + 1 if not provided, or start at 1
    let lessonOrder;
    if (order !== undefined && order !== null && order !== "") {
      if (typeof order !== "number" && isNaN(Number(order))) {
        return res.status(400).json({
          message: "Order must be a number",
          data: null,
        });
      }
      lessonOrder = Number(order);
    } else {
      const highestLesson = await Lesson.findOne({ course: courseId }).sort({ order: -1 });
      lessonOrder = highestLesson && typeof highestLesson.order === "number" ? highestLesson.order + 1 : 1;
    }

    const lesson = await Lesson.create({
      title: title.trim(),
      content: content.trim(),
      course: courseId,
      order: lessonOrder,
    });

    // Add lesson to course's lessons array
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message, data: null });
    }
    console.error("Create lesson error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Get all lessons for a course (any logged-in user)
async function getLessons(req, res) {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found", data: null });
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    res.json({
      message: "Lessons retrieved successfully",
      data: lessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Update a lesson (course owner only)
async function updateLesson(req, res) {
  try {
    const { title, content, order } = req.body;

    // Validate non-empty / non-whitespace title and content if provided in PUT payload
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return res.status(400).json({
        message: "Title must be a non-empty string",
        data: null,
      });
    }

    if (content !== undefined && (typeof content !== "string" || content.trim() === "")) {
      return res.status(400).json({
        message: "Content must be a non-empty string",
        data: null,
      });
    }

    if (order !== undefined && order !== null && order !== "" && typeof order !== "number" && isNaN(Number(order))) {
      return res.status(400).json({
        message: "Order must be a number",
        data: null,
      });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (content !== undefined) updateFields.content = content.trim();
    if (order !== undefined && order !== null && order !== "") updateFields.order = Number(order);

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found", data: null });
    }

    res.json({
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message, data: null });
    }
    console.error("Update lesson error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

// Delete a lesson (course owner only)
async function deleteLesson(req, res) {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found", data: null });
    }

    // Remove lesson from course's lessons array
    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: lesson._id },
    });

    // Cascade delete: delete all Progress documents for this lesson
    await Progress.deleteMany({ lesson: req.params.id });

    res.json({ message: "Lesson deleted successfully", data: null });
  } catch (error) {
    console.error("Delete lesson error:", error.message);
    res.status(500).json({ message: "Server error", data: null });
  }
}

module.exports = {
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson,
};