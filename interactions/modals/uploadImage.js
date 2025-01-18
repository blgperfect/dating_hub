const Profile = require('../../database/models/Profile');
const { EmbedBuilder } = require('discord.js');
const getAllFiles = require('../interactions/getAllFiles');

module.exports = async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== 'upload-image') return;

  // Vérifier si le profil de l'utilisateur existe
  const profile = await Profile.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
  if (!profile) {
    return interaction.reply({
      content: '❌ Vous n\'avez pas encore de profil. Créez-en un avec `/create-profile`.',
      flags: 64,
    });
  }

  // Récupérer l'URL de l'image depuis le modal
  const imageUrl = interaction.fields.getTextInputValue('image-url');

  // Vérifier si l'URL est valide
  if (!imageUrl.match(/\.(jpeg|jpg|png|gif)$/i)) {
    return interaction.reply({
      content: '❌ Veuillez fournir une URL valide pour une image (formats pris en charge : JPG, PNG, GIF).',
      flags: 64,
    });
  }

  // Mettre à jour l'image dans le profil utilisateur
  profile.image = imageUrl;
  await profile.save();

  // Envoyer un embed de confirmation
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('✅ Image de profil mise à jour')
    .setDescription('Votre image de profil a été mise à jour avec succès !')
    .setImage(imageUrl);

  await interaction.reply({
    embeds: [embed],
    flags: 64,
  });
};
