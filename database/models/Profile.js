const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  age: { type: Number, default: null },
  description: { type: String, default: '' },
  avatarUrl: { type: String, default: null },
  hexColor: { type: String, default: '#FFFFFF' },
  lastBump: { type: Date, default: null },
  likes: { type: [String], default: [] },
  verificationStatus: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
});

module.exports = mongoose.model('Profile', ProfileSchema);
