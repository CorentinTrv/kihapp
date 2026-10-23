// Kihapp, contenu/taegeuk_il_jang.js (lot K14)
//
// Le premier poomsae, Taegueug Il Jang, mouvements 1 à 6, au format du contenu
// (plan de l'Architecte, §2.3). Les gestes suivent la vidéo du Kukkiwon, les
// noms suivent la FFTDA. Données du Jarvis : 2026-10-23_contenu-K14_mouvements-1-a-6.md.
//
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
// - Le nombre de mouvements est la longueur du tableau, jamais une constante.

import { ARC_L, ARC_R, HIP_L, HIP_R, KUBI_FEET, LOW_L, LOW_L_KUBI, mir, P0, PREP_LOW_L, PUNCH_R, REACH_R_FOR_L, RELACHE_L } from '../animation/poses.js';

const verifie = (debut, fin) => ({ source: 'K', debut, fin, par: 'Jarvis', le: '2026-10-23' });

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
      foot: 'L', turn: true,
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
      foot: 'R', turn: false,
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
      foot: 'R', turn: true,
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
      foot: 'L', turn: false,
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
      foot: 'L', turn: true,
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
  ],
};
