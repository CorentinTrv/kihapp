// Kihapp, animation/geometrie.js (lot K12)
// Calculs vectoriels et squelette du bonhomme, sortis à l'identique de la page
// du 14/10 (context/import/taekwondo/page-taegeuk-il-jang-14-10/index.html).
// Le corps de chaque fonction est recopié tel quel, dans le même ordre
// d'opérations : les nombres flottants doivent tomber au même dixième que dans
// la page, c'est ce que vérifieront les empreintes (lot K13).
// Module pur : aucun DOM, aucune horloge.

export const D = Math.PI / 180;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len = (a) => Math.sqrt(dot(a, a));
export const lerp = (a, b, u) => a + (b - a) * u;
export const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smooth = (u) => u * u * (3 - 2 * u);
export const easeOut = (u) => 1 - Math.pow(1 - u, 3);
export const f1 = (v) => v.toFixed(1);

// Cinématique inverse à deux segments : renvoie la position du coude (ou du
// genou) pour une épaule A, une main Tg, des segments l1 et l2, et un pôle qui
// dit de quel côté le coude se plie.
export function ik(A, Tg, l1, l2, pole) {
  const v = sub(Tg, A);
  let d = len(v) || 1e-6;
  const dir = mul(v, 1 / d);
  d = clamp(d, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  let p = sub(pole, mul(dir, dot(pole, dir)));
  const pl = len(p);
  p = pl < 1e-6 ? [0, 0, 1] : mul(p, 1 / pl);
  return add(add(A, mul(dir, a)), mul(p, hh));
}

// Les articulations en 3D, dans la salle.
export function joints(f) {
  const th = f.th * D, fw = [Math.sin(th), 0, Math.cos(th)], rt = [Math.cos(th), 0, -Math.sin(th)], up = [0, 1, 0];
  const pel = [f.pel.x, f.pel.h, f.pel.z];
  const W = (l) => add(add(add(pel, mul(rt, l[0])), mul(up, l[1])), mul(fw, l[2]));
  const J = { pel, hipL: W([-0.09, 0, 0]), hipR: W([0.09, 0, 0]), neck: W([0, 0.52, 0]), shL: W([-0.19, 0.5, 0]), shR: W([0.19, 0.5, 0]), head: W([0, 0.68, 0]) };
  J.ankL = [f.feet.L.x, 0.08 + f.feet.L.lift, f.feet.L.z];
  J.ankR = [f.feet.R.x, 0.08 + f.feet.R.lift, f.feet.R.z];
  J.kneeL = ik(J.hipL, J.ankL, 0.42, 0.42, add(fw, mul(rt, -0.15)));
  J.kneeR = ik(J.hipR, J.ankR, 0.42, 0.42, add(fw, mul(rt, 0.15)));
  const elPole = (side, hl) => {
    const w = clamp((0.18 - hl[2]) / 0.18, 0, 1);
    return add(add(mul(up, -1), mul(rt, side * 0.5)), mul(fw, -0.9 * w));
  };
  J.hL = W(f.LH);
  J.hR = W(f.RH);
  J.elL = ik(J.shL, J.hL, 0.3, 0.29, elPole(-1, f.LH));
  J.elR = ik(J.shR, J.hR, 0.3, 0.29, elPole(1, f.RH));
  const gd = [Math.sin(f.gaze * D), 0, Math.cos(f.gaze * D)];
  J.nose = add(J.head, mul(gd, 0.17));
  J.gd = gd;
  return J;
}

// Les sept points du contour d'un pied posé en (x, z), orteils vers l'angle a
// (degrés), à la hauteur y.
export function footPts(x, z, a, y) {
  const d = [Math.sin(a * D), 0, Math.cos(a * D)], r = [Math.cos(a * D), 0, -Math.sin(a * D)], c = [x, y, z];
  const at = (fd, fr) => add(add(c, mul(d, fd)), mul(r, fr));
  return [at(-0.07, -0.04), at(-0.08, 0), at(-0.07, 0.04), at(0.15, 0.05), at(0.19, 0.01), at(0.18, -0.03), at(0.15, -0.05)];
}

// Pointe de flèche SVG au bout du segment p1 -> p2.
export function arrowHead(p1, p2, size, cls) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  const b = [p2[0] - ux * size, p2[1] - uy * size], n = [-uy * size * 0.55, ux * size * 0.55];
  return `<polygon class="${cls}" points="${f1(p2[0])},${f1(p2[1])} ${f1(b[0] + n[0])},${f1(b[1] + n[1])} ${f1(b[0] - n[0])},${f1(b[1] - n[1])}"/>`;
}
