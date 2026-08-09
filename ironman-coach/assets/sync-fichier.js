/* ============================================================
   SYNC-FICHIER — sauvegarde dans le CLOUD (partagé simple + coach)

   La source de vérité est un document JSON en ligne (jsonblob.com,
   gratuit, sans compte). Chaque modification y est poussée ; chaque
   ouverture de page le relit. Résultat : les données suivent, peu
   importe le navigateur (Safari, Arc, Chrome...) ou l'appareil.
   Le localStorage sert de copie de travail et de mode hors-ligne.

   Filets de sécurité (voir .github/workflows/garde-donnees.yml) :
   un robot GitHub relit le blob toutes les 6 h (ce qui le maintient
   en vie), archive une copie dans le repo, et le recrée depuis la
   copie s'il a expiré — en mettant à jour blob-id.txt, que les pages
   hébergées relisent à chaque ouverture.

   À charger AVANT tous les autres scripts : il fournit STORE_KEY.
   ============================================================ */

"use strict";

/* Clé du bloc COURANT (source unique — main.js et app.js l'utilisent).
   Changer de bloc = nouvelle clé (v3...), les anciens blocs restent dans le cloud. */
const STORE_KEY = "ironman-samy-bloc2";

/* Blob par défaut — utilisé en file:// ; en ligne, blob-id.txt fait foi. */
const SYNC_BLOB_DEFAUT = "019fe3d9-626f-74f2-866b-6fea4589b942";
const SYNC_BASE = "https://jsonblob.com/api/jsonBlob/";
const SYNC_PREFIXE = "ironman-samy-";     // toutes les clés de blocs, passés et courant
const SYNC_CLE_MAJ = "ironman-sync-maj";  // horodatage de la dernière écriture locale

let SYNC_URL = SYNC_BASE + SYNC_BLOB_DEFAUT;
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

function syncTaille(paquet) {
  return Object.entries(paquet)
    .filter(([cle]) => cle.startsWith(SYNC_PREFIXE))
    .reduce((n, [, val]) => n + JSON.stringify(val || {}).length, 0);
}

/* -- Envoi vers le cloud (PUT = remplace le document entier). -- */
function syncEnvoyer(options = {}) {
  clearTimeout(syncTimer);
  syncEnAttente = false;
  const paquet = syncLireLocal();
  paquet._maj = Date.now();
  localStorage.setItem(SYNC_CLE_MAJ, String(paquet._maj));
  return fetch(SYNC_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paquet),
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

/* -- Fermeture / bascule d'onglet : on pousse ce qui attend encore. -- */
window.addEventListener("pagehide", () => {
  if (syncEnAttente) syncEnvoyer({ keepalive: true });
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
   on compare avec le cloud (~200 ms) : si le cloud est plus récent
   (autre navigateur/appareil entre-temps), on écrase la copie locale
   et on recharge la page une fois pour afficher les bonnes données.
   ============================================================ */
(async function () {
  /* En ligne : blob-id.txt (à la racine du site) fait foi — c'est lui que
     le robot GitHub met à jour s'il a dû recréer le blob. */
  if (location.protocol === "http:" || location.protocol === "https:") {
    try {
      const r = await fetch("../blob-id.txt", { cache: "no-store" });
      if (r.ok) {
        const id = (await r.text()).trim();
        if (/^[0-9a-f-]{20,}$/i.test(id)) SYNC_URL = SYNC_BASE + id;
      }
    } catch { /* pas de blob-id.txt : blob par défaut */ }
  }

  let cloud = null;
  try {
    const r = await fetch(SYNC_URL, { cache: "no-store" });
    if (r.ok) cloud = await r.json();
    else if (r.status === 404) { syncStatut(true); return; } /* blob expiré : le robot GitHub le recréera ; en attendant, mode local */
  } catch { /* réseau coupé */ }
  if (!cloud || typeof cloud !== "object") { syncStatut(false); return; }
  syncStatut(true);

  const majCloud = +cloud._maj || 0;
  const majLocal = +(localStorage.getItem(SYNC_CLE_MAJ) || 0);
  /* Le plus récent gagne ; à égalité (premières utilisations), celui qui a le plus de données */
  const cloudGagne = majCloud !== majLocal
    ? majCloud > majLocal
    : syncTaille(cloud) >= syncTaille(syncLireLocal());

  if (!cloudGagne) {
    /* Ce navigateur a plus récent (saisie hors-ligne, ou cloud recréé
       depuis une vieille copie) : on remet le cloud à niveau. */
    syncEnvoyer();
    return;
  }
  if (majCloud === majLocal || syncEnAttente) return; /* déjà à jour, ou saisie en cours */

  Object.entries(cloud).forEach(([cle, val]) => {
    if (cle.startsWith(SYNC_PREFIXE)) localStorage.setItem(cle, JSON.stringify(val || {}));
  });
  localStorage.setItem(SYNC_CLE_MAJ, String(majCloud));
  location.reload(); /* une seule fois : au prochain passage, majCloud === majLocal */
})();
