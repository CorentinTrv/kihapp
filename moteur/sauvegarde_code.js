// Kihapp, moteur/sauvegarde_code.js (lot K9)
// ====================================================================
// Module PUR : ni hasard, ni horloge, ni DOM, ni stockage. L'état de l'élève et
// le jour sont passés par l'appelant, rien n'est écrit nulle part.
//
// Un code de sauvegarde tient en une ligne qu'on copie et qu'on recolle :
//   KIHAPP1-<état en JSON, en base64url>-<somme de 8 caractères>
// Le 1 du préfixe est la version du FORMAT du code, pas le schéma de l'état (qui
// voyage dedans). La somme est un FNV-1a 32 bits du segment base64url : elle ne
// protège de rien d'hostile (le code est public, l'élève le recolle chez lui),
// elle détecte un code recopié de travers ou coupé en route.

import { serieCourante } from "./serie.js";

const PREFIXE = "KIHAPP1-";
const LONGUEUR_SOMME = 8;

const PAS_UN_CODE = "Ce n'est pas un code Kihapp.";
const ABIME = "Ce code est abîmé, recopie-le en entier.";
const PLUS_RECENT = "Ce code vient d'une version plus récente de Kihapp. Mets l'app à jour, puis recommence.";

// base64url : lettres, chiffres, - et _ ; jamais de =, + ni /.
const SEGMENT_VALIDE = /^[A-Za-z0-9_-]+$/;
const JOUR_VALIDE = /^\d{4}-\d{2}-\d{2}$/;

const echec = (message) => ({ ok: false, message });
const estUnObjet = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** FNV-1a 32 bits d'un texte ASCII, en 8 caractères hexadécimaux. */
export function sommeFnv(texte) {
  let hachage = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    hachage ^= texte.charCodeAt(i);
    hachage = Math.imul(hachage, 0x01000193);
  }
  return (hachage >>> 0).toString(16).padStart(LONGUEUR_SOMME, "0");
}

// Le JSON passe par UTF-8 (TextEncoder) avant le base64 : btoa seul casserait le hangeul.
function versBase64url(texte) {
  let binaire = "";
  for (const octet of new TextEncoder().encode(texte)) binaire += String.fromCharCode(octet);
  return btoa(binaire).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

// Lève si le segment n'est pas du base64 ou si les octets ne sont pas de l'UTF-8 valide.
function depuisBase64url(segment) {
  const base64 = segment.replaceAll("-", "+").replaceAll("_", "/");
  const binaire = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const octets = Uint8Array.from(binaire, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(octets);
}

/** Le code de sauvegarde de cet état, daté du jour `aujourdhui` ('AAAA-MM-JJ'). */
export function encoder(etat, aujourdhui) {
  const segment = versBase64url(JSON.stringify({ etat, le: aujourdhui }));
  return `${PREFIXE}${segment}-${sommeFnv(segment)}`;
}

const pluriel = (n, un, plusieurs) => `${n} ${n === 1 ? un : plusieurs}`;

function resumer(etat, le) {
  const [, mois, jour] = le.split("-");
  const elements = pluriel(Object.keys(etat.elements).length, "élément travaillé", "éléments travaillés");
  const serie = pluriel(serieCourante(etat, le), "jour", "jours");
  return `${elements}, série de ${serie}, sauvegardé le ${jour}/${mois}.`;
}

/**
 * Lit un code collé. Rend { ok: true, etat, le, resume } ou { ok: false, message }.
 * Les espaces et retours à la ligne sont ignorés (un copier-coller depuis Notes
 * en ajoute). L'état rendu est tel qu'il a été sauvegardé : si son schéma est plus
 * ancien que `schemaConnu`, la migration revient à l'appelant. Ne lève jamais.
 */
export function decoder(code, schemaConnu) {
  if (typeof code !== "string") return echec(PAS_UN_CODE);
  const net = code.replace(/\s+/g, "");
  if (!net.startsWith(PREFIXE)) return echec(PAS_UN_CODE);

  // La somme est faite de caractères hexadécimaux : elle se prend par la fin, car
  // le tiret fait partie de l'alphabet base64url.
  const reste = net.slice(PREFIXE.length);
  const segment = reste.slice(0, -(LONGUEUR_SOMME + 1));
  const somme = reste.slice(-LONGUEUR_SOMME);
  if (reste.at(-(LONGUEUR_SOMME + 1)) !== "-" || !SEGMENT_VALIDE.test(segment) || somme !== sommeFnv(segment)) {
    return echec(ABIME);
  }

  let contenu;
  try {
    contenu = JSON.parse(depuisBase64url(segment));
  } catch {
    return echec(ABIME);
  }
  const { etat, le } = estUnObjet(contenu) ? contenu : {};
  if (!Number.isInteger(etat?.schema) || etat.schema < 0 || !JOUR_VALIDE.test(le ?? "")) return echec(ABIME);
  if (etat.schema > schemaConnu) return echec(PLUS_RECENT);
  if (!estUnObjet(etat.elements) || !estUnObjet(etat.jours)) return echec(ABIME);

  return { ok: true, etat, le, resume: resumer(etat, le) };
}
