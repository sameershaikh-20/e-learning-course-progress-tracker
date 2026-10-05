const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Unique index: one progress doc per learner per lesson
progressSchema.index({ learner: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);