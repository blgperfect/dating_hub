const ServerSettings = require('../../database/models/ServerSettings');
const getAllFiles = require('../interactions/getAllFiles');

module.exports = async (interaction) => {
  // Vérifier si l'interaction est un bouton et correspond au système de vérification
  if (!interaction.isButton() || interaction.customId !== 'verify-me') return;

  // Charger les paramètres du serveur
  const settings = await ServerSettings.findOne({ guildId: interaction.guild.id });
  if (!settings || !settings.verificationEnabled) {
    return interaction.reply({
      content: '❌ Le système de vérification n’est pas activé sur ce serveur.',
      flags: 64,
    });
  }

  const embed = {
    color: 0x00FF00,
    title: '🔒 Processus de vérification',
    description: `Bonjour ! Pour être vérifié sur **${interaction.guild.name}**, veuillez suivre ces étapes :\n\n` +
      `1️⃣ Prenez une photo de vous avec un papier mentionnant **votre pseudo**, **la date d'aujourd'hui** et **le nom du serveur**.\n` +
      `2️⃣ Envoyez cette photo en réponse à ce message en **DM**.\n\n` +
      `⚠️ **Important :** Vous disposez de 5 minutes pour compléter cette étape.`,
  };

  try {
    // Envoyer les instructions en DM à l'utilisateur
    await interaction.user.send({ embeds: [embed] });
    return interaction.reply({
      content: '📩 Vérification envoyée en privé. Veuillez vérifier vos messages !',
      flags: 64,
    });
  } catch (error) {
    // Gestion des DM désactivés
    return interaction.reply({
      content: '❌ Impossible de vous envoyer un message privé. Activez vos DM et réessayez.',
      flags: 64,
    });
  }
};
