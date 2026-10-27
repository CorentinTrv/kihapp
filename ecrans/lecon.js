// Kihapp, ecrans/lecon.js (lots K6, K19b, R4 puis R5) : l'écran #lecon, sans son.
// Une question à la fois : quatre réponses, correction immédiate dans un bandeau collé en bas
// (un titre, la réponse en entier, « Continuer » ou « Compris »).
// Depuis K19b l'écran montre aussi les exercices de gestes (G1 à G4, voir gestes.js) :
// la boucle animée de G1 (avec son bouton Rejouer), les images fixes de G4 et G2, la
// remise en ordre de G3 (quatre places en colonne, une tuile avec son nom par geste).
//
// L'ordre est ce qui compte (un banc Chromium le garde) :
//   1. au premier toucher, TOUS les boutons se désactivent (un double toucher ne
//      compte qu'une fois : noterReponse refuse aussi un second appel) ;
//   2. noterReponse met la leçon à jour ;
//   3. enregistrer(...) tout de suite : un iPhone peut tuer la PWA sans prévenir ;
//   4. la correction s'affiche (le bandeau, Ti, la réserve de place en bas).
// Après le dernier exercice (les rattrapages sont ajoutés en fin de leçon par
// noterReponse, donc le total peut grandir), le jour est marqué et l'écran de
// fin s'ouvre.
// Un G3 se joue en deux temps : les tuiles se rangent une à une dans les places
// numérotées, puis « Vérifier » envoie la suite touchée à noterReponse, avec le
// même ordre en quatre temps.

import { VOCABULAIRE } from '../contenu/vocabulaire.js';
import { noterReponse } from '../moteur/exercices.js';
import { blocNom, boutonImage, boutonNom, boutonOrdre, cadreEnBoucle, imageDuGeste, nomDuMouvement } from './gestes.js';
import { svgTi } from './ti.js';
import { creer, enregistrer, estNouveauDansLaLecon, leconCourante, quitterLecon, terminerLecon } from './session.js';

// Les exercices d'écoute (V3, V4) n'existent pas sans son : ils n'ont pas de consigne ici.
const CONSIGNES = {
  V1: 'Que veut dire ce mot ?',
  V2: 'Comment dit-on en coréen ?',
  G1: 'Quel est ce geste ?',
  G4: 'Quelle image montre ce geste ?',
  G2: 'Après ce geste, lequel ?',
  G3: "Remets ces gestes dans l'ordre",
};

let racineBranchee = null;
let affichee = null; // la leçon dont on montre un exercice
let index = 0; // l'exercice montré
let arretBoucle = null; // coupe la boucle animée de l'exercice montré (G1)
let imagesOrdre = []; // G3 : une tuile par choix, dans l'ordre de exercice.choix
let rangees = []; // G3 : les index de exercice.choix rangés dans la ligne, dans l'ordre touché

const TAILLE_TI = 72;

const hangeulDe = (id) => VOCABULAIRE.find((e) => e.id === id).hangeul;
const estGeste = (exercice) => exercice.type.startsWith('G');
// Les réponses à indexer par exercice.choix (hors G3, dont les images bougent entre la ligne et le bas).
const boutonsDeReponse = (racine) => [...racine.querySelectorAll('#lecon-choix button')];
// « Rejouer » n'est pas une réponse : il reste actif pendant la correction (on peut revoir le geste).
const tousLesBoutons = (racine) => racine.querySelectorAll('#lecon-geste button:not(.geste-rejouer), #lecon-choix button, #lecon-verifier');

function arreterBoucle() {
  arretBoucle?.();
  arretBoucle = null;
}

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
function corrigerChoix(racine, exercice) {
  const boutons = boutonsDeReponse(racine);
  boutons[exercice.bonne].classList.add('juste');
  if (!exercice.juste) boutons[exercice.choisi].classList.add('faux');
}

// G3 : chaque image est verte si elle est à la place qu'elle doit avoir (au sens des
// signatures, comme noterReponse), rouge sinon.
function corrigerOrdre(exercice) {
  const attendu = exercice.bonne.map((i) => exercice.signatures[i]);
  exercice.choisi.forEach((i, rang) => {
    imagesOrdre[i].classList.add(exercice.signatures[i] === attendu[rang] ? 'juste' : 'faux');
  });
}

// La réponse en entier, sous le titre du bandeau. Mots : « Kyongnye : Saluez » si juste, « Bonne réponse : Saluez »
// sinon. Gestes : « Ale Maki, gauche : Blocage bas, bras gauche » si juste, « Bonne réponse : Ale Maki, gauche
// (Blocage bas, bras gauche) » sinon ; G3 : le bon ordre, « 1 Ale Maki, gauche, 2 ... », précédé de « Bon ordre : » si faux.
function detailDe(exercice) {
  if (exercice.type === 'G3') {
    const ordre = exercice.bonne.map((i, rang) => `${rang + 1} ${nomDuMouvement(exercice.choix[i]).fftda}`).join(', ');
    return exercice.juste ? ordre : `Bon ordre : ${ordre}`;
  }
  if (estGeste(exercice)) {
    const { fftda, fr } = nomDuMouvement(exercice.choix[exercice.bonne]);
    return exercice.juste ? `${fftda} : ${fr}` : `Bonne réponse : ${fftda} (${fr})`;
  }
  const bonne = exercice.choix[exercice.bonne];
  return exercice.juste ? `${exercice.question} : ${bonne}` : `Bonne réponse : ${bonne}`;
}

// Tant que le bandeau (collé en bas de l'écran) est visible, la page garde en bas sa hauteur en marge :
// la dernière tuile se défile jusqu'au-dessus de lui. Reprise à chaque changement de sa taille (écran
// plus étroit, texte plus long), car sa hauteur dépend du retour à la ligne.
function reserverLaPlace(racine) {
  const bandeau = racine.querySelector('#lecon-correction');
  racine.style.paddingBottom = bandeau.hidden ? '' : `calc(${bandeau.offsetHeight}px + 16px)`;
}

function corriger(racine, lecon, exercice) {
  for (const b of tousLesBoutons(racine)) b.disabled = true;
  racine.querySelector('#lecon-verifier').hidden = true;
  if (exercice.type === 'G3') corrigerOrdre(exercice);
  else corrigerChoix(racine, exercice);
  const bandeau = racine.querySelector('#lecon-correction');
  bandeau.classList.add(exercice.juste ? 'juste' : 'faux');
  racine.querySelector('#lecon-retour').textContent = exercice.juste ? 'Bien joué !' : 'Pas tout à fait';
  racine.querySelector('#lecon-retour-detail').textContent = detailDe(exercice);
  if (!estGeste(exercice)) racine.querySelector('#lecon-ti').innerHTML = svgTi(exercice.juste ? 'reussite' : 'erreur', { taille: TAILLE_TI });
  const suite = racine.querySelector('#lecon-continuer');
  suite.textContent = exercice.juste ? 'Continuer' : 'Compris';
  bandeau.hidden = false;
  suite.hidden = false; // les bancs lisent aussi l'état du bouton lui-même
  reserverLaPlace(racine);
  suite.focus();
  majProgression(racine, lecon, exercice);
}

function toucher(racine, choix) {
  const lecon = leconCourante();
  const exercice = lecon?.exercices[index];
  if (!exercice || exercice.repondu) return;
  for (const b of tousLesBoutons(racine)) b.disabled = true;
  noterReponse(lecon, index, choix);
  exercice.choisi = choix;
  enregistrer(lecon.etat);
  corriger(racine, lecon, exercice);
}

// G3 : les quatre places numérotées en colonne, puis la réserve en grille 2 x 2. Chaque tuile a sa place dans la
// réserve et la garde : rangée, elle laisse sa place vide (des pointillés), et revenue, elle la retrouve.
function dessinerOrdre(racine) {
  const ligne = creer('ol', 'geste-rang');
  ligne.setAttribute('aria-label', 'Ton ordre');
  imagesOrdre.forEach((_, place) => {
    const li = creer('li', 'geste-place');
    const emplacement = creer('div', 'geste-case');
    if (rangees[place] !== undefined) emplacement.append(imagesOrdre[rangees[place]]);
    li.append(creer('span', 'geste-numero', String(place + 1)), emplacement);
    ligne.append(li);
  });
  racine.querySelector('#lecon-geste').replaceChildren(ligne);
  racine.querySelector('#lecon-choix').replaceChildren(...imagesOrdre.map((tuile, i) => {
    const place = creer('div', 'geste-case');
    if (!rangees.includes(i)) place.append(tuile);
    return place;
  }));
  racine.querySelector('#lecon-verifier').disabled = rangees.length < imagesOrdre.length;
}

// Toucher une tuile la range ; toucher une tuile rangée la remet dans la réserve (tant que la réponse n'est pas vérifiée).
function deplacerImage(racine, i) {
  const exercice = leconCourante()?.exercices[index];
  if (!exercice || exercice.repondu) return;
  rangees = rangees.includes(i) ? rangees.filter((x) => x !== i) : [...rangees, i];
  dessinerOrdre(racine);
  imagesOrdre[i].focus(); // la tuile a changé de place dans la page : le clavier ne la perd pas
}

function brancherChoix(racine, boutons) {
  boutons.forEach((b, i) => b.addEventListener('click', () => toucher(racine, i)));
  return boutons;
}

// Ce que montre la question d'un exercice de geste, et les choix qui vont avec.
function afficherGeste(racine, exercice) {
  const zone = racine.querySelector('#lecon-geste');
  const choix = racine.querySelector('#lecon-choix');
  zone.hidden = false;
  if (exercice.question !== null) zone.dataset.geste = exercice.question; // l'id du geste interrogé : le banc Chromium s'en sert
  if (exercice.type === 'G1') {
    const boucle = cadreEnBoucle(exercice.question);
    arretBoucle = boucle.arreter;
    zone.replaceChildren(boucle.tapis);
    choix.replaceChildren(...brancherChoix(racine, exercice.choix.map(boutonNom)));
    return;
  }
  const images = (ids) => brancherChoix(racine, ids.map((id, i) => boutonImage(id, i + 1)));
  choix.className = 'choix choix-images';
  if (exercice.type === 'G4') {
    zone.replaceChildren(blocNom(exercice.question));
    choix.replaceChildren(...images(exercice.choix));
  } else if (exercice.type === 'G2') {
    const image = imageDuGeste(exercice.question);
    image.classList.add('geste-cadre');
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', 'Le geste');
    zone.replaceChildren(image, blocNom(exercice.question));
    choix.replaceChildren(...images(exercice.choix));
  } else {
    afficherOrdre(racine, exercice);
  }
}

function afficherOrdre(racine, exercice) {
  rangees = exercice.repondu ? [...exercice.choisi] : [];
  imagesOrdre = exercice.choix.map((id, i) => {
    const b = boutonOrdre(id);
    b.addEventListener('click', () => deplacerImage(racine, i));
    return b;
  });
  racine.querySelector('#lecon-choix').className = 'choix choix-ordre';
  racine.querySelector('#lecon-verifier').hidden = false;
  dessinerOrdre(racine);
}

function afficherMot(racine, exercice) {
  racine.querySelector('#lecon-question').textContent = exercice.question;
  racine.querySelector('#lecon-hangeul').textContent = exercice.type === 'V1' ? hangeulDe(exercice.id) : '';
  racine.querySelector('#lecon-choix').replaceChildren(...brancherChoix(racine, exercice.choix.map((texte) => {
    const b = creer('button', 'reponse reponse-mot', texte);
    b.type = 'button';
    return b;
  })));
}

function afficherExercice(racine, lecon) {
  arreterBoucle(); // une seule boucle à la fois, et aucune pour un exercice de mots
  const exercice = lecon.exercices[index];
  const consigne = CONSIGNES[exercice.type];
  if (!consigne) throw new Error(`L'exercice ${exercice.type} demande le son, indisponible dans ce lot`);

  racine.querySelector('#lecon-rattrapage').hidden = !exercice.rattrapage;
  // « Nouveau » : le premier exercice d'un élément absent de l'état d'avant la leçon. Un rattrapage ne l'est
  // jamais : il vient après l'exercice raté du même élément, donc après sa première occurrence.
  const premier = lecon.exercices.findIndex((e) => e.id === exercice.id) === index;
  racine.querySelector('#lecon-nouveau').hidden = !premier || !estNouveauDansLaLecon(exercice.id);
  racine.querySelector('#lecon-consigne').textContent = consigne;
  // Un exercice de geste n'a ni texte de question ni hangeul ni Ti : la zone des gestes les remplace.
  const geste = estGeste(exercice);
  racine.querySelector('#lecon-mot').hidden = geste;
  racine.querySelector('#lecon-ti').innerHTML = geste ? '' : svgTi('attente', { taille: TAILLE_TI });
  racine.querySelector('#lecon-question').hidden = geste;
  racine.querySelector('#lecon-hangeul').hidden = geste;
  racine.querySelector('#lecon-geste').hidden = !geste;
  racine.querySelector('#lecon-geste').replaceChildren();
  delete racine.querySelector('#lecon-geste').dataset.geste;
  racine.querySelector('#lecon-choix').className = 'choix';
  racine.querySelector('#lecon-verifier').hidden = true;
  if (geste) afficherGeste(racine, exercice);
  else afficherMot(racine, exercice);
  const bandeau = racine.querySelector('#lecon-correction');
  bandeau.hidden = true;
  bandeau.classList.remove('juste', 'faux');
  racine.querySelector('#lecon-retour').textContent = '';
  racine.querySelector('#lecon-retour-detail').textContent = '';
  racine.querySelector('#lecon-continuer').hidden = true;
  reserverLaPlace(racine);
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
  arreterBoucle();
  terminerLecon();
  location.hash = '#fin';
}

function brancher(racine) {
  // Boîte de BORDURE : la réserve est l'offsetHeight du bandeau, padding compris. La boîte de contenu (le défaut) ne
  // bouge pas quand le padding change (zone sûre de l'iPhone à la rotation), le rappel ne partirait pas.
  new ResizeObserver(() => reserverLaPlace(racine)).observe(racine.querySelector('#lecon-correction'), { box: 'border-box' });
  racine.querySelector('#lecon-continuer').addEventListener('click', () => continuer(racine));
  racine.querySelector('#lecon-verifier').addEventListener('click', () => toucher(racine, [...rangees]));
  racine.querySelector('#lecon-quitter').addEventListener('click', () => {
    arreterBoucle();
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
