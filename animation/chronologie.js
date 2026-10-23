// Kihapp, animation/chronologie.js (lots K12 puis K14)
// La chronologie de la page du 14/10 sortie de son IIFE : découper les
// mouvements en segments (B pendant le pas, C à la pose, H tiens), puis
// calculer l'état du bonhomme à n'importe quel instant t.
// Depuis K14, plus de phase A « regarde » : la tête tourne pendant la phase B,
// avec les bras (le regard s'interpole sur B), et la phase B d'un mouvement
// sans pied qui bouge (le 6) ne dure que 0,25 s.
// Module pur : aucun DOM, aucune horloge.

import { add, clamp, D, easeOut, lerp, lerp3, mul, smooth } from './geometrie.js';

// Durée de la position de départ (Tchoumbi) avant le premier mouvement.
const DUREE_DEPART = 0.8;

// Construit la chronologie. `mouvements` : la liste des mouvements (le tableau
// `mouvements` de contenu/taegeuk_il_jang.js), `depart` : la pose de départ (P0).
// Le nombre de mouvements est la longueur du tableau, rien d'autre.
// On pose des repères de temps sur les mouvements (t0, tm0, tB, tm1, t1, from) :
// on travaille sur des copies, rendues dans `mouvements`, pour ne pas modifier
// l'entrée. Chaque copie porte aussi `num`, le numéro du mouvement
// (numeroKukkiwon), que la carte du sol (carte.js) lit sous ce nom.
// Rend { segs, total, bornes, mouvements } ; `bornes` est la liste triée des
// débuts de segment plus la fin.
export function construireSegments(mouvements, depart) {
  const mvs = mouvements.map((m) => ({ ...m, num: m.numeroKukkiwon }));
  const segs = [];
  let T = 0;
  segs.push({ m: null, ph: 'H', t0: 0, t1: (T = DUREE_DEPART), from: depart, to: depart });
  let prev = depart;
  mvs.forEach((m) => {
    m.t0 = T;
    m.from = prev;
    m.tm0 = T;
    segs.push({ m, ph: 'B', t0: T, t1: (T += (m.foot ? 0.95 : 0.25)), from: prev, to: m.to });
    m.tB = T;
    segs.push({ m, ph: 'C', t0: T, t1: (T += 0.3), from: prev, to: m.to });
    m.tm1 = T;
    segs.push({ m, ph: 'H', t0: T, t1: (T += 0.9 + Math.abs(m.to.th - prev.th) / 180 * 0.9), from: prev, to: m.to });
    m.t1 = T;
    prev = m.to;
  });
  const total = T;
  const bornes = [...new Set(segs.map((s) => s.t0).concat([total]))].sort((a, b) => a - b);
  return { segs, total, bornes, mouvements: mvs };
}

// Position du bassin pour une pose : milieu des pieds, décalé vers l'avant du
// corps de `shift`.
function pelv(p) {
  const f = [Math.sin(p.th * D), 0, Math.cos(p.th * D)];
  return { x: (p.L.x + p.R.x) / 2 + f[0] * p.shift, z: (p.L.z + p.R.z) / 2 + f[2] * p.shift, h: p.h };
}

// Le segment en cours à l'instant t (le dernier segment au delà de la fin).
export function segAt(chrono, t) {
  for (const s of chrono.segs) if (t < s.t1 - 1e-9) return s;
  return chrono.segs[chrono.segs.length - 1];
}

// L'état du bonhomme à l'instant t : pieds, bassin, poings, regard, fantôme du
// pied qui va se poser.
export function frameAt(chrono, t) {
  const s = segAt(chrono, t), m = s.m, A = s.from, B = s.to;
  const lt = clamp((t - s.t0) / (s.t1 - s.t0), 0, 1);
  let u = 0, LH = A.LH, RH = A.RH, gaze = A.gaze, cam = A.th;
  if (m) {
    const mu = smooth(clamp((t - m.tm0) / (m.tm1 - m.tm0), 0, 1));
    // Pendant le pas, la tête tourne avec les bras (même courbe qu'eux).
    if (s.ph === 'B') { u = mu; const k = smooth(lt); gaze = lerp(A.gaze, B.gaze, k); LH = lerp3(A.LH, m.prep.LH, k); RH = lerp3(A.RH, m.prep.RH, k); }
    else if (s.ph === 'C') {
      u = mu; gaze = B.gaze; const k = easeOut(lt), b = Math.sin(Math.PI * k);
      LH = lerp3(m.prep.LH, B.LH, k); RH = lerp3(m.prep.RH, B.RH, k);
      if (m.arc) { if (m.arc.LH) LH = add(LH, mul(m.arc.LH, b)); if (m.arc.RH) RH = add(RH, mul(m.arc.RH, b)); }
    }
    else { u = 1; gaze = B.gaze; LH = B.LH; RH = B.RH; cam = lerp(A.th, B.th, smooth(lt)); }
  }
  const feet = {};
  for (const k of ['L', 'R']) feet[k] = { x: lerp(A[k].x, B[k].x, u), z: lerp(A[k].z, B[k].z, u), a: lerp(A[k].a, B[k].a, u), lift: (m && m.foot === k) ? 0.07 * Math.sin(Math.PI * u) : 0 };
  const pa = pelv(A), pb = pelv(B);
  const pel = { x: lerp(pa.x, pb.x, u), z: lerp(pa.z, pb.z, u), h: lerp(pa.h, pb.h, u) };
  const ghost = (m && m.foot && s.ph === 'B') ? { k: m.foot, x: B[m.foot].x, z: B[m.foot].z, a: B[m.foot].a } : null;
  return { s, m, feet, pel, th: lerp(A.th, B.th, u), gaze, LH, RH, cam, ghost };
}
