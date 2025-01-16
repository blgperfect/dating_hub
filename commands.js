const fs = require('fs');
const path = require('path');

// Tableau pour stocker toutes les commandes valides
const commands = [];

// Chemin vers le dossier "commands"
const commandsPath = path.join(__dirname, 'commands');

// Lecture des sous-dossiers dans "commands"
fs.readdirSync(commandsPath).forEach(folder => {
    const folderPath = path.join(commandsPath, folder);

    // Vérifier que c'est un dossier
    if (fs.statSync(folderPath).isDirectory()) {
        // Lire les fichiers de commandes dans chaque sous-dossier
        fs.readdirSync(folderPath).filter(file => file.endsWith('.js')).forEach(file => {
            const command = require(path.join(folderPath, file));
            
            // Vérification : chaque commande doit avoir "data" et "execute"
            if (command.data && command.execute) {
                commands.push(command);
                console.log(`Commande chargée : ${command.data.name}`);
            } else {
                console.warn(`Commande ignorée (structure incorrecte) : ${file}`);
            }
        });
    }
});

// Exporter les commandes pour les utiliser dans index.js
module.exports = commands;
