const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  duration: {
    type: Number,
    min: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Lesson", lessonSchema);
