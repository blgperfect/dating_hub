const Profile = require('../database/models/Profile');

module.exports = {
  // Ajouter un "like" à un profil
  async addLike(userId, likedUserId) {
    try {
      if (userId === likedUserId) {
        return { success: false, message: '❌ Vous ne pouvez pas aimer votre propre profil.' };
      }

      const profile = await Profile.findOne({ userId: likedUserId });

      if (!profile) {
        return { success: false, message: '❌ Profil introuvable.' };
      }

      if (profile.likes.includes(userId)) {
        return { success: false, message: '❌ Vous avez déjà aimé ce profil.' };
      }

      profile.likes.push(userId);
      await profile.save();

      return { success: true, message: '✅ Vous avez aimé ce profil.' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du like :', error);
      return { success: false, message: '❌ Une erreur est survenue lors de l\'ajout du like.' };
    }
  },

  // Supprimer un "like" d’un profil
  async removeLike(userId, likedUserId) {
    try {
      const profile = await Profile.findOne({ userId: likedUserId });

      if (!profile) {
        return { success: false, message: '❌ Profil introuvable.' };
      }

      if (!profile.likes.includes(userId)) {
        return { success: false, message: '❌ Vous n\'avez pas encore aimé ce profil.' };
      }

      profile.likes = profile.likes.filter((id) => id !== userId);
      await profile.save();

      return { success: true, message: '✅ Vous avez retiré votre "like".' };
    } catch (error) {
      console.error('❌ Erreur lors du retrait du like :', error);
      return { success: false, message: '❌ Une erreur est survenue lors du retrait du like.' };
    }
  },

  // Vérifier les "likes" d’un profil
  async getLikes(userId) {
    try {
      const profile = await Profile.findOne({ userId });

      if (!profile) {
        return { success: false, message: '❌ Profil introuvable.' };
      }

      const totalLikes = profile.likes.length;

      if (totalLikes === 0) {
        return { success: true, message: '📉 Aucun like pour ce profil pour l\'instant.' };
      }

      return {
        success: true,
        message: `✅ Ce profil a reçu ${totalLikes} like(s) : ${profile.likes.join(', ')}.`,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des likes :', error);
      return { success: false, message: '❌ Une erreur est survenue lors de la récupération des likes.' };
    }
  },
};
