// Kihapp, contenu/taegeuk_il_jang.js (lots K14, K15 puis K16)
//
// Le premier poomsae, Taegueug Il Jang, mouvements 1 à 18 et le retour Baro, au
// format du contenu (plan de l'Architecte, §2.3). Les gestes suivent la vidéo du
// Kukkiwon, les noms suivent la FFTDA. Données du Jarvis : 2026-10-23_contenu-K14_mouvements-1-a-6.md
// pour les mouvements 1 à 6, 2026-10-24_contenu-K15-K16_mouvements-7-a-18.md pour
// les mouvements 7 à 18 et le retour Baro.
//
// - avant : seulement aux mouvements 14 et 16, qui portent deux techniques sous un
//   seul numéro. technique est la seconde (le coup de poing), avant la première
//   (le coup de pied, ap-tchagui).
// - kick : les deux positions de la cheville du pied qui frappe (armé, extension)
//   et les poings devant la poitrine pendant le coup de pied (lot K15).
// - arrivee : le retour Baro, qui n'est pas un mouvement numéroté.
// - technique et position sont des ids de vocabulaire.js : le nom affiché, le
//   hangeul et plus tard l'audio viennent de là, jamais recopiés dans un texte.
// - cote : le bras qui agit. numeroKukkiwon sert à l'animation et à la dictée,
//   numerosFftda à la correspondance avec la fiche du club.
// - La géométrie (to, arc, pieds) est celle de la page du 14/10. Seules les
//   préparations (prep) des mouvements 2, 4 et 6 ont changé : le bras qui a
//   bloqué remonte devant le plexus pendant le pas (RELACHE_L), le poing qui va
//   frapper reste à la hanche.
// - txt : B pendant le pas, C à la pose, H la tenue. Plus de phase A : la tête
//   tourne avec les bras, pendant B.
// - verifie : d'où vient chaque geste (garde-fou 9 : jamais de mouvement sans).
//   Les horodatages sont ceux de la vidéo source K.
// - repere : où la carte du sol dessine le rond du mouvement (lot K15). Un
//   mouvement qui pose un pied en porte un ; un mouvement sans pied s'ajoute au
//   rond du précédent.
// - Le nombre de mouvements est la longueur du tableau, jamais une constante.

import {
  AN_L, AN_PREP_L, AN_TENDU_R, ARC_AN_L, ARC_L, ARC_R, EULGOUL_DESSOUS_L, EULGOUL_DESSUS_R, EULGOUL_L, HIP_L, HIP_R, JUN_L, JUN_R,
  KUBI_FEET, LOW_L, LOW_L_KUBI, mir, P0, POITRINE_L, PREP_LOW_L, PUNCH_R, REACH_R_FOR_L, RELACHE_L, TCHAGUI_ARME_R, TCHAGUI_EXTENSION_R,
} from '../animation/poses.js';

// La date de relecture sur la vidéo : le 23/10 pour les mouvements 1 à 6, le 24/10 pour les 7 à 18 et le retour Baro.
const verifie = (debut, fin, le = '2026-10-23') => ({ source: 'K', debut, fin, par: 'Jarvis', le });

export const TAEGEUK_IL_JANG = {
  id: 'taegeuk-il-jang',
  nom: 'taegueug-il-jang',
  trigramme: '☰',
  ceinture: 'vers-jaune',
  avant: ['tchaliot', 'kyongnye', 'tchoumbi', 'taegueug-il-jang', 'shijak'],
  apres: ['baro'],
  depart: P0,
  departTexte: "<b>Position de départ, Tchoumbi.</b> Pieds parallèles, écartés d'une longueur de pied (Naranhi Seugui), poings fermés devant la ceinture, un poing d'écart entre eux, regard droit devant. Appuie sur Lecture, ou avance temps par temps avec « Temps → ».",
  mouvements: [
    {
      id: 't1-01', numeroKukkiwon: 1, numerosFftda: [3],
      technique: 'ale-maki', position: 'ap-seugui', cote: 'gauche', precision: 'quart de tour à gauche', kihap: false,
      foot: 'L', turn: true, repere: { x: -0.41, z: 0.27 },
      prep: { LH: PREP_LOW_L, RH: REACH_R_FOR_L }, arc: { LH: ARC_L },
      to: { L: { x: -0.41, z: -0.10, a: -90 }, R: { x: 0.15, z: 0, a: -60 }, shift: 0, h: 0.85, th: -90, gaze: -90, LH: LOW_L, RH: HIP_R },
      txt: {
        B: "<b>Le poids passe sur la plante du pied droit, la tête et les bras partent ensemble vers la gauche.</b> Le pied gauche glisse vers la gauche en frôlant le sol. Pendant le trajet, le poing gauche monte à l'épaule droite, près du cou, et le bras droit se tend vers le bas, en travers devant toi.",
        C: "<b>La plante du pied gauche touche le sol, puis le talon : le bras gauche balaie vers le bas en arc</b> jusqu'à deux poings au-dessus du genou gauche, coude presque tendu. Le tronc tourne en même temps. Le poing droit revient à la hanche, dos de la main vers le bas.",
        H: "Position finale : <b>Ap Seugui</b>, un pas de marche, pied gauche devant. Le blocage est fini au moment où le talon se pose.",
      },
      verifie: verifie('1:29.9', '1:30.8'),
    },
    {
      id: 't1-02', numeroKukkiwon: 2, numerosFftda: [4],
      technique: 'montong-bande-jileugui', position: 'ap-seugui', cote: 'droite', precision: 'un pas en avant', kihap: false,
      foot: 'R', turn: false, repere: { x: -0.97, z: 0.27 },
      prep: { LH: RELACHE_L, RH: HIP_R },
      to: { L: { x: -0.41, z: -0.10, a: -120 }, R: { x: -0.97, z: 0, a: -90 }, shift: 0, h: 0.85, th: -90, gaze: -90, LH: HIP_L, RH: PUNCH_R },
      txt: {
        B: "<b>Le pied droit avance d'un pas</b>, doucement, genoux souples, en passant près du pied gauche. Pendant le pas, <b>le bras gauche se relâche et remonte devant toi, à hauteur du plexus</b>. Le poing droit attend à la hanche.",
        C: "<b>Le pied droit se pose, plante d'abord : le poing droit part de la hanche</b>, tout droit, en frôlant la ceinture, et tourne paume vers le bas juste à l'arrivée, à hauteur du plexus. En même temps, le bras gauche revient à la hanche en frôlant la taille.",
        H: "<b>Ap Seugui</b>, pied droit devant. Le poing qui frappe est du même côté que le pied avant : c'est le « Bandé » de Montong Bandé Jileugui. L'épaule du bras qui revient ne part pas en arrière.",
      },
      verifie: verifie('1:31.3', '1:32.4'),
    },
    {
      id: 't1-03', numeroKukkiwon: 3, numerosFftda: [5],
      technique: 'ale-maki', position: 'ap-seugui', cote: 'droite', precision: 'demi-tour', kihap: false,
      foot: 'R', turn: true, repere: { x: 0.15, z: 0.27 },
      prep: { LH: mir(REACH_R_FOR_L), RH: mir(PREP_LOW_L) }, arc: { RH: ARC_R },
      to: { L: { x: -0.41, z: -0.10, a: 60 }, R: { x: 0.15, z: -0.20, a: 90 }, shift: 0, h: 0.85, th: 90, gaze: 90, LH: HIP_L, RH: mir(LOW_L) },
      txt: {
        B: "<b>Le poids passe sur la plante du pied gauche, la tête et les bras partent ensemble derrière toi.</b> Le pied droit repart vers l'arrière et passe de l'autre côté : tu fais demi-tour. Pendant le pivot, le poing droit monte à l'épaule gauche, le bras gauche se tend vers le bas.",
        C: "<b>Le pied droit se pose : le bras droit balaie vers le bas en arc</b> au-dessus du genou droit. Le poing gauche revient à la hanche.",
        H: "Le mouvement 1 en miroir, tourné vers l'autre bout de la ligne. La caméra fait le tour pour rester face à toi.",
      },
      verifie: verifie('1:33.0', '1:34.0'),
    },
    {
      id: 't1-04', numeroKukkiwon: 4, numerosFftda: [6],
      technique: 'montong-bande-jileugui', position: 'ap-seugui', cote: 'gauche', precision: 'un pas en avant', kihap: false,
      foot: 'L', turn: false, repere: { x: 0.71, z: 0.27 },
      prep: { LH: HIP_L, RH: mir(RELACHE_L) },
      to: { L: { x: 0.71, z: -0.10, a: 90 }, R: { x: 0.15, z: -0.20, a: 120 }, shift: 0, h: 0.85, th: 90, gaze: 90, LH: mir(PUNCH_R), RH: HIP_R },
      txt: {
        B: "<b>Le pied gauche avance d'un pas</b>, doucement, genoux souples. Pendant le pas, <b>le bras droit se relâche et remonte devant toi, à hauteur du plexus</b>. Le poing gauche attend à la hanche.",
        C: "<b>Le pied gauche se pose : le poing gauche part</b> de la hanche, tout droit, et le bras droit revient à la hanche en même temps.",
        H: "Le mouvement 2 en miroir. Tu es au bout droit de la première ligne.",
      },
      verifie: verifie('1:34.3', '1:35.4'),
    },
    {
      id: 't1-05', numeroKukkiwon: 5, numerosFftda: [7],
      technique: 'ale-maki', position: 'ap-koubi-seugui', cote: 'gauche', precision: "quart de tour, face à l'avant", kihap: false,
      foot: 'L', turn: true, repere: { x: -0.42, z: 0.70 },
      prep: { LH: PREP_LOW_L, RH: REACH_R_FOR_L }, arc: { LH: ARC_L },
      to: { L: KUBI_FEET.L, R: KUBI_FEET.R, shift: 0.1, h: 0.71, th: 0, gaze: 0, LH: LOW_L_KUBI, RH: HIP_R },
      txt: {
        B: "<b>La tête et les bras partent ensemble vers l'avant de la salle.</b> Le pied gauche part loin devant, un peu vers le centre : c'est une position longue. Pendant le trajet, le poing gauche monte à l'épaule droite, le bras droit se tend vers le bas.",
        C: "<b>Le pied gauche se pose, genou plié : le bras gauche balaie vers le bas en arc</b>, le poing droit revient à la hanche. Le talon du pied droit, derrière, ne décolle pas.",
        H: "<b>Ap Koubi Seugui</b> : un pas et demi entre les pieds, un poing d'écart en largeur, genou avant au-dessus des orteils, jambe arrière tendue, pied arrière ouvert d'environ 30°.",
      },
      verifie: verifie('1:36.3', '1:37.2'),
    },
    {
      id: 't1-06', numeroKukkiwon: 6, numerosFftda: [8],
      technique: 'montong-baro-jileugui', position: 'ap-koubi-seugui', cote: 'droite', precision: 'pieds fixes', kihap: false,
      foot: null, turn: false,
      prep: { LH: RELACHE_L, RH: HIP_R },
      to: { L: KUBI_FEET.L, R: KUBI_FEET.R, shift: 0.1, h: 0.71, th: 0, gaze: 0, LH: HIP_L, RH: PUNCH_R },
      txt: {
        B: "<b>Les pieds ne bougent pas. Le bras gauche quitte le blocage bas et monte au centre</b>, relâché, à hauteur du plexus. Le poing droit attend à la hanche.",
        C: "<b>Le poing droit part de la hanche</b>, tout droit, pendant que le bras gauche revient à la hanche.",
        H: "Ici le poing qui frappe est du côté opposé au pied avant : c'est le « Baro » de Montong Baro Jileugui. Fin de la première partie.",
      },
      verifie: verifie('1:37.7', '1:38.0'),
    },
    {
      id: 't1-07', numeroKukkiwon: 7, numerosFftda: [9],
      technique: 'montong-an-maki', position: 'ap-seugui', cote: 'gauche', precision: 'quart de tour à droite', kihap: false,
      foot: 'R', turn: true, repere: { x: 0.46, z: 1.05 },
      prep: { LH: AN_PREP_L, RH: AN_TENDU_R }, arc: { LH: ARC_AN_L },
      to: { L: { x: -0.10, z: 0.70, a: 60 }, R: { x: 0.46, z: 0.60, a: 90 }, shift: 0, h: 0.85, th: 90, gaze: 90, LH: AN_L, RH: HIP_R },
      txt: {
        B: "<b>Le pied droit pousse le sol, le poids passe sur le pied gauche, la tête et les bras partent ensemble vers la droite.</b> Le pied droit est ramené puis part vers la droite. Pendant le trajet, le poing gauche monte sur le côté, un poing au-dessus de l'épaule, et le bras droit se tend devant toi, à hauteur du plexus.",
        C: "<b>Le pied droit se pose : l'avant-bras gauche balaie de l'extérieur vers le centre</b> et s'arrête devant toi, poing sur l'axe du corps, poignet à hauteur du plexus, coude près du corps. Le poing droit revient à la hanche en frôlant la taille.",
        H: "<b>Ap Seugui</b>, pied droit devant, mais c'est le bras gauche qui bloque : bras et pied avant ne sont pas du même côté. Le coude reste collé au corps, c'est la rotation du tronc qui donne la force.",
      },
      verifie: verifie('1:38.7', '1:39.6', '2026-10-24'),
    },
    {
      id: 't1-08', numeroKukkiwon: 8, numerosFftda: [10],
      technique: 'montong-baro-jileugui', position: 'ap-seugui', cote: 'droite', precision: 'un pas en avant', kihap: false,
      foot: 'L', turn: false, repere: { x: 1.02, z: 1.05 },
      prep: { LH: RELACHE_L, RH: HIP_R },
      to: { L: { x: 1.02, z: 0.70, a: 90 }, R: { x: 0.46, z: 0.60, a: 120 }, shift: 0, h: 0.85, th: 90, gaze: 90, LH: HIP_L, RH: PUNCH_R },
      txt: {
        B: "<b>Le pied gauche avance d'un pas</b>, doucement. Pendant le pas, <b>le bras gauche se relâche et descend devant toi, à hauteur du plexus</b>. Le poing droit attend à la hanche.",
        C: "<b>Le pied gauche se pose : le poing droit part</b> de la hanche, tout droit, et le bras gauche revient à la hanche en même temps.",
        H: "Pied gauche devant, poing droit qui frappe : côtés opposés, c'est un « Baro ». Relâche le bras qui vient de bloquer, ne le crispe pas.",
      },
      verifie: verifie('1:39.9', '1:41.0', '2026-10-24'),
    },
    {
      id: 't1-09', numeroKukkiwon: 9, numerosFftda: [11],
      technique: 'montong-an-maki', position: 'ap-seugui', cote: 'droite', precision: 'demi-tour', kihap: false,
      foot: 'L', turn: true, repere: { x: -0.10, z: 1.05 },
      prep: { LH: mir(AN_TENDU_R), RH: mir(AN_PREP_L) }, arc: { RH: mir(ARC_AN_L) },
      to: { L: { x: -0.10, z: 0.50, a: -90 }, R: { x: 0.46, z: 0.60, a: -60 }, shift: 0, h: 0.85, th: -90, gaze: -90, LH: HIP_L, RH: mir(AN_L) },
      txt: {
        B: "<b>Le poids passe sur la plante du pied droit, la tête et les bras partent ensemble derrière toi.</b> Le pied gauche fait le tour : demi-tour vers la gauche. Pendant le pivot, le bras gauche se tend vers la nouvelle direction et le poing droit monte à côté de la tête.",
        C: "<b>La plante du pied gauche touche le sol : l'avant-bras droit balaie vers le centre.</b> Le poing gauche revient à la hanche. Le blocage est fini au moment où le pied se pose.",
        H: "Le mouvement 7 en miroir, tourné vers l'autre bout de la deuxième ligne.",
      },
      verifie: verifie('1:41.9', '1:42.8', '2026-10-24'),
    },
    {
      id: 't1-10', numeroKukkiwon: 10, numerosFftda: [12],
      technique: 'montong-baro-jileugui', position: 'ap-seugui', cote: 'gauche', precision: 'un pas en avant', kihap: false,
      foot: 'R', turn: false, repere: { x: -0.66, z: 1.05 },
      prep: { LH: HIP_L, RH: mir(RELACHE_L) },
      to: { L: { x: -0.10, z: 0.50, a: -120 }, R: { x: -0.66, z: 0.60, a: -90 }, shift: 0, h: 0.85, th: -90, gaze: -90, LH: mir(PUNCH_R), RH: HIP_R },
      txt: {
        B: "<b>Le pied droit avance d'un pas.</b> Pendant le pas, <b>le bras droit se relâche et descend devant toi, à hauteur du plexus</b>. Le poing gauche attend à la hanche.",
        C: "<b>Le pied droit se pose : le poing gauche part</b> de la hanche, tout droit, et le bras droit revient à la hanche.",
        H: "Le mouvement 8 en miroir. Tu es au bout gauche de la deuxième ligne.",
      },
      verifie: verifie('1:43.1', '1:44.2', '2026-10-24'),
    },
    {
      id: 't1-11', numeroKukkiwon: 11, numerosFftda: [13],
      technique: 'ale-maki', position: 'ap-koubi-seugui', cote: 'droite', precision: "quart de tour, face à l'avant", kihap: false,
      foot: 'R', turn: true, repere: { x: -0.17, z: 1.40 },
      prep: { LH: mir(REACH_R_FOR_L), RH: mir(PREP_LOW_L) }, arc: { RH: ARC_R },
      to: { L: { x: -0.10, z: 0.50, a: -30 }, R: { x: 0.15, z: 1.40, a: 0 }, shift: 0.1, h: 0.71, th: 0, gaze: 0, LH: HIP_L, RH: mir(LOW_L_KUBI) },
      txt: {
        B: "<b>La tête et les bras partent ensemble vers l'avant de la salle.</b> Le pied droit part loin devant, vers le centre : c'est une position longue. Pendant le trajet, le poing droit monte à l'épaule gauche, le bras gauche se tend vers le bas, en travers.",
        C: "<b>Le pied droit se pose, genou plié : le bras droit balaie vers le bas en arc</b>, le poing gauche revient à la hanche. Le talon du pied gauche, derrière, ne décolle pas.",
        H: "<b>Ap Koubi Seugui</b>, pied droit devant : le mouvement 5 en miroir, une ligne plus loin.",
      },
      verifie: verifie('1:44.8', '1:46.0', '2026-10-24'),
    },
    {
      id: 't1-12', numeroKukkiwon: 12, numerosFftda: [14],
      technique: 'montong-baro-jileugui', position: 'ap-koubi-seugui', cote: 'gauche', precision: 'pieds fixes', kihap: false,
      foot: null, turn: false,
      prep: { LH: HIP_L, RH: mir(RELACHE_L) },
      to: { L: { x: -0.10, z: 0.50, a: -30 }, R: { x: 0.15, z: 1.40, a: 0 }, shift: 0.1, h: 0.71, th: 0, gaze: 0, LH: mir(PUNCH_R), RH: HIP_R },
      txt: {
        B: "<b>Les pieds ne bougent pas. Le bras droit quitte le blocage bas et monte au centre</b>, relâché, à hauteur du plexus. Le poing gauche attend à la hanche.",
        C: "<b>Le poing gauche part de la hanche</b>, tout droit, pendant que le bras droit revient à la hanche.",
        H: "Pied droit devant, poing gauche : un « Baro ». Fin de la deuxième partie.",
      },
      verifie: verifie('1:46.3', '1:46.7', '2026-10-24'),
    },
    {
      id: 't1-13', numeroKukkiwon: 13, numerosFftda: [15],
      technique: 'eulgoul-maki', position: 'ap-seugui', cote: 'gauche', precision: 'quart de tour à gauche', kihap: false,
      foot: 'L', turn: true, repere: { x: -0.41, z: 1.83 },
      prep: { LH: EULGOUL_DESSOUS_L, RH: EULGOUL_DESSUS_R },
      to: { L: { x: -0.41, z: 1.30, a: -90 }, R: { x: 0.15, z: 1.40, a: -60 }, shift: 0, h: 0.85, th: -90, gaze: -90, LH: EULGOUL_L, RH: HIP_R },
      txt: {
        B: "<b>La tête et les bras partent ensemble vers la gauche.</b> Le pied gauche part vers la gauche. Pendant le trajet, les bras se croisent devant le plexus, <b>le bras gauche passe sous le bras droit</b>.",
        C: "<b>Le pied gauche se pose : l'avant-bras gauche monte au-dessus du front</b>, incliné, le poing plus haut que le coude, un poing d'espace entre le poignet et le front. Le poing droit est tiré à la hanche.",
        H: "<b>Ap Seugui</b>, pied gauche devant. Ne monte pas le bras trop haut, et ne laisse pas le coude retomber vers l'arrière.",
      },
      verifie: verifie('1:47.3', '1:48.0', '2026-10-24'),
    },
    {
      id: 't1-14', numeroKukkiwon: 14, numerosFftda: [16, 17],
      technique: 'montong-bande-jileugui', avant: 'ap-tchagui', position: 'ap-seugui', cote: 'droite', precision: 'coup de pied, puis un pas en avant', kihap: false,
      foot: 'R', turn: false, repere: { x: -0.97, z: 1.83 },
      kick: { arme: TCHAGUI_ARME_R, extension: TCHAGUI_EXTENSION_R, bras: { LH: POITRINE_L, RH: mir(POITRINE_L) } },
      prep: { LH: RELACHE_L, RH: HIP_R },
      to: { L: { x: -0.41, z: 1.30, a: -120 }, R: { x: -0.97, z: 1.40, a: -90 }, shift: 0, h: 0.85, th: -90, gaze: -90, LH: HIP_L, RH: PUNCH_R },
      txt: {
        B: "<b>Les deux poings viennent devant la poitrine. Le genou droit monte</b>, la jambe passe au-dessus du genou gauche, <b>puis le pied droit frappe droit devant</b> et revient aussitôt, genou plié. En redescendant, le bras gauche se tend devant toi à hauteur du plexus, le poing droit attend à la hanche.",
        C: "<b>Le pied droit se pose devant, plante d'abord : le poing droit part</b> de la hanche, et le bras gauche revient à la hanche.",
        H: "<b>Ap Seugui</b>, pied droit devant, toujours face à la gauche : on ne tourne pas. Un seul numéro pour deux techniques, la fiche du club en compte deux (16 et 17). Le souffle et le geste finissent quand le pied touche le sol.",
      },
      verifie: verifie('1:48.9', '1:50.3', '2026-10-24'),
    },
    {
      id: 't1-15', numeroKukkiwon: 15, numerosFftda: [18],
      technique: 'eulgoul-maki', position: 'ap-seugui', cote: 'droite', precision: 'demi-tour', kihap: false,
      foot: 'R', turn: true, repere: { x: 0.15, z: 1.83 },
      prep: { LH: mir(EULGOUL_DESSUS_R), RH: mir(EULGOUL_DESSOUS_L) },
      to: { L: { x: -0.41, z: 1.30, a: 60 }, R: { x: 0.15, z: 1.20, a: 90 }, shift: 0, h: 0.85, th: 90, gaze: 90, LH: HIP_L, RH: mir(EULGOUL_L) },
      txt: {
        B: "<b>Le poids passe sur la plante du pied gauche, la tête et les bras partent ensemble derrière toi.</b> Le pied droit fait le tour : demi-tour vers la droite. Pendant le pivot, les bras se croisent devant le plexus, <b>le bras droit passe sous le bras gauche</b>.",
        C: "<b>Le pied droit se pose : l'avant-bras droit monte au-dessus du front.</b> Le poing gauche est tiré à la hanche.",
        H: "Le mouvement 13 en miroir, tourné vers l'autre bout de la troisième ligne.",
      },
      verifie: verifie('1:51.3', '1:52.2', '2026-10-24'),
    },
    {
      id: 't1-16', numeroKukkiwon: 16, numerosFftda: [19, 20],
      technique: 'montong-bande-jileugui', avant: 'ap-tchagui', position: 'ap-seugui', cote: 'gauche', precision: 'coup de pied, puis un pas en avant', kihap: false,
      foot: 'L', turn: false, repere: { x: 0.71, z: 1.83 },
      kick: { arme: mir(TCHAGUI_ARME_R), extension: mir(TCHAGUI_EXTENSION_R), bras: { LH: POITRINE_L, RH: mir(POITRINE_L) } },
      prep: { LH: HIP_L, RH: mir(RELACHE_L) },
      to: { L: { x: 0.71, z: 1.30, a: 90 }, R: { x: 0.15, z: 1.20, a: 120 }, shift: 0, h: 0.85, th: 90, gaze: 90, LH: mir(PUNCH_R), RH: HIP_R },
      txt: {
        B: "<b>Les deux poings viennent devant la poitrine. Le genou gauche monte, puis le pied gauche frappe droit devant</b> et revient, genou plié. En redescendant, le bras droit se tend devant toi, le poing gauche attend à la hanche.",
        C: "<b>Le pied gauche se pose devant : le poing gauche part</b>, et le bras droit revient à la hanche.",
        H: "Le mouvement 14 en miroir. Tu es au bout droit de la troisième ligne.",
      },
      verifie: verifie('1:52.8', '1:54.2', '2026-10-24'),
    },
    {
      id: 't1-17', numeroKukkiwon: 17, numerosFftda: [21],
      technique: 'ale-maki', position: 'ap-koubi-seugui', cote: 'gauche', precision: 'quart de tour, vers le départ', kihap: false,
      foot: 'L', turn: true, repere: { x: 0.40, z: 0.42 },
      prep: { LH: PREP_LOW_L, RH: REACH_R_FOR_L }, arc: { LH: ARC_L },
      // th 180 et le pied droit à 210 : jamais -180 ni -150, l'interpolation tournerait dans le mauvais sens
      to: { L: { x: 0.40, z: 0.30, a: 180 }, R: { x: 0.15, z: 1.20, a: 210 }, shift: 0.1, h: 0.71, th: 180, gaze: 180, LH: LOW_L_KUBI, RH: HIP_R },
      txt: {
        B: "<b>Le poids passe sur le pied droit, la tête et les bras partent ensemble vers le point de départ.</b> Tu tournes d'un quart de tour, dos à l'avant de la salle, et le pied gauche part loin devant, vers le centre. Pendant le trajet, le poing gauche monte à l'épaule droite, le bras droit se tend vers le bas.",
        C: "<b>Le pied gauche se pose, genou plié : le bras gauche balaie vers le bas en arc</b>, le poing droit revient à la hanche.",
        H: "<b>Ap Koubi Seugui</b>, pied gauche devant, tourné vers le départ. Le dernier blocage.",
      },
      verifie: verifie('1:54.9', '1:56.0', '2026-10-24'),
    },
    {
      id: 't1-18', numeroKukkiwon: 18, numerosFftda: [22],
      technique: 'montong-bande-jileugui', position: 'ap-koubi-seugui', cote: 'droite', precision: 'un pas en avant, kihap', kihap: true,
      foot: 'R', turn: false, repere: { x: 0.47, z: -0.60 },
      prep: { LH: RELACHE_L, RH: HIP_R },
      to: { L: { x: 0.40, z: 0.30, a: 150 }, R: { x: 0.15, z: -0.60, a: 180 }, shift: 0.1, h: 0.71, th: 180, gaze: 180, LH: HIP_L, RH: PUNCH_R },
      txt: {
        B: "<b>Le pied droit avance, toujours en position longue.</b> Ton corps reste à la même hauteur pendant tout le pas. Le bras gauche se relâche et monte devant toi, le poing droit attend à la hanche.",
        C: "<b>Le pied droit se pose : le poing droit part, et tu cries Kihap</b> au moment exact de la frappe. Le bras gauche revient à la hanche.",
        H: "<b>Ap Koubi Seugui</b>, pied droit devant, poing droit : un « Bandé ». C'est le seul cri du poomsae.",
      },
      verifie: verifie('1:56.2', '1:57.4', '2026-10-24'),
    },
  ],
  // Le retour Baro : pas un mouvement numéroté, le dernier segment de la chronologie (3e paramètre de construireSegments).
  arrivee: {
    id: 't1-baro', foot: 'L', turn: true,
    prep: { LH: JUN_L, RH: JUN_R },
    to: { L: { x: -0.15, z: -0.60, a: 0 }, R: { x: 0.15, z: -0.60, a: 0 }, shift: 0, h: 0.88, th: 0, gaze: 0, LH: JUN_L, RH: JUN_R },
    txt: {
      B: "<b>Le poids passe sur le pied droit. Le pied gauche fait le tour par derrière</b> : demi-tour, face à l'avant de la salle.",
      C: "<b>Le pied gauche se pose à une longueur de pied du droit</b> : Naranhi Seugui, poings fermés devant la ceinture.",
      H: "<b>Baro</b> : tu es revenu en position de départ. Le poomsae est fini quand tu es immobile.",
    },
    verifie: verifie('2:00.0', '2:00.8', '2026-10-24'),
  },
};
