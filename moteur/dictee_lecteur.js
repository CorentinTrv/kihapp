// Kihapp, moteur/dictee_lecteur.js (lot K18a)
// ====================================================================
// Module PUR : la logique de TEMPS de la dictée, sans écran, sans son, sans
// horloge. L'appelant passe toujours l'instant (`maintenant`, en secondes, ceux
// de AudioContext.currentTime dans la glu de K18b). Chaque fonction rend un
// état NEUF et ne modifie jamais celui qu'elle reçoit.
//
// Choix à juger sur le tatami (jalon M2) : la reprise attend un temps entier,
// comme si l'événement d'avant venait d'être dit à l'instant de la reprise ; une
// pause entre « Ap Tchagui » et le coup de poing du 14 reprend donc au coup de poing.

import { VOCABULAIRE } from "../contenu/vocabulaire.js";
import { planDictee } from "./dictee_plan.js";

// On programme ce qui tombe dans la demi-seconde à venir (plan §2.9).
export const HORIZON = 0.5;

// Seules clés que la reprise accepte : le rythme.
const CLES_DU_RYTHME = ["intervalle", "pauseApresCommandements"];

const refuse = (action, etat) => new Error(`dictée : impossible de ${action} depuis « ${etat} »`);

// L'événement i du plan, dans la forme rendue à l'appelant.
function evenement(lecteur, i) {
  const { audio, texte, mouvement, kihap } = lecteur.plan[i];
  return { index: i, quand: lecteur.quand[i], audio, texte, mouvement, kihap };
}

// Un événement est dit si, programmé, son instant est atteint.
const estDit = (lecteur, i, maintenant) => i < lecteur.prochain && lecteur.quand[i] <= maintenant;

// Le premier événement pas encore dit (le plan est trié par instant : les dits forment un début).
function premierPasDit(lecteur, maintenant) {
  let i = 0;
  while (i < lecteur.plan.length && estDit(lecteur, i, maintenant)) i++;
  return i;
}

// Les index programmés et pas encore dits.
function programmesPasDits(lecteur, maintenant) {
  const index = [];
  for (let i = premierPasDit(lecteur, maintenant); i < lecteur.prochain; i++) index.push(i);
  return index;
}

/** Un lecteur prêt, plan calculé par planDictee (ses erreurs remontent telles quelles). */
export function lecteurNeuf(poomsae, options = {}, vocabulaire = VOCABULAIRE) {
  const optionsEnCours = { ...(options ?? {}) };
  return {
    etat: "pret",
    poomsae,
    vocabulaire,
    options: optionsEnCours,
    plan: planDictee(poomsae, optionsEnCours, vocabulaire),
    quand: [],
    prochain: 0,
    reprise: 0,
  };
}

/** Depuis pret, arrete ou fini : on repart toujours du premier commandement. */
export function commencer(lecteur, maintenant) {
  if (lecteur.etat !== "pret" && lecteur.etat !== "arrete" && lecteur.etat !== "fini") {
    throw refuse("commencer", lecteur.etat);
  }
  return {
    ...lecteur,
    etat: "joue",
    quand: lecteur.plan.map((e) => maintenant + e.t),
    prochain: 0,
    reprise: 0,
  };
}

/** En joue : chaque événement pas encore programmé qui tombe avant maintenant + HORIZON, une fois chacun. */
export function avancer(lecteur, maintenant) {
  if (lecteur.etat !== "joue") return { lecteur, aProgrammer: [] };
  const aProgrammer = [];
  let prochain = lecteur.prochain;
  while (prochain < lecteur.plan.length && lecteur.quand[prochain] < maintenant + HORIZON) {
    aProgrammer.push(evenement(lecteur, prochain));
    prochain++;
  }
  const dernier = lecteur.plan.length - 1;
  const fini = prochain === lecteur.plan.length && maintenant >= lecteur.quand[dernier];
  return { lecteur: { ...lecteur, etat: fini ? "fini" : "joue", prochain }, aProgrammer };
}

/** En joue : annule les programmés pas encore dits, retient où reprendre. */
export function mettreEnPause(lecteur, maintenant) {
  if (lecteur.etat !== "joue") throw refuse("mettre en pause", lecteur.etat);
  const aAnnuler = programmesPasDits(lecteur, maintenant);
  const reprise = premierPasDit(lecteur, maintenant);
  return { lecteur: { ...lecteur, etat: "pause", prochain: reprise, reprise }, aAnnuler };
}

/**
 * En pause : seul le rythme peut changer. Le plan est recalculé ; l'événement
 * de reprise tombe un écart entier après l'instant de la reprise.
 */
export function reprendre(lecteur, maintenant, changements = {}) {
  if (lecteur.etat !== "pause") throw refuse("reprendre", lecteur.etat);
  for (const cle of Object.keys(changements ?? {})) {
    if (!CLES_DU_RYTHME.includes(cle)) {
      throw new Error(`dictée : seul le rythme change pendant une pause (« ${cle} »)`);
    }
  }
  const options = { ...lecteur.options, ...changements };
  const plan = planDictee(lecteur.poomsae, options, lecteur.vocabulaire);
  const k = lecteur.reprise;
  const depart = k > 0 ? plan[k - 1].t : 0;
  // Avant k : instants conservés (déjà dits, jamais reprogrammés). Dès k : décalés sur la reprise.
  const quand = plan.map((e, i) => (i < k ? lecteur.quand[i] : maintenant + (e.t - depart)));
  return { ...lecteur, etat: "joue", options, plan, quand, prochain: k };
}

/** En joue ou en pause : annule les programmés pas encore dits (rien depuis une pause). */
export function arreter(lecteur, maintenant) {
  if (lecteur.etat !== "joue" && lecteur.etat !== "pause") throw refuse("arrêter", lecteur.etat);
  const aAnnuler = lecteur.etat === "joue" ? programmesPasDits(lecteur, maintenant) : [];
  const reprise = lecteur.etat === "joue" ? premierPasDit(lecteur, maintenant) : lecteur.reprise;
  return { lecteur: { ...lecteur, etat: "arrete", prochain: reprise, reprise }, aAnnuler };
}

/** Le dernier événement dit, ou null avant le premier. En pause ou à l'arrêt : celui d'avant. */
export function courant(lecteur, maintenant) {
  let dernier;
  if (lecteur.etat === "pause" || lecteur.etat === "arrete") dernier = lecteur.reprise - 1;
  else if (lecteur.etat === "fini") dernier = lecteur.plan.length - 1;
  else dernier = premierPasDit(lecteur, maintenant) - 1;
  return dernier >= 0 ? evenement(lecteur, dernier) : null;
}
