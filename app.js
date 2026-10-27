// Kihapp, app.js (lots K1, K13, K6, K9, K10 et R7a) : le routeur par ancre, puis le service worker.
// Montre la section d'écran dont l'id égale l'ancre, masque les autres.
// Une ancre vide ou inconnue ramène à #accueil.
// L'écran #poomsae anime en continu : on le lance quand il s'affiche et on
// l'arrête dès qu'on le quitte (sinon la boucle d'animation tourne pour rien).
// #lecon et #fin n'ont de sens qu'avec une leçon en cours ou qui vient de
// finir : sans elle (adresse tapée, rechargement), retour à l'accueil.
// R7a : le corps de la page porte l'écran montré (data-ecran, que styles.css lit pour cacher la barre
// d'onglets pendant une leçon et sur la fin), et la barre marque d'un aria-current l'onglet de cet écran.

import { afficherAccueil } from "./ecrans/accueil.js";
import { afficherFin } from "./ecrans/fin_lecon.js";
import { afficherLecon } from "./ecrans/lecon.js";
import { afficherLexique } from "./ecrans/lexique.js";
import { afficherMoi } from "./ecrans/moi.js";
import { arreterPoomsae, initialiserPoomsae } from "./ecrans/poomsae.js";
import { afficherReglages } from "./ecrans/reglages.js";
import { leconCourante, leconTerminee } from "./ecrans/session.js";
import { afficherSources } from "./ecrans/sources.js";

const ECRAN_PAR_DEFAUT = "accueil";

// L'onglet de chaque écran de la barre ; #lecon et #fin n'en ont pas (la barre y est cachée).
const ONGLET_DE = {
  accueil: "accueil", lexique: "accueil", dictee: "accueil",
  poomsae: "poomsae",
  moi: "moi", reglages: "moi", sources: "moi",
};

function afficherEcran() {
  const ecrans = [...document.querySelectorAll("main > section[id]")];
  const demande = location.hash.slice(1);
  let cible = ecrans.some((e) => e.id === demande) ? demande : ECRAN_PAR_DEFAUT;
  if (cible === "lecon" && !leconCourante()) cible = ECRAN_PAR_DEFAUT;
  if (cible === "fin" && !leconTerminee()) cible = ECRAN_PAR_DEFAUT;
  // L'adresse dit la vérité : sinon, retaper la même ancre ne changerait rien (pas de hashchange).
  if (cible !== demande) history.replaceState(null, "", `#${cible}`);
  for (const e of ecrans) e.hidden = e.id !== cible;
  document.body.dataset.ecran = cible;
  for (const onglet of document.querySelectorAll(".onglets a")) {
    if (onglet.hash.slice(1) === ONGLET_DE[cible]) onglet.setAttribute("aria-current", "page");
    else onglet.removeAttribute("aria-current");
  }
  const racine = document.getElementById(cible);
  if (cible === "accueil") afficherAccueil(racine);
  if (cible === "lecon") afficherLecon(racine);
  if (cible === "fin") afficherFin(racine);
  if (cible === "lexique") afficherLexique(racine);
  if (cible === "moi") afficherMoi(racine);
  if (cible === "sources") afficherSources(racine);
  if (cible === "reglages") afficherReglages(racine);
  if (cible === "poomsae") initialiserPoomsae(racine);
  else arreterPoomsae();
}

addEventListener("hashchange", afficherEcran);
afficherEcran();

// ---- Hors connexion et mise à jour (lot K10) ----------------------------------------
// Le service worker (sw.js) garde l'app en cache. Quand une nouvelle version est
// installée, elle ATTEND : on affiche un bandeau, et c'est le toucher de l'élève qui
// la fait passer devant (message SKIP_WAITING), puis la page se recharge UNE fois.

const bandeauMaj = document.getElementById("maj-bandeau");
const boutonMaj = document.getElementById("maj-bouton");
let versionEnAttente = null;
let majDemandee = false; // seul un toucher sur le bandeau autorise le rechargement
let rechargementFait = false; // garde : jamais deux rechargements

function proposerLaMiseAJour(worker) {
  versionEnAttente = worker;
  bandeauMaj.hidden = false;
}

boutonMaj.addEventListener("click", () => {
  if (!versionEnAttente) return;
  majDemandee = true;
  boutonMaj.disabled = true;
  versionEnAttente.postMessage({ type: "SKIP_WAITING" });
});

async function enregistrerLeServiceWorker() {
  try {
    const enregistrement = await navigator.serviceWorker.register("sw.js", { scope: "./" });
    // Une version déjà installée attendait avant même ce chargement.
    if (enregistrement.waiting) proposerLaMiseAJour(enregistrement.waiting);
    // Ou elle s'installe pendant la session. Sans contrôleur, c'est la toute première
    // installation : rien à mettre à jour.
    enregistrement.addEventListener("updatefound", () => {
      const nouveau = enregistrement.installing;
      nouveau?.addEventListener("statechange", () => {
        if (nouveau.state === "installed" && navigator.serviceWorker.controller) proposerLaMiseAJour(nouveau);
      });
    });
  } catch (erreur) {
    console.error("Kihapp : le service worker n'a pas pu s'enregistrer.", erreur);
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // La toute première installation prend aussi le contrôle (clients.claim) : pas de rechargement alors.
    if (!majDemandee || rechargementFait) return;
    rechargementFait = true;
    location.reload();
  });
  if (document.readyState === "complete") enregistrerLeServiceWorker();
  else addEventListener("load", enregistrerLeServiceWorker);
}
