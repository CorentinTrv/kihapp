// Kihapp, moteur/duree.js (lot « correctifs de la revue »)
// ====================================================================
// Module PUR : ni window, ni document, ni horloge. Les instants (millisecondes) sont passés par l'appelant ;
// la glu (ecrans/session.js) y met Date.now() et les passages de document.visibilityState.
//
// Le temps d'une leçon, sans les minutes passées hors de l'app : un compteur retient les pauses
// (l'app cachée) ; la durée est « fin - début - pauses ». Ce temps n'entre jamais dans le stockage.
// Un compteur est un petit objet { cache, depuis } qu'on ne modifie pas : chaque fonction en rend un neuf.
//   cache  : les millisecondes de pause déjà closes ;
//   depuis : l'instant où la pause en cours a commencé, ou null si l'app est visible.

export const compteurNeuf = () => ({ cache: 0, depuis: null });

/** L'app passe en arrière-plan à l'instant t. Déjà cachée : rien ne change (le début de la pause reste le premier). */
export function cacher(compteur, t) {
  return compteur.depuis === null ? { cache: compteur.cache, depuis: t } : compteur;
}

/** L'app revient au premier plan à l'instant t. Sans « cachée » d'avant : ignoré. Une horloge qui recule ne retire rien de négatif. */
export function montrer(compteur, t) {
  if (compteur.depuis === null) return compteur;
  return { cache: compteur.cache + Math.max(0, t - compteur.depuis), depuis: null };
}

/** Le temps au premier plan entre debut et fin : une pause encore ouverte s'arrête à fin ; jamais négatif. */
export function tempsAuPremierPlan(debut, fin, compteur) {
  const enCours = compteur.depuis === null ? 0 : Math.max(0, fin - compteur.depuis);
  return Math.max(0, fin - debut - compteur.cache - enCours);
}
