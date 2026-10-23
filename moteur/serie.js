// Kihapp, moteur/serie.js (lot K5)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge. Le jour ('AAAA-MM-JJ') est
// toujours passé par l'appelant. Les écarts passent par dates.js (K1), qui
// compte juste à travers un changement d'heure.
//
// Un jour compte s'il porte une leçon finie ('l'), un cours au club ('c') ou
// les deux ('lc') : ce n'est jamais plus d'un point par jour. Aucune
// notification et aucun reproche : une série qui s'arrête devient « Nouvelle
// série », avec le record en vue.

import { ajouterJours, ecartJours } from "./dates.js";

// Nombre de jours marqués d'affilée en remontant depuis `depart` (compris).
function joursAvant(jours, depart) {
  let n = 0;
  while (jours[ajouterJours(depart, -n)]) n++;
  return n;
}

// Longueur de la suite de jours marqués qui contient `jour` (marqué).
function suiteAutour(jours, jour) {
  let apres = 0;
  while (jours[ajouterJours(jour, apres + 1)]) apres++;
  return joursAvant(jours, jour) + apres;
}

/**
 * Marque un jour comme leçon ('l') ou cours ('c') et rend un NOUVEL état.
 * Leçon et cours le même jour donnent 'lc'. Le record ne baisse jamais ; la
 * suite est mesurée dans les deux sens, car un cours oublié peut combler un
 * trou entre deux jours déjà marqués.
 */
export function marquerJour(etat, jour, type) {
  if (type !== "l" && type !== "c") {
    throw new Error(`marquerJour : type « ${type} » inconnu (attendu 'l' ou 'c')`);
  }
  const deja = etat.jours[jour] ?? "";
  const marque = ["l", "c"].filter((t) => t === type || deja.includes(t)).join("");
  const jours = { ...etat.jours, [jour]: marque };
  return { ...etat, jours, record: Math.max(etat.record, suiteAutour(jours, jour)) };
}

/** Un cours au club se déclare pour aujourd'hui ou pour hier (un cours du soir s'oublie). */
export function peutMarquerCours(jour, aujourdhui) {
  const ecart = ecartJours(jour, aujourdhui);
  return ecart === 0 || ecart === 1;
}

/**
 * Jours consécutifs marqués qui finissent aujourd'hui, ou hier si aujourd'hui
 * n'est pas encore marqué ; 0 sinon.
 */
export function serieCourante(etat, aujourdhui) {
  if (etat.jours[aujourdhui]) return joursAvant(etat.jours, aujourdhui);
  return joursAvant(etat.jours, ajouterJours(aujourdhui, -1));
}

const jours = (n) => `${n} ${n === 1 ? "jour" : "jours"}`;

/** Le texte de série de l'accueil. */
export function texteSerie(etat, aujourdhui) {
  const serie = serieCourante(etat, aujourdhui);
  if (serie > 0) {
    return etat.jours[aujourdhui]
      ? `Série : ${jours(serie)}`
      : `Série : ${jours(serie)}. Fais une leçon aujourd'hui pour la garder.`;
  }
  if (etat.record > 0) return `Nouvelle série. Ton record : ${jours(etat.record)}.`;
  return "Ta série commence avec ta première leçon.";
}
