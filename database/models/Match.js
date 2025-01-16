const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  feedbackGiven: { type: Boolean, default: false }
});

module.exports = mongoose.model('Match', MatchSchema);
