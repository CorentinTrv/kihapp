// Kihapp, moteur/leitner.js (lot K3)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge. Le jour ('AAAA-MM-JJ') est
// toujours passé par l'appelant.
//
// Cinq boîtes. Plus l'élève connaît un élément, plus la boîte est haute et plus
// la revue est lointaine. Un faux renvoie en boîte 1.
//
// La règle « la première réponse de la leçon décide » (et le rattrapage sans
// second mouvement de boîte) vit dans la leçon (lot K4) : ici, repondre()
// applique toujours la réponse qu'on lui donne.

import { ajouterJours } from "./dates.js";

/** Jours avant la revue, selon la boîte. Un seul endroit. */
export const INTERVALLES = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 };

const BOITE_MAX = 5;

/**
 * Applique une réponse et rend un NOUVEL état (l'ancien reste intact).
 * Élément de forme { b, p, v, e, d } : boîte, prochaine revue, vues, échecs,
 * dernier jour. Un élément absent naît en boîte 1 avant la réponse.
 */
export function repondre(etat, id, juste, aujourdhui) {
  const avant = etat.elements[id] ?? { b: 1, p: aujourdhui, v: 0, e: 0, d: aujourdhui };
  const b = juste ? Math.min(avant.b + 1, BOITE_MAX) : 1;
  const apres = {
    b,
    p: ajouterJours(aujourdhui, INTERVALLES[b]),
    v: avant.v + 1,
    e: avant.e + (juste ? 0 : 1),
    d: aujourdhui,
  };
  return { ...etat, elements: { ...etat.elements, [id]: apres } };
}

/** Vrai si l'élément est à revoir ce jour (les chaînes 'AAAA-MM-JJ' se comparent telles quelles). */
export function estDu(element, aujourdhui) {
  return element.p <= aujourdhui;
}
