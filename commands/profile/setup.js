const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const ServerSettings = require('../../database/models/ServerSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure le système de gestion des profils pour ce serveur'),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: '❌ Vous devez être administrateur pour utiliser cette commande.',
        flags: 64, // Utilisation de flags pour "ephemeral"
      });
    }

    let settings = await ServerSettings.findOne({ guildId: interaction.guild.id });
    if (!settings) {
      settings = new ServerSettings({ guildId: interaction.guild.id });
    }

    // Étape 1 : Activer ou désactiver la vérification
    const embedStep1 = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎉 Bienvenue dans la configuration du système de profils !')
      .setDescription(
        `✨ Merci d'avoir ajouté le bot !\n\n🔒 **Souhaitez-vous activer la vérification des membres ?**\n\n` +
          `✅ **Oui** : Active la vérification et passe à l'étape suivante.\n` +
          `❌ **Non** : Désactive la vérification et passe à la configuration des salons.`
      );

    const buttonsStep1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('verify-enable').setLabel('✅ Oui').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('verify-disable').setLabel('❌ Non').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embedStep1],
      components: [buttonsStep1],
      flags: 64, // Réponse éphémère
    });

    const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 120000,
    });

    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.customId === 'verify-enable') {
        settings.verificationEnabled = true;
        await settings.save();
        await btnInteraction.update({
          content: '🔒 Vérification activée. Passons à l’étape suivante.',
          components: [],
        });
        return setupVerificationChannel(interaction, settings);
      } else if (btnInteraction.customId === 'verify-disable') {
        settings.verificationEnabled = false;
        await settings.save();
        await btnInteraction.update({
          content: '🚫 Vérification désactivée. Passons à la configuration des salons.',
          components: [],
        });
        return setupProfileChannels(interaction, settings);
      }
    });

    collector.on('end', (collected) => {
      if (!collected.size) {
        interaction.followUp({
          content: '⏱️ Temps écoulé. Veuillez relancer `/setup`.',
          flags: 64,
        });
      }
    });
  },
};
// Étape 2 : Sélectionner le salon de vérification
async function setupVerificationChannel(interaction, settings) {
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('📋 Configuration - Salon de vérification')
    .setDescription(
      `Veuillez sélectionner le salon où les vérifications seront reçues. Les nouveaux membres y recevront des instructions.`
    );

  const channels = interaction.guild.channels.cache
    .filter((channel) => channel.type === 'GUILD_TEXT') // Discord.js v14
    .map((channel) => ({ label: channel.name, value: channel.id }));

  if (channels.length === 0) {
    return interaction.followUp({
      content: '❌ Aucun salon textuel disponible pour la configuration.',
      flags: 64,
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('verification-channel')
    .setPlaceholder('Choisir un salon...')
    .addOptions(channels.slice(0, 25)); // Limité à 25 options

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.followUp({ embeds: [embed], components: [row], flags: 64 });

  const filter = (menuInteraction) => menuInteraction.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

  collector.on('collect', async (menuInteraction) => {
    settings.verificationChannel = menuInteraction.values[0];
    await settings.save();
    await menuInteraction.update({
      content: `✔️ Salon de vérification configuré : <#${menuInteraction.values[0]}>.`,
      components: [],
    });
    return setupProfileChannels(interaction, settings);
  });

  collector.on('end', (collected) => {
    if (!collected.size) {
      interaction.followUp({
        content: '❌ Aucun salon sélectionné. Veuillez relancer `/setup`.',
        flags: 64,
      });
    }
  });
}
// Étape 3 : Configuration des salons de profils
async function setupProfileChannels(interaction, settings) {
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('📌 Configuration - Salons des profils')
    .setDescription(
      `Veuillez sélectionner les salons pour les catégories suivantes :\n\n` +
        `1️⃣ **Profil Homme**\n` +
        `2️⃣ **Profil Femme**\n` +
        `3️⃣ **Profil Autre**\n` +
        `4️⃣ **Setup-Profil**\n\n⚠️ **Obligatoire pour chaque catégorie.**`
    );

  const channels = interaction.guild.channels.cache
    .filter((channel) => channel.type === 'GUILD_TEXT')
    .map((channel) => ({ label: channel.name, value: channel.id }));

  if (channels.length === 0) {
    return interaction.followUp({
      content: '❌ Aucun salon textuel disponible pour la configuration.',
      flags: 64,
    });
  }

  const selectMenus = ['male', 'female', 'other', 'setupProfile'].map((key, index) => {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`profile-channel-${key}`)
        .setPlaceholder(`Choisir le salon pour ${['Homme', 'Femme', 'Autre', 'Setup-Profil'][index]}...`)
        .addOptions(channels.slice(0, 25)) // Limité à 25 options
    );
  });

  await interaction.followUp({ embeds: [embed], components: selectMenus, flags: 64 });

  const filter = (menuInteraction) => menuInteraction.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

  collector.on('collect', async (menuInteraction) => {
    const key = menuInteraction.customId.split('-')[2];
    settings.profileChannels[key] = menuInteraction.values[0];
    await settings.save();
    await menuInteraction.reply({
      content: `✔️ Salon configuré pour **${key}** : <#${menuInteraction.values[0]}>.`,
      flags: 64,
    });
  });

  collector.on('end', () => {
    interaction.followUp({ content: '🎉 Configuration des salons terminée ! Passons à la configuration des rôles.', flags: 64 });
    return setupRoles(interaction, settings);
  });
}
// Étape 4 : Configuration des rôles
async function setupRoles(interaction, settings) {
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('📌 Configuration - Rôles des membres')
    .setDescription(
      `Veuillez sélectionner les rôles pour les catégories suivantes :\n\n` +
        `1️⃣ **Homme**\n` +
        `2️⃣ **Femme**\n` +
        `3️⃣ **Autre**\n` +
        `4️⃣ **Vérifié** *(si la vérification est activée)*\n\n⚠️ **Obligatoire pour chaque catégorie.**`
    );

  const roles = interaction.guild.roles.cache.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  if (roles.length === 0) {
    return interaction.followUp({
      content: '❌ Aucun rôle disponible pour la configuration.',
      flags: 64,
    });
  }

  const selectMenus = ['male', 'female', 'other', 'verified'].map((key, index) => {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`role-select-${key}`)
        .setPlaceholder(`Choisir le rôle pour ${['Homme', 'Femme', 'Autre', 'Vérifié'][index]}...`)
        .addOptions(roles.slice(0, 25)) // Limité à 25 options
    );
  });

  await interaction.followUp({ embeds: [embed], components: selectMenus, flags: 64 });

  const filter = (menuInteraction) => menuInteraction.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

  collector.on('collect', async (menuInteraction) => {
    const key = menuInteraction.customId.split('-')[2];
    settings.roles[key] = menuInteraction.values[0];
    await settings.save();
    await menuInteraction.reply({
      content: `✔️ Rôle configuré pour **${key}** : <@&${menuInteraction.values[0]}>.`,
      flags: 64,
    });
  });

  collector.on('end', () => {
    interaction.followUp({ content: '🎉 Configuration des rôles terminée ! Passons aux messages personnalisés.', flags: 64 });
    return setupCustomMessages(interaction, settings);
  });
}
// Étape 5 : Messages personnalisés ou par défaut
async function setupCustomMessages(interaction, settings) {
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('✨ Configuration - Messages personnalisés')
    .setDescription(
      `Voulez-vous utiliser des messages par défaut ou personnaliser vos messages ?\n\n` +
        `1️⃣ **Message de vérification** : Message envoyé pendant le processus de vérification.\n` +
        `2️⃣ **Message de setup des profils** : Message pour guider les membres à configurer leurs profils.`
    );

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('custom-message-enable').setLabel('✔️ Modifier').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('custom-message-default').setLabel('❌ Par défaut').setStyle(ButtonStyle.Danger)
  );

  await interaction.followUp({ embeds: [embed], components: [buttons], flags: 64 });

  const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

  collector.on('collect', async (btnInteraction) => {
    if (btnInteraction.customId === 'custom-message-enable') {
      await btnInteraction.update({
        content: '💡 Envoyez vos messages personnalisés en DM dans ce format :\n\n' +
          '**Message de vérification :**\n[Texte]\n\n' +
          '**Message de setup :**\n[Texte]',
        components: [],
      });

      const dmCollector = interaction.user.dmChannel.createMessageCollector({ time: 60000 });

      dmCollector.on('collect', async (msg) => {
        const [verificationMessage, setupMessage] = msg.content.split('\n\n');
        settings.customMessages.verification = verificationMessage.replace('**Message de vérification :**\n', '');
        settings.customMessages.setupProfile = setupMessage.replace('**Message de setup :**\n', '');
        await settings.save();
        await interaction.followUp({ content: '✅ Messages personnalisés enregistrés avec succès.', flags: 64 });
      });

      dmCollector.on('end', (collected) => {
        if (!collected.size) {
          interaction.followUp({
            content: '❌ Aucun message reçu. Les messages par défaut seront utilisés.',
            flags: 64,
          });
        }
      });
    } else if (btnInteraction.customId === 'custom-message-default') {
      settings.customMessages.verification = null;
      settings.customMessages.setupProfile = null;
      await settings.save();
      await btnInteraction.update({
        content: '✔️ Messages par défaut appliqués.',
        components: [],
      });
    }
  });

  collector.on('end', () => {
    interaction.followUp({ content: '🎉 Configuration des messages terminée ! Passons à la confirmation finale.', flags: 64 });
    return confirmSettings(interaction, settings);
  });
}
// Étape 6 : Confirmation finale
async function confirmSettings(interaction, settings) {
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('📝 Confirmation finale')
    .setDescription(
      `Voici un résumé de vos paramètres :\n\n` +
        `🔒 **Vérification activée** : ${settings.verificationEnabled ? 'Oui' : 'Non'}\n` +
        `📋 **Salon de vérification** : <#${settings.verificationChannel || 'Non configuré'}>\n` +
        `📌 **Salons de profils** :\n` +
        `   - **Homme** : <#${settings.profileChannels.male || 'Non configuré'}>\n` +
        `   - **Femme** : <#${settings.profileChannels.female || 'Non configuré'}>\n` +
        `   - **Autre** : <#${settings.profileChannels.other || 'Non configuré'}>\n` +
        `   - **Setup-Profil** : <#${settings.profileChannels.setupProfile || 'Non configuré'}>\n\n` +
        `✨ **Messages personnalisés** : ${settings.customMessages.verification ? 'Oui' : 'Non'}\n\n` +
        `Confirmez-vous l'application de ces paramètres ?`
    );

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('settings-confirm').setLabel('✅ Confirmer').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('settings-cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Danger)
  );

  await interaction.followUp({ embeds: [embed], components: [buttons], flags: 64 });

  const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

  collector.on('collect', async (btnInteraction) => {
    if (btnInteraction.customId === 'settings-confirm') {
      await btnInteraction.update({
        content: '🎉 Paramètres appliqués avec succès ! Votre serveur est maintenant configuré.',
        components: [],
      });
    } else if (btnInteraction.customId === 'settings-cancel') {
      await btnInteraction.update({
        content: '❌ Configuration annulée. Aucun paramètre n’a été enregistré.',
        components: [],
      });
    }
  });

  collector.on('end', () => {
    interaction.followUp({ content: '⏱️ Temps écoulé. Veuillez relancer `/setup`.', flags: 64 });
  });
}
