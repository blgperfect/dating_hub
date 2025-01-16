const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const Profile = require('../../database/models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile-setup')
    .setDescription('Configurer et gérer votre profil'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Bienvenue dans Profile Setup')
      .setDescription(
        'Gérez votre profil ici. Utilisez les boutons ci-dessous pour créer, modifier ou visualiser votre profil.'
      )
      .setColor('#2ecc71');

    const buttons = [
      new ButtonBuilder()
        .setLabel('Créer un profil')
        .setCustomId('create-profile')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel('Modifier un profil')
        .setCustomId('edit-profile')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('Bump profil')
        .setCustomId('bump-profile')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel('Prévisualiser le profil')
        .setCustomId('preview-profile')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel('Télécharger une photo')
        .setCustomId('upload-picture')
        .setStyle(ButtonStyle.Secondary),
    ];

    // Divisez les boutons en rangées pour respecter la limite Discord
    const rows = [
      new ActionRowBuilder().addComponents(buttons.slice(0, 5)),
    ];

    return interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: true,
    });
  },
};
