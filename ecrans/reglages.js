// Kihapp, ecrans/reglages.js (lot K9) : l'écran #reglages.
// Copier mon code, coller un code (avec confirmation avant de remplacer), le
// rythme de dictée par défaut, le stockage protégé, la version servie.
//
// afficherReglages(racine) est appelé à chaque affichage : l'écran repart propre
// (zone de collage vidée, confirmation cachée). Les gestes sont branchés une
// seule fois.

import { decoder, encoder } from '../moteur/sauvegarde_code.js';
import { migrer, SCHEMA } from '../moteur/stockage.js';
import { aujourdhui, enregistrer, etatCourant } from './session.js';

// La progression d'avant un import, gardée au cas où l'élève regrette. Clé du
// préfixe « kihapp: » : l'origine est partagée avec Stovo.
const CLE_AVANT_IMPORT = 'kihapp:etat:avant-import';

const MESSAGE_COPIE = 'Code copié. Colle-le dans tes notes.';
const MESSAGE_A_LA_MAIN = 'Copie ce code à la main, puis colle-le dans tes notes.';
const INCONNU = 'Inconnu sur ce navigateur';

let racineBranchee = null;
let importEnAttente = null; // le résultat de decoder() que « Remplacer » appliquera
let protectionDemandee = false;

/**
 * Demande une fois au navigateur de protéger le stockage de l'effacement
 * automatique (accordé ou non selon ses règles). L'accueil l'appelle au retour
 * d'une leçon finie, quand la progression vaut la peine d'être gardée.
 */
export function demanderStockageProtege() {
  if (protectionDemandee || !navigator.storage?.persist) return;
  protectionDemandee = true;
  try {
    Promise.resolve(navigator.storage.persist()).catch(() => {});
  } catch {
    // sans effet : l'état « Non » s'affiche dans Réglages
  }
}

// ---- Copier mon code ----------------------------------------------------------------

// Partage natif s'il existe, sinon presse-papiers. 'annule' : l'élève a fermé la
// feuille de partage, rien à dire. 'affiche' : aucun des deux n'a marché.
async function transmettre(code) {
  if (navigator.share) {
    try {
      await navigator.share({ text: code });
      return 'fait';
    } catch (erreur) {
      if (erreur?.name === 'AbortError') return 'annule';
    }
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(code);
      return 'fait';
    } catch {
      // refusé : le code est affiché plus bas
    }
  }
  return 'affiche';
}

async function copierMonCode(racine) {
  const code = encoder(etatCourant(), aujourdhui());
  const issue = await transmettre(code);
  const zone = racine.querySelector('#reg-code-affiche');
  zone.hidden = issue !== 'affiche';
  if (issue === 'affiche') {
    zone.value = code;
    zone.focus();
    zone.select();
  }
  racine.querySelector('#reg-copie').textContent =
    { fait: MESSAGE_COPIE, affiche: MESSAGE_A_LA_MAIN, annule: '' }[issue];
}

// ---- Coller un code -----------------------------------------------------------------

function cacherConfirmation(racine) {
  importEnAttente = null;
  racine.querySelector('#reg-confirmation').hidden = true;
}

function verifierLeCode(racine) {
  const resultat = decoder(racine.querySelector('#reg-coller').value, SCHEMA);
  racine.querySelector('#reg-verdict').textContent = resultat.ok ? resultat.resume : resultat.message;
  racine.querySelector('#reg-confirmation').hidden = !resultat.ok;
  importEnAttente = resultat.ok ? resultat : null;
}

function remplacerMaProgression() {
  if (!importEnAttente) return;
  try {
    window.localStorage.setItem(CLE_AVANT_IMPORT, JSON.stringify(etatCourant()));
  } catch {
    // pas de place pour la copie : l'import se fait quand même, c'est ce que l'élève a demandé
  }
  enregistrer(migrer(importEnAttente.etat));
  importEnAttente = null;
  location.hash = '#accueil';
}

// ---- Rythme, stockage, version ------------------------------------------------------

function marquerLeRythme(racine) {
  const rythme = etatCourant().reglages?.rythme;
  for (const b of racine.querySelectorAll('[data-rythme]')) {
    b.setAttribute('aria-pressed', String(Number(b.dataset.rythme) === rythme));
  }
}

function choisirLeRythme(racine, rythme) {
  const etat = etatCourant();
  enregistrer({ ...etat, reglages: { ...etat.reglages, rythme } });
  marquerLeRythme(racine);
}

async function texteStockage() {
  if (!navigator.storage?.persisted) return INCONNU;
  try {
    return (await navigator.storage.persisted()) ? 'Oui' : "Non, le navigateur peut l'effacer s'il manque de place";
  } catch {
    return INCONNU;
  }
}

/** Le plus récent des caches « kihapp-vN » parmi ces noms (les caches de Stovo n'en sont pas), ou null. */
function nomDeCache(noms) {
  const versions = noms.map((n) => /^kihapp-v(\d+)$/.exec(n)).filter(Boolean).sort((a, b) => Number(b[1]) - Number(a[1]));
  return versions.length > 0 ? versions[0][0] : null;
}

async function texteVersion() {
  try {
    return `Version : ${nomDeCache(await caches.keys()) ?? 'développement'}`;
  } catch {
    return 'Version : développement';
  }
}

// ---- L'écran ------------------------------------------------------------------------

function brancher(racine) {
  racine.querySelector('#reg-copier').addEventListener('click', () => copierMonCode(racine));
  racine.querySelector('#reg-verifier').addEventListener('click', () => verifierLeCode(racine));
  racine.querySelector('#reg-annuler').addEventListener('click', () => afficherReglages(racine));
  racine.querySelector('#reg-remplacer').addEventListener('click', remplacerMaProgression);
  // Un code modifié après la vérification n'est plus celui qui a été vérifié.
  racine.querySelector('#reg-coller').addEventListener('input', () => {
    cacherConfirmation(racine);
    racine.querySelector('#reg-verdict').textContent = '';
  });
  for (const b of racine.querySelectorAll('[data-rythme]')) {
    b.addEventListener('click', () => choisirLeRythme(racine, Number(b.dataset.rythme)));
  }
}

export function afficherReglages(racine) {
  if (racineBranchee !== racine) {
    racineBranchee = racine;
    brancher(racine);
  }
  cacherConfirmation(racine);
  racine.querySelector('#reg-coller').value = '';
  racine.querySelector('#reg-verdict').textContent = '';
  racine.querySelector('#reg-copie').textContent = '';
  racine.querySelector('#reg-code-affiche').hidden = true;
  marquerLeRythme(racine);
  texteStockage().then((t) => { racine.querySelector('#reg-stockage').textContent = t; });
  texteVersion().then((t) => { racine.querySelector('#reg-version').textContent = t; });
}
