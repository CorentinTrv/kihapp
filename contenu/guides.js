// Kihapp, contenu/guides.js (lot « guide d'unité »)
// ====================================================================
// Les sept guides, un par unité de parcours.js, dans le même ordre. Chaque guide a deux
// blocs de texte : « Pour retenir » (1 à 3 astuces, écrites par le Jarvis) et « Au dojang »
// (0 à 2 faits sourcés ; [] = le bloc n'existe pas à l'écran). Le troisième bloc, « Phrases
// clés », ne s'écrit PAS ici : l'écran le tire d'ELEMENTS (tous les éléments de l'unité).
//
// - retenir : { texte, mots } ; `mots` liste les ids du vocabulaire que l'astuce nomme.
// - dojang : { texte, sources, mots? } ; `sources` sont des clés de SOURCES, jamais J.
// guides_test.js vérifie que chaque mot existe et que son fftda figure tel quel dans le texte.
//
// Source des textes : context/import/taekwondo/2026-10-27_kihapp_guides-unite_contenu.md.
// Donnée pure : aucun accès à window ni à document.

export const GUIDES = [
  {
    unite: "compter",
    retenir: [
      {
        texte: "Par paires : Hana, Doul ; Set, Net ; Dasot, Yosot. Set et Net ne changent que d'une lettre, Dasot et Yosot finissent pareil.",
        mots: ["hana", "doul", "set", "net", "dasot", "yosot"],
      },
      {
        texte: "Ilgop, comme « il galope », pour 7 ; Ahop, comme « allez, hop ! », pour 9 ; Yeul, le plus court, ferme la série à 10.",
        mots: ["ilgop", "ahop", "yeul"],
      },
    ],
    dojang: [
      {
        texte: "Le lexique de la FFTDA a une seconde série pour les rangs : Il pour 1er, Yi pour 2e, Sam pour 3e. C'est le Il de Taegueug Il Jang, le premier poomsae.",
        sources: ["L", "T1"],
        mots: ["taegueug-il-jang"],
      },
    ],
  },
  {
    unite: "commandements",
    retenir: [
      {
        texte: "Par contraires : Shijak (Commencez) et Keuman (Arrêtez), Tchaliot (Garde à vous) et Chwio (Repos).",
        mots: ["shijak", "keuman", "tchaliot", "chwio"],
      },
      {
        texte: "Dwiro Dora, c'est Dora (Tournez) avec un mot de plus : le plus long des deux pour le plus grand tour, le demi-tour.",
        mots: ["dwiro-dora", "dora"],
      },
      {
        texte: "Baro (Revenez) reviendra dans Montong Baro Jileugui avec un autre sens : le poing du côté opposé à la jambe avant.",
        mots: ["baro", "montong-baro-jileugui"],
      },
    ],
    dojang: [
      {
        texte: "Avant Taegueug Il Jang : Tchaliot, Kyongnye, Tchoumbi, puis le nom du poomsae et Shijak. À la fin, Baro te ramène en position de départ.",
        sources: ["T1"],
        mots: ["taegueug-il-jang", "tchaliot", "kyongnye", "tchoumbi", "shijak", "baro"],
      },
      {
        texte: "Kihap, le cri, se pousse une seule fois dans Taegueug Il Jang : au dernier coup de poing.",
        sources: ["T1", "K"],
        mots: ["kihap", "taegueug-il-jang"],
      },
    ],
  },
  {
    unite: "salle",
    retenir: [
      {
        texte: "Les deux mots en Do vont ensemble : le Dojang, la salle, et le Dobok, la tenue que tu y portes.",
        mots: ["dojang", "dobok"],
      },
      {
        texte: "Keup jusqu'à la ceinture noire, Dan à partir d'elle : tu commences en Keup.",
        mots: ["keup", "dan"],
      },
      {
        texte: "Ti, la ceinture, c'est aussi le nom de la mascotte de Kihapp.",
        mots: ["ti"],
      },
    ],
    dojang: [],
  },
  {
    unite: "corps",
    retenir: [
      {
        texte: "Trois étages, de bas en haut : Ale, Montong, Eulgoul. Montre-les sur toi en les disant.",
        mots: ["ale", "montong", "eulgoul"],
      },
      {
        texte: "Ces trois mots reviennent devant les blocages de l'unité 6 : Ale Maki, Montong An Maki, Eulgoul Maki.",
        mots: ["ale", "montong", "eulgoul", "ale-maki", "montong-an-maki", "eulgoul-maki"],
      },
      {
        texte: "Ap tchouk, Ap Seugui et Ap Tchagui commencent par le même signe coréen, 앞 : regarde le hangeul.",
        mots: ["ap-tchouk", "ap-seugui", "ap-tchagui"],
      },
    ],
    dojang: [],
  },
  {
    unite: "positions",
    retenir: [
      {
        texte: "Toutes finissent par Seugui, la position : retiens le premier mot.",
        mots: ["seugui"],
      },
      {
        texte: "Ap Seugui, un pas entre les pieds ; Ap Koubi Seugui, un pas et demi : le mot en plus, c'est le demi-pas en plus.",
        mots: ["ap-seugui", "ap-koubi-seugui"],
      },
      {
        texte: "Moa Seugui, les pieds se touchent ; Naranhi Seugui, ils se rangent côte à côte, à un pied d'écart.",
        mots: ["moa-seugui", "naranhi-seugui"],
      },
    ],
    dojang: [
      {
        texte: "Dans Taegueug Il Jang, la FFTDA place le salut en Moa Seugui, pieds joints, et non en Tchaliot Seugui.",
        sources: ["T1", "P"],
        mots: ["taegueug-il-jang", "moa-seugui", "tchaliot-seugui"],
      },
      {
        texte: "Tchoumbi, la position de départ du poomsae, se prend en Naranhi Seugui.",
        sources: ["T1"],
        mots: ["tchoumbi", "naranhi-seugui"],
      },
    ],
  },
  {
    unite: "techniques",
    retenir: [
      {
        texte: "Le dernier mot dit le geste : Maki bloque, Jileugui frappe du poing, Tchagui frappe du pied. Le premier dit souvent la hauteur, vue dans Le corps.",
        mots: ["maki", "jileugui", "tchagui"],
      },
      {
        // Bandé n'est pas un élément du vocabulaire : l'astuce ne nomme aucun mot vérifiable.
        texte: "Bandé ou Baro : regarde ton pied avant. Poing du même côté, Bandé ; poing du côté opposé, Baro.",
        mots: [],
      },
    ],
    dojang: [
      {
        texte: "Les six techniques de cette unité sont toutes dans Taegueug Il Jang, l'unité suivante.",
        sources: ["T1", "K"],
        mots: ["taegueug-il-jang"],
      },
    ],
  },
  {
    unite: "taegeuk-il-jang",
    retenir: [
      {
        texte: "Trois parties sur le même modèle : quatre gestes en Ap Seugui, blocage puis coup de poing, deux fois ; puis Ale Maki et un coup de poing en Ap Koubi Seugui.",
        mots: ["ap-seugui", "ale-maki", "ap-koubi-seugui"],
      },
      {
        texte: "Le blocage monte d'une partie à l'autre : Ale Maki, puis Montong An Maki, puis Eulgoul Maki.",
        mots: ["ale-maki", "montong-an-maki", "eulgoul-maki"],
      },
      {
        texte: "Dans la troisième partie, Ap Tchagui vient avant les coups de poing ; le Kihap tombe sur le tout dernier, le 18.",
        mots: ["ap-tchagui", "kihap"],
      },
    ],
    dojang: [
      {
        texte: "La fiche FFTDA du club compte 24 numéros, Kihapp en compte 18 comme le Kukkiwon : le salut et Tchoumbi en ouvrent et en ferment la liste, et le coup de pied et le coup de poing du 14 et du 16 y font deux numéros.",
        sources: ["T1", "K"],
        mots: ["tchoumbi"],
      },
    ],
  },
];
