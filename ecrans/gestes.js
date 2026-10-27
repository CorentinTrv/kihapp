// Kihapp, ecrans/gestes.js (lot K19b) : montrer un geste du poomsae dans une leçon.
// Un geste est un mouvement du Taegueug Il Jang (id « t1-05 »). Le bonhomme est
// celui de l'écran du poomsae : même chronologie, même rendu, même caméra miroir
// (animation/chronologie.js et animation/rendu.js), jamais redessiné ici.
//
// - une IMAGE FIXE est la pose à la fin du mouvement (juste avant son instant t1,
//   quand le bonhomme tient la pose) ;
// - une BOUCLE ANIMÉE rejoue le mouvement de son début à cette même pose, fait une
//   courte pause, et recommence. Elle s'arrête d'elle-même dès que son cadre quitte
//   la page ou qu'un écran masqué le contient : aucune boucle ne survit à l'exercice.
//   Un bouton « Rejouer » la relance depuis le début, sans jamais en lancer une seconde.
//   Avec « Réduire les animations », il n'y a pas de boucle : le cadre montre l'image
//   fixe de la pose finale, et « Rejouer » joue le mouvement une seule fois.
//
// Les aides DOM de la fin (boutons, blocs de nom) sont assemblées par lecon.js.

import { construireSegments, frameAt } from '../animation/chronologie.js';
import { cameraDe, renderScene } from '../animation/rendu.js';
import { ELEMENTS, nomDuGeste } from '../contenu/elements.js';
import { TAEGEUK_IL_JANG } from '../contenu/taegeuk_il_jang.js';
import { creer } from './session.js';

const chrono = construireSegments(TAEGEUK_IL_JANG.mouvements, TAEGEUK_IL_JANG.depart, TAEGEUK_IL_JANG.arrivee);
const camera = cameraDe('miroir', true);

// Le cadrage des images fixes de l'écran du poomsae (index.html : viewBox des .still).
const CADRAGE = '130 50 340 330';
// Le bonhomme tient la pose tout le « Tiens » : un centième avant t1 est la pose finale.
const AVANT_T1 = 0.01;
// Mêmes vitesse et temps que l'écran du poomsae par défaut (×½), puis une pause d'une
// demi-seconde sur la pose finale avant de recommencer.
const VITESSE = 0.5;
const PAUSE = 0.5;

const elementDe = (id) => {
  const e = ELEMENTS.find((x) => x.id === id && x.categorie === 'mouvement');
  if (e === undefined) throw new Error(`gestes : « ${id} » n'est pas un mouvement`);
  return e;
};

const mouvementDe = (id) => {
  const m = chrono.mouvements.find((x) => x.id === id);
  if (m === undefined) throw new Error(`gestes : « ${id} » est absent de la chronologie`);
  return m;
};

/** { fftda, fr } du geste d'id `id`. */
export const nomDuMouvement = (id) => nomDuGeste(elementDe(id));

/**
 * Les morceaux d'un nom FFTDA, à poser dans un élément : le mot de côté final (« gauche » ou « droite »,
 * toujours après la dernière virgule) est enveloppé dans un span coloré, le reste est du texte. Le texte
 * de l'élément reste exactement le nom : seule la couleur change.
 */
export function nomColore(fftda) {
  const m = /^(.*, )(gauche|droite)$/.exec(fftda);
  return m === null ? [fftda] : [m[1], creer('span', `cote-${m[2]}`, m[2])];
}

/** Le bonhomme à l'instant t, en SVG. Sans flèches, sans fantôme, sans libellés : on ne donne pas la réponse. */
function svgA(t) {
  const scene = renderScene(frameAt(chrono, t), camera, { trails: 'none', ghost: false, labels: false, chrono });
  return `<svg viewBox="${CADRAGE}" aria-hidden="true" focusable="false">${scene}</svg>`;
}

/** Le temps (secondes de la chronologie) où la boucle en est après `ecoule` secondes d'horloge. */
function instantDeLaBoucle(ecoule, debut, fin) {
  const duree = fin - debut;
  const cycle = duree / VITESSE + PAUSE;
  return debut + Math.min(duree, (ecoule % cycle) * VITESSE);
}

/** Un cadre carré avec la pose finale du geste. */
export function imageDuGeste(id) {
  const m = mouvementDe(id);
  const cadre = creer('span', 'geste-image');
  cadre.innerHTML = svgA(m.t1 - AVANT_T1);
  return cadre;
}

// Le bouton rond posé dans le coin du cadre : une flèche qui tourne (tracé de type Feather « rotate-cw »).
const ICONE_REJOUER = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23 4v6h-6M20.49 15a9 9 0 1 1-2.12-9.36L23 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function boutonRejouer() {
  const b = creer('button', 'geste-rejouer');
  b.type = 'button';
  b.setAttribute('aria-label', 'Rejouer le geste');
  b.innerHTML = ICONE_REJOUER;
  return b;
}

/**
 * Le geste du cadre de G1 : un tapis qui porte le cadre animé et son bouton « Rejouer ».
 * Rend { tapis, arreter } : `tapis` est à poser dans la page, `arreter` coupe la boucle.
 */
export function cadreEnBoucle(id) {
  const m = mouvementDe(id);
  const fin = m.t1 - AVANT_T1;
  const duree = fin - m.t0;
  // Lu une fois, à la création du cadre : « Réduire les animations » ne change pas en pleine question.
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cadre = creer('span', 'geste-image geste-cadre');
  cadre.setAttribute('role', 'img');
  cadre.setAttribute('aria-label', reduit ? 'Le geste à reconnaître' : 'Le geste à reconnaître, en boucle');
  const bouton = boutonRejouer();
  const tapis = creer('div', 'geste-tapis');
  tapis.append(cadre, bouton);
  let rafId = null;
  let depart = null;
  let dernier = reduit ? fin : m.t0;
  let unePasse = false; // une seule passe, sans pause : le passage de « Rejouer » en mouvement réduit
  cadre.innerHTML = svgA(dernier);
  const arreter = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  };
  const tick = (ts) => {
    rafId = null;
    // Le cadre a quitté la page, ou un écran masqué le contient : la boucle s'éteint.
    if (!cadre.isConnected || cadre.closest('[hidden]')) return;
    depart ??= ts;
    const ecoule = (ts - depart) / 1000;
    const fini = unePasse && ecoule * VITESSE >= duree;
    // La dernière image est exactement la pose finale (pas « début + durée », qui peut s'en écarter d'un rien).
    const t = fini ? fin : unePasse ? m.t0 + ecoule * VITESSE : instantDeLaBoucle(ecoule, m.t0, fin);
    if (t !== dernier) {
      cadre.innerHTML = svgA(t);
      dernier = t;
    }
    if (!fini) rafId = requestAnimationFrame(tick);
  };
  // Relancer coupe d'abord la demande en cours : il n'y a jamais deux boucles.
  bouton.addEventListener('click', () => {
    arreter();
    depart = null;
    unePasse = reduit;
    rafId = requestAnimationFrame(tick);
  });
  if (!reduit) rafId = requestAnimationFrame(tick);
  return { tapis, arreter };
}

/** Un bouton-image : la pose finale du geste, sans nom (son nom accessible ne donne pas la réponse). */
export function boutonImage(id, rang) {
  const b = creer('button', 'reponse reponse-image');
  b.type = 'button';
  b.dataset.geste = id;
  b.setAttribute('aria-label', `Image ${rang}`);
  b.append(imageDuGeste(id));
  return b;
}

/** Un bouton-texte : le nom FFTDA en gras (mot de côté coloré), le français dessous en plus petit. */
export function boutonNom(id) {
  const nom = nomDuMouvement(id);
  const b = creer('button', 'reponse reponse-geste');
  b.type = 'button';
  b.dataset.geste = id;
  const fftda = creer('b', 'geste-fftda');
  fftda.append(...nomColore(nom.fftda));
  b.append(fftda, ' ', creer('span', 'geste-fr', nom.fr));
  return b;
}

/** Le nom d'un geste affiché comme question : fftda en grand (mot de côté coloré), français dessous. */
export function blocNom(id) {
  const nom = nomDuMouvement(id);
  const fftda = creer('p', 'geste-fftda-grand');
  fftda.append(...nomColore(nom.fftda));
  const bloc = creer('div');
  bloc.append(fftda, creer('p', 'geste-fr', nom.fr));
  return bloc;
}

/**
 * Une tuile de G3 : la pose finale en petit à gauche, le nom FFTDA à côté (mot de côté coloré).
 * Le nom est écrit, donc c'est aussi son nom accessible (question 5, tranchée le 26/10).
 */
export function boutonOrdre(id) {
  const nom = nomDuMouvement(id);
  const b = creer('button', 'reponse reponse-image reponse-ordre');
  b.type = 'button';
  b.dataset.geste = id;
  b.setAttribute('aria-label', nom.fftda);
  const texte = creer('span', 'geste-nom');
  texte.append(...nomColore(nom.fftda));
  b.append(imageDuGeste(id), texte);
  return b;
}
