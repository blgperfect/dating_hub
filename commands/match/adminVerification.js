// commands/adminVerification.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Profile = require('../../database/models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-verification')
    .setDescription('Gérez les demandes de vérification.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Affiche toutes les demandes de vérification en attente.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('approve')
        .setDescription('Approuve une demande de vérification.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Utilisateur dont la demande doit être approuvée.')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reject')
        .setDescription('Rejette une demande de vérification.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Utilisateur dont la demande doit être rejetée.')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Raison du rejet.')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const pendingProfiles = await Profile.find({ verificationStatus: 'pending' });
      if (!pendingProfiles.length) {
        return interaction.reply({
          content: '✅ Aucune demande de vérification en attente.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('Demandes de vérification en attente')
        .setColor('#28f2e3');

      pendingProfiles.forEach((profile) => {
        embed.addFields({
          name: profile.username,
          value: `**ID utilisateur :** ${profile.userId}\n**Description :** ${
            profile.description || 'Aucune description.'
          }`,
        });
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'approve') {
      const user = interaction.options.getUser('user');
      const profile = await Profile.findOne({ userId: user.id });

      if (!profile || profile.verificationStatus !== 'pending') {
        return interaction.reply({
          content: `⚠️ Aucune demande de vérification en attente pour **${user.username}**.`,
          ephemeral: true,
        });
      }

      profile.verificationStatus = 'approved';
      await profile.save();

      const guildMember = interaction.guild.members.cache.get(user.id);
      const verifiedRole = interaction.guild.roles.cache.find((r) => r.name === 'Vérifié');
      if (guildMember && verifiedRole) {
        await guildMember.roles.add(verifiedRole);
      }

      await user.send(
        '✅ Félicitations, votre demande de vérification a été approuvée ! Vous avez reçu le rôle "Vérifié".'
      );
      return interaction.reply({
        content: `✅ La demande de vérification de **${user.username}** a été approuvée.`,
        ephemeral: true,
      });
    }

    if (subcommand === 'reject') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const profile = await Profile.findOne({ userId: user.id });

      if (!profile || profile.verificationStatus !== 'pending') {
        return interaction.reply({
          content: `⚠️ Aucune demande de vérification en attente pour **${user.username}**.`,
          ephemeral: true,
        });
      }

      profile.verificationStatus = 'rejected';
      profile.rejectionReason = reason;
      await profile.save();

      await user.send(
        `❌ Votre demande de vérification a été rejetée.\n**Raison :** ${reason}\n\nVous pouvez soumettre une nouvelle demande si nécessaire.`
      );

      return interaction.reply({
        content: `✅ La demande de vérification de **${user.username}** a été rejetée.`,
        ephemeral: true,
      });
    }
  },
};
