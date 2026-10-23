// Kihapp, ecrans/lecon.js (lot K6) : l'écran #lecon, sans son.
// Une question à la fois : quatre réponses, correction immédiate, « Continuer ».
//
// L'ordre est ce qui compte (un banc Chromium le garde) :
//   1. au premier toucher, TOUS les boutons se désactivent (un double toucher ne
//      compte qu'une fois : noterReponse refuse aussi un second appel) ;
//   2. noterReponse met la leçon à jour ;
//   3. enregistrer(...) tout de suite : un iPhone peut tuer la PWA sans prévenir ;
//   4. la correction s'affiche.
// Après le dernier exercice (les rattrapages sont ajoutés en fin de leçon par
// noterReponse, donc le total peut grandir), le jour est marqué et l'écran de
// fin s'ouvre.

import { VOCABULAIRE } from '../contenu/vocabulaire.js';
import { noterReponse } from '../moteur/exercices.js';
import { creer, enregistrer, leconCourante, quitterLecon, terminerLecon } from './session.js';

// Les exercices d'écoute (V3, V4) n'existent pas sans son : ils n'ont pas de consigne ici.
const CONSIGNES = { V1: 'Que veut dire ce mot ?', V2: 'Comment dit-on en coréen ?' };

let racineBranchee = null;
let affichee = null; // la leçon dont on montre un exercice
let index = 0; // l'exercice montré

const hangeulDe = (id) => VOCABULAIRE.find((e) => e.id === id).hangeul;
const boutonsDeReponse = (racine) => [...racine.querySelectorAll('#lecon-choix button')];

function majProgression(racine, lecon, exercice) {
  const faits = index + (exercice.repondu ? 1 : 0);
  const total = lecon.exercices.length;
  racine.querySelector('#lecon-compte').textContent = `${index + 1} / ${total}`;
  const barre = racine.querySelector('#lecon-barre');
  barre.setAttribute('aria-valuemax', String(total));
  barre.setAttribute('aria-valuenow', String(faits));
  barre.firstElementChild.style.transform = `scaleX(${faits / total})`;
}

// Vert pour la bonne réponse, rouge pour celle qui a été touchée à tort.
function corriger(racine, lecon, exercice) {
  const boutons = boutonsDeReponse(racine);
  for (const b of boutons) b.disabled = true;
  boutons[exercice.bonne].classList.add('juste');
  if (exercice.juste) {
    racine.querySelector('#lecon-retour').textContent = 'Bien !';
  } else {
    boutons[exercice.choisi].classList.add('faux');
    racine.querySelector('#lecon-retour').textContent = `La bonne réponse : ${exercice.choix[exercice.bonne]}`;
  }
  const suite = racine.querySelector('#lecon-continuer');
  suite.hidden = false;
  suite.focus();
  majProgression(racine, lecon, exercice);
}

function toucher(racine, choix) {
  const lecon = leconCourante();
  const exercice = lecon?.exercices[index];
  if (!exercice || exercice.repondu) return;
  for (const b of boutonsDeReponse(racine)) b.disabled = true;
  noterReponse(lecon, index, choix);
  exercice.choisi = choix;
  enregistrer(lecon.etat);
  corriger(racine, lecon, exercice);
}

function afficherExercice(racine, lecon) {
  const exercice = lecon.exercices[index];
  const consigne = CONSIGNES[exercice.type];
  if (!consigne) throw new Error(`L'exercice ${exercice.type} demande le son, indisponible dans ce lot`);

  racine.querySelector('#lecon-rattrapage').hidden = !exercice.rattrapage;
  racine.querySelector('#lecon-consigne').textContent = consigne;
  racine.querySelector('#lecon-question').textContent = exercice.question;
  racine.querySelector('#lecon-hangeul').textContent = exercice.type === 'V1' ? hangeulDe(exercice.id) : '';
  racine.querySelector('#lecon-choix').replaceChildren(...exercice.choix.map((texte, i) => {
    const b = creer('button', 'reponse', texte);
    b.type = 'button';
    b.addEventListener('click', () => toucher(racine, i));
    return b;
  }));
  racine.querySelector('#lecon-retour').textContent = '';
  racine.querySelector('#lecon-continuer').hidden = true;
  majProgression(racine, lecon, exercice);
  if (exercice.repondu) corriger(racine, lecon, exercice); // retour sur l'écran par la flèche arrière
}

function continuer(racine) {
  const lecon = leconCourante();
  if (!lecon || !lecon.exercices[index].repondu) return; // double toucher sur « Continuer »
  if (index + 1 < lecon.exercices.length) {
    index += 1;
    afficherExercice(racine, lecon);
    return;
  }
  terminerLecon();
  location.hash = '#fin';
}

function brancher(racine) {
  racine.querySelector('#lecon-continuer').addEventListener('click', () => continuer(racine));
  racine.querySelector('#lecon-quitter').addEventListener('click', () => {
    quitterLecon();
    location.hash = '#accueil';
  });
}

/** À appeler à chaque affichage de #lecon, avec une leçon en cours (le routeur le garantit). */
export function afficherLecon(racine) {
  if (racineBranchee !== racine) {
    racineBranchee = racine;
    brancher(racine);
  }
  const lecon = leconCourante();
  if (lecon !== affichee) {
    affichee = lecon;
    index = 0;
  }
  afficherExercice(racine, lecon);
}
