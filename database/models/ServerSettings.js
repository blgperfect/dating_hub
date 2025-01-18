const mongoose = require('mongoose');

const ServerSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  verificationEnabled: { type: Boolean, default: false },
  verificationChannel: { type: String, default: null },
  profileChannels: {
    male: { type: String, default: null },
    female: { type: String, default: null },
    other: { type: String, default: null },
    setupProfile: { type: String, default: null },
  },
  roles: {
    male: { type: String, default: null },
    female: { type: String, default: null },
    other: { type: String, default: null },
    verified: { type: String, default: null },
  },
  customMessages: {
    verification: { type: String, default: null },
    setupProfile: { type: String, default: null },
  },
});

module.exports = mongoose.model('ServerSettings', ServerSettingsSchema);
