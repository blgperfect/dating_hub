// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  guildId: { type: String, required: true }, // Identifiant unique du serveur
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  ageRange: { type: String, required: true }, // Tranche d'âge (via rôles)
  location: { type: String, required: true }, // Localisation (via rôles)
  relationshipStatus: { type: String, required: true }, // Statut relationnel
  searchStatus: { type: String, required: true }, // Recherches
  preferences: { type: [String], default: [] }, // Préférences multiples
  description: { type: String, default: '' }, // Description personnelle
  badges: { type: [String], default: [] }, // Références aux badges
  matches: { type: [String], default: [] }, // Historique de matchs
  feedbacks: { type: [{ userId: String, rating: Number, comment: String }], default: [] }, // Feedbacks
  avatarUrl: { type: String, default: null }, // URL de la photo de profil
  lastBump: { type: Date, default: null }, // Dernier bump
  verificationStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  }, // Statut de vérification
  rejectionReason: { type: String, default: null }, // Raison du rejet
  likes: { type: [String], default: [] }, // Utilisateurs ayant aimé ce profil
  likesEnabled: { type: Boolean, default: true }, // Activer/Désactiver les likes
  lastInteraction: { type: Date, default: null }, // Dernière interaction
});

module.exports = mongoose.model('Profile', ProfileSchema);
