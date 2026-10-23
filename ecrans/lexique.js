// Kihapp, ecrans/lexique.js (lot K9) : l'écran #lexique.
// Tous les mots que Kihapp interroge, groupés par unité dans l'ordre du parcours,
// puis les mots de famille (Seugui, Maki...) qui ne sont jamais interrogés.
// Chaque mot : graphie FFTDA, français, hangeul en petit, et la boîte atteinte
// en clair. Pas de bouton son : l'audio est en pause (lot K8).
//
// afficherLexique(racine) est appelé à chaque affichage : la boîte atteinte
// vient de l'état courant, qui change à chaque leçon.

import { UNITES } from '../contenu/parcours.js';
import { VOCABULAIRE } from '../contenu/vocabulaire.js';
import { creer, etatCourant } from './session.js';

// Le nom d'une boîte, le même ici et sur l'écran de fin de leçon (qui l'importe) :
// 1 « À revoir » (un mot raté retombe là, il ne peut pas se lire « Bien parti »),
// 2 « Bien parti », 3 et 4 « En bonne voie », 5 « Acquis ».
export function nomDeLaBoite(boite) {
  if (boite >= 5) return 'Acquis';
  if (boite >= 3) return 'En bonne voie';
  return boite === 2 ? 'Bien parti' : 'À revoir';
}

function ligneMot(mot, etat) {
  const li = creer('li', 'lex-mot');
  const nom = creer('span', 'lex-nom');
  nom.append(creer('span', 'lex-fftda', mot.fftda), creer('span', 'lex-fr', mot.fr));
  const ko = creer('span', 'lex-ko', mot.hangeul);
  ko.lang = 'ko';
  li.append(nom, ko);
  // Un mot de famille n'est jamais interrogé : aucune boîte à lui donner.
  // Jamais répondu : « Pas encore vu ».
  if (mot.exercice) li.append(creer('span', 'lex-boite', etat.elements[mot.id] ? nomDeLaBoite(etat.elements[mot.id].b) : 'Pas encore vu'));
  return li;
}

function groupe(titre, mots, etat) {
  const liste = creer('ul', 'lex-liste');
  liste.append(...mots.map((m) => ligneMot(m, etat)));
  const section = creer('section', 'lex-groupe');
  section.append(creer('h3', '', titre), liste);
  return section;
}

export function afficherLexique(racine) {
  const etat = etatCourant();
  const interrogeables = VOCABULAIRE.filter((m) => m.exercice);
  const parUnite = UNITES.map((u) => groupe(u.titre, interrogeables.filter((m) => m.unite === u.id), etat));
  const familles = groupe('Les familles de mots', VOCABULAIRE.filter((m) => m.categorie === 'famille'), etat);
  racine.querySelector('#lex-groupes').replaceChildren(...parUnite, familles);
}
