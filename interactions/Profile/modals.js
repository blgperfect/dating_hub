const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  createProfileModal: () => {
    const modal = new ModalBuilder()
      .setCustomId('create-profile-modal')
      .setTitle('Créer un profil');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('profile-name')
          .setLabel('Quel est votre nom ?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('profile-location')
          .setLabel('D’où venez-vous ?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('profile-status')
          .setLabel('Quel est votre statut ?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('profile-about')
          .setLabel('Parlez-nous de vous.')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      )
    );

    return modal;
  },
};
