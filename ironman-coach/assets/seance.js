/* ============================================================
   IRONMAN COACH — seance.js
   LE module réutilisable : une carte de séance identique pour
   TOUS les sports (muscu, natation, vélo, test, marche...).
   Utilisé par programme.html ET par le tableau de bord.

   PLANNING FLEXIBLE : les séances ne sont PAS attachées à un jour.
   Chaque semaine est un MENU : Samy choisit quoi faire quel jour.
   Chaque carte porte donc :
   - un STATUT   -> seance.<id>.statut :
       ""        à faire (défaut)
       "faite"   faite comme prévu
       "adaptee" faite mais modifiée/remplacée (piscine fermée -> vélo, etc.)
       "pas-pu"  pas pu la faire (la raison est demandée et CONSERVÉE :
                 c'est une info précieuse pour ajuster le bloc suivant)
   - la date réelle -> seance.<id>.faitele
   - si adaptée / pas pu : la raison / ce qui a été fait à la place
                    -> seance.<id>.raison
   - difficulté RPE -> seance.<id>.rpe
   - données libres -> seance.<id>.donnees
   - ressenti libre -> seance.<id>.ressenti

   Pour ajouter un sport : rien à coder ici — juste un nouveau
   type dans programme-data.js (+ 1 ligne de couleur .badge en CSS).
   ============================================================ */

"use strict";

const TYPE_LABELS = {
  muscu: "Muscu", natation: "Natation", velo: "Vélo",
  course: "Course", marche: "Marche", test: "Test", repos: "Repos",
};

const STATUTS = [
  { val: "",        label: "○ À faire" },
  { val: "faite",   label: "✓ Faite" },
  { val: "adaptee", label: "≈ Faite en adapté" },
  { val: "pas-pu",  label: "✗ Pas pu" },
];

/* Lit le statut d'une séance (compatible avec l'ancien format "fait" coché) */
function statutDe(id) {
  return state[`seance.${id}.statut`] || (state[`seance.${id}.fait`] ? "faite" : "");
}
function estFaite(id) { const s = statutDe(id); return s === "faite" || s === "adaptee"; }

/* Renvoie le HTML d'une carte de séance. */
function renderSeance(s) {
  const statut = statutDe(s.id);
  const classeEtat = estFaite(s.id) ? "faite" : (statut === "pas-pu" ? "paspu" : "");
  const badge = `<span class="badge ${s.type}">${TYPE_LABELS[s.type] || s.type}</span>`;

  return `
  <div class="card seance ${classeEtat}" id="carte-${s.id}">
    <div class="entete">
      ${badge}${s.optionnel ? ' <span class="badge repos">optionnelle</span>' : ""}
      <h3>${s.titre}</h3>
      <select class="statut" data-bind="seance.${s.id}.statut" title="Statut de la séance">
        ${STATUTS.map(o => `<option value="${o.val}" ${o.val === statut ? "selected" : ""}>${o.label}</option>`).join("")}
      </select>
    </div>
    <p class="meta">⏱ ${s.duree} — <strong>${s.objectif}</strong></p>
    <ul>${s.contenu.map(c => `<li>${c}</li>`).join("")}</ul>
    <details>
      <summary>Pourquoi cette séance ?</summary>
      <p>${s.pourquoi}</p>
    </details>
    <div class="zone-raison" id="raison-${s.id}" ${statut === "adaptee" || statut === "pas-pu" ? "" : "hidden"}>
      <label class="field">
        <span id="raison-label-${s.id}">${statut === "pas-pu" ? "Pourquoi pas pu ? (je garde ça en tête pour adapter la suite)" : "Qu'est-ce qui a changé / été fait à la place ?"}</span>
        <input type="text" data-bind="seance.${s.id}.raison" placeholder="Ex : piscine fermée, pas le temps, pied douloureux, remplacée par du vélo...">
      </label>
    </div>
    <div class="grid">
      <label class="field" style="max-width:160px">
        <span>Faite le</span>
        <input type="date" data-bind="seance.${s.id}.faitele">
      </label>
      <label class="field" style="max-width:140px">
        <span>Difficulté (1-10)</span>
        <input type="number" min="1" max="10" data-bind="seance.${s.id}.rpe">
      </label>
      <label class="field" style="grid-column: span 2">
        <span>Données (${s.hint || "chrono, distance, charges..."})</span>
        <input type="text" data-bind="seance.${s.id}.donnees" placeholder="${s.hint || ""}">
      </label>
    </div>
    <label class="field">
      <span>Ressenti / notes libres</span>
      <textarea data-bind="seance.${s.id}.ressenti" placeholder="Comment c'était ? Douleurs ? Énergie ? Écris ce que tu veux — je lirai tout."></textarea>
    </label>
  </div>`;
}

/* Réagit aux changements de statut : couleur de la carte + affichage
   du champ raison (avec un libellé adapté au cas). */
document.addEventListener("state:change", e => {
  const m = e.detail.cle.match(/^seance\.(.+)\.statut$/);
  if (!m) return;
  const id = m[1], statut = statutDe(id);
  const carte = document.getElementById(`carte-${id}`);
  if (carte) {
    carte.classList.toggle("faite", estFaite(id));
    carte.classList.toggle("paspu", statut === "pas-pu");
  }
  const zone = document.getElementById(`raison-${id}`);
  if (zone) {
    zone.hidden = !(statut === "adaptee" || statut === "pas-pu");
    const label = document.getElementById(`raison-label-${id}`);
    if (label) label.textContent = statut === "pas-pu"
      ? "Pourquoi pas pu ? (je garde ça en tête pour adapter la suite)"
      : "Qu'est-ce qui a changé / été fait à la place ?";
  }
  // Séance marquée faite/adaptée et date vide → pré-remplie à aujourd'hui
  // (directement dans le store : fonctionne aussi depuis le tableau de bord).
  if (estFaite(id) && !state[`seance.${id}.faitele`]) {
    state[`seance.${id}.faitele`] = aujourdhuiISO();
    saveState();
    const champDate = document.querySelector(`[data-bind="seance.${id}.faitele"]`);
    if (champDate) champDate.value = state[`seance.${id}.faitele`];
  }
});

/* Liste plate de toutes les séances du bloc, avec leur n° de semaine */
function toutesLesSeances() {
  const liste = [];
  BLOC.semaines.forEach(sem => {
    sem.seances.forEach(s => liste.push({ ...s, semaine: sem.num }));
  });
  return liste;
}

/* ---------- Séances libres ----------
   Pour tout ce qui n'était pas prévu au menu : une séance en plus,
   un footing improvisé, un match de foot... Samy en ajoute autant
   qu'il veut par semaine. Stockage :
   extra.w<num>.count           nombre de séances libres de la semaine
   extra.w<num>.<i>.titre/date/donnees/ressenti                       */

const EXTRA_CHAMPS = ["titre", "date", "donnees", "ressenti"]; // champs d'une séance libre

function renderExtra(wNum, i) {
  const p = `extra.w${wNum}.${i}`;
  return `
  <div class="card seance faite">
    <div class="entete">
      <span class="badge repos">Libre</span>
      <span class="field" style="flex:1;margin:0">
        <input type="text" data-bind="${p}.titre" placeholder="Quoi ? (ex : footing léger, foot avec les potes, 2e passage piscine...)" aria-label="Titre de la séance libre">
      </span>
      <button class="btn-suppr" type="button" data-suppr="${i}" title="Supprimer cette séance libre">✕</button>
    </div>
    <div class="grid">
      <label class="field" style="max-width:160px"><span>Faite le</span>
        <input type="date" data-bind="${p}.date"></label>
      <label class="field" style="grid-column: span 2"><span>Données</span>
        <input type="text" data-bind="${p}.donnees" placeholder="durée, distance, intensité..."></label>
    </div>
    <label class="field"><span>Ressenti / notes</span>
      <textarea data-bind="${p}.ressenti"></textarea></label>
  </div>`;
}

/* Supprime la séance libre i d'une semaine : décale les suivantes
   d'un cran vers le bas puis efface la dernière, pour garder des
   indices continus (0..count-1) dans le stockage. */
function supprimerExtra(wNum, i) {
  const n = +state[`extra.w${wNum}.count`] || 0;
  for (let j = i; j < n - 1; j++)
    EXTRA_CHAMPS.forEach(c => {
      const suivant = state[`extra.w${wNum}.${j + 1}.${c}`];
      if (suivant === undefined) delete state[`extra.w${wNum}.${j}.${c}`];
      else state[`extra.w${wNum}.${j}.${c}`] = suivant;
    });
  EXTRA_CHAMPS.forEach(c => delete state[`extra.w${wNum}.${n - 1}.${c}`]);
  state[`extra.w${wNum}.count`] = n - 1;
  saveState();
}

/* Affiche les séances libres existantes d'une semaine + le bouton d'ajout */
function initExtras(wNum, conteneur) {
  const cleCount = `extra.w${wNum}.count`;
  const dessiner = () => {
    const n = +state[cleCount] || 0;
    let html = "";
    for (let i = 0; i < n; i++) html += renderExtra(wNum, i);
    html += `<p><button class="btn bleu" type="button" data-ajout="${wNum}">+ Ajouter une séance libre (non prévue)</button></p>`;
    conteneur.innerHTML = html;
    bindAll(conteneur);
    conteneur.querySelector(`[data-ajout]`).onclick = () => {
      state[cleCount] = n + 1;
      saveState();
      dessiner();
    };
    conteneur.querySelectorAll("[data-suppr]").forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.suppr;
        // Confirmation seulement si la carte contient déjà quelque chose
        const remplie = EXTRA_CHAMPS.some(c => state[`extra.w${wNum}.${i}.${c}`]);
        if (remplie && !confirm("Supprimer cette séance libre et son contenu ?")) return;
        supprimerExtra(wNum, i);
        dessiner();
      };
    });
  };
  dessiner();
}
