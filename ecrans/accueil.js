// Kihapp, ecrans/accueil.js (lot K6) : l'écran #accueil.
// La ceinture, les sept unités (barre de progression, cadenas), « Réviser »,
// « Mes points faibles », la série et « J'étais au cours ». Le lien vers le
// poomsae, les liens vers le lexique, les sources et les réglages, et la carte
// sur la perte (avec « Copier mon code ») sont du HTML fixe (index.html).
//
// afficherAccueil(racine) est appelé à chaque affichage de l'écran : les parties
// vivantes sont reconstruites à partir de l'état courant. Les gestes de
// « J'étais au cours » sont branchés une seule fois.

import { CEINTURES, UNITES } from '../contenu/parcours.js';
import { ELEMENTS } from '../contenu/elements.js';
import { ajouterJours } from '../moteur/dates.js';
import { estDu } from '../moteur/leitner.js';
import { etatUnites, pointsFaibles } from '../moteur/parcours_logique.js';
import { marquerJour, peutMarquerCours, texteSerie } from '../moteur/serie.js';
import { demanderStockageProtege } from './reglages.js';
import { afficherBandeaux, aujourdhui, creer, demarrerLecon, enregistrer, etatCourant, leconTerminee } from './session.js';

const CADENAS = '<svg viewBox="0 0 24 24" width="18" height="18" role="img" aria-label="Fermée"><path fill="currentColor" d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z"/></svg>';

let racineBranchee = null;

function lancer(mode, unite = null) {
  demarrerLecon(mode, unite);
  location.hash = '#lecon';
}

function ligneUnite(unite) {
  const li = creer('li', `unite ${unite.ouverte ? 'ouverte' : 'fermee'}`);
  const tete = creer('span', 'unite-tete');
  tete.append(creer('span', 'unite-titre', unite.titre), creer('span', 'unite-compte', `${unite.acquis} / ${unite.total}`));
  if (!unite.ouverte) {
    const cadenas = creer('span', 'cadenas');
    cadenas.innerHTML = CADENAS;
    tete.prepend(cadenas);
  }
  const barre = creer('span', 'barre');
  barre.setAttribute('role', 'progressbar');
  barre.setAttribute('aria-label', unite.titre);
  barre.setAttribute('aria-valuemin', '0');
  barre.setAttribute('aria-valuemax', String(unite.total));
  barre.setAttribute('aria-valuenow', String(unite.acquis));
  const rempli = creer('span', 'barre-rempli');
  rempli.style.transform = `scaleX(${unite.total === 0 ? 0 : unite.acquis / unite.total})`;
  barre.append(rempli);

  if (unite.ouverte) {
    const bouton = creer('button', 'unite-bouton');
    bouton.type = 'button';
    bouton.append(tete, barre);
    bouton.addEventListener('click', () => lancer('unite', unite.id));
    li.append(bouton);
  } else {
    li.append(tete, barre);
  }
  return li;
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
  racine.querySelector('#acc-unites').replaceChildren(...etatUnites(etat, ELEMENTS, UNITES).map(ligneUnite));
  racine.querySelector('#acc-actions').replaceChildren(...actions(etat));
  racine.querySelector('#acc-serie').textContent = texteSerie(etat, aujourdhui());
  racine.querySelector('#acc-cours-choix').hidden = true;
  // Au retour d'une leçon finie, une progression d'au moins un jour vaut d'être protégée (une seule demande).
  if (leconTerminee() && Object.keys(etat.jours).length > 0) demanderStockageProtege();
}
