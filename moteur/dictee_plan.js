// Kihapp, moteur/dictee_plan.js (lot K17)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge, ni son, ni réseau. Il ne
// produit qu'une LISTE : ce que l'app dira, et à quelle seconde. L'écran (K18)
// et l'audio liront cette liste plus tard.
//
// Deux modes, mêmes instants de mouvement :
// - 'compte' : on dit le numéro du mouvement (Hana, Doul, ... Yeul Yeudol) ;
// - 'nomme'  : on dit la technique (Ale Maki, Montong Bandé Jileugui, ...).

import { VOCABULAIRE } from "../contenu/vocabulaire.js";

// Écart entre deux commandements (Tchaliot, Kyongnye, ... et Baro). Il ne
// dépend pas du rythme choisi, qui ne concerne que les mouvements.
const ECART_COMMANDEMENTS = 2.5;

const INTERVALLE = { defaut: 2.5, min: 1, max: 6 };
const PAUSE = { defaut: 2, min: 0, max: 6 };

// Un nombre ramené dans [min ; max] ; tout ce qui n'est pas un nombre prend le défaut.
function borne(valeur, { defaut, min, max }) {
  if (typeof valeur !== "number" || Number.isNaN(valeur)) return defaut;
  return Math.min(max, Math.max(min, valeur));
}

// L'élément du vocabulaire, ou une erreur claire (jamais un TypeError muet).
function elementDe(vocabulaire, id) {
  const element = vocabulaire.find((e) => e.id === id);
  if (!element) throw new Error(`il manque l'audio de « ${id} »`);
  return element;
}

// L'élément qui se dit pour le nombre n : catégorie 'compter' (1 à 10) ou 'nombre-dictee' (11 à 18).
function elementDuNombre(vocabulaire, n) {
  const element = vocabulaire.find(
    (e) => (e.categorie === "compter" || e.categorie === "nombre-dictee") && e.fr === String(n),
  );
  if (!element) throw new Error(`il manque l'audio du nombre ${n}`);
  return element;
}

/**
 * La liste horodatée de la dictée d'un poomsae, dans l'ordre du temps.
 * Chaque événement : { t, audio, texte, mouvement, kihap }.
 * Options : mode ('compte' par défaut ou 'nomme'), intervalle (2,5 s, dans
 * [1 ; 6]), pauseApresCommandements (2 s, dans [0 ; 6]).
 */
export function planDictee(poomsae, options = {}, vocabulaire = VOCABULAIRE) {
  const { mode = "compte", intervalle: demande, pauseApresCommandements: pauseDemandee } = options ?? {};
  if (mode !== "compte" && mode !== "nomme") throw new Error(`dictée : mode inconnu « ${mode} »`);
  const intervalle = borne(demande, INTERVALLE);
  const pause = borne(pauseDemandee, PAUSE);

  const evenement = (t, element, mouvement, kihap) => ({
    t,
    audio: element.id,
    texte: element.fftda,
    mouvement,
    kihap,
  });
  const commandement = (id, t) => evenement(t, elementDe(vocabulaire, id), null, false);

  const plan = poomsae.avant.map((id, i) => commandement(id, i * ECART_COMMANDEMENTS));

  // Un instant calculé par multiplication, jamais par additions en boucle : 12 + 13 × 2,5 = 44,5 exactement.
  const tPremier = (poomsae.avant.length - 1) * ECART_COMMANDEMENTS + pause;
  poomsae.mouvements.forEach((m, k) => {
    const t = tPremier + k * intervalle;
    const kihap = m.kihap === true;
    if (mode === "compte") {
      plan.push(evenement(t, elementDuNombre(vocabulaire, m.numeroKukkiwon), m.id, kihap));
      return;
    }
    if (m.avant) plan.push(evenement(t, elementDe(vocabulaire, m.avant), m.id, kihap));
    const tTechnique = m.avant ? t + intervalle / 2 : t;
    plan.push(evenement(tTechnique, elementDe(vocabulaire, m.technique), m.id, kihap));
  });

  const tApres = tPremier + (poomsae.mouvements.length - 1) * intervalle + intervalle;
  poomsae.apres.forEach((id, i) => plan.push(commandement(id, tApres + i * ECART_COMMANDEMENTS)));
  return plan;
}
