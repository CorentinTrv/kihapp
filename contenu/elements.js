// Kihapp, contenu/elements.js (lot K19a)
// ====================================================================
// Tout ce que Kihapp fait réviser : le vocabulaire, puis les mouvements des
// poomsae. Un mouvement devient un élément du même système Leitner que les mots
// (boîte, prochaine revue), avec l'id du mouvement (t1-05) pour clé.
//
// Un élément de mouvement ne porte AUCUN texte (ni fftda ni fr) : comment un
// geste se nomme à l'écran est une décision du lot qui dessine l'écran des gestes.
//
// - suivant : l'id du mouvement d'après, null pour le dernier (le retour Baro
//   n'est pas un mouvement) ; sert à l'exercice « après ce geste, lequel ? ».
// - signature : ce qu'un NOM de geste peut distinguer, « technique|côté », avec
//   « avant+ » devant quand le mouvement porte deux techniques (le coup de pied
//   puis le coup de poing). Deux mouvements de même signature sont indiscernables
//   par le nom : les exercices ne les mettent jamais côte à côte.

import { VOCABULAIRE } from "./vocabulaire.js";
import { TAEGEUK_IL_JANG } from "./taegeuk_il_jang.js";

/** Un élément par mouvement du poomsae, dans l'ordre. Le poomsae reçu n'est pas modifié. */
export function elementsDuPoomsae(poomsae) {
  return poomsae.mouvements.map((m, i, tous) => ({
    id: m.id,
    categorie: "mouvement",
    unite: poomsae.id,
    poomsae: poomsae.id,
    numero: m.numeroKukkiwon,
    technique: m.technique,
    avant: m.avant ?? null,
    cote: m.cote,
    signature: `${m.avant ? `${m.avant}+` : ""}${m.technique}|${m.cote}`,
    suivant: tous[i + 1]?.id ?? null,
    exercice: true,
  }));
}

export const ELEMENTS = [...VOCABULAIRE, ...elementsDuPoomsae(TAEGEUK_IL_JANG)];

// ---- Lot K19b : comment un geste se nomme à l'écran ------------------------------
// Le nom ne dépend que de la signature (technique, éventuel coup de pied d'avant,
// côté) : deux mouvements de même signature se nomment pareil. Le côté est celui du
// bras qui agit (cote), écrit « gauche » ou « droite » dans le nom FFTDA et
// « bras gauche » ou « bras droit » dans le français.
const BRAS = { gauche: "bras gauche", droite: "bras droit" };

const minuscule = (texte) => texte.charAt(0).toLowerCase() + texte.slice(1);

/** { fftda, fr } d'un élément de catégorie « mouvement », d'après les mots du vocabulaire. */
export function nomDuGeste(element, vocabulaire = VOCABULAIRE) {
  if (element.categorie !== "mouvement") throw new Error(`nomDuGeste : « ${element.id} » n'est pas un mouvement`);
  const mot = (id) => {
    const trouve = vocabulaire.find((v) => v.id === id);
    if (trouve === undefined) throw new Error(`nomDuGeste : « ${id} » absent du vocabulaire`);
    return trouve;
  };
  const bras = BRAS[element.cote];
  if (bras === undefined) throw new Error(`nomDuGeste : côté « ${element.cote} » inconnu pour « ${element.id} »`);
  const technique = mot(element.technique);
  const avant = element.avant ? mot(element.avant) : null;
  return {
    fftda: `${avant ? `${avant.fftda} puis ` : ""}${technique.fftda}, ${element.cote}`,
    fr: `${avant ? `${avant.fr} puis ${minuscule(technique.fr)}` : technique.fr}, ${bras}`,
  };
}
