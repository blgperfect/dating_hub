const fs = require("fs")
const path = require("path")

/**
 * Renvoie tous les fichiers et/ou dossiers d'un dossier, y compris ceux des sous-dossiers si spécifié.
 * @param {string} directory - Nom du dossier.
 * @param {"folders" | "files" | "both"} type - Type de résultat à retourner ("folders", "files", ou "both").
 * @param {boolean} readSubfolders - Lire également les sous-dossiers ?
 * @returns {string[]} - Un array avec le chemin absolu de tous les fichiers et/ou dossiers.
 */
function getAllFiles(
  directory,
  type,
  readSubfolders
) {
  let results = [];
  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      if (type === "folders" || type === "both") {
        results.push(itemPath);
      }
      if (readSubfolders) {
        results = results.concat(getAllFiles(itemPath, type, readSubfolders));
      }
    } else if (stats.isFile()) {
      if (type === "files" || type === "both") {
        results.push(itemPath);
      }
    }
  });

  return results;
}

module.exports = getAllFiles