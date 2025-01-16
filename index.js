// Import des modules
require('dotenv').config();
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const connectDB = require('./database/connect');
const commands = require('./commands');
const getAllFiles = require('./utils/getAllFiles');
const likeManager = require('./utils/likeManager');

// Initialisation du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

// Initialisation
console.clear();
console.log(chalk.blue.bold("System >> Initialisation..."));

client.once('ready', async () => {
    console.log(chalk.green(`✅ Connecté en tant que ${client.user.tag}`));

    // Connexion à MongoDB
    console.log(chalk.blue("🔗 Connexion à MongoDB..."));
    await connectDB();
    console.log(chalk.green("✅ Connexion à MongoDB réussie !"));

    // Définir l'activité du bot
    client.user.setPresence({
        activities: [{ name: 'Blue Haven', type: 3 }], // 3 = Écoute
        status: 'online',
    });
    console.log(chalk.yellow('🎧 Activité définie : "Écoute Blue Haven"'));

    // Déploiement des commandes globales
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log(chalk.yellow("🚀 Déploiement des commandes globales..."));
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(command => command.data.toJSON()) }
        );
        console.log(chalk.green("✅ Commandes globales déployées avec succès !"));
    } catch (error) {
        console.error(chalk.red("❌ Erreur lors du déploiement des commandes :", error));
    }
});

// Gestion des interactions
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = commands.find(cmd => cmd.data.name === interaction.commandName);
        if (!command) return;

        try {
            console.log(chalk.blue(`➡️ Exécution de la commande : ${interaction.commandName}`));
            await command.execute(interaction);
        } catch (error) {
            console.error(chalk.red(`❌ Erreur lors de l'exécution de la commande "${interaction.commandName}" :`, error));
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        try {
            const interactionFolders = getAllFiles(path.join(__dirname, "./interactions"), "folders");
            for (const subFolder of interactionFolders) {
                const interactionFiles = getAllFiles(subFolder, "files", true);
                for (const eventFile of interactionFiles) {
                    const eventFunction = require(eventFile);
                    await eventFunction(client, interaction);
                }
            }
        } catch (error) {
            console.error(chalk.red('❌ Erreur lors de la gestion des boutons :', error));
        }
    }
});

// Gestion des réactions (likes)
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    try {
        await likeManager.handleLikeReaction(reaction, user);
    } catch (error) {
        console.error(chalk.red('❌ Erreur lors de la gestion des réactions :', error));
    }
});

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
    console.error(chalk.red("❌ Rejet non géré :", error));
});

process.on('warning', (warn) => {
    console.warn(chalk.yellow("⚠️ Avertissement :", warn));
});

// Connexion du bot
client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log(chalk.cyan.bold("🔑 Connexion au bot réussie !"));
}).catch((error) => {
    console.error(chalk.red("❌ Erreur lors de la connexion au bot :", error));
    process.exit(1);
});
