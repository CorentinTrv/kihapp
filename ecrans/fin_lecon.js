// Kihapp, ecrans/fin_lecon.js (lot K6, refait au lot R6) : l'écran #fin, en deux panneaux.
// Fin1 : Ti, « Leçon finie ! », la précision et le temps, le score, les éléments montés de boîte.
// Fin2 : la série et la semaine du lundi au dimanche, seulement si cette leçon vient de faire compter
// le jour (un jour déjà marqué par un cours ou une leçon plus tôt ne repasse pas par Fin2).
// Le dernier « Continuer » est le lien #fin-accueil ; avec une Fin2, Fin1 a d'abord un bouton #fin-suite.
//
// Le score compte les exercices de la leçon de départ, pas les rattrapages : un
// rattrapage est un second essai pour s'entraîner, il ne rattrape pas la note
// (et la première réponse sur un élément est celle qui décide de sa boîte).

import { ELEMENTS } from '../contenu/elements.js';
import { UNITES } from '../contenu/parcours.js';
import { semaineDe, serieCourante, texteSerie } from '../moteur/serie.js';
import { nomDuMouvement } from './gestes.js';
import { afficherBandeaux, aujourdhui, creer, etatCourant, leconTerminee } from './session.js';
import { nomDeLaBoite } from './lexique.js';
import { svgTi } from './ti.js';

const s = (n) => (n > 1 ? 's' : '');
const ESPACE_INSECABLE = String.fromCharCode(160);

// Les icônes des ronds de la semaine : la couleur vient de styles.css.
const COCHE = '<svg class="fin-coche" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true" focusable="false"><path d="M8 16 L14 22 L24 10" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const DOJANG = '<svg class="fin-dojang" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3" y="12" width="26" height="6" rx="3"/><rect x="12" y="9" width="8" height="12" rx="2.5"/><path d="M14 20 L11 28 M18 20 L21 28" stroke-width="3" stroke-linecap="round"/></svg>';

const NOMS_DES_JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const LIBELLES_DES_MARQUES = { l: 'leçon', c: 'cours au club', lc: 'leçon et cours au club' };
const SOUS_TITRES = { revision: 'Révision', 'points-faibles': 'Mes points faibles' };

// Le nom d'un élément monté de boîte : un mot par sa graphie FFTDA, un geste par son nom de geste suivi du numéro
// du mouvement (trois mouvements s'appellent « Ale Maki, gauche » : le numéro les distingue).
const nomDe = (id) => {
  const element = ELEMENTS.find((e) => e.id === id);
  return element.categorie === 'mouvement' ? `${nomDuMouvement(id).fftda} (mouvement ${element.numero})` : element.fftda;
};

/** Le score et les éléments montés de boîte d'une leçon finie. */
function resumer({ lecon, avant }) {
  const exercices = lecon.exercices.filter((e) => !e.rattrapage);
  const justes = exercices.filter((e) => e.juste).length;
  const montes = [...new Set(exercices.map((e) => e.id))]
    .filter((id) => lecon.etat.elements[id].b > (avant.elements[id]?.b ?? 1))
    .map((id) => ({ nom: nomDe(id), boite: lecon.etat.elements[id].b }));
  return { justes, total: exercices.length, montes };
}

/** « m:ss » : minutes sans zéro devant, secondes entières sur deux chiffres. */
function formaterDuree(ms) {
  const secondes = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}

// Le titre de l'unité (mode « unite »), ou le nom du mode.
const sousTitre = (lecon) => (lecon.mode === 'unite' ? UNITES.find((u) => u.id === lecon.unite).titre : SOUS_TITRES[lecon.mode]);

/** Un rond de la semaine : vide, coche (leçon, avec ou sans cours) ou dojang (cours seul), cerclé si c'est aujourd'hui. */
function jourDeLaSemaine(j, nom) {
  const rond = creer('span', 'fin-rond');
  rond.setAttribute('role', 'img');
  rond.setAttribute('aria-label', `${nom} : ${j.marque === null ? 'rien' : LIBELLES_DES_MARQUES[j.marque]}`);
  if (j.marque !== null) {
    const genre = j.marque.includes('l') ? 'lecon' : 'cours';
    rond.classList.add(genre);
    rond.innerHTML = genre === 'lecon' ? COCHE : DOJANG;
  }
  if (j.aujourdhui) {
    rond.classList.add('aujourdhui');
    rond.setAttribute('aria-current', 'date');
  }
  const initiale = creer('span', 'fin-initiale', j.initiale);
  initiale.setAttribute('aria-hidden', 'true'); // le nom du jour est dans le nom accessible du rond
  const colonne = creer('li', j.aujourdhui ? 'fin-jour aujourdhui' : 'fin-jour');
  colonne.append(initiale, rond);
  return colonne;
}

/** Montre Fin1 (panneau 1) ou Fin2 (panneau 2) et ce qui va avec : le bouton, le lien, les points. `avecFin2` : la leçon a-t-elle une Fin2. */
function montrer(racine, panneau, avecFin2) {
  racine.querySelector('#fin-1').hidden = panneau !== 1;
  racine.querySelector('#fin-2').hidden = panneau !== 2;
  racine.querySelector('#fin-suite').hidden = !(avecFin2 && panneau === 1);
  racine.querySelector('#fin-accueil').hidden = avecFin2 && panneau === 1;
  racine.querySelector('#fin-points').hidden = !avecFin2;
  racine.querySelectorAll('#fin-points .fin-point').forEach((point, i) => point.classList.toggle('courant', i === panneau - 1));
  if (panneau === 2) racine.querySelector('#fin-serie-titre').focus();
}

/** À appeler à chaque affichage de #fin, une leçon finie existant (le routeur le garantit). Revenir sur #fin remontre Fin1. */
export function afficherFin(racine) {
  const terminee = leconTerminee();
  const { justes, total, montes } = resumer(terminee);
  const jour = aujourdhui();
  const avecFin2 = !terminee.avant.jours[jour];
  afficherBandeaux(racine.querySelector('#fin-bandeaux'));

  racine.querySelector('#fin-ti').innerHTML = svgTi('reussite', { taille: 156 });
  racine.querySelector('#fin-sous-titre').textContent = sousTitre(terminee.lecon);
  racine.querySelector('#fin-precision-valeur').textContent = `${Math.round((100 * justes) / total)}${ESPACE_INSECABLE}%`;
  racine.querySelector('#fin-temps-valeur').textContent = formaterDuree(terminee.fin - terminee.debut);
  racine.querySelector('#fin-score').textContent = `${justes} bonne${s(justes)} réponse${s(justes)} sur ${total}`;
  racine.querySelector('#fin-montes-titre').hidden = montes.length === 0;
  racine.querySelector('#fin-montes').replaceChildren(
    ...montes.map((m) => creer('li', '', `${m.nom} : ${nomDeLaBoite(m.boite)} (boîte ${m.boite})`)),
  );

  const etat = etatCourant();
  const serie = serieCourante(etat, jour);
  const semaine = semaineDe(etat, jour);
  racine.querySelector('#fin-serie-chiffre').textContent = serie;
  racine.querySelector('#fin-serie-mot').textContent = serie > 1 ? 'jours d\'affilée' : 'jour d\'affilée';
  racine.querySelector('#fin-semaine').replaceChildren(...semaine.map((j, i) => jourDeLaSemaine(j, NOMS_DES_JOURS[i])));
  racine.querySelector('#fin-cours .fin-cours-pastille').innerHTML = DOJANG;
  racine.querySelector('#fin-cours').hidden = !semaine.some((j) => j.marque?.includes('c'));
  racine.querySelector('#fin-serie').textContent = texteSerie(etat, jour);

  racine.querySelector('#fin-suite').onclick = () => montrer(racine, 2, avecFin2);
  montrer(racine, 1, avecFin2);
}
