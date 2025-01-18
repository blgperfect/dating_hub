const Profile = require('../../database/models/Profile');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const getAllFiles = require('../interactions/getAllFiles');

module.exports = async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== 'edit-profile') return;

  // Vérification de l'existence du profil utilisateur
  const profile = await Profile.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
  if (!profile) {
    return interaction.reply({
      content: '❌ Vous n\'avez pas encore de profil. Créez-en un avec `/create-profile`.',
      flags: 64,
    });
  }

  // Récupération des valeurs du modal
  const name = interaction.fields.getTextInputValue('name');
  const age = interaction.fields.getTextInputValue('age');
  const description = interaction.fields.getTextInputValue('description');

  // Validations des données
  if (name.length > 50) {
    return interaction.reply({
      content: '❌ Le nom ne peut pas dépasser 50 caractères.',
      flags: 64,
    });
  }

  if (description.length > 200) {
    return interaction.reply({
      content: '❌ La description ne peut pas dépasser 200 caractères.',
      flags: 64,
    });
  }

  if (isNaN(age) || age < 13 || age > 99) {
    return interaction.reply({
      content: '❌ Veuillez entrer un âge valide (entre 13 et 99).',
      flags: 64,
    });
  }

  // Mise à jour des informations du profil
  profile.username = name;
  profile.age = parseInt(age, 10);
  profile.description = description;
  await profile.save();

  // Embed de confirmation
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('✅ Profil mis à jour')
    .setDescription(
      `Vos informations ont été mises à jour avec succès !\n\n` +
        `**Nom :** ${profile.username}\n` +
        `**Âge :** ${profile.age}\n` +
        `**Description :** ${profile.description}`
    );

  await interaction.reply({
    embeds: [embed],
    flags: 64,
  });
};
