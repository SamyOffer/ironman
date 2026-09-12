/* ============================================================
   SYNC-FICHIER — sauvegarde dans le CLOUD (partagé simple + coach)

   La source de vérité est une base Firebase Realtime Database
   (projet Google "ironman-samy-2028", gratuite, permanente).
   Chaque modification y est poussée ; chaque ouverture de page la
   relit. Résultat : les données suivent, peu importe le navigateur
   (Safari, Arc, Chrome...) ou l'appareil.
   Le localStorage sert de copie de travail et de mode hors-ligne.

   Historique : jsonblob.com (v1 cloud) a fermé les créations en
   août 2026 — remplacé par Firebase le 8 sept. 2026.

   Format stocké côté Firebase : { d: "<paquet JSON en chaîne>", maj: <ts> }.
   Le paquet est une CHAÎNE car nos clés contiennent des points
   ("journal.2026-08-07.poids"), interdits dans les clés Firebase.

   Filet de sécurité : le robot GitHub (.github/workflows/
   garde-donnees.yml) archive une copie dans le repo toutes les 6 h.

   À charger AVANT tous les autres scripts : il fournit STORE_KEY.
   ============================================================ */

"use strict";

/* Clé du bloc COURANT (source unique — main.js et app.js l'utilisent).
   Changer de bloc = nouvelle clé (v3...), les anciens blocs restent dans le cloud. */
const STORE_KEY = "ironman-samy-bloc3";

const SYNC_URL = "https://ironman-samy-2028-default-rtdb.europe-west1.firebasedatabase.app/ironman.json";
const SYNC_PREFIXE = "ironman-samy-";     // toutes les clés de blocs, passés et courant
const SYNC_CLE_MAJ = "ironman-sync-maj";  // horodatage de la dernière écriture locale

let syncEnLigne = true;
let syncTimer = null;
let syncEnAttente = false;

/* -- Tous les blocs présents dans localStorage -> { "ironman-samy-blocN": {...} } -- */
function syncLireLocal() {
  const paquet = {};
  for (let i = 0; i < localStorage.length; i++) {
    const cle = localStorage.key(i);
    if (!cle || !cle.startsWith(SYNC_PREFIXE)) continue;
    try { paquet[cle] = JSON.parse(localStorage.getItem(cle)) || {}; } catch { /* clé illisible : ignorée */ }
  }
  return paquet;
}

/* -- RÈGLE D'OR anti-écrasement : on ne POUSSE jamais vers le cloud avant
      d'avoir réussi à le LIRE et à le fusionner dans le localStorage.
      Sans ça, un navigateur vide (ex. téléphone dont la lecture a échoué)
      peut remplacer tout le cloud par presque rien — c'est arrivé. -- */
let syncPret = false;      // un pull réussi a été fusionné -> pousser est autorisé
let syncRetryTimer = null;

/* -- Fusion du cloud dans le localStorage, clé par clé (union).
      En cas de conflit sur une même clé, le camp au _maj le plus récent gagne.
      Renvoie ce qui reste à faire de chaque côté. -- */
function syncFusionnerCloud(cloud) {
  const majCloud = +cloud._maj || 0;
  const majLocal = +(localStorage.getItem(SYNC_CLE_MAJ) || 0);
  const localPrioritaire = majLocal > majCloud;
  const local = syncLireLocal();
  const blocs = new Set([...Object.keys(local), ...Object.keys(cloud).filter(c => c.startsWith(SYNC_PREFIXE))]);
  let localChange = false, cloudIncomplet = false;
  blocs.forEach(b => {
    const c = cloud[b] || {}, l = local[b] || {};
    const fusion = localPrioritaire ? { ...c, ...l } : { ...l, ...c };
    if (JSON.stringify(fusion) !== JSON.stringify(l)) { localStorage.setItem(b, JSON.stringify(fusion)); localChange = true; }
    if (JSON.stringify(fusion) !== JSON.stringify(c)) cloudIncomplet = true;
  });
  localStorage.setItem(SYNC_CLE_MAJ, String(Math.max(majCloud, majLocal)));
  return { localChange, cloudIncomplet };
}

/* -- Lecture du cloud + fusion. Renvoie true si le pull a réussi. -- */
async function syncTirer() {
  let cloud;
  try {
    const r = await fetch(SYNC_URL, { cache: "no-store" });
    if (!r.ok) return false;
    const enveloppe = await r.json();                 // null si base vide
    cloud = (enveloppe && typeof enveloppe.d === "string") ? JSON.parse(enveloppe.d) : {};
  } catch { return false; }
  if (!cloud || typeof cloud !== "object") cloud = {};
  const { localChange, cloudIncomplet } = syncFusionnerCloud(cloud);
  syncPret = true;
  syncStatut(true);
  if (cloudIncomplet) {
    await syncEnvoyer();                              // ce navigateur avait des choses en plus
  }
  if (localChange && !syncEnAttente) location.reload(); /* une seule fois : au prochain
    passage la fusion ne change plus rien, donc pas de boucle */
  return true;
}

function syncReessayer() {
  clearTimeout(syncRetryTimer);
  syncRetryTimer = setTimeout(() => {
    if (!syncPret) syncTirer().then(ok => { if (!ok) { syncStatut(false); syncReessayer(); } });
  }, 15000);
}

/* -- Envoi vers le cloud (PUT = remplace le document entier). -- */
function syncEnvoyer(options = {}) {
  clearTimeout(syncTimer);
  syncEnAttente = false;
  if (!syncPret) {
    // Pas encore lu le cloud : on tire d'abord (la fusion re-poussera nos saisies).
    return syncTirer().then(ok => { if (!ok) { syncStatut(false); syncReessayer(); } });
  }
  const paquet = syncLireLocal();
  paquet._maj = Date.now();
  localStorage.setItem(SYNC_CLE_MAJ, String(paquet._maj));
  return fetch(SYNC_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ d: JSON.stringify(paquet), maj: paquet._maj }),
    keepalive: !!options.keepalive,   // survit à la fermeture de la page
  })
    .then(r => syncStatut(r.ok))
    .catch(() => syncStatut(false));
}

/* -- À appeler après chaque écriture localStorage (depuis save()/saveState()).
      Petit délai pour grouper les modifications rapprochées. -- */
function syncVersFichier() {
  syncEnAttente = true;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncEnvoyer(), 300);
}

/* -- Fermeture / bascule d'onglet : on pousse ce qui attend encore
      (seulement si le pull initial a réussi — règle d'or). -- */
window.addEventListener("pagehide", () => {
  if (syncEnAttente && syncPret) syncEnvoyer({ keepalive: true });
});

/* -- Bandeau discret si le cloud est injoignable : le mode hors-ligne
      prend le relais (localStorage), tout repartira à la prochaine fois. -- */
function syncStatut(ok) {
  syncEnLigne = ok;
  syncMajBandeau();
}

function syncMajBandeau() {
  if (!document.body) return;
  let bandeau = document.getElementById("sync-bandeau");
  if (syncEnLigne) { if (bandeau) bandeau.remove(); return; }
  if (bandeau) return;
  bandeau = document.createElement("div");
  bandeau.id = "sync-bandeau";
  bandeau.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#8a6d00;color:#fff;" +
    "font:14px/1.45 -apple-system,'Segoe UI',sans-serif;padding:9px 16px;text-align:center";
  bandeau.textContent =
    "📡 Hors ligne — tes saisies sont gardées dans ce navigateur et repartiront " +
    "dans le cloud dès que la connexion reviendra (laisse la page se recharger une fois en ligne).";
  document.body.appendChild(bandeau);
}

document.addEventListener("DOMContentLoaded", syncMajBandeau);

/* ============================================================
   CHARGEMENT INITIAL
   La page s'affiche tout de suite avec la copie localStorage, puis
   on lit le cloud (~200 ms) et on FUSIONNE clé par clé : chaque camp
   apporte ce que l'autre n'a pas, les conflits vont au plus récent.
   Si l'affichage doit changer, la page se recharge une fois.
   Si le cloud est injoignable : bandeau + nouvel essai toutes les 15 s,
   et AUCUN envoi tant qu'une lecture n'a pas réussi.
   ============================================================ */
syncTirer().then(ok => { if (!ok) { syncStatut(false); syncReessayer(); } });
