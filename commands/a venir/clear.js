const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre de messages dans ce salon.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Nombre de messages à supprimer (1-100).')
                .setRequired(true)
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        // Vérification des permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "❌ Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });
        }

        // Vérification du nombre valide
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: "Veuillez spécifier un nombre entre 1 et 100.", ephemeral: true });
        }

        try {
            // Supprimer les messages
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);

            // Embed pour afficher le résultat
            const embed = new EmbedBuilder()
                .setTitle("🧹 Nettoyage terminé !")
                .setDescription(`**${deletedMessages.size} messages** ont été supprimés avec succès.`)
                .setColor('Green')
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Réponse temporaire
            const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
            setTimeout(() => reply.delete(), 5000); // Supprime le message après 5 secondes
        } catch (error) {
            console.error('Erreur lors de la suppression des messages :', error);
            interaction.reply({ content: "❌ Une erreur est survenue lors du nettoyage.", ephemeral: true });
        }
    },
};