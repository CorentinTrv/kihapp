// Kihapp, ecrans/session.js (lot K6) : la glu partagée des écrans.
// Elle tient ce que les modules purs de moteur/ ne peuvent pas tenir : le magasin
// du téléphone, le jour d'aujourd'hui, l'état courant de l'élève et la leçon en
// cours. Aucun écran ne parle à localStorage ni à l'horloge sans passer ici.
//
// Pour les bancs : window.__kihappMaintenant (une date ISO) remplace l'horloge,
// window.__kihappGraine (un entier) remplace la graine tirée au hasard.

import { creerAlea } from '../moteur/aleatoire.js';
import { jourLocal } from '../moteur/dates.js';
import { cacher, compteurNeuf, montrer, tempsAuPremierPlan } from '../moteur/duree.js';
import { guidesVus, marquerGuideVu } from '../moteur/guides_vus.js';
import { composerLecon } from '../moteur/lecon_composer.js';
import { pointsFaibles } from '../moteur/parcours_logique.js';
import { marquerJour } from '../moteur/serie.js';
import { ecrire, lire } from '../moteur/stockage.js';
import { ELEMENTS } from '../contenu/elements.js';

/** Faux jusqu'au lot K8 (le son) : aucune leçon ne propose d'exercice d'écoute. */
const AUDIO_DISPONIBLE = false;

const MESSAGE_NON_ENREGISTRABLE = 'Ta progression ne peut pas être enregistrée sur ce téléphone.';

/** Le jour local d'aujourd'hui, 'AAAA-MM-JJ'. Relu à chaque appel : l'app peut rester ouverte la nuit. */
export function aujourdhui() {
  const simule = window.__kihappMaintenant;
  return jourLocal(simule ? new Date(simule) : new Date());
}

// Un localStorage inaccessible (accès refusé par le navigateur) donne un magasin en mémoire :
// l'app tourne, la progression ne survit pas à la fermeture.
function ouvrirMagasin() {
  try {
    return window.localStorage ?? magasinEnMemoire();
  } catch {
    return magasinEnMemoire();
  }
}

function magasinEnMemoire() {
  const valeurs = new Map();
  return {
    getItem: (cle) => (valeurs.has(cle) ? valeurs.get(cle) : null),
    setItem: (cle, valeur) => { valeurs.set(cle, String(valeur)); },
  };
}

const magasin = ouvrirMagasin();
const lu = lire(magasin, aujourdhui());
let etat = lu.etat;
let enregistrable = true;
let courante = null; // { lecon, avant, debut, pauses } : la leçon en cours, l'état d'avant la première réponse, l'heure de départ (Date.now()), les pauses de l'app cachée (moteur/duree.js)
let derniere = null; // { lecon, avant, duree, jour } : la leçon qui vient de finir, pour l'écran de fin : son temps au premier plan (ms) et le jour qu'elle a fait compter ; le temps ne va jamais dans le stockage

// Une seule écoute pour toute la vie de la page (pas une par leçon), posée au premier départ de leçon : l'app cachée
// (écran verrouillé, autre app) n'est pas du temps passé sur la leçon. Sans leçon en cours, elle ne fait rien.
// Posée à ce moment et non à l'import : ce module se charge aussi dans les tests Deno, qui n'ont pas de document.
let ecouteVisibilite = false;
function ecouterLaVisibilite() {
  if (ecouteVisibilite) return;
  ecouteVisibilite = true;
  document.addEventListener('visibilitychange', () => {
    if (courante === null) return;
    const t = Date.now();
    courante.pauses = document.visibilityState === 'hidden' ? cacher(courante.pauses, t) : montrer(courante.pauses, t);
  });
}

/** L'état courant de l'élève. */
export const etatCourant = () => etat;

/**
 * Adopte cet état comme état courant et l'écrit tout de suite (un iPhone peut
 * tuer la PWA sans prévenir). En lecture seule (un schéma plus récent que le
 * code), l'état vit en mémoire et rien n'est écrit.
 */
export function enregistrer(nouvelEtat) {
  etat = nouvelEtat;
  if (lu.lectureSeule) return;
  enregistrable = ecrire(magasin, nouvelEtat).enregistrable;
}

/** Les messages à montrer en bandeau : lecture, puis écriture refusée. */
function messagesSession() {
  return [lu.message, enregistrable ? null : MESSAGE_NON_ENREGISTRABLE].filter(Boolean);
}

/** Un élément DOM avec sa classe et son texte : le petit outil que les trois écrans se partagent. */
export function creer(balise, classe, texte = '') {
  const e = document.createElement(balise);
  if (classe) e.className = classe;
  e.textContent = texte;
  return e;
}

/** Remplit le conteneur avec un bandeau par message de la session (et le vide s'il n'y en a pas). */
export function afficherBandeaux(conteneur) {
  conteneur.replaceChildren(...messagesSession().map((m) => {
    const bandeau = creer('p', 'bandeau', m);
    bandeau.setAttribute('role', 'status');
    return bandeau;
  }));
}

// Sans graine imposée, un entier tiré une fois par leçon.
const tirerGraine = () => Math.floor(Math.random() * 2 ** 32);

/**
 * Compose et range la leçon en cours. mode : 'unite' (avec `unite`), 'revision'
 * ou 'points-faibles'.
 */
export function demarrerLecon(mode, unite = null) {
  const elements = mode === 'points-faibles' ? pointsFaibles(etat, ELEMENTS) : ELEMENTS;
  const lecon = composerLecon({
    elements,
    etat,
    aujourdhui: aujourdhui(),
    alea: creerAlea(window.__kihappGraine ?? tirerGraine()),
    mode,
    unite,
    audioDisponible: AUDIO_DISPONIBLE,
  });
  ecouterLaVisibilite();
  courante = { lecon, avant: etat, debut: Date.now(), pauses: compteurNeuf() };
}

/** La leçon en cours, ou null. */
export const leconCourante = () => courante?.lecon ?? null;

/**
 * Vrai si cet élément n'existait pas dans l'état d'avant la leçon en cours (c'est ce qui fait
 * « Nouveau » sur son premier exercice). Faux sans leçon en cours. Une lecture : rien n'est écrit.
 */
export const estNouveauDansLaLecon = (id) => courante !== null && !Object.hasOwn(courante.avant.elements, id);

/** Laisse la leçon : ce qui a été répondu est déjà enregistré. */
export function quitterLecon() {
  courante = null;
}

/**
 * Fin de la leçon : le jour compte, puis la leçon passe à l'écran de fin. Le jour est calculé UNE fois et gardé :
 * l'écran de fin, rouvert après minuit, parle toujours du jour que la leçon a fait compter.
 */
export function terminerLecon() {
  const { lecon, avant, debut, pauses } = courante;
  const jour = aujourdhui();
  derniere = { lecon, avant, duree: tempsAuPremierPlan(debut, Date.now(), pauses), jour };
  courante = null;
  enregistrer(marquerJour(lecon.etat, jour, 'l'));
}

/** La leçon qui vient de finir : { lecon, avant, duree, jour }, ou null. */
export const leconTerminee = () => derniere;

/** Le guide de cette unité a-t-il déjà été lu ? Mémoire à part de l'état sauvegardé (moteur/guides_vus.js). */
export const guideDejaVu = (unite) => guidesVus(magasin).has(unite);

/** Note ce guide comme lu (« C'est parti » touché). Ne lève jamais. */
export const noterGuideVu = (unite) => marquerGuideVu(magasin, unite);
