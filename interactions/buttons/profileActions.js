const Profile = require('../../database/models/Profile');
const getAllFiles = require('../interactions/getAllFiles');

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return interaction.reply({
      content: '❌ Cette interaction n’est pas un bouton.',
      flags: 64,
    });
  }

  const profile = await Profile.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
  if (!profile) {
    return interaction.reply({
      content: '❌ Vous n\'avez pas encore de profil. Créez-en un pour interagir.',
      flags: 64,
    });
  }

  switch (interaction.customId) {
    case 'bump-profile': {
      const now = new Date();
      if (profile.lastBump && now - profile.lastBump < 3 * 60 * 60 * 1000) {
        const remainingTime = Math.ceil((3 * 60 * 60 * 1000 - (now - profile.lastBump)) / 60000);
        return interaction.reply({
          content: `⏳ Vous ne pouvez bumper votre profil qu'une fois toutes les 3 heures.\nTemps restant : ${remainingTime} minutes.`,
          flags: 64,
        });
      }

      profile.lastBump = now;
      await profile.save();

      return interaction.reply({
        content: '🎉 Votre profil a été bumpé avec succès !',
        flags: 64,
      });
    }

    case 'like-profile': {
      const targetUserId = interaction.customId.split('-')[2];
      const targetProfile = await Profile.findOne({ userId: targetUserId, guildId: interaction.guild.id });

      if (!targetProfile) {
        return interaction.reply({
          content: '❌ Le profil cible est introuvable.',
          flags: 64,
        });
      }

      if (targetProfile.likes.includes(interaction.user.id)) {
        return interaction.reply({
          content: '❌ Vous avez déjà liké ce profil.',
          flags: 64,
        });
      }

      targetProfile.likes.push(interaction.user.id);
      await targetProfile.save();

      await interaction.reply({
        content: `❤️ Vous avez liké le profil de **${targetProfile.username}**.`,
        flags: 64,
      });

      try {
        const user = await interaction.client.users.fetch(targetUserId);
        await user.send(
          `❤️ Votre profil a reçu un nouveau like de **${interaction.user.username}** sur **${interaction.guild.name}**.`
        );
      } catch (error) {
        console.error('❌ Impossible d’envoyer un DM au propriétaire du profil liké.');
      }
      break;
    }

    default:
      interaction.reply({
        content: '❌ Action inconnue.',
        flags: 64,
      });
  }
};
