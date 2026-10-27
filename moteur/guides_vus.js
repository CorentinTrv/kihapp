// Kihapp, moteur/guides_vus.js (lot « guide d'unité »)
// ====================================================================
// Module PUR : ni window, ni document, ni localStorage. Le magasin ({ getItem, setItem }) est
// passé en paramètre ; la glu (ecrans/session.js) y met localStorage, les tests y mettent un faux.
//
// Il retient quels guides d'unité l'élève a déjà lus (« C'est parti » touché), pour que le guide
// ne s'ouvre qu'une fois. Ce n'est PAS dans l'état sauvegardé : une clé à part, un simple tableau
// d'ids d'unité. Conséquence voulue : une restauration sur un autre téléphone rouvre chaque guide
// une fois. Ce module ne lit ni n'écrit jamais « kihapp:etat ».
//
// Règle d'or, comme moteur/stockage.js : un souci de stockage ne fait JAMAIS planter l'app.
// Rien ici ne lève vers l'appelant (le pire qui puisse arriver : le guide se rouvre).

export const CLE_GUIDES = "kihapp:guides-vus";

/** L'ensemble des ids d'unité dont le guide est lu. Absent, illisible ou magasin en panne : ensemble vide. */
export function guidesVus(magasin) {
  try {
    const valeur = JSON.parse(magasin.getItem(CLE_GUIDES));
    return Array.isArray(valeur) ? new Set(valeur.filter((id) => typeof id === "string")) : new Set();
  } catch {
    return new Set();
  }
}

/** Marque ce guide lu : l'id s'ajoute sans doublon. Une écriture refusée (quota) ne lève pas. */
export function marquerGuideVu(magasin, unite) {
  const vus = guidesVus(magasin);
  vus.add(unite);
  try {
    magasin.setItem(CLE_GUIDES, JSON.stringify([...vus]));
  } catch {
    // Le guide se rouvrira au prochain tap : sans gravité.
  }
}
