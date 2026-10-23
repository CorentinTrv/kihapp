// parcours.js, lot K2 de Kihapp
//
// Une ceinture et ses sept unités, dans l'ordre où l'élève les rencontre.
// Les catégories famille et nombre-dictee n'ont pas d'unité.

export const CEINTURES = [
  { id: "vers-jaune", titre: "Vers la ceinture jaune" },
];

export const UNITES = [
  { id: "compter", titre: "Compter", ceinture: "vers-jaune", ordre: 1 },
  { id: "commandements", titre: "Les commandements", ceinture: "vers-jaune", ordre: 2 },
  { id: "salle", titre: "La salle et les gens", ceinture: "vers-jaune", ordre: 3 },
  { id: "corps", titre: "Le corps", ceinture: "vers-jaune", ordre: 4 },
  { id: "positions", titre: "Les positions", ceinture: "vers-jaune", ordre: 5 },
  { id: "techniques", titre: "Les techniques", ceinture: "vers-jaune", ordre: 6 },
  { id: "taegeuk-il-jang", titre: "Taegueug Il Jang", ceinture: "vers-jaune", ordre: 7 },
];
