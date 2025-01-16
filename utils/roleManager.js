module.exports = {
  // Définition des catégories de rôles
  roleCategories: {
    sexualité: [
      'Heterosexuelle',
      'Bisexuelle',
      'Homosexuelle',
      'Lesbienne',
      'Pansexuelle',
      'Assexuelle',
    ],
    pronom: ['He/him', 'She/her', 'They/them', 'Ask pronom'],
    location: [
      'North America',
      'South America',
      'Europe',
      'Africa',
      'Middle East',
      'Asia',
      'Oceania',
    ],
    interet: [
      'Anime',
      'Lire',
      'Moovie',
      'Cooking',
      'Tech',
      'Sport',
      'Gaming',
      'Art',
      'Dance',
      'Party',
      'Fashion',
    ],
    status_dm: ['DM Ask', 'DM Open', 'DM Close'],
    relation: [
      'Célibataire',
      'Taken',
      'Recherche',
      'Aucune recherche',
      'Amitié',
      'Compliqué',
      'Monogame',
      'Polyamoureux',
    ],
    preference: [
      'Préférence 18+',
      'Préférence 18-',
      'Distance importante',
      'Distance pas importante',
      'Préférence petite',
      'Préférence grande',
      'Préférence féminine',
      'Préférence masculine',
    ],
    misc: ['Travail', 'Sans emploi', 'Étude'],
  },

  // Création des rôles dans une guilde
  async createRoles(guild, roles) {
    for (const roleData of roles) {
      try {
        const existingRole = guild.roles.cache.find(
          (role) => role.name === roleData.name
        );

        if (existingRole) {
          console.log(`ℹ️ Le rôle "${roleData.name}" existe déjà.`);
          continue;
        }

        // Création du rôle
        await guild.roles.create({
          name: roleData.name,
          color: roleData.color || 'DEFAULT',
          reason: 'Création automatique pour le système de profil.',
        });
        console.log(`✅ Rôle créé : ${roleData.name}`);
      } catch (error) {
        console.error(
          `❌ Erreur lors de la création du rôle "${roleData.name}":`,
          error
        );
      }
    }
  },

  // Suppression des rôles dans une guilde
  async deleteRoles(guild, roleNames) {
    for (const roleName of roleNames) {
      try {
        const role = guild.roles.cache.find((r) => r.name === roleName);

        if (!role) {
          console.log(`⚠️ Le rôle "${roleName}" n'existe pas ou a déjà été supprimé.`);
          continue;
        }

        // Suppression du rôle
        await role.delete('Suppression automatique pour le système de profil.');
        console.log(`🗑️ Rôle supprimé : ${roleName}`);
      } catch (error) {
        console.error(
          `❌ Erreur lors de la suppression du rôle "${roleName}":`,
          error
        );
      }
    }
  },

  // Récupérer tous les rôles d'une catégorie
  getRolesByCategory(category) {
    if (!this.roleCategories[category]) {
      console.warn(`⚠️ La catégorie "${category}" n'existe pas.`);
      return [];
    }
    return this.roleCategories[category];
  },
};
