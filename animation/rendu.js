// Kihapp, animation/rendu.js (lot K13)
// Le dessin de la scène de la page du 14/10, sorti de son IIFE : chaque
// fonction RENDUE UNE CHAÎNE SVG au lieu d'écrire dans le DOM. La caméra, qui
// vivait dans des variables de la fermeture, arrive en paramètre
// ({ camOff, elev, flip, follow }). Les corps de fonction sont recopiés dans le
// même ordre d'opérations flottantes que la page, avec le même arrondi (f1) :
// le filet est rendu_test.js, qui compare ces chaînes aux 408 empreintes de
// fixtures/empreintes_K14.json (au lot K13 : celles de la page originale ; depuis
// K14, celles produites par outils/empreintes-k14.mjs).
// Module pur : aucun DOM, aucune horloge.

import { add, arrowHead, clamp, D, dot, f1, footPts, joints, lerp, mul, sub } from './geometrie.js';
import { frameAt } from './chronologie.js';

/* Caméras : off = angle autour du bonhomme (0 = derrière lui), el = hauteur, flip = image inversée comme un miroir */
export const CAMERAS = {
  miroir: { off: 180, el: 9, flip: true },
  tq: { off: 35, el: 16, flip: false },
  dos: { off: 0, el: 10, flip: false },
  cote: { off: -90, el: 5, flip: false },
  dessus: { off: 0, el: 88, flip: false },
};

// La caméra à passer à renderScene pour un réglage de la page : le nom du point
// de vue et la case « La caméra tourne avec toi ».
export function cameraDe(nom, suit) {
  const c = CAMERAS[nom];
  if (!c) throw new Error(`cameraDe : point de vue inconnu « ${nom} »`);
  return { camOff: c.off, elev: c.el, flip: c.flip, follow: suit };
}

const S = 160;

export function makeProj(f, camera) {
  const { camOff, elev, flip, follow } = camera;
  const yaw = ((follow ? f.th : 0) + camOff) * D, e = elev * D, fx = flip ? -1 : 1;
  const h = [Math.sin(yaw), 0, Math.cos(yaw)];
  const cr = [Math.cos(yaw), 0, -Math.sin(yaw)], cu = [h[0] * Math.sin(e), Math.cos(e), h[2] * Math.sin(e)], cd = [h[0] * Math.cos(e), -Math.sin(e), h[2] * Math.cos(e)];
  const anchor = [f.pel.x, 0, f.pel.z], cx = 300, cy = lerp(338, 205, elev / 88);
  const P = (w) => { const v = sub(w, anchor); return [cx + fx * dot(v, cr) * S, cy - dot(v, cu) * S, dot(v, cd)]; };
  return { P, anchor, pd: P([f.pel.x, f.pel.h, f.pel.z])[2] };
}

const polyOf = (P, pts, cls) => `<polygon class="${cls}" points="${pts.map((p) => { const q = P(p); return f1(q[0]) + ',' + f1(q[1]); }).join(' ')}"/>`;
const segOf = (P, a, b, cls, w, extra = '') => { const pa = P(a), pb = P(b); return `<line class="${cls}" x1="${f1(pa[0])}" y1="${f1(pa[1])}" x2="${f1(pb[0])}" y2="${f1(pb[1])}"${w ? ` stroke-width="${w}"` : ''}${extra}/>`; };

// Le sol : grille, tracé des pieds, flèche du regard, fantôme du pied, pieds.
export function floorSvg(f, pr, labels) {
  const { P, anchor } = pr;
  let fl = '';
  const ax = anchor[0], az = anchor[2], R = 2.6;
  for (let g = Math.ceil((ax - R) * 2) / 2; g <= ax + R; g += 0.5) fl += segOf(P, [g, 0, az - R], [g, 0, az + R], 'grid');
  for (let g = Math.ceil((az - R) * 2) / 2; g <= az + R; g += 0.5) fl += segOf(P, [ax - R, 0, g], [ax + R, 0, g], 'grid');
  fl += segOf(P, [0, 0, -0.35], [0, 0, 1.48], 'mark', 4);
  for (const z of [-0.08, 0.7, 1.48]) fl += segOf(P, [-1.05, 0, z], [1.05, 0, z], 'mark', 9);
  if (labels) { const fr = P([ax, 0, az + 1.9]); fl += `<text class="lab" x="${f1(fr[0])}" y="${f1(fr[1])}" text-anchor="middle">avant de la salle</text>`; }
  // Regard
  const gd = [Math.sin(f.gaze * D), 0, Math.cos(f.gaze * D)];
  const g0 = [f.pel.x + gd[0] * 0.25, 0, f.pel.z + gd[2] * 0.25], g1 = add(g0, mul(gd, 0.9));
  // Allumé là où la tête tourne : la phase B d'un mouvement qui tourne (depuis K14b, plus de phase A).
  const on = (f.s.ph === 'B' && f.m && f.m.turn) ? ' on' : '';
  const pg0 = P(g0), pg1 = P(g1);
  fl += `<line class="gz${on}" x1="${f1(pg0[0])}" y1="${f1(pg0[1])}" x2="${f1(pg1[0])}" y2="${f1(pg1[1])}"/>` + arrowHead(pg0, pg1, 12, 'gzh' + on);
  if (on && labels) { fl += `<text class="labk" x="${f1(pg1[0] + 14)}" y="${f1(pg1[1] + 4)}" text-anchor="start">regard</text>`; }
  if (f.ghost) fl += polyOf(P, footPts(f.ghost.x, f.ghost.z, f.ghost.a, 0), f.ghost.k === 'L' ? 'ghostl' : 'ghostr');
  fl += polyOf(P, footPts(f.feet.L.x, f.feet.L.z, f.feet.L.a, f.feet.L.lift), 'footl');
  fl += polyOf(P, footPts(f.feet.R.x, f.feet.R.z, f.feet.R.a, f.feet.R.lift), 'footr');
  return fl;
}

// Le bonhomme pâle de la position de départ du mouvement (derrière le vrai).
export function ghostSvg(J, P) {
  const L = (a, b, w) => segOf(P, a, b, 'gh', w);
  let s = polyOf(P, [J.shL, J.shR, J.hipR, J.hipL], 'ghf');
  s += L(J.hipL, J.kneeL, 7) + L(J.kneeL, J.ankL, 6) + L(J.hipR, J.kneeR, 7) + L(J.kneeR, J.ankR, 6);
  s += L(J.shL, J.elL, 6) + L(J.elL, J.hL, 5) + L(J.shR, J.elR, 6) + L(J.elR, J.hR, 5);
  const ph = P(J.head), hl = P(J.hL), hr = P(J.hR);
  s += `<circle class="gh" cx="${f1(ph[0])}" cy="${f1(ph[1])}" r="${f1(0.1 * S)}" stroke-width="3"/><circle class="ghf" cx="${f1(hl[0])}" cy="${f1(hl[1])}" r="8"/><circle class="ghf" cx="${f1(hr[0])}" cy="${f1(hr[1])}" r="8"/>`;
  return s;
}

// Le bonhomme : os, articulations, poings, tête ; trié du plus loin au plus près.
export function figureSvg(J, pr) {
  const { P, pd } = pr;
  const items = [];
  const fade = (d) => clamp(1 - (d - pd) * 1.3, 0.5, 1);
  const L = (a, b, cls, w) => { const pa = P(a), pb = P(b), d = (pa[2] + pb[2]) / 2; items.push({ d, svg: `<line class="${cls}" x1="${f1(pa[0])}" y1="${f1(pa[1])}" x2="${f1(pb[0])}" y2="${f1(pb[1])}" stroke-width="${w}" opacity="${fade(d).toFixed(2)}"/>` }); };
  const C = (c, r, cls, extra = '') => { const pc = P(c), d = pc[2]; items.push({ d, svg: `<circle class="${cls}" cx="${f1(pc[0])}" cy="${f1(pc[1])}" r="${f1(r)}" opacity="${fade(d).toFixed(2)}"${extra}/>` }); };
  const tp = [J.shL, J.shR, J.hipR, J.hipL].map(P);
  const td = tp.reduce((a, q) => a + q[2], 0) / 4;
  items.push({ d: td, svg: `<polygon class="torso" points="${tp.map((q) => f1(q[0]) + ',' + f1(q[1])).join(' ')}"/>` });
  L(J.hipL, J.kneeL, 'l', 10); L(J.kneeL, J.ankL, 'l', 9); C(J.kneeL, 5, 'fl');
  L(J.hipR, J.kneeR, 'r', 10); L(J.kneeR, J.ankR, 'r', 9); C(J.kneeR, 5, 'fr');
  L(J.shL, J.elL, 'l', 9); L(J.elL, J.hL, 'l', 8); C(J.elL, 4.5, 'fl'); C(J.hL, 10, 'fist fl');
  L(J.shR, J.elR, 'r', 9); L(J.elR, J.hR, 'r', 8); C(J.elR, 4.5, 'fr'); C(J.hR, 10, 'fist fr');
  const ph = P(J.head), pn = P(J.nose);
  items.push({ d: ph[2], svg: `<circle class="hd" cx="${f1(ph[0])}" cy="${f1(ph[1])}" r="${f1(0.1 * S)}"/><line class="k" x1="${f1(ph[0])}" y1="${f1(ph[1])}" x2="${f1(pn[0])}" y2="${f1(pn[1])}" stroke-width="4"/>` });
  items.sort((a, b) => b.d - a.d);
  return items.map((i) => i.svg).join('');
}

// Une flèche de trajet : le chemin d'un point du corps (choisi par `pick`)
// entre les instants tA et tB. Rien si le chemin est trop court pour se voir.
export function trailSvg(chrono, P, tA, tB, pick, cls, strong) {
  const n = 16, pts = [];
  for (let i = 0; i <= n; i++) { const J = joints(frameAt(chrono, tA + (tB - tA) * i / n)); pts.push(P(pick(J))); }
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (l < 14) return '';
  const d = pts.map((q, i) => (i ? 'L' : 'M') + f1(q[0]) + ' ' + f1(q[1])).join(' ');
  const last = pts[pts.length - 1], before = pts[pts.length - 3];
  const fa = strong ? '' : ' faint';
  return `<path class="trail ${cls}${fa}" d="${d}"/>` + arrowHead(before, last, strong ? 12 : 9, 'th ' + cls + fa);
}

// Les flèches de la scène : `mode` est 'auto' (selon la phase en cours), 'B' ou
// 'C' (forcé, pour les images fixes) ou 'none'. En phase C on garde la
// préparation en pâle.
export function trailsFor(chrono, f, P, mode) {
  const m = f.m;
  if (!m) return '';
  const ph = mode === 'auto' ? f.s.ph : mode;
  if (ph !== 'B' && ph !== 'C') return '';
  const picks = [[(J) => J.hL, 'l'], [(J) => J.hR, 'r']];
  if (m.foot) picks.push([m.foot === 'L' ? ((J) => J.ankL) : ((J) => J.ankR), m.foot === 'L' ? 'l' : 'r']);
  let s = '';
  if (ph === 'C') for (const [pk, c] of picks) s += trailSvg(chrono, P, m.tm0, m.tB, pk, c, false);
  const [a, b] = ph === 'B' ? [m.tm0, m.tB] : [m.tB, m.tm1];
  for (const [pk, c] of picks) s += trailSvg(chrono, P, a, b, pk, c, true);
  return s;
}

// Une scène complète en SVG : la principale (trails 'auto') ou une image fixe
// (flèches forcées). `opts` : { trails, ghost, labels, chrono }. La chronologie
// sert au fantôme (le bonhomme au début du mouvement) et aux flèches.
export function renderScene(f, camera, opts) {
  if (!opts || !opts.chrono) throw new Error('renderScene : opts.chrono manquant (la chronologie sert au fantôme et aux flèches)');
  const { chrono } = opts;
  const pr = makeProj(f, camera), J = joints(f);
  let s = `<g>${floorSvg(f, pr, opts.labels)}</g>`;
  if (opts.ghost && f.m && (f.s.ph === 'B' || f.s.ph === 'C')) s += `<g>${ghostSvg(joints(frameAt(chrono, f.m.tm0)), pr.P)}</g>`;
  s += `<g>${figureSvg(J, pr)}</g>`;
  s += `<g>${trailsFor(chrono, f, pr.P, opts.trails)}</g>`;
  return s;
}
