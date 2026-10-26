// Kihapp, moteur/lecon_composer.js (lot K4)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge, ni Math.random. Le jour et le
// hasard (à graine) sont passés par l'appelant : même graine, même leçon.
//
// Une leçon, dans l'ordre du plan :
//   1. les DUS (vus, revue arrivée), boîte croissante, puis date, puis id ;
//   2. en mode « unite », AU PLUS 4 nouveaux, dans l'ordre du contenu ;
//   3. s'il manque des exercices pour atteindre 10, le COMPLÉMENT : les vus non
//      dus de plus basse boîte (réviser n'est jamais limité) ;
//   4. un exercice par élément ; puis un second, d'un autre type, pour les
//      nouveaux et la boîte 1 ; puis un troisième s'il manque encore des
//      exercices pour atteindre 10. Jamais plus de 15 au départ. Quand les types
//      possibles sont épuisés (sans audio il n'y en a que deux), la leçon reste
//      courte (court: true) au lieu de répéter à l'infini.

import { melanger } from "./aleatoire.js";
import { genererExercice, typePour } from "./exercices.js";
import { estDu } from "./leitner.js";
import { ELEMENTS } from "../contenu/elements.js";

const MIN = 10;
const MAX = 15;
const NOUVEAUX_MAX = 4;
const MODES = ["unite", "revision", "points-faibles"];

const comparer = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Compose une leçon. `elements` : le vocabulaire (en mode « points-faibles », la
 * liste des ids à retravailler, dans l'ordre voulu ; les éléments sont alors
 * ELEMENTS : le vocabulaire et les mouvements des poomsae). `etat` n'est jamais modifié.
 * `audioDisponible` vaut faux par défaut : sans le dire, pas de bouton d'écoute.
 * Rend { mode, unite, aujourdhui, etat, exercices, rattrapages, decides, court }
 * que noterReponse (exercices.js) fait vivre.
 */
export function composerLecon({
  elements,
  etat,
  aujourdhui,
  alea,
  mode,
  unite = null,
  audioDisponible = false,
}) {
  if (!MODES.includes(mode)) throw new Error(`Mode de leçon inconnu : ${mode}`);
  if (mode === "unite" && unite === null) throw new Error("Le mode unité demande une unité");

  const voc = mode === "points-faibles" ? ELEMENTS : elements;
  const cadre = voc.filter((e) => e.exercice && (unite === null || e.unite === unite));
  const vu = (e) => etat.elements[e.id] !== undefined;
  const parBoite = (a, b) => {
    const ea = etat.elements[a.id];
    const eb = etat.elements[b.id];
    return ea.b - eb.b || comparer(ea.p, eb.p) || comparer(a.id, b.id);
  };

  const demandes = mode === "points-faibles" ? choisirDemandes(elements, voc) : [];
  const dus = cadre.filter((e) => vu(e) && estDu(etat.elements[e.id], aujourdhui)).sort(parBoite);
  const nouveaux = mode === "unite" ? cadre.filter((e) => !vu(e)).slice(0, NOUVEAUX_MAX) : [];
  const base = (mode === "points-faibles" ? demandes : [...dus, ...nouveaux]).slice(0, MAX);

  if (base.length < MIN) {
    const complement = cadre.filter((e) => vu(e) && !base.includes(e)).sort(parBoite);
    base.push(...complement.slice(0, MIN - base.length));
  }

  const options = { elements: voc, alea, audioDisponible };
  const boiteDe = (e) => etat.elements[e.id]?.b ?? 1;
  const vuesDe = (e) => etat.elements[e.id]?.v ?? 0;
  const types = {};
  const exercices = [];
  const ajouter = (e, type) => {
    (types[e.id] ??= []).push(type);
    return genererExercice(e, type, options);
  };

  // Premier tour : un exercice par élément, dans l'ordre de priorité.
  for (const e of base) exercices.push(ajouter(e, typePour(e, etat.elements[e.id], audioDisponible)));

  // Tours suivants : second (puis troisième) exercice pour les nouveaux et la boîte 1.
  const fragiles = [...nouveaux, ...base.filter((e) => !nouveaux.includes(e) && boiteDe(e) === 1)];
  const tour = (numero) => {
    const lot = [];
    for (const e of fragiles.slice(0, MAX - exercices.length)) {
      const type = typePour(e, { b: numero, v: vuesDe(e) }, audioDisponible, types[e.id]);
      if (type !== null) lot.push(ajouter(e, type));
    }
    exercices.push(...melanger(lot, alea));
  };
  tour(2);
  if (exercices.length < MIN) tour(3);

  // Un rattrapage prêt pour chaque élément : un type encore jamais vu si possible.
  const rattrapages = {};
  for (const e of base) {
    const type = typePour(e, { b: 2, v: vuesDe(e) }, audioDisponible, types[e.id]) ?? (e.categorie === "mouvement" ? "G1" : "V1");
    rattrapages[e.id] = { ...genererExercice(e, type, options), rattrapage: true, repondu: false };
  }

  return { mode, unite, aujourdhui, etat, exercices, rattrapages, decides: {}, court: exercices.length < MIN };
}

/** Les éléments demandés par leurs ids, sans doublon ni exercice faux. */
function choisirDemandes(ids, voc) {
  const trouves = ids.map((id) => {
    const e = voc.find((v) => v.id === id);
    if (e === undefined) throw new Error(`Élément inconnu pour les points faibles : ${id}`);
    return e;
  });
  return [...new Set(trouves)].filter((e) => e.exercice);
}
