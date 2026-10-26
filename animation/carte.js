// Kihapp, animation/carte.js (lots K13 puis K15)
// La carte du sol (vue du plafond) de la page du 14/10, rendue en chaîne SVG.
// Les repères de pas (un rond numéroté par pas) sont recalculés à chaque appel :
// quelques dizaines de mouvements, c'est trop peu pour justifier un état gardé.
// Même arrondi (f1) que la page : le filet est rendu_test.js (empreintes de #map).
// Depuis le lot K15, le cadre couvre le tracé entier du poomsae (viewBox
// 0 0 280 310 dans index.html, bas du cadre à z = -0,9) et chaque mouvement
// déclare lui-même où son rond se dessine (`repere`).
// Module pur : aucun DOM, aucune horloge.

import { arrowHead, D, f1 } from './geometrie.js';

const MM = { x0: -1.4, z1: 2.2, K: 100 };
const mm = (x, z) => [(x - MM.x0) * MM.K, (MM.z1 - z) * MM.K];

// Un repère par mouvement qui pose un pied, à la place que le mouvement déclare ;
// un mouvement sans pied (les pieds ne bougent pas) s'ajoute au repère du
// précédent (« 5·6 »).
function reperes(mouvements) {
  const markers = [];
  mouvements.forEach((m) => {
    if (m.foot) {
      if (!m.repere) throw new Error(`carte : le mouvement ${m.id} pose un pied mais n'a pas de repere`);
      markers.push({ nums: [m.num], x: m.repere.x, z: m.repere.z });
    }
    else markers[markers.length - 1].nums.push(m.num);
  });
  return markers;
}

// `f` : l'état du bonhomme (frameAt), `chrono` : la chronologie (ses mouvements).
export function renderMap(f, chrono) {
  let s = '';
  const ln = (a, b, cls, w, extra = '') => { const p = mm(a[0], a[1]), q = mm(b[0], b[1]); return `<line class="${cls}" x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke-width="${w}"${extra}/>`; };
  s += ln([0, -0.35], [0, 1.48], 'mark', 3);
  s += ln([-1.05, -0.08], [1.05, -0.08], 'mark', 8) + ln([-1.05, 0.7], [1.05, 0.7], 'mark', 8) + ln([-1.05, 1.48], [1.05, 1.48], 'mark', 8, ' stroke-dasharray="2 10"');
  const tx = (x, z, txt, cls, anchor = 'middle') => { const p = mm(x, z); return `<text class="${cls}" x="${f1(p[0])}" y="${f1(p[1])}" text-anchor="${anchor}">${txt}</text>`; };
  s += tx(0, 2.05, 'avant de la salle ↑', 'lab');
  s += tx(1.12, -0.04, '1', 'lab', 'start') + tx(1.12, 0.74, '2', 'lab', 'start') + tx(1.12, 1.52, '3', 'lab', 'start');
  s += tx(0.1, -0.36, 'départ', 'lab', 'start');
  const st = mm(0, 0);
  s += `<circle class="mk" cx="${f1(st[0])}" cy="${f1(st[1])}" r="4"/>`;
  const curNum = f.m ? f.m.num : 0;
  for (const mk of reperes(chrono.mouvements)) {
    const p = mm(mk.x, mk.z), on = mk.nums.includes(curNum) ? ' on' : '';
    const label = mk.nums.join('·'), r = mk.nums.length > 1 ? 13 : 10;
    s += `<circle class="mk${on}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}"/><text class="mkt${on}" x="${f1(p[0])}" y="${f1(p[1] + 4)}" text-anchor="middle">${label}</text>`;
  }
  // Le retour Baro n'a pas de rond numéroté : un libellé à gauche du pied gauche final.
  if (chrono.arrivee) s += tx(chrono.arrivee.to.L.x - 0.30, chrono.arrivee.to.L.z, 'fin', 'lab');
  const fpoly = (x, z, a, cls) => {
    const d = [Math.sin(a * D), Math.cos(a * D)], r = [Math.cos(a * D), -Math.sin(a * D)];
    const at = (fd, fr) => mm(x + d[0] * fd + r[0] * fr, z + d[1] * fd + r[1] * fr);
    return `<polygon class="${cls}" points="${[at(-0.07, -0.045), at(-0.07, 0.045), at(0.17, 0.055), at(0.2, 0), at(0.17, -0.055)].map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')}"/>`;
  };
  if (f.ghost) s += fpoly(f.ghost.x, f.ghost.z, f.ghost.a, f.ghost.k === 'L' ? 'ghostl' : 'ghostr');
  s += fpoly(f.feet.L.x, f.feet.L.z, f.feet.L.a, 'footl') + fpoly(f.feet.R.x, f.feet.R.z, f.feet.R.a, 'footr');
  const c = mm(f.pel.x, f.pel.z), fd = [Math.sin(f.th * D), Math.cos(f.th * D)], e = mm(f.pel.x + fd[0] * 0.38, f.pel.z + fd[1] * 0.38);
  s += `<line class="face" x1="${f1(c[0])}" y1="${f1(c[1])}" x2="${f1(e[0])}" y2="${f1(e[1])}"/>` + arrowHead(c, e, 9, 'faceh');
  return s;
}
