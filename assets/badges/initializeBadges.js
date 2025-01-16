// initializeBadges.js
const BadgeModel = require('./database/models/profilBadge'); // Correction du chemin

async function initializeBadges() {
  const badges = [
    {
      name: 'Sociable',
      description: 'Obtenez ce badge après 5 rencontres réussies.',
      criteria: '5 rencontres réussies',
      imagePath: '/assets/sociable.png',
    },
    {
      name: 'Populaire',
      description: 'Obtenez ce badge après avoir reçu 10 feedbacks positifs.',
      criteria: '10 feedbacks positifs',
      imagePath: '/assets/popular.png',
    },
    {
      name: 'Curieux',
      description: 'Obtenez ce badge après 3 intérêts différents.',
      criteria: '3 intérêts différents',
      imagePath: '/assets/curious.png',
    },
  ];

  for (const badge of badges) {
    const existingBadge = await BadgeModel.findOne({ name: badge.name });
    if (!existingBadge) {
      await BadgeModel.create(badge);
      console.log(`✅ Badge ajouté : ${badge.name}`);
    } else {
      console.log(`ℹ️ Badge déjà existant : ${badge.name}`);
    }
  }
}

initializeBadges().catch(console.error);
