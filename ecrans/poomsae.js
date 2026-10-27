// Kihapp, ecrans/poomsae.js (lots K13, K14 puis K16) : l'écran #poomsae, la page
// animée du 14/10 (Taegueug Il Jang) dans l'app. Mêmes contrôles et mêmes
// vitesses. Les dessins viennent de animation/rendu.js et animation/carte.js
// (qui rendent des chaînes SVG), la caméra est un objet passé en paramètre, et
// la boucle d'animation s'arrête quand on quitte l'écran.
// Depuis K14, le contenu vient de contenu/taegeuk_il_jang.js (au format du
// contenu) : les noms des mouvements sont ceux du vocabulaire, en graphie
// FFTDA, et un mouvement a deux temps comptés, 1 (pendant le pas) et 2 (la
// pose), puis « Tiens ».
// Depuis K16, tout le poomsae : ses mouvements et le retour Baro (TAEGEUK_IL_JANG.arrivee, qui n'a
// ni technique ni numéro) : le titre de la liste compte les mouvements du contenu, un
// mouvement à coup de pied (14 et 16) porte deux techniques dans son nom et montre sa
// frappe à l'image 2.
//
// initialiserPoomsae(racine) : à appeler à chaque affichage de l'écran. Le
// premier appel construit tout ; les suivants relancent seulement la boucle.
// arreterPoomsae() : à appeler quand on quitte l'écran (coupe la boucle
// requestAnimationFrame, la lecture en cours et la voix).

import { construireSegments, frameAt } from '../animation/chronologie.js';
import { clamp } from '../animation/geometrie.js';
import { cameraDe, renderScene } from '../animation/rendu.js';
import { renderMap } from '../animation/carte.js';
import { TAEGEUK_IL_JANG } from '../contenu/taegeuk_il_jang.js';
import { VOCABULAIRE } from '../contenu/vocabulaire.js';

let ecran = null; // l'écran construit (un seul dans l'app)

// Un élément du vocabulaire par son id ; échoue tôt s'il manque (un test le garantit).
function voc(id) {
  const e = VOCABULAIRE.find((x) => x.id === id);
  if (!e) throw new Error(`poomsae : « ${id} » est absent du vocabulaire`);
  return e;
}

// Un coup de poing (…jileugui) ou un blocage : le bandeau des temps ne les nomme pas pareil.
// Le retour Baro (m.fin) n'a pas de technique : ni l'un ni l'autre.
const estCoup = (m) => !m.fin && m.technique.endsWith('jileugui');
const NUMERO_DU_TEMPS = { B: 1, C: 2 };

// Le libellé d'un temps (sans son numéro) : « Prépare, pendant le pas », « Frappe »...
function libelleDuTemps(m, ph) {
  if (m.fin) return ph === 'B' ? 'Demi-tour, le pied gauche fait le tour' : 'Le pied se pose, poings devant la ceinture';
  if (ph === 'B') {
    if (m.kick) return 'Le coup de pied, puis le bras se relâche devant';
    if (!estCoup(m)) return 'Prépare, pendant le pas';
    return m.foot ? 'Le pas, le bras se relâche devant' : `Le bras ${AUTRE_BRAS[m.cote]} monte au centre`;
  }
  return (estCoup(m) ? 'Frappe' : 'Bloque') + (m.foot ? ', à la pose du pied' : '');
}

// Le bras qui monte devant n'est pas celui qui frappe (cote : « gauche » ou « droite », comme le côté) : « bras » est masculin.
const AUTRE_BRAS = { gauche: 'droit', droite: 'gauche' };

// Les noms d'un mouvement : { fftda, hangeul } de sa technique ; un mouvement à deux techniques
// (le 14 et le 16 : coup de pied, puis coup de poing) les nomme dans l'ordre, séparées par une virgule.
function techniqueAffichee(m) {
  const t = voc(m.technique);
  if (!m.avant) return { fftda: t.fftda, hangeul: t.hangeul };
  const a = voc(m.avant);
  return { fftda: `${a.fftda}, puis ${t.fftda}`, hangeul: `${a.hangeul}, ${t.hangeul}` };
}

// Le sous-titre d'un mouvement : graphie FFTDA de la technique, puis de la position. Ni le côté ni la précision.
// Dans la liste, la ligne 2 ne porte que la position et la précision a sa propre ligne, en petit.
const nomDuMouvement = (m) => (m.fin ? `${voc('naranhi-seugui').fftda}, retour à la position de départ` : `${techniqueAffichee(m).fftda} · ${voc(m.position).fftda}`);

export function initialiserPoomsae(racine) {
  if (!ecran || ecran.racine !== racine) ecran = creerEcran(racine);
  ecran.reprendre();
}

export function arreterPoomsae() {
  if (ecran) ecran.arreter();
}

function creerEcran(racine) {
  const $ = (id) => racine.querySelector('#' + id);
  const chrono = construireSegments(TAEGEUK_IL_JANG.mouvements, TAEGEUK_IL_JANG.depart, TAEGEUK_IL_JANG.arrivee);
  const { segs, total: TOTAL, bornes: BOUNDS, mouvements } = chrono;

  let camera = cameraDe('miroir', true);
  let repeat = false, voice = false;
  let t = 0, playing = false, speed = 0.5, stopAt = null, last = null, dirty = true;
  let lastSeg = null, lastMv, stillsFor;
  let actif = false, rafId = null;

  /* Bandeau des temps, images fixes, textes, voix */
  function cellLabel(m, ph) {
    if (!m) return 'Départ';
    if (ph === 'H') return 'Tiens';
    return `<b>${NUMERO_DU_TEMPS[ph]}</b>${libelleDuTemps(m, ph)}`;
  }
  function phName(s) {
    if (!s.m) return 'Départ';
    if (s.ph === 'H') return 'Tiens';
    return `${NUMERO_DU_TEMPS[s.ph]} · ${libelleDuTemps(s.m, s.ph)}`;
  }
  const canSpeak = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  if (!canSpeak) $('voiceLab').hidden = true;
  function say(txt) {
    if (!voice || !canSpeak) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'fr-FR'; u.rate = 1.05; speechSynthesis.speak(u); } catch (_e) { /* la voix est un confort, jamais bloquante */ }
  }
  const strip = $('strip'), stillsEl = $('stills');
  // Les trois instants des images fixes : le début, la fin du pas (un cheveu avant la pose) et la fin du coup.
  // Pour un coup de pied, l'image 2 est l'instant de la frappe (q = 0,4 de la phase B) : à la fin du pas le pied serait déjà redescendu.
  const stillTimes = (m) => [m.t0, m.kick ? m.tm0 + 0.4 * (m.tB - m.tm0) : m.tB - 0.02, m.tm1];

  function renderStills(m) {
    stillsFor = m;
    if (!m) { stillsEl.hidden = true; return; }
    stillsEl.hidden = false;
    const ts = stillTimes(m), modes = ['none', 'B', 'C'];
    // Le libellé de l'image 2 dit ce que fait le bras (le pied, au coup de pied ; le demi-tour, au retour Baro).
    const bras = m.fin ? 'Le demi-tour' : m.kick ? 'Le coup de pied' : !estCoup(m) ? 'Bras préparés' : m.foot ? 'Le bras se relâche devant' : 'Le bras monte au centre';
    const coup = m.fin ? 'Baro' : 'le coup';
    const caps = ['<b>1 · Avant</b>', `<b>2 · ${bras}</b>`, m.foot ? `<b>3 · Pied posé</b>, ${coup}` : '<b>3 · Le coup</b>'];
    for (let i = 0; i < 3; i++) {
      const f = frameAt(chrono, ts[i]);
      $('still' + i).querySelector('svg').innerHTML = renderScene(f, camera, { trails: modes[i], ghost: false, labels: false, chrono });
      $('stillc' + i).innerHTML = caps[i];
    }
  }

  function renderUI(f) {
    const s = f.s, m = f.m;
    if (m !== lastMv) {
      lastMv = m;
      // Le retour Baro n'a ni technique ni numéro : son nom est celui du commandement « Baro », numéro 0 comme le départ.
      const technique = m && (m.fin ? voc('baro') : techniqueAffichee(m));
      $('mvTitle').innerHTML = m ? `<span class="n">${m.fin ? 0 : m.numeroKukkiwon}</span>${technique.fftda} <span style="font-weight:400;color:var(--k-texte2)">${technique.hangeul}</span>` : '<span class="n">0</span>Départ';
      $('mvSub').textContent = m ? nomDuMouvement(m) : `${voc('tchoumbi').fftda}, position prête`;
      const cells = segs.filter((x) => x.m === m);
      strip.innerHTML = cells.map((c) => `<div class="cell ${c.ph}" data-i="${segs.indexOf(c)}" style="flex-grow:${(c.t1 - c.t0).toFixed(2)}">${cellLabel(m, c.ph)}</div>`).join('') + '<div class="head" id="head"></div>';
      // « false » au départ (la page écrivait « null », que les lecteurs d'écran prennent pour « vrai »)
      racine.querySelectorAll('.mvbtn').forEach((b) => b.setAttribute('aria-current', String(!!m && +b.dataset.i === mouvements.indexOf(m))));
      renderStills(m);
    }
    if (s !== lastSeg) {
      const wasPlaying = playing && lastSeg !== null;
      lastSeg = s;
      const chip = $('chip');
      chip.textContent = phName(s);
      chip.className = 'chip ' + s.ph;
      $('caption').innerHTML = m ? m.txt[s.ph] : TAEGEUK_IL_JANG.departTexte;
      strip.querySelectorAll('.cell').forEach((c) => c.classList.toggle('on', +c.dataset.i === segs.indexOf(s)));
      if (wasPlaying && m) { if (s.ph === 'B') say('un'); else if (s.ph === 'C') say('deux'); }
    }
    if (m) { const ts = stillTimes(m); for (let i = 0; i < 3; i++) $('still' + i).setAttribute('aria-current', String(Math.abs(t - ts[i]) < 0.03)); }
    const cells = segs.filter((x) => x.m === m), a = cells[0].t0, b = cells[cells.length - 1].t1;
    const head = $('head');
    if (head) { const w = strip.clientWidth - 32; head.style.left = (16 + clamp((t - a) / (b - a), 0, 1) * w - 1) + 'px'; }
    $('scrub').value = Math.round(t / TOTAL * 1000);
    $('play').textContent = playing ? '❚❚ Pause' : (t >= TOTAL - 1e-6 ? '↺ Revoir' : '▶ Lecture');
  }

  function render() {
    const f = frameAt(chrono, t);
    $('stage').innerHTML = renderScene(f, camera, { trails: 'auto', ghost: true, labels: true, chrono });
    $('map').innerHTML = renderMap(f, chrono);
    renderUI(f);
  }
  const refreshStills = () => { if (stillsFor) renderStills(stillsFor); };

  $('mvCount').textContent = `Les ${mouvements.length} mouvements`; // le nombre vient du contenu, jamais écrit en dur
  $('mvList').innerHTML = mouvements.map((m, i) => {
    const technique = techniqueAffichee(m);
    return `<li><button class="mvbtn" data-i="${i}" aria-current="false"><span class="n">${m.numeroKukkiwon}</span><span class="t"><b>${technique.fftda}</b><span class="ko">${technique.hangeul}</span><br><span class="fr">${voc(m.position).fftda}</span><br><small class="fr">${m.precision}</small></span></button></li>`;
  }).join('');

  function tick(ts) {
    if (last === null) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if (playing) {
      // Écart voulu avec la page : le mouvement joué est cherché à bornes exactes (début compris, fin
      // exclue), pas par segAt. La page cherchait à `t` avec segAt, dont la tolérance d'un milliardième
      // répond « le mouvement suivant » quand une image tombe juste avant la fin (durées multiples de
      // 1/60 s, fréquent à 60 ou 120 Hz) : « Répéter le mouvement » ne rebouclait pas (vu au banc, une
      // fois sur dix). La correction d'alors cherchait un millionième avant `t`, mais au début d'un
      // mouvement (clic dans la liste, ou après un rebouclage) c'était alors le précédent : la
      // répétition d'un mouvement autre que le premier rejouait le précédent, puis le premier (vu au
      // banc au lot K16, mouvement 3 et retour Baro).
      const before = t, mBefore = [...mouvements, chrono.arrivee].find((mv) => mv && before >= mv.t0 && before < mv.t1);
      t += dt * speed;
      if (stopAt !== null && t >= stopAt) { t = stopAt; stopAt = null; playing = false; }
      else if (repeat && mBefore && t >= mBefore.t1) { t = mBefore.t0; }
      if (t >= TOTAL) { t = TOTAL; playing = false; }
      dirty = true;
    }
    if (dirty) { render(); dirty = false; }
    rafId = requestAnimationFrame(tick);
  }

  function play() { if (t >= TOTAL - 1e-6) t = 0; playing = !playing; stopAt = null; dirty = true; }
  function next() { const nb = BOUNDS.find((b) => b > t + 1e-4); if (nb !== undefined) { stopAt = nb; playing = true; dirty = true; } }
  function prevT() { const pb = [...BOUNDS].reverse().find((b) => b < t - 0.05); t = pb === undefined ? 0 : pb; playing = false; stopAt = null; dirty = true; }
  function goTo(tt) { t = tt; playing = false; stopAt = null; dirty = true; }

  $('play').addEventListener('click', play);
  $('next').addEventListener('click', next);
  $('prev').addEventListener('click', prevT);
  racine.querySelectorAll('[data-speed]').forEach((b) => b.addEventListener('click', () => {
    speed = +b.dataset.speed;
    racine.querySelectorAll('[data-speed]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  racine.querySelectorAll('[data-cam]').forEach((b) => b.addEventListener('click', () => {
    camera = cameraDe(b.dataset.cam, camera.follow);
    racine.querySelectorAll('[data-cam]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    dirty = true; refreshStills();
  }));
  $('follow').addEventListener('change', (e) => { camera = { ...camera, follow: e.target.checked }; dirty = true; refreshStills(); });
  $('repeat').addEventListener('change', (e) => { repeat = e.target.checked; });
  $('voice').addEventListener('change', (e) => { voice = e.target.checked; if (voice) say('un, deux'); });
  $('scrub').addEventListener('input', (e) => { goTo(e.target.value / 1000 * TOTAL); });
  $('mvList').addEventListener('click', (e) => {
    const b = e.target.closest('.mvbtn');
    if (!b) return;
    const m = mouvements[+b.dataset.i];
    t = m.t0; stopAt = repeat ? null : m.t1; playing = true; dirty = true;
  });
  for (let i = 0; i < 3; i++) $('still' + i).addEventListener('click', () => { if (stillsFor) goTo(stillTimes(stillsFor)[i]); });
  document.addEventListener('keydown', (e) => {
    if (!actif) return; // les flèches et l'espace ne servent qu'à cet écran
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input') return;
    if (e.key === ' ' && tag !== 'button') { e.preventDefault(); play(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevT(); }
  });
  addEventListener('resize', () => { dirty = true; });

  return {
    racine,
    // Relance la boucle (écran affiché). Une seule boucle à la fois.
    reprendre() {
      if (actif) return;
      actif = true; last = null; dirty = true;
      rafId = requestAnimationFrame(tick);
    },
    // Coupe la boucle, la lecture en cours et la voix (écran quitté).
    arreter() {
      actif = false; playing = false; stopAt = null;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      if (canSpeak) { try { speechSynthesis.cancel(); } catch (_e) { /* rien à couper */ } }
    },
  };
}
