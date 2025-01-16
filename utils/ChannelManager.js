const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  // Création des salons dans une guilde
  async createChannels(guild, channels) {
    for (const channelData of channels) {
      try {
        const existingChannel = guild.channels.cache.find(
          (channel) => channel.name === channelData.name
        );

        if (existingChannel) {
          console.log(`ℹ️ Le salon "${channelData.name}" existe déjà.`); 
          continue;
        }

        // Crée un nouveau salon
        const newChannel = await guild.channels.create({
          name: channelData.name,
          type: 0, // Type : salon de texte
          topic: channelData.topic || '',
          reason: 'Création automatique pour le système de profil.',
        });

        console.log(`✅ Salon créé : ${channelData.name}`);

        // Ajouter du contenu spécifique pour certains salons
        if (channelData.name === 'self-role-profile') {
          await this.setupSelfRoleProfile(newChannel);
        } else if (channelData.name === 'profile-setup') {
          await this.setupProfileSetup(newChannel);
        } else if (channelData.name === 'verification') {
          await this.setupVerificationChannel(newChannel);
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de la création du salon "${channelData.name}":`,
          error
        );
      }
    }
  },

  // Suppression des salons dans une guilde
  async deleteChannels(guild, channelNames) {
    for (const channelName of channelNames) {
      try {
        const channel = guild.channels.cache.find(
          (ch) => ch.name === channelName
        );

        if (!channel) {
          console.log(
            `⚠️ Le salon "${channelName}" n'existe pas ou a déjà été supprimé.`
          );
          continue;
        }

        await channel.delete('Suppression automatique pour le système de profil.');
        console.log(`🗑️ Salon supprimé : ${channelName}`);
      } catch (error) {
        console.error(
          `❌ Erreur lors de la suppression du salon "${channelName}":`,
          error
        );
      }
    }
  },

  // Configuration du salon "self-role-profile"
  async setupSelfRoleProfile(channel) {
    const embed = new EmbedBuilder()
      .setTitle('Bienvenue dans Self-Role Profile')
      .setDescription(
        'Sélectionnez vos rôles pour personnaliser votre profil. Appuyez sur le bouton ci-dessous pour commencer.'
      )
      .setColor('#3498db');

    const roleButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Modifier mes rôles')
        .setCustomId('edit-roles')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await channel.send({ embeds: [embed], components: [roleButton] });
      console.log('✅ Contenu ajouté au salon "self-role-profile".');
    } catch (error) {
      console.error('❌ Erreur lors de la configuration du salon "self-role-profile":', error);
    }
  },

  // Configuration du salon "profile-setup"
  async setupProfileSetup(channel) {
    const embed = new EmbedBuilder()
      .setTitle('Bienvenue dans Profile Setup')
      .setDescription(
        'Gérez votre profil ici. Utilisez les boutons ci-dessous pour créer, modifier ou visualiser votre profil.'
      )
      .setColor('#2ecc71');

    const buttons = new ActionRowBuilder().addComponents(
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
        .setStyle(ButtonStyle.Secondary)
    );

    try {
      await channel.send({ embeds: [embed], components: [buttons] });
      console.log('✅ Contenu ajouté au salon "profile-setup".');
    } catch (error) {
      console.error('❌ Erreur lors de la configuration du salon "profile-setup":', error);
    }
  },

  // Configuration du salon "verification"
  async setupVerificationChannel(channel) {
    const embed = new EmbedBuilder()
      .setTitle('Vérification')
      .setDescription(
        'Protégez votre identité et gagnez en crédibilité avec la vérification. Suivez les étapes ci-dessous :\n\n' +
          '1️⃣ Prenez un selfie avec votre pièce d\'identité et une note mentionnant votre pseudo Discord et le serveur.\n' +
          '2️⃣ Floutez les informations sensibles sauf la photo et la date de naissance.\n\n' +
          'Lorsque vous êtes prêt, appuyez sur le bouton ci-dessous pour soumettre votre demande.'
      )
      .setColor('#e74c3c');

    const verificationButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Soumettre une demande')
        .setCustomId('submit-verification')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await channel.send({ embeds: [embed], components: [verificationButton] });
      console.log('✅ Contenu ajouté au salon "verification".');
    } catch (error) {
      console.error('❌ Erreur lors de la configuration du salon "verification":', error);
    }
  },
};