// Kihapp, animation/chronologie.js (lots K12, K14 puis K15)
// La chronologie de la page du 14/10 sortie de son IIFE : découper les
// mouvements en segments (B pendant le pas, C à la pose, H tiens), puis
// calculer l'état du bonhomme à n'importe quel instant t.
// Depuis K14, plus de phase A « regarde » : la tête tourne pendant la phase B,
// avec les bras (le regard s'interpole sur B), et la phase B d'un mouvement
// sans pied qui bouge (le 6) ne dure que 0,25 s.
// Lot K15 : un mouvement qui porte `kick` monte le genou, frappe et repose le
// pied devant (voir piedsEtBassinDuCoup) ; une chronologie peut finir par un
// retour Baro (troisième paramètre de construireSegments).
// Module pur : aucun DOM, aucune horloge.

import { add, clamp, D, easeOut, lerp, lerp3, mul, smooth } from './geometrie.js';

// Durée de la position de départ (Tchoumbi) avant le premier mouvement.
const DUREE_DEPART = 0.8;
// Durée de la phase B d'un mouvement à coup de pied (0,95 s pour un pas ordinaire).
const DUREE_B_COUP_DE_PIED = 1.6;

// Construit la chronologie. `mouvements` : la liste des mouvements (le tableau
// `mouvements` de contenu/taegeuk_il_jang.js), `depart` : la pose de départ (P0).
// Le nombre de mouvements est la longueur du tableau, rien d'autre.
// On pose des repères de temps sur les mouvements (t0, tm0, tB, tm1, t1, from) :
// on travaille sur des copies, rendues dans `mouvements`, pour ne pas modifier
// l'entrée. Chaque copie porte aussi `num`, le numéro du mouvement
// (numeroKukkiwon), que la carte du sol (carte.js) lit sous ce nom.
// `arrivee` (facultatif) : le retour Baro, { foot, turn, prep, to, txt }. Il
// ajoute ses trois segments B, C, H après le dernier mouvement, calculés comme
// ceux d'un mouvement ordinaire ; sa copie (`num: null`, `fin: true`) est rendue
// à part dans `arrivee`, jamais dans `mouvements` (l'écran et la dictée lisent
// ce tableau).
// Rend { segs, total, bornes, mouvements[, arrivee] } ; `bornes` est la liste
// triée des débuts de segment plus la fin.
export function construireSegments(mouvements, depart, arrivee) {
  const mvs = mouvements.map((m) => ({ ...m, num: m.numeroKukkiwon }));
  const segs = [];
  let T = 0;
  segs.push({ m: null, ph: 'H', t0: 0, t1: (T = DUREE_DEPART), from: depart, to: depart });
  let prev = depart;
  const poser = (m) => {
    m.t0 = T;
    m.from = prev;
    m.tm0 = T;
    segs.push({ m, ph: 'B', t0: T, t1: (T += (m.kick ? DUREE_B_COUP_DE_PIED : m.foot ? 0.95 : 0.25)), from: prev, to: m.to });
    m.tB = T;
    segs.push({ m, ph: 'C', t0: T, t1: (T += 0.3), from: prev, to: m.to });
    m.tm1 = T;
    segs.push({ m, ph: 'H', t0: T, t1: (T += 0.9 + Math.abs(m.to.th - prev.th) / 180 * 0.9), from: prev, to: m.to });
    m.t1 = T;
    prev = m.to;
  };
  mvs.forEach(poser);
  const fin = arrivee ? { ...arrivee, num: null, fin: true } : null;
  if (fin) poser(fin);
  const total = T;
  const bornes = [...new Set(segs.map((s) => s.t0).concat([total]))].sort((a, b) => a - b);
  return fin ? { segs, total, bornes, mouvements: mvs, arrivee: fin } : { segs, total, bornes, mouvements: mvs };
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

// Le coup de pied (lot K15), repéré par la fraction q de la phase B :
// 0 à 0,25 le pied monte à l'armé, 0,25 à 0,4 il frappe, 0,4 à 0,55 il revient
// à l'armé ; ensuite (jusqu'à la fin de C) il descend et se pose devant.
const Q_ARME = 0.25, Q_FRAPPE = 0.4, Q_RETOUR = 0.55;
// Hauteur du bassin pendant le coup de pied (atteinte à Q_ARME, gardée jusqu'à Q_RETOUR).
// 0,88 m est la valeur du fichier de données. Au lot K15 le bassin restait à la place de la pose A,
// la cheville d'appui 0,28 m devant la hanche, et seul 0,87 m était atteignable ; depuis le lot K16b
// le bassin passe au-dessus du pied d'appui, hanche-cheville vaut 0,80 m (0,839 m possibles) et
// 0,88 m tient (comparaison J5 : « Le défaut du coup de pied »).
const H_COUP_DE_PIED = 0.88;
// Écart de la hanche au milieu du bassin, sur la droite du corps : celui de hipL et hipR dans joints().
const DEMI_BASSIN = 0.09;

// Les poings pendant la phase B d'un coup de pied : devant la poitrine (kick.bras)
// du début de l'armé à Q_RETOUR, puis vers la préparation du coup de poing.
function poingsDuCoup(m, A, q) {
  const bras = m.kick.bras;
  if (q < Q_ARME) { const k = smooth(q / Q_ARME); return [lerp3(A.LH, bras.LH, k), lerp3(A.RH, bras.RH, k)]; }
  if (q < Q_RETOUR) return [bras.LH, bras.RH];
  const k = smooth((q - Q_RETOUR) / (1 - Q_RETOUR));
  return [lerp3(bras.LH, m.prep.LH, k), lerp3(bras.RH, m.prep.RH, k)];
}

// Pieds, bassin et orientation du corps d'un mouvement à coup de pied, en phases
// B et C (la tenue H est celle de tout mouvement). Le pied qui frappe (m.foot)
// suit sa cheville : sol, armé, extension, armé, puis sol à to ; le pied d'appui
// ne bouge qu'à partir de Q_RETOUR. Le bassin glisse (jusqu'à Q_ARME, même courbe que la montée) au
// point d'appui, où la hanche d'appui est à la verticale de la cheville d'appui : la jambe d'appui
// reste droite de l'armé au retour. Il monte en même temps à H_COUP_DE_PIED, garde ce point et cette
// hauteur jusqu'à Q_RETOUR, puis rejoint sa place finale avec le même `u` que le pied d'appui. Les points
// d'armé et d'extension sont dans le repère du corps depuis le bassin (comme les
// poings), transformés comme `W` dans joints() avec le bassin et le th de l'instant.
// La hauteur de la cheville passe par `lift` (joints() la lit à 0,08 + lift).
function piedsEtBassinDuCoup(m, A, B, t) {
  const dB = m.tB - m.tm0, q = (t - m.tm0) / dB;
  const tRetour = m.tm0 + Q_RETOUR * dB;
  const u = smooth(clamp((t - tRetour) / (m.tm1 - tRetour), 0, 1));
  const pa = pelv(A), pb = pelv(B);
  // Le point d'appui : hipL = bassin - DEMI_BASSIN x rt, hipR = bassin + DEMI_BASSIN x rt (rt de A).
  const rtA = [Math.cos(A.th * D), 0, -Math.sin(A.th * D)], sens = m.foot === 'R' ? 1 : -1, cA = A[m.foot === 'R' ? 'L' : 'R'];
  const app = { x: cA.x + sens * DEMI_BASSIN * rtA[0], z: cA.z + sens * DEMI_BASSIN * rtA[2] };
  const avance = smooth(clamp(q / Q_ARME, 0, 1));
  const monte = { x: lerp(pa.x, app.x, avance), z: lerp(pa.z, app.z, avance), h: lerp(A.h, H_COUP_DE_PIED, avance) };
  const pel = { x: lerp(monte.x, pb.x, u), z: lerp(monte.z, pb.z, u), h: lerp(monte.h, pb.h, u) };
  const th = lerp(A.th, B.th, u);
  const fw = [Math.sin(th * D), 0, Math.cos(th * D)], rt = [Math.cos(th * D), 0, -Math.sin(th * D)];
  // Un point du corps -> [x, lift, z] dans la salle (lift = hauteur de la cheville au dessus de sa pose au sol).
  const W = (l) => {
    const p = add(add(add([pel.x, pel.h, pel.z], mul(rt, l[0])), mul([0, 1, 0], l[1])), mul(fw, l[2]));
    return [p[0], p[1] - 0.08, p[2]];
  };
  const k = m.foot;
  const arme = W(m.kick.arme), extension = W(m.kick.extension);
  let c, a;
  if (q < Q_ARME) { const e = smooth(q / Q_ARME); c = lerp3([A[k].x, 0, A[k].z], arme, e); a = lerp(A[k].a, th, e); }
  else if (q < Q_FRAPPE) { c = lerp3(arme, extension, smooth((q - Q_ARME) / (Q_FRAPPE - Q_ARME))); a = th; }
  else if (q < Q_RETOUR) { c = lerp3(extension, arme, smooth((q - Q_FRAPPE) / (Q_RETOUR - Q_FRAPPE))); a = th; }
  else { c = lerp3(arme, [B[k].x, 0, B[k].z], u); a = lerp(th, B[k].a, u); }
  const feet = {};
  for (const n of ['L', 'R']) {
    feet[n] = n === k
      ? { x: c[0], z: c[2], a, lift: c[1] }
      : { x: lerp(A[n].x, B[n].x, u), z: lerp(A[n].z, B[n].z, u), a: lerp(A[n].a, B[n].a, u), lift: 0 };
  }
  return { feet, pel, th };
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
    if (s.ph === 'B') { u = mu; const k = smooth(lt); gaze = lerp(A.gaze, B.gaze, k); LH = lerp3(A.LH, m.prep.LH, k); RH = lerp3(A.RH, m.prep.RH, k); if (m.kick) [LH, RH] = poingsDuCoup(m, A, lt); }
    else if (s.ph === 'C') {
      u = mu; gaze = B.gaze; const k = easeOut(lt), b = Math.sin(Math.PI * k);
      LH = lerp3(m.prep.LH, B.LH, k); RH = lerp3(m.prep.RH, B.RH, k);
      if (m.arc) { if (m.arc.LH) LH = add(LH, mul(m.arc.LH, b)); if (m.arc.RH) RH = add(RH, mul(m.arc.RH, b)); }
    }
    else { u = 1; gaze = B.gaze; LH = B.LH; RH = B.RH; cam = lerp(A.th, B.th, smooth(lt)); }
  }
  let feet = {}, pel, th;
  if (m && m.kick && s.ph !== 'H') ({ feet, pel, th } = piedsEtBassinDuCoup(m, A, B, t));
  else {
    for (const k of ['L', 'R']) feet[k] = { x: lerp(A[k].x, B[k].x, u), z: lerp(A[k].z, B[k].z, u), a: lerp(A[k].a, B[k].a, u), lift: (m && m.foot === k) ? 0.07 * Math.sin(Math.PI * u) : 0 };
    const pa = pelv(A), pb = pelv(B);
    pel = { x: lerp(pa.x, pb.x, u), z: lerp(pa.z, pb.z, u), h: lerp(pa.h, pb.h, u) };
    th = lerp(A.th, B.th, u);
  }
  const ghost = (m && m.foot && s.ph === 'B') ? { k: m.foot, x: B[m.foot].x, z: B[m.foot].z, a: B[m.foot].a } : null;
  return { s, m, feet, pel, th, gaze, LH, RH, cam, ghost };
}
