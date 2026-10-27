// Kihapp, ecrans/moi.js (lot R7a de la refonte) : l'écran #moi, derrière l'onglet Moi.
// Ti, « Ceinture blanche, vers la jaune », la barre vers la ceinture jaune et « Unité n sur 7 »,
// puis les lignes de service (rythme, code de sauvegarde, lexique, sources) qui sont du HTML fixe
// (index.html). Ici, seulement ce qui vit : la barre, l'unité en cours et le mot du rythme.
//
// resumeMoi et motDuRythme sont purs (moi_test.js les garde) ; afficherMoi(racine) lit l'état
// courant à chaque affichage de l'écran.

import { ELEMENTS } from '../contenu/elements.js';
import { UNITES } from '../contenu/parcours.js';
import { etatUnites } from '../moteur/parcours_logique.js';
import { etatCourant } from './session.js';
import { svgTi } from './ti.js';

const MOTS_DU_RYTHME = new Map([[4, 'Lent'], [2.5, 'Moyen'], [1.5, 'Rapide']]);

/** Le mot du rythme de la dictée (4 s Lent, 2,5 s Moyen, 1,5 s Rapide) ; « Moyen », le réglage par défaut, si la valeur manque ou est inconnue. */
export function motDuRythme(rythme) {
  return MOTS_DU_RYTHME.get(rythme) ?? 'Moyen';
}

/**
 * Où en est l'élève vers la ceinture jaune : le rang (à partir de 1) de la dernière unité
 * ouverte, le nombre d'unités, et les sommes des éléments acquis et interrogeables de toutes
 * les unités. Lecture seule : l'état n'est pas modifié.
 */
export function resumeMoi(etat, elements, unites) {
  const lignes = etatUnites(etat, elements, unites);
  return {
    uniteEnCours: lignes.findLastIndex((u) => u.ouverte) + 1,
    totalUnites: unites.length,
    acquis: lignes.reduce((somme, u) => somme + u.acquis, 0),
    total: lignes.reduce((somme, u) => somme + u.total, 0),
  };
}

export function afficherMoi(racine) {
  const etat = etatCourant();
  const resume = resumeMoi(etat, ELEMENTS, UNITES);
  racine.querySelector('#moi-ti').innerHTML = svgTi('attente', { taille: 80 });
  const barre = racine.querySelector('#moi-barre');
  barre.setAttribute('aria-valuemax', String(resume.total));
  barre.setAttribute('aria-valuenow', String(resume.acquis));
  barre.querySelector('.barre-rempli').style.transform = `scaleX(${resume.total === 0 ? 0 : resume.acquis / resume.total})`;
  racine.querySelector('#moi-unite').textContent = `Unité ${resume.uniteEnCours} sur ${resume.totalUnites}`;
  racine.querySelector('#moi-rythme-valeur').textContent = motDuRythme(etat.reglages?.rythme);
}
