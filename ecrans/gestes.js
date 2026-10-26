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

/** Un cadre qui rejoue le geste en boucle ; rend la fonction qui coupe la boucle. */
export function cadreEnBoucle(id) {
  const m = mouvementDe(id);
  const fin = m.t1 - AVANT_T1;
  const cadre = creer('span', 'geste-image geste-cadre');
  cadre.setAttribute('role', 'img');
  cadre.setAttribute('aria-label', 'Le geste à reconnaître, en boucle');
  cadre.innerHTML = svgA(m.t0);
  let rafId = null;
  let depart = null;
  let dernier = m.t0;
  const arreter = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  };
  const tick = (ts) => {
    rafId = null;
    // Le cadre a quitté la page, ou un écran masqué le contient : la boucle s'éteint.
    if (!cadre.isConnected || cadre.closest('[hidden]')) return;
    depart ??= ts;
    const t = instantDeLaBoucle((ts - depart) / 1000, m.t0, fin);
    if (t !== dernier) {
      cadre.innerHTML = svgA(t);
      dernier = t;
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return { cadre, arreter };
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

/** Un bouton-texte : le nom FFTDA en gras, le français dessous en plus petit. */
export function boutonNom(id) {
  const nom = nomDuMouvement(id);
  const b = creer('button', 'reponse');
  b.type = 'button';
  b.dataset.geste = id;
  b.append(creer('b', 'geste-fftda', nom.fftda), ' ', creer('span', 'geste-fr', nom.fr));
  return b;
}

/** Le nom d'un geste affiché comme question : fftda en grand, français dessous. */
export function blocNom(id) {
  const nom = nomDuMouvement(id);
  const bloc = creer('div');
  bloc.append(creer('p', 'geste-fftda-grand', nom.fftda), creer('p', 'geste-fr', nom.fr));
  return bloc;
}
