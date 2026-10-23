// Kihapp, moteur/dates.js (lot K1)
// ====================================================================
// Module PUR : aucune lecture de l'horloge (l'appelant passe la date), ni
// window, ni document. Les jours sont des chaînes 'AAAA-MM-JJ' en JOUR LOCAL.
//
// Pourquoi UTC pour compter : entre deux minuits locaux, un changement
// d'heure fait durer un jour 23 h ou 25 h. Diviser la différence de
// millisecondes par 24 h donnerait 1,96 jour. Date.UTC n'a pas d'heure d'été :
// chaque jour y fait exactement 86 400 000 ms.

const MS_PAR_JOUR = 86400000;

function deuxChiffres(n) {
  return String(n).padStart(2, "0");
}

// 'AAAA-MM-JJ' -> millisecondes UTC du minuit de ce jour.
function enUtc(jour) {
  const [a, m, j] = jour.split("-").map(Number);
  return Date.UTC(a, m - 1, j);
}

/** Le jour local (année, mois, jour locaux de la date reçue) en 'AAAA-MM-JJ'. */
export function jourLocal(date) {
  return `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`;
}

/** Nombre de jours entiers de a à b (négatif si b est avant a). */
export function ecartJours(a, b) {
  return Math.round((enUtc(b) - enUtc(a)) / MS_PAR_JOUR);
}

/** Le jour situé n jours après (ou avant, si n est négatif) le jour donné. */
export function ajouterJours(jour, n) {
  const d = new Date(enUtc(jour) + n * MS_PAR_JOUR);
  return `${d.getUTCFullYear()}-${deuxChiffres(d.getUTCMonth() + 1)}-${deuxChiffres(d.getUTCDate())}`;
}
