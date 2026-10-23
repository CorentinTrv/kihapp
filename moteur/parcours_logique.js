// Kihapp, moteur/parcours_logique.js (lot K5)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge. Il dit à l'élève où il en
// est dans son parcours (quelles unités sont ouvertes) et ce qui est fragile.
// Rien ici ne punit : une unité fermée est seulement « pas encore ».

/** Part des éléments d'une unité à avoir atteint la boîte 2 pour ouvrir la suivante. */
export const SEUIL_OUVERTURE = 0.8;

const BOITE_ACQUISE = 2;
const BOITE_FRAGILE_MAX = 2;
const MAX_POINTS_FAIBLES = 10;

/**
 * Une ligne par unité, dans l'ordre : { id, titre, total, acquis, ouverte }.
 * total : éléments interrogeables (exercice: true) ; acquis : ceux en boîte 2
 * ou plus. La 1re unité est toujours ouverte ; la suivante s'ouvre quand
 * celle-ci est ouverte ET à 80 %. Une unité sans élément interrogeable
 * n'ouvre rien (0 sur 0 n'est pas une réussite).
 */
export function etatUnites(etat, vocabulaire, unites) {
  let precedenteFranchie = true; // sert de « ouverte » à la 1re unité
  return unites.map((unite) => {
    const ids = vocabulaire.filter((e) => e.unite === unite.id && e.exercice).map((e) => e.id);
    const acquis = ids.filter((id) => (etat.elements[id]?.b ?? 0) >= BOITE_ACQUISE).length;
    const ouverte = precedenteFranchie;
    precedenteFranchie = ouverte && ids.length > 0 && acquis / ids.length >= SEUIL_OUVERTURE;
    return { id: unite.id, titre: unite.titre, total: ids.length, acquis, ouverte };
  });
}

/**
 * Les ids des éléments vus et encore en boîte 1 ou 2, du plus raté au moins
 * raté (échecs décroissants, puis dernier jour le plus ancien, puis id), dix au
 * plus. Seuls les éléments interrogeables du vocabulaire comptent.
 */
export function pointsFaibles(etat, vocabulaire) {
  const interrogeables = new Set(vocabulaire.filter((e) => e.exercice).map((e) => e.id));
  return Object.entries(etat.elements)
    .filter(([id, el]) => interrogeables.has(id) && el.v > 0 && el.b <= BOITE_FRAGILE_MAX)
    .sort(([idA, a], [idB, b]) =>
      b.e - a.e || (a.d < b.d ? -1 : a.d > b.d ? 1 : 0) || (idA < idB ? -1 : idA > idB ? 1 : 0)
    )
    .slice(0, MAX_POINTS_FAIBLES)
    .map(([id]) => id);
}
