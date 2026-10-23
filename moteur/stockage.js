// Kihapp, moteur/stockage.js (lot K3)
// ====================================================================
// Module PUR : ni window, ni document, ni localStorage, ni horloge. Le magasin
// ({ getItem, setItem }) et le jour sont passés en paramètre ; la glu y met
// localStorage, les tests y mettent un faux.
//
// Règle d'or : un souci de stockage ne fait JAMAIS planter l'app. Rien ici ne
// lève vers l'appelant.
//
// Jamais de clear() ni de removeItem : l'origine corentintrv.github.io est
// partagée avec la copie GitHub Pages de Stovo. Toute clé écrite commence par
// « kihapp: ».

export const CLE = "kihapp:etat";
export const SCHEMA = 1;

const CLE_ILLISIBLE = "kihapp:etat:illisible";
const MESSAGE_ABIME = "Ta progression précédente était abîmée : Kihapp repart de zéro.";
const MESSAGE_FUTUR = "Ferme et rouvre l'app pour la mettre à jour.";

/** L'état d'un élève qui n'a encore rien fait. */
export function etatNeuf(aujourdhui) {
  return {
    schema: SCHEMA,
    creeLe: aujourdhui,
    elements: {},
    jours: {},
    record: 0,
    reglages: { rythme: 2.5, modeDictee: "compte" },
  };
}

// Une migration par version de départ : MIGRATIONS[n] amène un état du schéma n
// au schéma n + 1. Le schéma 0 n'a jamais été publié : cette première marche ne
// sert qu'à ce que la tuyauterie existe et soit testée avant d'en avoir besoin.
const MIGRATIONS = {
  0: (etat) => ({ ...etat, schema: 1 }),
};

/** Enchaîne les migrations jusqu'à SCHEMA. L'état reçu n'est pas modifié. */
export function migrer(etat) {
  let courant = etat;
  while (courant.schema < SCHEMA) {
    courant = MIGRATIONS[courant.schema](courant);
  }
  return courant;
}

// Un JSON qui se lit mais n'est pas un état (null, tableau, pas de schéma entier)
// est traité comme abîmé : mieux vaut repartir de zéro que planter plus loin.
function estUnEtat(valeur) {
  return Number.isInteger(valeur?.schema) && valeur.schema >= 0;
}

// setItem peut lever (quota, navigation privée) : on le dit par un booléen.
function essayerEcrire(magasin, cle, texte) {
  try {
    magasin.setItem(cle, texte);
    return true;
  } catch {
    return false;
  }
}

function repartirDeZero(magasin, brut, aujourdhui) {
  essayerEcrire(magasin, CLE_ILLISIBLE, brut); // on garde la valeur brute, au cas où
  return { etat: etatNeuf(aujourdhui), lectureSeule: false, message: MESSAGE_ABIME };
}

/**
 * Lit l'état. Rend { etat, lectureSeule, message }.
 * - rien : état neuf ; illisible : état neuf, brut recopié, message ;
 * - schéma plus grand : tel quel, lecture seule (un ancien code servi après un
 *   nouveau ne doit rien écraser) ; schéma plus petit : migré puis écrit.
 */
export function lire(magasin, aujourdhui) {
  let brut = null;
  try {
    brut = magasin.getItem(CLE);
  } catch {
    // magasin inaccessible : l'app tourne en mémoire sur un état neuf
  }
  if (brut === null) return { etat: etatNeuf(aujourdhui), lectureSeule: false, message: null };

  let etat;
  try {
    etat = JSON.parse(brut);
  } catch {
    return repartirDeZero(magasin, brut, aujourdhui);
  }
  if (!estUnEtat(etat)) return repartirDeZero(magasin, brut, aujourdhui);

  if (etat.schema > SCHEMA) return { etat, lectureSeule: true, message: MESSAGE_FUTUR };
  if (etat.schema < SCHEMA) {
    const migre = migrer(etat);
    essayerEcrire(magasin, CLE, JSON.stringify(migre));
    return { etat: migre, lectureSeule: false, message: null };
  }
  return { etat, lectureSeule: false, message: null };
}

/**
 * Écrit l'état. Rend { enregistrable } : false si le magasin refuse, ou si l'état
 * vient d'un schéma plus récent (lecture seule). Ne lève jamais.
 */
export function ecrire(magasin, etat) {
  if (etat.schema > SCHEMA) return { enregistrable: false };
  return { enregistrable: essayerEcrire(magasin, CLE, JSON.stringify(etat)) };
}
