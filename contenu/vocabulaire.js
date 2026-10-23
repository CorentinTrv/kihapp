// vocabulaire.js, lot K2 de Kihapp
//
// Les 60 éléments du premier lot, dans l'ordre des tableaux du fichier de
// données du 23/10/2026 (2026-10-23_contenu-K2_donnees.md, qui fait foi).
// Données pures : aucun accès à window, document ni localStorage.
//
// Un élément : { id, categorie, unite, fftda, variantes, fr, hangeul,
// audioTexte, sources, doute, exercice, illustration }.
// - fftda : la graphie affichée (celle de la FFTDA) ;
// - variantes : autres graphies, jamais affichées comme nom principal ;
// - audioTexte : ce que lit la synthèse vocale, hangeul et espaces seulement
//   (égal à hangeul quand rien n'est précisé) ;
// - exercice : false = affiché ou utilisé par la dictée, jamais interrogé ;
// - illustration : null, ou { poomsae, mouvement } quand une image existe
//   (posée au lot K14 sur cinq éléments, voir ILLUSTRATIONS).

// Les textes des sept doutes, écrits une seule fois et partagés.
const DOUTES = {
  1: "La FFTDA écrit Tchoumbi dans le lexique et Joumbi au n° 23 de la fiche Taegueug Il Jang : même mot, 준비.",
  2: "Le Kukkiwon écrit 품새 ; 품세 est l'ancienne graphie, prononcée presque pareil.",
  3: "La FFTDA décrit Tchaliot Seugui talons joints, pointes ouvertes à 45°, mais place le salut de Taegueug Il Jang en Moa Seugui. Kihapp suit la fiche : salut en Moa Seugui.",
  4: "La FFTDA ajoute Seugui ; en coréen la position s'appelle 앞굽이 seule.",
  5: "Bandé : le poing du côté de la jambe avant. Baro : le poing du côté opposé. Les noms se lisent facilement à l'envers : regarde l'image.",
  6: "Écrit 1장, se dit il-jang (일장).",
  7: "Composé pour Kihapp : le lexique FFTDA donne Yeul et les unités, pas les nombres de 11 à 19.",
};

// L'image d'un élément : le mouvement du poomsae qui le montre (lot K14).
const ILLUSTRATIONS = {
  "ale-maki": { poomsae: "taegeuk-il-jang", mouvement: "t1-01" },
  "montong-bande-jileugui": { poomsae: "taegeuk-il-jang", mouvement: "t1-02" },
  "montong-baro-jileugui": { poomsae: "taegeuk-il-jang", mouvement: "t1-06" },
  "ap-seugui": { poomsae: "taegeuk-il-jang", mouvement: "t1-01" },
  "ap-koubi-seugui": { poomsae: "taegeuk-il-jang", mouvement: "t1-05" },
};

// n : numéro du doute, ou null.
const doute = (n) => (n === null ? null : { n, texte: DOUTES[n] });

function el(id, categorie, unite, fftda, variantes, fr, hangeul, sources, n, exercice, audioTexte = hangeul) {
  return {
    id,
    categorie,
    unite,
    fftda,
    variantes,
    fr,
    hangeul,
    audioTexte,
    sources,
    doute: doute(n),
    exercice,
    illustration: ILLUSTRATIONS[id] ?? null,
  };
}

export const VOCABULAIRE = [
  // Compter (10)
  el("hana", "compter", "compter", "Hana", [], "1", "하나", ["L"], null, true),
  el("doul", "compter", "compter", "Doul", ["Dul"], "2", "둘", ["L"], null, true),
  el("set", "compter", "compter", "Set", [], "3", "셋", ["L"], null, true),
  el("net", "compter", "compter", "Net", [], "4", "넷", ["L"], null, true),
  el("dasot", "compter", "compter", "Dasot", ["Daseot"], "5", "다섯", ["L"], null, true),
  el("yosot", "compter", "compter", "Yosot", ["Yeoseot"], "6", "여섯", ["L"], null, true),
  el("ilgop", "compter", "compter", "Ilgop", [], "7", "일곱", ["L"], null, true),
  el("yeudol", "compter", "compter", "Yeudol", ["Yeodeol"], "8", "여덟", ["L"], null, true),
  el("ahop", "compter", "compter", "Ahop", [], "9", "아홉", ["L"], null, true),
  el("yeul", "compter", "compter", "Yeul", ["Yeol"], "10", "열", ["L"], null, true),

  // Commandements (12)
  el("tchaliot", "commandement", "commandements", "Tchaliot", ["Charyeot"], "Garde à vous", "차렷", ["L"], null, true),
  el("kyongnye", "commandement", "commandements", "Kyongnye", ["Kyeongnye", "Gyeongnye"], "Saluez", "경례", ["L"], null, true),
  el("tchoumbi", "commandement", "commandements", "Tchoumbi", ["Joumbi", "Junbi"], "Position de départ (prêt)", "준비", ["L", "T1"], 1, true),
  el("shijak", "commandement", "commandements", "Shijak", ["Sijak"], "Commencez", "시작", ["L"], null, true),
  el("keuman", "commandement", "commandements", "Keuman", ["Geuman"], "Arrêtez", "그만", ["L"], null, true),
  el("baro", "commandement", "commandements", "Baro", [], "Revenez", "바로", ["L"], null, true),
  el("chwio", "commandement", "commandements", "Chwio", ["Swieo"], "Repos", "쉬어", ["L"], null, true),
  el("dwiro-dora", "commandement", "commandements", "Dwiro Dora", ["Dwiro Dola"], "Demi-tour", "뒤로 돌아", ["L"], null, true),
  el("dora", "commandement", "commandements", "Dora", ["Dola"], "Tournez", "돌아", ["L"], null, true),
  el("ann-ja", "commandement", "commandements", "Ann ja", ["Anja"], "Assis", "앉아", ["L"], null, true),
  el("kihap", "commandement", "commandements", "Kihap", ["Kiap", "Gihap"], "Cri", "기합", ["L", "T1"], null, true),
  el("jesari", "commandement", "commandements", "Jésari", ["Jejari"], "Sur place", "제자리", ["L"], null, true),

  // La salle et les gens (7)
  el("dojang", "salle", "salle", "Dojang", [], "Salle d'entraînement", "도장", ["L"], null, true),
  el("dobok", "salle", "salle", "Dobok", [], "Tenue", "도복", ["L"], null, true),
  el("ti", "salle", "salle", "Ti", ["Tti"], "Ceinture", "띠", ["L"], null, true),
  el("sa-beum-nim", "salle", "salle", "Sa beum nim", ["Sabeomnim", "Sabomnim"], "Maître", "사범님", ["L"], null, true),
  el("poumse", "salle", "salle", "Poumse", ["Poomsae", "Poumsae"], "Forme (enchaînement)", "품새", ["L"], 2, true),
  el("keup", "salle", "salle", "Keup", ["Geup", "Kup"], "Niveau avant la ceinture noire", "급", ["L"], null, true),
  el("dan", "salle", "salle", "Dan", [], "Niveau à partir de la ceinture noire", "단", ["L"], null, true),

  // Le corps : niveaux (3) et parties (4)
  el("ale", "niveau", "corps", "Ale", ["Arae"], "Bas (bas-ventre)", "아래", ["T1"], null, true),
  el("montong", "niveau", "corps", "Montong", ["Momtong"], "Milieu (tronc, plexus)", "몸통", ["T1"], null, true),
  el("eulgoul", "niveau", "corps", "Eulgoul", ["Eolgul", "Olgul"], "Haut (visage)", "얼굴", ["T1"], null, true),
  el("joumok", "corps", "corps", "Joumok", ["Jumeok"], "Le poing", "주먹", ["L"], null, true),
  el("bal", "corps", "corps", "Bal", [], "Le pied", "발", ["L"], null, true),
  el("palmok", "corps", "corps", "Palmok", [], "L'avant-bras (côté radius)", "팔목", ["L"], null, true),
  el("ap-tchouk", "corps", "corps", "Ap tchouk", ["Apchuk"], "Le bol du pied (dessous des métatarsiens)", "앞축", ["L"], null, true),

  // Positions (5)
  el("moa-seugui", "position", "positions", "Moa Seugui", ["Moa Seogi", "Moa Seugi"], "Pieds joints, jambes tendues", "모아서기", ["P", "T1"], null, true),
  el("tchaliot-seugui", "position", "positions", "Tchaliot Seugui", ["Charyeot Seogi"], "Talons joints, pointes ouvertes à 45°", "차렷서기", ["P"], 3, false),
  el("naranhi-seugui", "position", "positions", "Naranhi Seugui", ["Naranhi Seogi", "Naranhi Seugi"], "Pieds parallèles, distants d'un pied", "나란히서기", ["P", "T1"], null, true),
  el("ap-seugui", "position", "positions", "Ap Seugui", ["Ap Seogi", "Ap Seugi"], "Position de marche, un pas entre les pieds", "앞서기", ["P", "T1"], null, true),
  el("ap-koubi-seugui", "position", "positions", "Ap Koubi Seugui", ["Ap Koubi", "Ap Kubi", "Ap Gubi"], "Position longue, un pas et demi", "앞굽이", ["P", "T1"], 4, true, "앞굽이"),

  // Techniques (6) et le poomsae (1)
  el("ale-maki", "technique", "techniques", "Ale Maki", ["Arae Makgi", "Ale Makki"], "Blocage bas", "아래막기", ["T1"], null, true),
  el("montong-an-maki", "technique", "techniques", "Montong An Maki", ["Momtong An Makgi", "Montong An Makki"], "Blocage intérieur au milieu", "몸통안막기", ["T1"], null, true),
  el("eulgoul-maki", "technique", "techniques", "Eulgoul Maki", ["Eolgul Makgi", "Olgul Makgi", "Eulgoul Makki"], "Blocage haut", "얼굴막기", ["T1"], null, true),
  el("montong-bande-jileugui", "technique", "techniques", "Montong Bandé Jileugui", ["Momtong Bandae Jireugi", "Montong Bande Jileugi"], "Coup de poing au milieu, du côté de la jambe avant", "몸통반대지르기", ["T1", "K"], 5, true),
  el("montong-baro-jileugui", "technique", "techniques", "Montong Baro Jileugui", ["Momtong Baro Jireugi", "Montong Baro Jileugi"], "Coup de poing au milieu, du côté opposé à la jambe avant", "몸통바로지르기", ["T1", "K"], 5, true),
  el("ap-tchagui", "technique", "techniques", "Ap Tchagui", ["Aptchagui", "Ap Tchagi", "Ap Chagi"], "Coup de pied de face", "앞차기", ["T1"], null, true),
  el("taegueug-il-jang", "poomsae", "taegeuk-il-jang", "Taegueug Il Jang", ["Taegeuk Il Jang", "Taeguk Il Jang"], "Premier poomsae", "태극 1장", ["T1", "K"], 6, true, "태극 일장"),

  // Mots de famille (4), jamais interrogés
  el("seugui", "famille", null, "Seugui", ["Seugi", "Seogi"], "Position", "서기", ["P"], null, false),
  el("maki", "famille", null, "Maki", ["Makki", "Makgi"], "Blocage", "막기", ["T1"], null, false),
  el("jileugui", "famille", null, "Jileugui", ["Jileugi", "Jireugi"], "Coup de poing", "지르기", ["T1"], null, false),
  el("tchagui", "famille", null, "Tchagui", ["Tchagi", "Chagi"], "Coup de pied", "차기", ["T1"], null, false),

  // Nombres de la dictée, 11 à 18 (8), jamais interrogés
  el("yeul-hana", "nombre-dictee", null, "Yeul Hana", ["Yeolhana"], "11", "열하나", ["L", "J"], 7, false),
  el("yeul-doul", "nombre-dictee", null, "Yeul Doul", ["Yeoldul"], "12", "열둘", ["L", "J"], 7, false),
  el("yeul-set", "nombre-dictee", null, "Yeul Set", ["Yeolset"], "13", "열셋", ["L", "J"], 7, false),
  el("yeul-net", "nombre-dictee", null, "Yeul Net", ["Yeolnet"], "14", "열넷", ["L", "J"], 7, false),
  el("yeul-dasot", "nombre-dictee", null, "Yeul Dasot", ["Yeoldaseot"], "15", "열다섯", ["L", "J"], 7, false),
  el("yeul-yosot", "nombre-dictee", null, "Yeul Yosot", ["Yeolyeoseot"], "16", "열여섯", ["L", "J"], 7, false),
  el("yeul-ilgop", "nombre-dictee", null, "Yeul Ilgop", ["Yeorilgop"], "17", "열일곱", ["L", "J"], 7, false),
  el("yeul-yeudol", "nombre-dictee", null, "Yeul Yeudol", ["Yeoryeodeol"], "18", "열여덟", ["L", "J"], 7, false),
];
