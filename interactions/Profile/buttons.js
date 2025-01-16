const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ButtonInteraction
} = require('discord.js');
const Profile = require('../../database/models/Profile');
const RoleManager = require('../../utils/roleManager');
const ChannelManager = require('../../utils/ChannelManager')
const { createProfileModal } = require('./modals');

/**
 * @param {Client} client
 * @param {ButtonInteraction} interaction
 */
module.exports = async (_client, interaction) =>{
  if (!interaction.isButton()) return;
    const { customId, user, member, guild } = interaction;

    switch (customId) {
      /** ========================
       * Gestion des rôles et salons
       ======================== **/
      case 'profile-activate-confirm': {
        try {
          console.log('Activation du système de profil commencée');
          await interaction.deferReply({ ephemeral: true });

          const roles = [];
          const categoryColors = {
            sexualité: '#1B263B',
            pronom: '#3498DB',
            location: '#5DADE2',
            interet: '#85C1E9',
            status_dm: '#154360',
            relation: '#1ABC9C',
            preference: '#A9CCE3',
            misc: '#AED6F1',
          };

          Object.keys(RoleManager.roleCategories).forEach((category) => {
            RoleManager.roleCategories[category].forEach((role) => {
              roles.push({ name: role, color: categoryColors[category] });
            });
          });
          console.log('Début de la création des rôles');
          await RoleManager.createRoles(guild, roles);
          console.log('Rôles créés avec succès');

          const channels = [
            { name: '📌┃profile-setup', topic: 'Configurer votre profil ici. Utilisez les options disponibles.' },
            { name: '👩┃profile-femme', topic: 'Profils féminins visibles ici.' },
            { name: '👨┃profile-homme', topic: 'Profils masculins visibles ici.' },
            { name: '🌈┃profile-autre', topic: 'Profils non-binaires ou autres.' },
            { name: '🎭┃self-role-profile', topic: 'Choisissez vos rôles personnels.' },
            { name: '✅┃verification', topic: 'Vérifiez votre compte.' },
            { name: '🏅┃badge', topic: 'Explications sur les badges.' },
          ];
          console.log('Début de la création des salons');
          await ChannelManager.createChannels(guild, channels);
          console.log('Salons créés avec succès');

          const selfRoleChannel = guild.channels.cache.find(ch => ch.name === '🎭┃self-role-profile');
          if (selfRoleChannel) {
            const embed = new EmbedBuilder()
              .setTitle('╭━━━༻🎭༺━━━╮\n✨ **Personnalisez votre profil !** ✨\n╰━━━༻🌟༺━━━╯')
              .setDescription(
                '❀ 🎭 Sélectionnez les rôles qui vous représentent. \n❀ 🎨 Ils s\'afficheront fièrement sur votre profil. \n➤ **Appuyez sur le bouton ci-dessous pour commencer.** '
              )
              .setImage('https://media.discordapp.net/attachments/1102406059722801184/1328858043810713741/C19CDA1A-0073-415A-8E4E-368A56761788.jpg?ex=67883afe&is=6786e97e&hm=ab19dbb45645b3f1da96f244019c78b508e46328de5062dfe3b084085ccd9685&=&format=webp&width=1025&height=388')
              .setColor('#3498DB');
          
            const roleButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Modifier mes rôles')
                .setCustomId('edit-roles')
                .setStyle(ButtonStyle.Primary)
            );
          
            await selfRoleChannel.send({ embeds: [embed], components: [roleButton] });
            console.log('Embed envoyé dans le salon 🎭┃self-role-profile');
          }
          
          const profileSetupChannel = guild.channels.cache.find(ch => ch.name === '📌┃profile-setup');
          if (profileSetupChannel) {
            const embed = new EmbedBuilder()
              .setTitle('╭━━━༻📌༺━━━╮\n✨ **Configurer votre profil !** ✨\n╰━━━༻🌟༺━━━╯')
              .setDescription(
                '❀ 📌 Créez ou modifiez votre profil pour le personnaliser selon vos préférences.\n' +
                '❀ ✏️ Cliquez sur le bouton ci-dessous pour commencer.\n' +
                '➤ **Appuyez sur le bouton pour créer ou modifier un profil.**'
              )
              .setImage('https://example.com/profile-setup-banner.jpg') // Remplacez par une URL d'image valide
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
        
            await profileSetupChannel.send({ embeds: [embed], components: [buttons] });
            console.log('Embed envoyé dans le salon 📌┃profile-setup');
          }

          return interaction.editReply({
            content: '✅ Système de profil activé avec succès ! Les salons et rôles ont été créés.',
          });
        } catch (error) {
          console.error("❌ Erreur lors de l'activation du système de profil :", error);
          return interaction.editReply({
            content: "❌ Une erreur est survenue lors de l'activation du système de profil.",
          });
        }
      }
      


      case 'profile-desactivate-confirm': {
        try {
          console.log('Désactivation du système de profil commencée');
          await interaction.deferReply({ ephemeral: true });

          const rolesToDelete = Object.values(RoleManager.roleCategories).flat();
          const channelsToDelete = [
            '📌┃profile-setup',
            '👩┃profile-femme',
            '👨┃profile-homme',
            '🌈┃profile-autre',
            '🎭┃self-role-profile',
            '✅┃verification',
            '🏅┃badge',
          ];

          console.log('Début de la suppression des rôles');
          for (const roleName of rolesToDelete) {
            const role = guild.roles.cache.find((r) => r.name === roleName);
            if (role) await role.delete();
          }
          console.log('Rôles supprimés.');

          console.log('Début de la suppression des salons');
          for (const channelName of channelsToDelete) {
            const channel = guild.channels.cache.find((ch) => ch.name === channelName);
            if (channel) await channel.delete();
          }
          console.log('Salons supprimés.');

          return interaction.editReply({
            content: '✅ Système de profil désactivé avec succès. Les rôles et salons associés ont été supprimés.',
          });
        } catch (error) {
          console.error("❌ Erreur lors de la désactivation du système de profil :", error);
          return interaction.editReply({
            content: "❌ Une erreur est survenue lors de la désactivation du système de profil.",
          });
        }
      }

      case 'profile-activate-cancel': {
        await interaction.deferReply({ ephemeral: true });
        return interaction.editReply({
          content: '❌ Activation du système de profil annulée.',
        });
      }

      /** ========================
       * Gestion des rôles (Edit Roles)
       ======================== **/
       case 'edit-roles': {
        const categories = Object.keys(RoleManager.roleCategories).map((category) => ({
            id: category,
            label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
        }));
    
        if (!categories.length) {
            return interaction.reply({
                content: '❌ Aucune catégorie de rôles disponible.',
                ephemeral: true,
            });
        }
    
        const buttons = categories.map((category) =>
            new ButtonBuilder()
                .setLabel(category.label)
                .setCustomId(`edit-role-${category.id}`)
                .setStyle(ButtonStyle.Primary)
        );
    
        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }
    
        const embed = new EmbedBuilder()
            .setTitle('Modifier vos rôles')
            .setDescription('Choisissez une catégorie pour modifier vos rôles.')
            .setColor('#3498DB');
    
        await interaction.deferReply({ ephemeral: true });
        return interaction.editReply({
            embeds: [embed],
            components: rows,
        });
    }
    
    case customId.startsWith('edit-role-') && customId: {
        const category = customId.replace('edit-role-', '');
        const roles = RoleManager.getRolesByCategory(category);
    
        if (!roles || roles.length === 0) {
            return interaction.reply({
                content: `❌ Aucun rôle disponible pour la catégorie **${category}**.`,
                ephemeral: true,
            });
        }
    
        const roleMenu = new StringSelectMenuBuilder()
            .setCustomId(`select-roles-${category}`)
            .setPlaceholder('Choisissez vos rôles...')
            .setMinValues(0)
            .setMaxValues(roles.length)
            .addOptions(
                roles.map((role) => ({
                    label: role,
                    value: role,
                }))
            );
    
        const roleRow = new ActionRowBuilder().addComponents(roleMenu);
    
        await interaction.deferReply({ ephemeral: true });
        return interaction.editReply({
            content: `Sélectionnez vos rôles pour la catégorie **${category}**.`,
            components: [roleRow],
        });
    }
    
    
  
  
  //endroit modal modifier
      /** ========================
       * Gestion des profils (embeds avec boutons)
       ======================== **/
       case 'create-profile': {
        const existingProfile = await Profile.findOne({ userId: user.id });
      
        if (existingProfile) {
          await interaction.deferReply({ ephemeral: true });
          return interaction.editReply({
            content: '❌ Vous avez déjà un profil. Utilisez "Modifier un profil" pour le mettre à jour.',
          });
        }
      
        const modal = createProfileModal();
        console.log(modal); // Cela doit afficher un objet ModalBuilder
        return interaction.showModal(modal);
        
      }
          
        

      case 'edit-profile': {
        const profile = await Profile.findOne({ userId: user.id });

        if (!profile) {
          await interaction.deferReply({ ephemeral: true });
          return interaction.editReply({
            content: '❌ Vous n’avez pas encore de profil. Utilisez "Créer un profil" pour en créer un.',
          });
        }

        const modal = new ModalBuilder()
          .setCustomId('edit-profile-modal')
          .setTitle('Modifier votre profil');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder() 
              .setCustomId('profile-name')
              .setLabel('Modifier votre nom')
              .setValue(profile.name || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('profile-location')
              .setLabel('Modifier votre lieu')
              .setValue(profile.location || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('profile-status')
              .setLabel('Modifier votre statut')
              .setValue(profile.status || '')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('profile-about')
              .setLabel('Modifier votre description')
              .setValue(profile.about || '')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          )
        );

        return interaction.showModal(modal);
      }

      default:
        console.warn(`⚠️ Bouton inconnu : ${customId}`);
        await interaction.deferReply({ ephemeral: true });
        return interaction.editReply({
          content: '❌ Action non reconnue.',
        });
    }
  }
