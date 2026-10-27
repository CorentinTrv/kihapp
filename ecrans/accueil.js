// Kihapp, ecrans/accueil.js (lot K6, refait au lot R7b d'après E2-Accueil) : l'écran #accueil.
// La barre du haut (la série), la bannière de l'unité en cours, le chemin (un rond par
// unité : coche si finie, étoile si ouverte, cadenas si fermée, Ti à côté de la courante,
// une barre de progression), « Réviser », « Mes points faibles », la série et « J'étais au
// cours ». La barre du haut (la ceinture), le lien Lexique et leur mise en page sont du HTML
// fixe (index.html) ; les ronds sont dessinés par le CSS.
//
// afficherAccueil(racine) est appelé à chaque affichage de l'écran : les parties
// vivantes sont reconstruites à partir de l'état courant. Les gestes de
// « J'étais au cours » sont branchés une seule fois.

import { CEINTURES, UNITES } from '../contenu/parcours.js';
import { ELEMENTS } from '../contenu/elements.js';
import { ajouterJours } from '../moteur/dates.js';
import { estDu } from '../moteur/leitner.js';
import { etatUnites, pointsFaibles } from '../moteur/parcours_logique.js';
import { marquerJour, peutMarquerCours, serieCourante, texteSerie } from '../moteur/serie.js';
import { demanderStockageProtege } from './reglages.js';
import { ouvrirGuide } from './guide.js';
import { afficherBandeaux, aujourdhui, creer, demarrerLecon, enregistrer, etatCourant, guideDejaVu, leconTerminee } from './session.js';
import { svgTi } from './ti.js';

const CADENAS = '<svg viewBox="0 0 24 24" width="18" height="18" role="img" aria-label="Fermée"><path fill="currentColor" d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z"/></svg>';
// Les deux icônes des ronds (chemins de E2-Accueil), dessinées dans la couleur du texte du rond (currentColor).
const COCHE = '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><path d="M8 16 L14 22 L24 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ETOILE = '<svg viewBox="0 0 32 32" width="36" height="36" aria-hidden="true" focusable="false"><path d="M16 4 L19.5 12 L28 12.6 L21.5 18 L23.6 26.5 L16 22 L8.4 26.5 L10.5 18 L4 12.6 L12.5 12 Z" fill="currentColor"/></svg>';
// Le livre ouvert du bouton « Guide » de la bannière (chemin de E2-Accueil).
const LIVRE = '<svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 7 Q11 5 16 9 Q21 5 27 7 V25 Q21 23 16 27 Q11 23 5 25 Z M16 9 V27" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>';

let racineBranchee = null;

function lancer(mode, unite = null) {
  demarrerLecon(mode, unite);
  location.hash = '#lecon';
}

// Une unité complète : au moins un élément interrogeable, tous acquis.
const estFinie = (unite) => unite.total > 0 && unite.acquis === unite.total;

// Le rond de l'unité : cadenas si fermée, coche si finie, étoile sinon (le CSS donne les couleurs et la taille).
function rondUnite(unite) {
  const rond = creer('span', 'unite-rond');
  if (!unite.ouverte) {
    const cadenas = creer('span', 'cadenas');
    cadenas.innerHTML = CADENAS;
    rond.append(cadenas);
  } else {
    rond.innerHTML = estFinie(unite) ? COCHE : ETOILE;
  }
  return rond;
}

// L'étiquette à côté du rond : le titre, la barre de progression et le compte « acquis / total ».
function etiquetteUnite(unite) {
  const barre = creer('span', 'barre');
  barre.setAttribute('role', 'progressbar');
  barre.setAttribute('aria-label', unite.titre);
  barre.setAttribute('aria-valuemin', '0');
  barre.setAttribute('aria-valuemax', String(unite.total));
  barre.setAttribute('aria-valuenow', String(unite.acquis));
  const rempli = creer('span', 'barre-rempli');
  rempli.style.transform = `scaleX(${unite.total === 0 ? 0 : unite.acquis / unite.total})`;
  barre.append(rempli);
  const suivi = creer('span', 'unite-suivi');
  suivi.append(barre, creer('span', 'unite-compte', `${unite.acquis} / ${unite.total}`));
  const etiquette = creer('span', 'unite-etiquette');
  etiquette.append(creer('span', 'unite-titre', unite.titre), suivi);
  return etiquette;
}

// `courante` : la dernière unité ouverte, celle où l'élève en est (une seule, avec Ti à côté de son rond).
function ligneUnite(unite, courante) {
  const classes = ['unite', unite.ouverte ? 'ouverte' : 'fermee'];
  if (estFinie(unite)) classes.push('finie');
  if (courante) classes.push('courante');
  const li = creer('li', classes.join(' '));
  // Ouverte : toute la ligne (rond et étiquette) est un seul bouton. Fermée : la même ligne, sans bouton.
  let ligne;
  if (unite.ouverte) {
    ligne = creer('button', 'unite-ligne unite-bouton');
    ligne.type = 'button';
    // Le premier tap sur une unité ouvre son guide (même une unité déjà commencée) ; ensuite, la leçon directement.
    ligne.addEventListener('click', () => {
      if (guideDejaVu(unite.id)) lancer('unite', unite.id);
      else ouvrirGuide(unite.id, { premiere: true, lancer });
    });
  } else {
    ligne = creer('div', 'unite-ligne');
  }
  ligne.append(rondUnite(unite), etiquetteUnite(unite));
  li.append(ligne);
  if (courante) {
    const ti = creer('span', 'unite-ti'); // le dessin est déjà aria-hidden (svgTi)
    ti.innerHTML = svgTi('attente', { taille: 96 });
    li.prepend(ti);
  }
  return li;
}

// La bannière de l'unité en cours : « Unité n », son titre, et le bouton « Guide » qui rouvre le guide de l'unité.
function banniere(unites, rang) {
  const unite = unites[rang];
  const guide = creer('button', 'acc-banniere-guide');
  guide.type = 'button';
  guide.setAttribute('aria-label', `Guide de l'unité ${unite.titre}`);
  guide.innerHTML = LIVRE; // le dessin est déjà aria-hidden
  guide.append('Guide');
  guide.addEventListener('click', () => ouvrirGuide(unite.id, { premiere: false, lancer }));
  return [creer('p', 'acc-banniere-rang', `Unité ${rang + 1}`), creer('p', 'acc-banniere-titre', unite.titre), guide];
}

// Éléments vus et à revoir aujourd'hui (la boîte 1 est due le jour même).
function nombreARevoir(etat) {
  return ELEMENTS.filter((e) => e.exercice && etat.elements[e.id] && estDu(etat.elements[e.id], aujourdhui())).length;
}

function bouton(id, texte, mode) {
  const b = creer('button', 'bouton', texte);
  b.type = 'button';
  b.id = id;
  b.addEventListener('click', () => lancer(mode));
  return b;
}

function actions(etat) {
  const gestes = [];
  const aRevoir = nombreARevoir(etat);
  if (aRevoir > 0) gestes.push(bouton('acc-reviser', `Réviser (${aRevoir} à revoir)`, 'revision'));
  if (pointsFaibles(etat, ELEMENTS).length > 0) gestes.push(bouton('acc-faibles', 'Mes points faibles', 'points-faibles'));
  else {
    const rien = creer('p', 'rien-fragile', "Rien de fragile pour l'instant.");
    rien.id = 'acc-rien-fragile';
    gestes.push(rien);
  }
  return gestes;
}

function marquerCours(quand) {
  const jour = quand === 'hier' ? ajouterJours(aujourdhui(), -1) : aujourdhui();
  if (!peutMarquerCours(jour, aujourdhui())) return;
  enregistrer(marquerJour(etatCourant(), jour, 'c'));
  afficherAccueil(racineBranchee);
}

function brancherCours(racine) {
  const choix = racine.querySelector('#acc-cours-choix');
  racine.querySelector('#acc-cours').addEventListener('click', () => { choix.hidden = !choix.hidden; });
  for (const b of choix.querySelectorAll('button')) b.addEventListener('click', () => marquerCours(b.dataset.jour));
}

export function afficherAccueil(racine) {
  if (racineBranchee !== racine) {
    racineBranchee = racine;
    brancherCours(racine);
  }
  const etat = etatCourant();
  afficherBandeaux(racine.querySelector('#acc-bandeaux'));
  racine.querySelector('#acc-ceinture').textContent = CEINTURES[0].titre;
  const unites = etatUnites(etat, ELEMENTS, UNITES);
  const courante = unites.findLastIndex((u) => u.ouverte); // la première unité est toujours ouverte : jamais -1
  racine.querySelector('#acc-banniere').replaceChildren(...banniere(unites, courante));
  racine.querySelector('#acc-unites').replaceChildren(...unites.map((u, i) => ligneUnite(u, i === courante)));
  racine.querySelector('#acc-actions').replaceChildren(...actions(etat));
  const phrase = texteSerie(etat, aujourdhui());
  racine.querySelector('#acc-serie').textContent = phrase;
  racine.querySelector('#acc-haut-nombre').textContent = String(serieCourante(etat, aujourdhui()));
  racine.querySelector('#acc-haut-serie').setAttribute('aria-label', phrase);
  racine.querySelector('#acc-cours-choix').hidden = true;
  // Au retour d'une leçon finie, une progression d'au moins un jour vaut d'être protégée (une seule demande).
  if (leconTerminee() && Object.keys(etat.jours).length > 0) demanderStockageProtege();
}
