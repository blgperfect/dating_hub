// models/profilBadge.js
const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  guildId: { type: String, required: true }, // Associé à un serveur spécifique
  name: { type: String, required: true },
  description: { type: String, required: true },
  criteria: { type: String, required: true },
  imagePath: { type: String, required: true },
  users: { type: [String], default: [] }, // Liste des utilisateurs ayant obtenu ce badge
});

module.exports = mongoose.model('Badge', BadgeSchema);
