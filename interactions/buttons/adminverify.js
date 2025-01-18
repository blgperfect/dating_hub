const Profile = require('../../database/models/Profile');
const getAllFiles = require('../getAllFiles'); // Ce chemin est valide mais redondant

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return console.error('Interaction reçue non reconnue comme un bouton.');
  }

  if (!interaction.customId.startsWith('verify-user-')) return;

  const userId = interaction.customId.split('-')[2];
  const profile = await Profile.findOne({ userId, guildId: interaction.guild.id });

  if (!profile) {
    return interaction.reply({
      content: '❌ Profil introuvable pour cet utilisateur.',
      flags: 64,
    });
  }

  if (interaction.customId.includes('accept')) {
    profile.verificationStatus = 'approved';
    await profile.save();

    await interaction.reply({
      content: `✅ L'utilisateur **${profile.username}** a été vérifié avec succès.`,
      flags: 64,
    });

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(`🎉 Félicitations ! Votre profil sur **${interaction.guild.name}** a été vérifié.`);
    } catch (error) {
      console.error('❌ Impossible d’envoyer un DM à l’utilisateur vérifié.');
    }
  } else if (interaction.customId.includes('reject')) {
    profile.verificationStatus = 'rejected';
    await profile.save();

    await interaction.reply({
      content: `❌ L'utilisateur **${profile.username}** a été refusé.`,
      flags: 64,
    });

    try {
      const user = await interaction.client.users.fetch(userId);
      await user.send(
        `⚠️ Votre demande de vérification sur **${interaction.guild.name}** a été rejetée.\n` +
          `Si vous pensez qu'il s'agit d'une erreur, veuillez contacter un administrateur.`
      );
    } catch (error) {
      console.error('❌ Impossible d’envoyer un DM à l’utilisateur refusé.');
    }
  }
};
