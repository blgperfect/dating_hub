const fs = require('fs');
const path = require('path');

/**
 * Parcourt récursivement un répertoire et récupère les fichiers ou dossiers selon le mode spécifié.
 *
 * @param {string} directory - Le chemin du répertoire à parcourir.
 * @param {string} mode - "files", "folders", ou "all" pour récupérer respectivement fichiers, dossiers ou les deux.
 * @param {boolean} recursive - Si vrai, parcourt les sous-dossiers récursivement.
 * @returns {Array<string>} - Une liste des chemins absolus correspondant au mode.
 */
function getAllFiles(directory, mode = 'files', recursive = false) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let results = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (mode === 'folders' || mode === 'all') {
        results.push(fullPath);
      }
      if (recursive) {
        results = results.concat(getAllFiles(fullPath, mode, recursive));
      }
    } else if (entry.isFile() && (mode === 'files' || mode === 'all')) {
      results.push(fullPath);
    }
  }

  return results;
}

module.exports = getAllFiles;
