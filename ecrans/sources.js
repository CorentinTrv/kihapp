// Kihapp, ecrans/sources.js (lot K9) : l'écran #sources.
// D'où vient chaque mot : les documents de contenu/sources.js avec leur date et
// leur lien, puis les sept doutes en clair avec les mots qu'ils concernent. Le
// contenu est fixe : l'écran se remplit une seule fois.
//
// Aucune adresse ni numéro personnel ici : le dépôt de Kihapp est public. La
// porte ouverte (« Dis-le à Corentin au club ») est du texte fixe d'index.html.

import { SOURCES } from '../contenu/sources.js';
import { VOCABULAIRE } from '../contenu/vocabulaire.js';
import { creer } from './session.js';

function ligneDocument(source) {
  const li = creer('li', 'src-doc');
  if (source.url) {
    const lien = creer('a', '', source.titre);
    lien.href = source.url;
    lien.target = '_blank';
    lien.rel = 'noopener noreferrer';
    li.append(lien);
  } else {
    li.append(creer('span', '', source.titre));
  }
  li.append(creer('span', 'src-date', source.url ? source.date : `Composé pour Kihapp, ${source.date}`));
  return li;
}

// Les doutes de 1 à 7 : le texte (le même pour tous les mots qui le portent) et les graphies concernées.
function ligneDoute(n) {
  const concernes = VOCABULAIRE.filter((m) => m.doute?.n === n);
  const li = creer('li', 'src-doute');
  li.value = n;
  li.append(
    creer('p', '', concernes[0].doute.texte),
    creer('p', 'src-mots', `Concerne : ${concernes.map((m) => m.fftda).join(', ')}`),
  );
  return li;
}

let rempli = false;

export function afficherSources(racine) {
  if (rempli) return;
  rempli = true;
  racine.querySelector('#src-documents').replaceChildren(...Object.values(SOURCES).map(ligneDocument));
  const numeros = [...new Set(VOCABULAIRE.filter((m) => m.doute).map((m) => m.doute.n))].sort((a, b) => a - b);
  racine.querySelector('#src-doutes').replaceChildren(...numeros.map(ligneDoute));
}
