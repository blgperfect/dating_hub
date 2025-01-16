const { Client, StringSelectMenuInteraction } = require("discord.js")
const RoleManager = require('../../utils/roleManager');

/**
 * @param {Client} client
 * @param {StringSelectMenuInteraction} interaction
 */
module.exports = async (_client, interaction) => {
    if (!interaction.isStringSelectMenu()) return;

  const { customId } = interaction;
   
  if (!customId.startsWith('select-roles-')) return;
  
      try {
        const category = customId.replace('select-roles-', '');
        const { guild, member } = interaction;
  
        if (!guild || !member) {
          return await interaction.reply({
            content: '❌ Une erreur interne est survenue. Veuillez réessayer plus tard.',
            ephemeral: true,
          });
        }
  
        await guild.roles.fetch();
  
        const selectedRoles = interaction.values || [];
        const allRoles = RoleManager.getRolesByCategory(category);
  
        if (!Array.isArray(allRoles) || allRoles.length === 0) {
          return await interaction.reply({
            content: `❌ Aucun rôle disponible pour la catégorie **${category}**.`,
            ephemeral: true,
          });
        }
  
        await interaction.deferReply({ ephemeral: true });
  
        // Suppression des anciens rôles
        const memberRoles = member.roles.cache.map(role => role.name);
        const rolesToRemove = allRoles.filter(role => memberRoles.includes(role));
        for (const roleName of rolesToRemove) {
          const role = guild.roles.cache.find(r => r.name === roleName);
          if (role) {
            await member.roles.remove(role);
          }
        }
  
        // Ajout des nouveaux rôles
        for (const roleName of selectedRoles) {
          const role = guild.roles.cache.find(r => r.name === roleName);
          if (role) {
            await member.roles.add(role);
          }
        }
  
        return interaction.editReply({
          content: `✅ Vos rôles ont été mis à jour : ${selectedRoles.join(', ')}`,
        });
      } catch (error) {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: '❌ Une erreur critique est survenue lors de la mise à jour des rôles.',
          });
        } else {
          await interaction.reply({
            content: '❌ Une erreur critique est survenue lors de la mise à jour des rôles.',
            ephemeral: true,
          });
        }
      }
}