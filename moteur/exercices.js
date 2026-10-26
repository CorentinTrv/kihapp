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
// Quatre types de gestes, pour les éléments de catégorie « mouvement » (lot K19a) :
//   G1 animation vers geste   (4 choix, ids de mouvement)
//   G4 nom vers image         (3 choix)
//   G2 geste suivant          (3 choix : le mouvement d'après et deux autres)
//   G3 remise en ordre        (4 gestes consécutifs à remettre dans l'ordre)
// Leurs questions et leurs choix sont des IDS de mouvement, jamais un texte :
// l'écran des gestes décide comment un geste se montre et se nomme.
// Le type V5 (image) n'existe pas encore : jamais rendu.

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
// Même idée pour les gestes : le plus accessible d'abord, sans audio (l'audio ne change rien aux gestes).
const REPLI_GESTES = ["G4", "G1", "G2", "G3"];
const TYPES_GESTES = ["G1", "G2", "G3", "G4"];
// Combien de gestes un exercice met sur l'écran (le mouvement interrogé compris).
const CHOIX_GESTES = { G1: 4, G2: 3, G4: 3 };
const FENETRE_G3 = 4;

const estMouvement = (element) => element.categorie === "mouvement";

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
 * Un mouvement suit son échelle à lui : nouveau ou boîte 1 G1 ; boîte 2 G4 ou G2 ;
 * boîtes 3 et plus G2 ou G3. G2 (le geste suivant) n'existe pas pour le dernier.
 */
export function typePour(element, etatElement, audioDisponible, exclus = []) {
  const boite = etatElement?.b ?? 1;
  if (estMouvement(element)) return typePourGeste(element, boite, etatElement, exclus);
  const voulus = boite <= 1 ? ["V1"] : boite === 2 ? ["V2", "V4"] : ["V3", "V4"];
  const premier = voulus[voulus.length === 1 ? 0 : pileOuFace(element, etatElement)];
  const ordre = [premier, ...voulus, ...REPLI];
  return ordre.find((t) => (audioDisponible || !AVEC_AUDIO.has(t)) && !exclus.includes(t)) ?? null;
}

function typePourGeste(element, boite, etatElement, exclus) {
  const voulus = boite <= 1 ? ["G1"] : boite === 2 ? ["G4", "G2"] : ["G2", "G3"];
  const premier = voulus[voulus.length === 1 ? 0 : pileOuFace(element, etatElement)];
  const ordre = [premier, ...voulus, ...REPLI_GESTES];
  const possible = (t) => !exclus.includes(t) && !(t === "G2" && element.suivant === null);
  return ordre.find(possible) ?? null;
}

/**
 * Trois distracteurs : même catégorie, puis même unité, puis même ceinture.
 * Jamais un mouvement : il n'a ni graphie ni français à proposer.
 */
function choisirDistracteurs(element, elements, alea) {
  const ceinture = (e) => UNITES.find((u) => u.id === e.unite)?.ceinture ?? null;
  const memeCeinture = (e) => ceinture(e) !== null && ceinture(e) === ceinture(element);
  const rangs = [
    (e) => e.categorie === element.categorie,
    (e) => e.unite === element.unite,
    memeCeinture,
  ];
  const candidats = elements.filter((e) => e.exercice && e.id !== element.id && !estMouvement(e));
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

/** Les autres mouvements du même poomsae, dans l'ordre reçu. */
const autresGestes = (element, elements) =>
  elements.filter((e) => estMouvement(e) && e.poomsae === element.poomsae && e.id !== element.id);

/**
 * Jusqu'à `n` gestes tirés au hasard parmi `candidats`, de signatures toutes
 * différentes entre elles et de celles de `deja`. Peut en rendre moins.
 */
function piocherDistincts(candidats, deja, n, alea) {
  const signatures = new Set(deja.map((m) => m.signature));
  const pris = [];
  for (const e of melanger(candidats, alea)) {
    if (pris.length === n) break;
    if (signatures.has(e.signature)) continue;
    pris.push(e);
    signatures.add(e.signature);
  }
  return pris;
}

function pasAssezDeGestes(element, trouves, attendus) {
  return new Error(`Pas assez de gestes distincts pour « ${element.id} » : ${trouves} sur ${attendus}`);
}

/** G1, G4 et G2 : l'id du mouvement en question, des ids de gestes en choix, une place pour la bonne. */
function genererGesteSimple(element, type, elements, alea) {
  const autres = autresGestes(element, elements);
  let juste = element;
  let deja = [element];
  if (type === "G2") {
    juste = autres.find((e) => e.id === element.suivant);
    if (juste === undefined) throw new Error(`Type d'exercice G2 impossible pour « ${element.id} » : pas de geste suivant`);
    deja = [juste];
  }
  const attendus = CHOIX_GESTES[type];
  const distracteurs = piocherDistincts(autres, deja, attendus - 1, alea);
  if (distracteurs.length < attendus - 1) throw pasAssezDeGestes(element, 1 + distracteurs.length, attendus);
  const tous = melanger([juste, ...distracteurs], alea);
  return { id: element.id, type, question: element.id, choix: tous.map((e) => e.id), bonne: tous.indexOf(juste), audio: false };
}

/**
 * G3 : 4 gestes consécutifs à remettre dans l'ordre. La fenêtre commence à
 * l'élément, ou prend les 4 derniers du poomsae s'il en est trop près. L'exercice
 * garde l'id de l'ÉLÉMENT (c'est lui qu'on révise). `bonne` est le tableau des
 * index des choix dans l'ordre du poomsae ; `signatures` dit ce que vaut chaque
 * choix, pour que deux gestes indiscernables échangés ne soient pas une faute.
 */
function genererRemiseEnOrdre(element, elements, alea) {
  const geste = elements.filter((e) => estMouvement(e) && e.poomsae === element.poomsae).sort((a, b) => a.numero - b.numero);
  const rang = geste.findIndex((e) => e.id === element.id);
  if (rang === -1 || geste.length < FENETRE_G3) throw pasAssezDeGestes(element, geste.length, FENETRE_G3);
  const debut = Math.min(rang, geste.length - FENETRE_G3);
  const fenetre = geste.slice(debut, debut + FENETRE_G3);
  const suite = (liste) => liste.map((e) => e.signature).join("\n");

  // Le mélange n'est jamais l'ordre juste : on décale d'un rang tant qu'il l'égale.
  let tous = melanger(fenetre, alea);
  for (let essai = 0; essai < FENETRE_G3 && suite(tous) === suite(fenetre); essai++) {
    tous = [...tous.slice(1), tous[0]];
  }
  if (suite(tous) === suite(fenetre)) {
    throw pasAssezDeGestes(element, new Set(fenetre.map((e) => e.signature)).size, 2);
  }

  return {
    id: element.id,
    type: "G3",
    question: null,
    choix: tous.map((e) => e.id),
    bonne: fenetre.map((e) => tous.indexOf(e)),
    signatures: tous.map((e) => e.signature),
    audio: false,
  };
}

/**
 * Fabrique un exercice : { id, type, question, choix: [4 textes], bonne: index, audio }.
 * `audio` dit si l'écran doit jouer le son (V1 : seulement si disponible).
 * Un type de geste (G1 à G4) ne va qu'à un mouvement, un type V qu'au vocabulaire.
 * Pour un mouvement, question et choix sont des ids de mouvement, `audio` est faux ;
 * G3 rend en plus `signatures` et une `bonne` qui est un tableau.
 */
export function genererExercice(element, type, { elements, alea, audioDisponible = false }) {
  const geste = TYPES_GESTES.includes(type);
  const forme = FORMES[type];
  if (!forme && !geste) throw new Error(`Type d'exercice inconnu ou pas encore disponible : ${type}`);
  if (!element.exercice) throw new Error(`« ${element.id} » n'est jamais interrogé (exercice faux)`);
  if (geste !== estMouvement(element)) {
    throw new Error(`Type d'exercice ${type} impossible pour « ${element.id} »`);
  }
  if (type === "G3") return genererRemiseEnOrdre(element, elements, alea);
  if (geste) return genererGesteSimple(element, type, elements, alea);
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

const indexValide = (i, n) => Number.isInteger(i) && i >= 0 && i < n;

/** Un tableau de n index, tous différents, de 0 à n - 1. */
const estPermutation = (choix, n) =>
  Array.isArray(choix) && choix.length === n && choix.every((i) => indexValide(i, n)) && new Set(choix).size === n;

/** Vrai si les deux ordres donnent la même suite de signatures. */
const memeSuite = (a, b, signatures) => a.every((i, k) => signatures[i] === signatures[b[k]]);

/**
 * Note la réponse `choix` (index) à l'exercice `index` de la leçon. Rend
 * { juste, bonne } et marque l'exercice comme répondu (un second toucher ne
 * compte pas). La PREMIÈRE réponse de la leçon sur un élément décide de sa
 * boîte, une seule fois. Si elle est fausse, l'élément revient une fois en fin
 * de leçon (rattrapage: true), et cette seconde réponse ne bouge plus la boîte.
 * La leçon est modifiée (exercices, etat, decides) ; l'état de l'appelant, non.
 * Pour un G3, `choix` est le tableau des index touchés, dans l'ordre : une
 * permutation de 0 à 3, juste si la suite des signatures touchées est celle du
 * poomsae (deux gestes indiscernables échangés ne sont pas une faute).
 */
export function noterReponse(lecon, index, choix) {
  const exercice = lecon.exercices[index];
  if (!exercice) throw new Error(`Pas d'exercice ${index} dans cette leçon`);
  const ordre = exercice.type === "G3";
  if (ordre ? !estPermutation(choix, exercice.choix.length) : !indexValide(choix, exercice.choix.length)) {
    throw new Error(`Choix ${choix} hors limites pour l'exercice ${index}`);
  }
  if (exercice.repondu) return { juste: exercice.juste, bonne: exercice.bonne };

  const juste = ordre ? memeSuite(choix, exercice.bonne, exercice.signatures) : choix === exercice.bonne;
  exercice.repondu = true;
  exercice.juste = juste;
  if (!lecon.decides[exercice.id]) {
    lecon.decides[exercice.id] = true;
    lecon.etat = repondre(lecon.etat, exercice.id, juste, lecon.aujourdhui);
    if (!juste) lecon.exercices.push(lecon.rattrapages[exercice.id]);
  }
  return { juste, bonne: exercice.bonne };
}
