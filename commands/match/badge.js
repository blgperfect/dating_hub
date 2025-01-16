// commands/badge.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BadgeModel = require('../../database/models/profilBadge');
const Profile = require('../../database/models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('Gérez vos badges.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Affichez la liste des badges disponibles.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('Affichez les badges que vous avez obtenus.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const badges = await BadgeModel.find();
      if (!badges.length) {
        return interaction.reply({
          content: '⚠️ Aucun badge disponible.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('Liste des badges disponibles')
        .setColor('#FFD700')
        .setDescription('Voici tous les badges disponibles :');

      badges.forEach((badge) => {
        embed.addFields({
          name: badge.name,
          value: `${badge.description}\n**Critères :** ${badge.criteria}`,
        }).setThumbnail(badge.imagePath);
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'view') {
      const profile = await Profile.findOne({ userId: interaction.user.id });

      if (!profile || !profile.badges.length) {
        return interaction.reply({
          content: '⚠️ Vous n’avez obtenu aucun badge pour le moment.',
          ephemeral: true,
        });
      }

      const userBadges = await BadgeModel.find({ name: { $in: profile.badges } });

      const embed = new EmbedBuilder()
        .setTitle(`Badges obtenus par ${interaction.user.username}`)
        .setColor('#4caf50')
        .setDescription('Voici vos badges :');

      userBadges.forEach((badge) => {
        embed.addFields({
          name: badge.name,
          value: badge.description,
        }).setThumbnail(badge.imagePath);
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
