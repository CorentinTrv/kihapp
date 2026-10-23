// Kihapp, moteur/exercices.js (lot K4)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge, ni Math.random. Le hasard
// vient de l'appelant (moteur/aleatoire.js, à graine), le jour aussi.
//
// Quatre types, tous en choix parmi 4, aucune saisie :
//   V1 coréen vers français   (graphie FFTDA affichée, audio si disponible)
//   V2 français vers coréen   (choisir la graphie FFTDA)
//   V3 écoute vers graphie    (audio seul)
//   V4 écoute vers français   (audio seul)
// Les types G (gestes) et V5 (image) n'existent pas encore : jamais rendus.

import { melanger } from "./aleatoire.js";
import { repondre } from "./leitner.js";
import { UNITES } from "../contenu/parcours.js";

// Ce que montre la question, ce que proposent les choix, selon le type.
const FORMES = {
  V1: { question: "fftda", choix: "fr" },
  V2: { question: "fr", choix: "fftda" },
  V3: { question: null, choix: "fftda" },
  V4: { question: null, choix: "fr" },
};

const AVEC_AUDIO = new Set(["V3", "V4"]);

// Quand le type voulu n'est pas permis : le plus accessible d'abord (V2 avant V1,
// parce qu'un élève de boîte 3 sans audio n'a pas à retomber sur le plus facile).
const REPLI = ["V2", "V1", "V4", "V3"];

const cle = (texte) => texte.trim().toLowerCase();

/** Pile ou face sans hasard : stable pour un élément et un nombre de vues, change à chaque vue. */
function pileOuFace(element, etatElement) {
  let somme = etatElement?.v ?? 0;
  for (const c of element.id) somme += c.charCodeAt(0);
  return somme % 2;
}

/**
 * Le type d'exercice d'un élément, selon sa boîte : nouveau ou boîte 1 V1 ;
 * boîte 2 V2 ou V4 ; boîte 3 et plus V3 ou V4. Sans audio, V3 et V4 sont
 * indisponibles et le suivant de la liste prend la place. `exclus` : types déjà
 * donnés à cet élément dans la leçon, jamais redonnés. Rend null s'il ne reste rien.
 */
export function typePour(element, etatElement, audioDisponible, exclus = []) {
  const boite = etatElement?.b ?? 1;
  const voulus = boite <= 1 ? ["V1"] : boite === 2 ? ["V2", "V4"] : ["V3", "V4"];
  const premier = voulus[voulus.length === 1 ? 0 : pileOuFace(element, etatElement)];
  const ordre = [premier, ...voulus, ...REPLI];
  return ordre.find((t) => (audioDisponible || !AVEC_AUDIO.has(t)) && !exclus.includes(t)) ?? null;
}

/** Trois distracteurs : même catégorie, puis même unité, puis même ceinture. */
function choisirDistracteurs(element, elements, alea) {
  const ceinture = (e) => UNITES.find((u) => u.id === e.unite)?.ceinture ?? null;
  const memeCeinture = (e) => ceinture(e) !== null && ceinture(e) === ceinture(element);
  const rangs = [
    (e) => e.categorie === element.categorie,
    (e) => e.unite === element.unite,
    memeCeinture,
  ];
  const candidats = elements.filter((e) => e.exercice && e.id !== element.id);
  const vus = new Set([cle(element.fftda), cle(element.fr)]);
  const pris = [];
  for (const rang of rangs) {
    for (const e of melanger(candidats.filter(rang), alea)) {
      if (pris.length === 3) break;
      if (pris.includes(e) || vus.has(cle(e.fftda)) || vus.has(cle(e.fr))) continue;
      pris.push(e);
      vus.add(cle(e.fftda));
      vus.add(cle(e.fr));
    }
  }
  if (pris.length < 3) {
    throw new Error(`Pas assez de distracteurs pour « ${element.id} » : ${pris.length} sur 3`);
  }
  return pris;
}

/**
 * Fabrique un exercice : { id, type, question, choix: [4 textes], bonne: index, audio }.
 * `audio` dit si l'écran doit jouer le son (V1 : seulement si disponible).
 */
export function genererExercice(element, type, { elements, alea, audioDisponible = false }) {
  const forme = FORMES[type];
  if (!forme) throw new Error(`Type d'exercice inconnu ou pas encore disponible : ${type}`);
  if (!element.exercice) throw new Error(`« ${element.id} » n'est jamais interrogé (exercice faux)`);
  if (AVEC_AUDIO.has(type) && !audioDisponible) {
    throw new Error(`${type} demande l'audio, indisponible pour « ${element.id} »`);
  }
  const tous = melanger([element, ...choisirDistracteurs(element, elements, alea)], alea);
  return {
    id: element.id,
    type,
    question: forme.question === null ? null : element[forme.question],
    choix: tous.map((e) => e[forme.choix]),
    bonne: tous.indexOf(element),
    audio: type === "V1" ? audioDisponible : AVEC_AUDIO.has(type),
  };
}

/**
 * Note la réponse `choix` (index) à l'exercice `index` de la leçon. Rend
 * { juste, bonne } et marque l'exercice comme répondu (un second toucher ne
 * compte pas). La PREMIÈRE réponse de la leçon sur un élément décide de sa
 * boîte, une seule fois. Si elle est fausse, l'élément revient une fois en fin
 * de leçon (rattrapage: true), et cette seconde réponse ne bouge plus la boîte.
 * La leçon est modifiée (exercices, etat, decides) ; l'état de l'appelant, non.
 */
export function noterReponse(lecon, index, choix) {
  const exercice = lecon.exercices[index];
  if (!exercice) throw new Error(`Pas d'exercice ${index} dans cette leçon`);
  if (!Number.isInteger(choix) || choix < 0 || choix >= exercice.choix.length) {
    throw new Error(`Choix ${choix} hors limites pour l'exercice ${index}`);
  }
  if (exercice.repondu) return { juste: exercice.juste, bonne: exercice.bonne };

  const juste = choix === exercice.bonne;
  exercice.repondu = true;
  exercice.juste = juste;
  if (!lecon.decides[exercice.id]) {
    lecon.decides[exercice.id] = true;
    lecon.etat = repondre(lecon.etat, exercice.id, juste, lecon.aujourdhui);
    if (!juste) lecon.exercices.push(lecon.rattrapages[exercice.id]);
  }
  return { juste, bonne: exercice.bonne };
}
