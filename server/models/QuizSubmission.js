const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  staffId: String,
  category: String,
  startTime: Number,
  endTime: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  responses: [
    {
      questionId: String,
      question: String,
      selected: String,
      correctAnswer: String,
      isCorrect: Boolean
    }
  ]
});

module.exports = mongoose.model("QuizSubmission", submissionSchema);
