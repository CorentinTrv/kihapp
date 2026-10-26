// Kihapp, ecrans/fin_lecon.js (lot K6) : l'écran #fin.
// Le score, les éléments montés de boîte pendant la leçon, la série, et le
// retour à l'accueil (un simple lien, dans index.html).
//
// Le score compte les exercices de la leçon de départ, pas les rattrapages : un
// rattrapage est un second essai pour s'entraîner, il ne rattrape pas la note
// (et la première réponse sur un élément est celle qui décide de sa boîte).

import { ELEMENTS } from '../contenu/elements.js';
import { texteSerie } from '../moteur/serie.js';
import { nomDuMouvement } from './gestes.js';
import { afficherBandeaux, aujourdhui, creer, etatCourant, leconTerminee } from './session.js';
import { nomDeLaBoite } from './lexique.js';

const s = (n) => (n > 1 ? 's' : '');

// Le nom d'un élément monté de boîte : un mot par sa graphie FFTDA, un geste par son nom de geste.
const nomDe = (id) => {
  const element = ELEMENTS.find((e) => e.id === id);
  return element.categorie === 'mouvement' ? nomDuMouvement(id).fftda : element.fftda;
};

/** Le score et les éléments montés de boîte d'une leçon finie. */
function resumer({ lecon, avant }) {
  const exercices = lecon.exercices.filter((e) => !e.rattrapage);
  const justes = exercices.filter((e) => e.juste).length;
  const montes = [...new Set(exercices.map((e) => e.id))]
    .filter((id) => lecon.etat.elements[id].b > (avant.elements[id]?.b ?? 1))
    .map((id) => ({ fftda: nomDe(id), boite: lecon.etat.elements[id].b }));
  return { justes, total: exercices.length, montes };
}

/** À appeler à chaque affichage de #fin, une leçon finie existant (le routeur le garantit). */
export function afficherFin(racine) {
  const { justes, total, montes } = resumer(leconTerminee());
  afficherBandeaux(racine.querySelector('#fin-bandeaux'));
  racine.querySelector('#fin-score').textContent = `${justes} bonne${s(justes)} réponse${s(justes)} sur ${total}`;
  racine.querySelector('#fin-montes-titre').hidden = montes.length === 0;
  racine.querySelector('#fin-montes').replaceChildren(
    ...montes.map((m) => creer('li', '', `${m.fftda} : ${nomDeLaBoite(m.boite)} (boîte ${m.boite})`)),
  );
  racine.querySelector('#fin-serie').textContent = texteSerie(etatCourant(), aujourdhui());
}
