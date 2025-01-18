const ServerSettings = require('../../database/models/ServerSettings');
const getAllFiles = require('../interactions/getAllFiles');

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return interaction.reply({
      content: '❌ Cette interaction n’est pas un bouton.',
      flags: 64,
    });
  }

  const settings = await ServerSettings.findOne({ guildId: interaction.guild.id });
  if (!settings) {
    return interaction.reply({
      content: '❌ Les paramètres de ce serveur n\'ont pas encore été configurés. Utilisez `/setup` pour démarrer.',
      flags: 64,
    });
  }

  switch (interaction.customId) {
    case 'verify-enable': {
      settings.verificationEnabled = true;
      await settings.save();

      await interaction.update({
        content: '✅ La vérification a été activée. Passons à la configuration des salons.',
        components: [],
      });
      break;
    }

    case 'verify-disable': {
      settings.verificationEnabled = false;
      await settings.save();

      await interaction.update({
        content: '🚫 La vérification a été désactivée. Passons à la configuration des salons.',
        components: [],
      });
      break;
    }

    default: {
      return interaction.reply({
        content: '❌ Action inconnue. Veuillez réessayer.',
        flags: 64,
      });
    }
  }
};
