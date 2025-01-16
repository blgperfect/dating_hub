const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Gérer le système de vérification')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('instructions')
        .setDescription('Afficher les instructions pour la vérification')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('status')
        .setDescription('Vérifier le statut de votre vérification')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'instructions') {
      const embed = new EmbedBuilder()
        .setTitle('Instructions pour la vérification')
        .setDescription(
          'Pour prouver votre identité et bénéficier des avantages de la vérification, suivez ces étapes :\n\n' +
            '1️⃣ Prenez un selfie avec votre pièce d’identité et une note mentionnant votre pseudo Discord et le serveur.\n' +
            '2️⃣ Floutez toutes les informations sensibles sauf votre photo et votre date de naissance.\n\n' +
            'Lorsque vous êtes prêt, appuyez sur le bouton ci-dessous pour soumettre votre demande.'
        )
        .setColor('#3498db')
        .setImage('https://example.com/example-image.png'); // Remplacez par une image explicative si nécessaire

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Soumettre une demande')
          .setCustomId('submit-verification')
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        embeds: [embed],
        components: [actionRow],
        ephemeral: true,
      });
    }

    if (subcommand === 'status') {
      // Simuler une base de données ou une API pour vérifier le statut
      try {
        const verificationStatus = await checkVerificationStatus(userId); // Fonction à implémenter

        if (verificationStatus.approved) {
          return interaction.reply({
            content: '✅ Votre vérification a été approuvée !',
            ephemeral: true,
          });
        }

        if (verificationStatus.pending) {
          return interaction.reply({
            content: '⏳ Votre demande est en attente de traitement.',
            ephemeral: true,
          });
        }

        return interaction.reply({
          content: '❌ Vous n’avez pas encore soumis de demande de vérification.',
          ephemeral: true,
        });
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du statut :', error);
        return interaction.reply({
          content: '❌ Une erreur est survenue lors de la vérification de votre statut.',
          ephemeral: true,
        });
      }
    }
  },
};

// Fonction fictive pour simuler un statut de vérification
async function checkVerificationStatus(userId) {
  // Exemple : Simuler des données depuis une base de données
  const mockDatabase = {
    '123456789': { approved: true },
    '987654321': { pending: true },
  };

  return mockDatabase[userId] || { approved: false, pending: false };
}
