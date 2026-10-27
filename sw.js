// Kihapp, service worker (lot K10)
// ==================================
// Kihapp n'a aucune donnée serveur : tout ce qu'il sert ne change qu'avec une
// version. D'où un CACHE D'ABORD (le réseau n'est qu'un repli), à l'inverse de
// Stovo qui lit un stock vivant. Conséquence : un fichier modifié sans nouveau
// CACHE_NAME resterait figé sur les téléphones pour toujours. L'outil de dépôt
// (outils/deposer-kihapp.mjs) refuse donc un dépôt sans nouvelle version.
//
// L'adresse corentintrv.github.io est PARTAGÉE avec la copie GitHub Pages de
// Stovo : même Cache Storage, même localStorage. Ce fichier n'efface donc que
// les caches « kihapp-vN » et n'intercepte que ce qui est sous sa portée.
//
// Mise à jour : jamais de skipWaiting automatique. Une nouvelle version attend ;
// app.js affiche « Nouvelle version prête », et c'est le toucher de l'élève qui
// envoie le message SKIP_WAITING (patron du lot A6 de Stovo). Sans ce geste, une
// PWA iPhone rarement fermée garderait l'ancienne version des semaines.

// 23/10/2026 : première version, coquille sans audio.
// 26/10/2026 : v2, dépôt intermédiaire avant la refonte (mouvements 7 à 18, Baro, exercices de gestes).
// 27/10/2026 : v3, la refonte façon Duolingo (Ti, leçon et fin, onglets, accueil, écrans de service, poomsae).
// 27/10/2026 : v4, fond bleu piscine en clair, textes plus noirs, plus gros et plus gras (choix N1).
const CACHE_NAME = 'kihapp-v4';

// ---- DEBUT bloc pur ----
// Pas d'accès à self ici : sw_test.js extrait ce bloc du texte de ce fichier et
// l'exécute. Un service worker n'est pas importable, on teste donc le code réel.

// La coquille : TOUS les fichiers de app/, écrits à la main, hors *_test.js, hors
// sw.js, hors audio/ (lu à part, voir fichiersAudio) et hors fichiers cachés.
// sw_test.js compare cette liste au disque : un module oublié casse le test.
const FICHIERS_COQUILLE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './polices/nunito-latin-wght-normal.woff2',
  './polices/OFL.txt',
  './animation/carte.js',
  './animation/chronologie.js',
  './animation/geometrie.js',
  './animation/poses.js',
  './animation/rendu.js',
  './contenu/elements.js',
  './contenu/parcours.js',
  './contenu/sources.js',
  './contenu/taegeuk_il_jang.js',
  './contenu/vocabulaire.js',
  './ecrans/accueil.js',
  './ecrans/fin_lecon.js',
  './ecrans/gestes.js',
  './ecrans/lecon.js',
  './ecrans/lexique.js',
  './ecrans/moi.js',
  './ecrans/poomsae.js',
  './ecrans/reglages.js',
  './ecrans/session.js',
  './ecrans/sources.js',
  './ecrans/ti.js',
  './moteur/aleatoire.js',
  './moteur/dates.js',
  './moteur/dictee_lecteur.js',
  './moteur/dictee_plan.js',
  './moteur/exercices.js',
  './moteur/lecon_composer.js',
  './moteur/leitner.js',
  './moteur/parcours_logique.js',
  './moteur/sauvegarde_code.js',
  './moteur/serie.js',
  './moteur/stockage.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon-180.png',
];

// Les caches à effacer : les anciennes versions de Kihapp, rien d'autre. Un nom
// de Stovo (stovo-app-v63), un nom mal formé (kihapp-v2-old) ou celui d'un autre
// outil restent intacts.
function cachesAEffacer(noms, versionCourante) {
  return (noms || []).filter((nom) => nom !== versionCourante && /^kihapp-v\d+$/.test(nom));
}

// Les fichiers son listés par audio/liste.json (écrite par l'outil audio, un
// tableau d'entrées { id, fichier, ... }). `fichier` est le nom dans audio/, avec
// ou sans le préfixe « audio/ ». Une entrée mal formée ou qui sort du dossier
// (.., chemin absolu) est ignorée, jamais une erreur : l'installation doit réussir.
function fichiersAudio(liste) {
  if (!Array.isArray(liste)) return [];
  const chemins = [];
  for (const entree of liste) {
    if (!entree || typeof entree.fichier !== 'string') continue;
    const nom = entree.fichier.replace(/^audio\//, '');
    if (nom === '' || nom.includes('..') || nom.includes('\\') || nom.includes(':') || nom.startsWith('/')) continue;
    const chemin = './audio/' + nom;
    if (!chemins.includes(chemin)) chemins.push(chemin);
  }
  return chemins;
}

// Une requête est-elle sous la portée de Kihapp (même origine ET même dossier) ?
// L'adresse de Stovo (/stovo/...) vit sur la même origine et ne doit pas être touchée.
function sousLaPortee(adresse, portee) {
  try {
    return new URL(adresse).href.startsWith(portee);
  } catch (_e) {
    return false;
  }
}
// ---- FIN bloc pur ----

// cache: 'reload' : le précache va chercher la version du SERVEUR, pas celle que le
// cache HTTP du navigateur garde (GitHub Pages en laisse dix minutes). Sans cela, une
// version neuve installée juste après un dépôt pourrait se remplir d'anciens fichiers,
// et le cache d'abord les figerait.
const requeteNeuve = (chemin) => new Request(chemin, { cache: 'reload' });

// Le son arrive plus tard. S'il est absent (404, hors ligne), l'installation réussit
// quand même : la coquille suffit, l'app se passe de son. Un fichier son qui ne vient
// pas n'empêche pas non plus la version de s'installer.
async function precacherLeSon(cache) {
  try {
    const reponse = await fetch(requeteNeuve('./audio/liste.json'));
    if (!reponse.ok) return;
    const fichiers = fichiersAudio(await reponse.clone().json());
    await cache.put('./audio/liste.json', reponse);
    await Promise.allSettled(fichiers.map((chemin) => cache.add(requeteNeuve(chemin))));
  } catch (_e) {
    // pas de liste lisible : pas de son pour cette version
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(FICHIERS_COQUILLE.map(requeteNeuve));
    await precacherLeSon(cache);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(cachesAEffacer(noms, CACHE_NAME).map((nom) => caches.delete(nom)));
    // Sans risque : l'activation n'arrive jamais toute seule (pas de skipWaiting
    // automatique), seulement au prochain lancement à froid ou après le toucher de
    // l'élève sur le bandeau, et app.js recharge alors la page lui-même.
    await self.clients.claim();
  })());
});

// Cache d'abord, dans le cache de CETTE version seulement (caches.match chercherait
// dans les caches de Stovo aussi). Une navigation hors ligne retombe sur index.html.
async function repondre(requete) {
  const cache = await caches.open(CACHE_NAME);
  const navigation = requete.mode === 'navigate';
  const rangee = await cache.match(requete);
  if (rangee) return rangee;
  try {
    return await fetch(requete);
  } catch (erreur) {
    const accueil = navigation ? await cache.match('./index.html') : undefined;
    if (accueil) return accueil;
    throw erreur;
  }
}

self.addEventListener('fetch', (event) => {
  const requete = event.request;
  // Autre origine, autre dossier (/stovo/), autre méthode : on ne s'en mêle pas.
  if (requete.method !== 'GET' || !sousLaPortee(requete.url, self.registration.scope)) return;
  event.respondWith(repondre(requete));
});

// Le SEUL déclencheur de self.skipWaiting() de ce fichier : le message envoyé par
// app.js quand l'élève touche « Mettre à jour ». Jamais tout seul.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
