// Kihapp, ecrans/guide.js (lot « guide d'unité ») : la feuille du guide d'une unité.
// Un <dialog id="guide"> (dans section#accueil, vide dans index.html) ouvert par showModal() : le
// navigateur rend le reste de la page inerte, garde le focus dans la feuille et ferme sur Échap.
//
// De haut en bas : « Unité n » et le titre « <unité>, guide », la croix (à la relecture seulement),
// trois blocs (Pour retenir, Phrases clés, Au dojang), puis en bas « C'est parti » (au premier
// affichage seulement). Les astuces et les faits viennent de contenu/guides.js ; les phrases clés
// ne sont recopiées nulle part : ce sont les éléments d'ELEMENTS dont `unite` est l'unité.
//
// - premier affichage : « C'est parti » marque le guide lu, ferme, lance la leçon. Échap ferme sans
//   rien marquer ni lancer : le guide se rouvrira au prochain tap.
// - relecture (bouton « Guide » de la bannière) : la croix ou Échap ferment, rien n'est écrit.

import { ELEMENTS, nomDuGeste } from '../contenu/elements.js';
import { GUIDES } from '../contenu/guides.js';
import { UNITES } from '../contenu/parcours.js';
import { nomColore } from './gestes.js';
import { creer, noterGuideVu } from './session.js';

// Les icônes sont dessinées dans la couleur du texte du titre (currentColor), sur une grille de 32.
const AMPOULE = 'M16 4 A8 8 0 0 1 21 18 V21 H11 V18 A8 8 0 0 1 16 4 Z M12 25 H20 M13.5 28.5 H18.5';
const BULLE = 'M5 7 H27 V21 H15 L9 27 V21 H5 Z';
const MAISON = 'M4 14 L16 5 L28 14 M7 12 V27 H25 V12 M13 27 V19 H19 V27';
const FERMER = 'M9 9 L23 23 M23 9 L9 23';
const CHEVRON = '<svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 7 L21 16 L12 25" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const dessin = (chemin, taille, trait) => `<svg viewBox="0 0 32 32" width="${taille}" height="${taille}" aria-hidden="true" focusable="false"><path d="${chemin}" fill="none" stroke="currentColor" stroke-width="${trait}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Typographie française à l'affichage seulement (les textes de guides.js restent ceux du fichier de contenu) : l'espace devant « : », « ; »,
// « ! », « ? » et « » », et celle après « « », devient insécable, pour que la ponctuation ne tombe jamais seule en début de ligne.
const NBSP = String.fromCharCode(160);
const typographie = (texte) => texte.replace(/ ([:;!?»])/g, (_, signe) => NBSP + signe).replace(/« /g, () => '«' + NBSP);

/** Une section : un titre h3 avec son icône, puis son contenu. */
function bloc(titre, icone, contenu) {
  const pastille = creer('span', 'guide-icone');
  pastille.innerHTML = dessin(icone, 22, 2.5);
  const h3 = creer('h3', 'guide-bloc-titre');
  h3.append(pastille, titre);
  const section = creer('section', 'guide-bloc');
  section.append(h3, contenu);
  return section;
}

function liste(classe, textes) {
  const ul = creer('ul', classe);
  ul.append(...textes.map((t) => creer('li', '', t)));
  return ul;
}

/**
 * Une phrase clé : un mot (la graphie FFTDA, son hangeul, son français) ou un mouvement (« 14 · » puis son
 * nom FFTDA, son français dessous, sans hangeul). Le mot de côté d'un mouvement garde sa couleur, comme en leçon.
 */
function phrase(element) {
  const fftda = creer('span', 'guide-fftda');
  const nom = creer('span', 'guide-nom', '');
  let fr;
  if (element.categorie === 'mouvement') {
    const geste = nomDuGeste(element);
    fftda.append(`${element.numero} · `, ...nomColore(geste.fftda));
    nom.append(fftda);
    fr = geste.fr;
  } else {
    fftda.textContent = element.fftda;
    const ko = creer('span', 'guide-ko', element.hangeul);
    ko.lang = 'ko';
    nom.append(fftda, ' ', ko);
    fr = element.fr;
  }
  const li = creer('li', 'guide-phrase');
  li.append(nom, creer('span', 'guide-fr', fr));
  return li;
}

function entete(unite, feuille, premiere) {
  const titre = creer('h2', 'guide-titre', `${unite.titre}, guide`);
  titre.id = 'guide-titre';
  const titres = creer('div', 'guide-titres');
  titres.append(creer('p', 'guide-rang', `Unité ${unite.ordre}`), titre);
  const haut = creer('div', 'guide-entete');
  haut.append(titres);
  if (!premiere) {
    const croix = creer('button', 'guide-croix');
    croix.type = 'button';
    croix.setAttribute('aria-label', 'Fermer');
    croix.innerHTML = dessin(FERMER, 20, 3.5);
    croix.addEventListener('click', () => feuille.close());
    haut.append(croix);
  }
  return haut;
}

function corps(unite, guide, feuille) {
  const defile = creer('div', 'guide-defile');
  const phrases = creer('ul', 'guide-phrases');
  phrases.append(...ELEMENTS.filter((e) => e.unite === unite.id).map(phrase));
  defile.append(
    bloc('Pour retenir', AMPOULE, liste('guide-astuces', guide.retenir.map((r) => typographie(r.texte)))),
    bloc('Phrases clés', BULLE, phrases),
  );
  // Sans fait sourcé, le bloc n'existe pas (il n'est pas seulement caché).
  if (guide.dojang.length > 0) defile.append(bloc('Au dojang', MAISON, liste('guide-faits', guide.dojang.map((d) => typographie(d.texte)))));
  if (unite.id === 'taegeuk-il-jang') {
    // Le lien ferme la feuille sans marquer le guide lu, puis le navigateur suit l'ancre vers l'onglet Poomsae.
    const lien = creer('a', 'acc-lexique guide-lien');
    lien.href = '#poomsae';
    lien.append(creer('span', '', 'Voir le poomsae en animation'));
    lien.insertAdjacentHTML('beforeend', CHEVRON);
    lien.addEventListener('click', () => feuille.close());
    defile.append(lien);
  }
  return defile;
}

function pied(unite, feuille, lancer) {
  const parti = creer('button', 'bouton principal', "C'est parti");
  parti.type = 'button';
  parti.id = 'guide-parti';
  parti.autofocus = true; // showModal() pose le focus ici : Entrée lance la leçon
  parti.addEventListener('click', () => {
    noterGuideVu(unite.id);
    feuille.close();
    lancer('unite', unite.id);
  });
  const bas = creer('div', 'guide-pied');
  bas.append(parti);
  return bas;
}

/**
 * Ouvre la feuille du guide de l'unité `uniteId`. `premiere` : vrai au premier affichage (« C'est parti », pas de croix),
 * faux à la relecture. `lancer(mode, unite)` démarre la leçon (donnée par l'accueil).
 */
export function ouvrirGuide(uniteId, { premiere, lancer }) {
  const unite = UNITES.find((u) => u.id === uniteId);
  const guide = GUIDES.find((g) => g.unite === uniteId);
  if (unite === undefined || guide === undefined) throw new Error(`guide : aucune unité « ${uniteId} »`);
  const feuille = document.getElementById('guide');
  if (feuille.open) return;
  const declencheur = document.activeElement;
  feuille.replaceChildren(entete(unite, feuille, premiere), corps(unite, guide, feuille), ...(premiere ? [pied(unite, feuille, lancer)] : []));
  // Un changement d'écran pendant que la feuille est ouverte (geste « retour » du téléphone) la ferme : une feuille
  // modale cachée avec son écran laisserait tout le reste de la page inerte.
  const fermerSiEcranChange = () => feuille.close();
  addEventListener('hashchange', fermerSiEcranChange);
  feuille.addEventListener('close', () => {
    removeEventListener('hashchange', fermerSiEcranChange);
    if (declencheur instanceof HTMLElement) declencheur.focus(); // le focus revient là où la feuille a été ouverte
  }, { once: true });
  feuille.showModal();
}
