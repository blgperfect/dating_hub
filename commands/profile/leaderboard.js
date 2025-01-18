const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Profile = require('../../database/models/Profile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement des profils les plus populaires')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Type de classement')
        .setRequired(true)
        .addChoices(
          { name: 'Global', value: 'global' },
          { name: 'Serveur', value: 'server' }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    let profiles;

    if (type === 'global') {
      profiles = await Profile.find().sort({ likes: -1 }).limit(10);
    } else {
      profiles = await Profile.find({ guildId: interaction.guild.id }).sort({ likes: -1 }).limit(10);
    }

    if (!profiles || profiles.length === 0) {
      return interaction.reply({
        content: '❌ Aucun profil trouvé.',
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle(`🏆 Classement des profils - ${type === 'global' ? 'Global' : 'Serveur'}`)
      .setDescription(
        profiles
          .map((profile, index) => `**${index + 1}.** ${profile.username} - ${profile.likes.length} likes`)
          .join('\n')
      );

    await interaction.reply({ embeds: [embed] });
  },
};
