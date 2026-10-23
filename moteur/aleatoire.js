// Kihapp, moteur/aleatoire.js (lot K1)
// ====================================================================
// Module PUR : un hasard à graine. Une même graine redonne toujours la même
// suite de tirages, donc une leçon composée avec une graine est rejouable
// dans un banc. Math.random n'est jamais utilisé ici.

/** mulberry32 : rend une fonction sans argument qui donne un nombre dans [0, 1). */
export function creerAlea(graine) {
  let etat = graine >>> 0;
  return function alea() {
    etat = (etat + 0x6D2B79F5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Un entier dans [0, n). */
export function entier(alea, n) {
  return Math.floor(alea() * n);
}

/** Un NOUVEAU tableau mélangé (Fisher-Yates), l'original reste intact. */
export function melanger(tableau, alea) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = entier(alea, i + 1);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Un élément du tableau. */
export function choisir(tableau, alea) {
  return tableau[entier(alea, tableau.length)];
}
