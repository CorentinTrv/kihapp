// Kihapp, animation/poses.js (lots K12 puis K14)
// Les constantes de poings et de pieds de la page du 14/10, recopiées telles
// quelles (valeurs, noms, ordre des calculs), plus RELACHE_L ajoutée au lot K14
// pour le bras qui a bloqué et remonte devant le plexus pendant le pas.

// Miroir gauche/droite : x change de signe.
export const mir = (v) => [-v[0], v[1], v[2]];

/* Positions des poings, dans le repère du corps : x vers la droite, y vers le haut depuis le bassin, z vers l'avant (mètres). */
export const HIP_L = [-0.17, 0.1, 0.02], HIP_R = mir(HIP_L);
export const JUN_L = [-0.1, 0.04, 0.25], JUN_R = mir(JUN_L);
export const PREP_LOW_L = [0.15, 0.55, 0.10]; // poing gauche à l'épaule droite, hauteur de l'oreille
export const REACH_R_FOR_L = [-0.07, 0.05, 0.27]; // bras droit tendu vers le bas, en travers devant
export const LOW_L = [-0.13, -0.03, 0.23]; // coude presque tendu, poing deux poings au-dessus du genou
export const LOW_L_KUBI = [-0.13, -0.03, 0.24];
export const PUNCH_R = [0.0, 0.42, 0.55]; // bras tendu, poing sur la ligne du plexus
// Bras qui a bloqué, relâché devant le plexus pendant le pas (Kukkiwon, R-poing ; FFTDA :
// « l'autre bras semi fléchi au niveau du plexus, le bras est relâché, paume face au sol »).
// Un peu moins haut et moins loin que le coup de poing (PUNCH_R), du côté du bras. Son miroir : mir(RELACHE_L).
export const RELACHE_L = [-0.06, 0.36, 0.42];
export const ARC_L =[-0.14, 0.02, 0.12], ARC_R = [0.14, 0.02, 0.12]; // le blocage descend en arc, pas en ligne droite (Kukkiwon)

/* Pieds dans la salle : x vers la droite, z vers l'avant (le jury). a = direction des orteils, 0 = vers l'avant, -90 = vers la gauche. */
export const P0 = { L: { x: -0.15, z: 0, a: 0 }, R: { x: 0.15, z: 0, a: 0 }, shift: 0, h: 0.88, th: 0, gaze: 0, LH: JUN_L, RH: JUN_R };
export const KUBI_FEET = { L: { x: -0.10, z: 0.70, a: 0 }, R: { x: 0.15, z: -0.20, a: 30 } };

/* Lot K15 : les poses des mouvements 7 à 18 (blocage intérieur, blocage haut, coup de pied de face).
   Fichier de données : context/import/taekwondo/2026-10-24_contenu-K15-K16_mouvements-7-a-18.md, §2. */

// Montong An Maki (blocage intérieur), Kukkiwon 5:03 à 5:43.
// Préparation : le poing qui va bloquer monte sur le côté, environ un poing au-dessus de l'épaule
// (écran 5:25 « a fist's length above the shoulder »), coude écarté.
export const AN_PREP_L = [-0.32, 0.64, 0.0];
// L'autre bras, tendu devant, légèrement fléchi, à hauteur du plexus (écran 5:21).
export const AN_TENDU_R = [0.04, 0.38, 0.50];
// Fin : avant-bras devant, poing sur l'axe central, poignet extérieur au niveau du plexus,
// coude ramené vers le corps (écrans 5:09, 5:17, 5:33).
export const AN_L = [-0.02, 0.45, 0.32];
// Le poing balaie de l'extérieur vers le centre, en avançant : arc ajouté pendant la phase C.
export const ARC_AN_L = [-0.08, 0.0, 0.10];

// Eulgoul Maki (blocage haut), Kukkiwon 5:44 à 6:15 et 12:22 à 13:00.
// Préparation : bras croisés devant le plexus, le bras qui bloque passe DESSOUS
// (écran 12:24 « crossing your defending arm from under your supporting arm »).
export const EULGOUL_DESSOUS_L = [0.10, 0.30, 0.28];
export const EULGOUL_DESSUS_R = [-0.08, 0.36, 0.32];
// Fin : avant-bras incliné au-dessus du front, poing plus haut que le coude,
// un poing d'espace entre le dos du poignet et le front (écrans 6:02 à 6:06, 12:48).
export const EULGOUL_L = [0.02, 0.80, 0.18];

// Ap Tchagui (coup de pied de face) : les deux poings devant la poitrine pendant le coup de pied
// (vu 1:49.1 à 1:49.6 ; FFTDA : « les bras se positionnent naturellement devant la poitrine »).
export const POITRINE_L = [-0.08, 0.36, 0.20];
// Son miroir : mir(POITRINE_L), comme pour toutes les poses ci-dessus.

// Le coup de pied : deux positions de la cheville du pied qui frappe, dans le repère du corps,
// depuis le bassin (y négatif = sous le bassin), pour le pied droit ; le gauche est le miroir en x.
// Armé : genou monté devant, cuisse à peu près horizontale, la jambe part au-dessus du genou
// de la jambe d'appui (écran 6:24). Cheville à 0,51 m du sol pour un bassin à 0,88 m.
export const TCHAGUI_ARME_R = [0.09, -0.37, 0.33];
// Extension : jambe presque tendue vers l'avant, cheville à hauteur de poitrine (1,18 m).
// La vidéo monte plus haut (au-dessus de la tête à 1:49.4) ; c'est un schéma, la hauteur du coup
// de pied n'est pas une règle du Taegueug.
export const TCHAGUI_EXTENSION_R = [0.05, 0.30, 0.72];
