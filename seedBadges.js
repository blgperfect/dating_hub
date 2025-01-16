const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const BadgeModel = require('./database/models/profilBadge'); // Chemin ajusté pour seedBadges.js dans la racine

// Charger les badges depuis le fichier JSON
const badgesPath = path.resolve(__dirname, './data/badge.json');
const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf-8'));

// Fonction pour insérer les badges dans MongoDB
async function seedBadges() {
  try {
    // Connectez-vous à MongoDB
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connexion à MongoDB réussie.');

    // Parcourir les badges pour les insérer
    for (const badge of badges) {
      const existingBadge = await BadgeModel.findOne({ name: badge.name });
      if (!existingBadge) {
        await BadgeModel.create(badge);
        console.log(`Badge ajouté : ${badge.name}`);
      } else {
        console.log(`Badge existant : ${badge.name}`);
      }
    }

    console.log('Insertion des badges terminée.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des badges :', error);
  } finally {
    // Fermer la connexion à MongoDB
    await mongoose.disconnect();
    console.log('Connexion MongoDB fermée.');
  }
}

seedBadges();
