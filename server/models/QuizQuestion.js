const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'safety'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
