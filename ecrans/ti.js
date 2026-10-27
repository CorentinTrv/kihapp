// Kihapp, ecrans/ti.js (lot R3 de la refonte)
// Ti, la mascotte : une ceinture nouée vue de face (la bande, le noeud avec le visage,
// deux pans). Le module RENDUE UNE CHAÎNE SVG, comme animation/rendu.js : aucun DOM,
// aucune horloge, aucun import (il n'importe surtout pas session.js, que Deno ne charge
// pas). Les géométries sont celles de maquette/kit/KIT.md §6 ; les coordonnées des
// étoiles du jalon et des étincelles du coffre, que KIT ne donne pas, viennent de la
// feuille maquette/project/E2-Ti.dc.html.
//
// AUCUNE couleur dans la chaîne : chaque morceau porte une classe (.ti-bande, .ti-noeud,
// .ti-pan, .ti-yeux, .ti-trait-yeux, .ti-bouche, .ti-choc, .ti-etoile, .ti-z) que
// styles.css colore avec les jetons --k-ti*. Les épaisseurs, bouts et jointures restent
// ici, en attributs, comme dans KIT.

export const ETATS_TI = Object.freeze(['attente', 'reussite', 'erreur', 'salut', 'kihap', 'jalon', 'coffre', 'sommeil']);
const CEINTURES = ['blanche', 'jaune'];

// Les morceaux communs. La géométrie d'abord, la classe ensuite : la bande et le noeud
// sont la même chaîne, mot pour mot, dans les huit états.
const BANDE = '<rect x="6" y="40" width="108" height="20" rx="7" class="ti-bande" stroke-width="2.5"></rect>';
const NOEUD = '<rect x="36" y="28" width="48" height="42" rx="15" class="ti-noeud" stroke-width="2.5"></rect>';

const pans = (gauche, droit) =>
  `<path d="${gauche}" class="ti-pan ti-pan-g" stroke-width="2.5" stroke-linejoin="round"></path>`
  + `<path d="${droit}" class="ti-pan ti-pan-d" stroke-width="2.5" stroke-linejoin="round"></path>`;
const yeuxRonds = (r) => `<circle cx="50" cy="46" r="${r}" class="ti-yeux"></circle><circle cx="70" cy="46" r="${r}" class="ti-yeux"></circle>`;
const trait = (d, epaisseur) => `<path d="${d}" fill="none" class="ti-trait-yeux" stroke-width="${epaisseur}" stroke-linecap="round"></path>`;
const bouchePleine = (d) => `<path d="${d}" class="ti-bouche"></path>`;
const accessoire = (classe, d, epaisseur) => `<path d="${d}" fill="none" class="${classe}" stroke-width="${epaisseur}" stroke-linecap="round"></path>`;
const arcs = trait('M45 47 Q50 41 55 47 M65 47 Q70 41 75 47', 3); // yeux contents (réussite, kihap, jalon)

const PANS_DROITS = pans('M50 66 L36 112 L52 114 L60 70 Z', 'M70 66 L84 112 L68 114 L60 70 Z');
const SOURIRE = trait('M54 56 Q60 60 66 56', 2.5);
const BOUCHE_DOUCE = trait('M55 57 Q60 59 65 57', 2.5);

// Chaque état : la chaîne de ses morceaux, dans l'ordre du dessin (pans, bande, noeud, visage, accessoires).
const DESSINS = {
  attente: () => PANS_DROITS + BANDE + NOEUD + yeuxRonds(4) + SOURIRE,
  reussite: () => pans('M50 66 L22 104 L36 112 L60 70 Z', 'M70 66 L98 104 L84 112 L60 70 Z')
    + BANDE + NOEUD + arcs + bouchePleine('M53 54 Q60 66 67 54 Z'),
  erreur: () => '<g transform="rotate(-7 60 50)">'
    + pans('M52 66 L48 112 L62 114 L60 70 Z', 'M68 66 L74 110 L60 114 L60 70 Z')
    + BANDE + NOEUD + trait('M45 38 Q50 35 55 38 M65 38 Q70 35 75 38', 2.5) + yeuxRonds(4) + BOUCHE_DOUCE
    + '</g>',
  salut: () => PANS_DROITS
    + '<g transform="translate(0 8)">' + BANDE + NOEUD + trait('M45 47 L55 47 M65 47 L75 47', 3) + BOUCHE_DOUCE + '</g>',
  kihap: () => pans('M50 66 L14 96 L28 108 L60 70 Z', 'M70 66 L106 96 L92 108 L60 70 Z')
    + BANDE + NOEUD + arcs + bouchePleine('M51 52 Q60 70 69 52 Z')
    + accessoire('ti-choc', 'M30 18 L36 28 M60 6 L60 20 M90 18 L84 28', 4),
  // Les pans levés en V passent derrière la bande : ils sont dessinés avant elle, comme dans tous les états.
  jalon: () => pans('M50 60 L30 20 L44 14 L60 58 Z', 'M70 60 L90 20 L76 14 L60 58 Z')
    + BANDE + NOEUD + arcs + bouchePleine('M53 54 Q60 66 67 54 Z')
    + accessoire('ti-etoile', 'M14 76 L14 88 M8 82 L20 82 M106 76 L106 88 M100 82 L112 82 M18 18 L18 26 M14 22 L22 22 M102 18 L102 26 M98 22 L106 22', 3),
  coffre: () => PANS_DROITS + BANDE + NOEUD + yeuxRonds(5) + '<circle cx="60" cy="57" r="4" class="ti-bouche"></circle>'
    + accessoire('ti-etoile', 'M20 22 L26 30 M100 22 L94 30 M60 8 L60 18', 3),
  sommeil: () => pans('M50 66 L30 100 L44 106 L60 70 Z', 'M70 66 L90 100 L76 106 L60 70 Z')
    + BANDE + NOEUD + trait('M45 45 Q50 50 55 45 M65 45 Q70 50 75 45', 3) + trait('M55 57 Q60 60 65 57', 2.5)
    + '<text x="92" y="24" font-size="14" font-weight="900" class="ti-z">z</text>'
    + '<text x="104" y="12" font-size="11" font-weight="900" class="ti-z">z</text>',
};

// svgTi('reussite') : la chaîne SVG de Ti dans cet état. Un état, une ceinture ou une taille
// inconnus échouent tout de suite en nommant la valeur reçue (rien n'est dessiné de travers).
export function svgTi(etat, { taille = 96, ceinture = 'blanche' } = {}) {
  if (!ETATS_TI.includes(etat)) throw new Error(`svgTi : état inconnu « ${String(etat)} » (attendu : ${ETATS_TI.join(', ')})`);
  if (!CEINTURES.includes(ceinture)) throw new Error(`svgTi : ceinture inconnue « ${String(ceinture)} » (attendu : ${CEINTURES.join(', ')})`);
  if (!Number.isFinite(taille) || taille <= 0) throw new Error(`svgTi : taille invalide « ${String(taille)} » (un nombre de pixels positif)`);
  return `<svg class="ti ti-${etat} ti--${ceinture}" viewBox="0 0 120 120" width="${taille}" height="${taille}" aria-hidden="true" focusable="false">`
    + DESSINS[etat]() + '</svg>';
}
