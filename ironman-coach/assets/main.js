/* ============================================================
   IRONMAN COACH — main.js
   Moteur partagé par toutes les pages. Une fonction par rôle :

   1. buildNav()      — génère la sidebar depuis PAGES
   2. buildPager()    — génère "← précédent / suivant →"
   3. Store           — sauvegarde générique : tout élément portant
                        data-bind="une.cle" est lu/écrit automatiquement
                        dans localStorage. AUCUN code à écrire pour
                        ajouter un champ : on ajoute juste l'attribut.
   4. initProgress()  — checklists ul.progress (data-store)
   (export JSON/Excel : voir assets/export.js — multi-blocs)
   ============================================================ */

"use strict";

/* ---------- 1. Navigation ----------
   UNE SEULE liste à modifier pour ajouter une page au site. */
const PAGES = [
  { file: "index.html",     num: "01", title: "Tableau de bord" },
  { file: "programme.html", num: "02", title: "Programme du bloc" },
  { file: "journal.html",   num: "03", title: "Journal quotidien" },
  { file: "tests.html",     num: "04", title: "Tests du bloc" },
  { file: "guide.html",     num: "05", title: "Guide du coach" },
];

/* Nom de la clé localStorage : STORE_KEY est défini dans assets/sync-fichier.js
   (chargé avant sur chaque page), qui synchronise aussi toutes les données
   avec le fichier SPORT/donnees-ironman.json sur le disque. */

function pageActuelle() {
  const f = location.pathname.split("/").pop();
  return f === "" ? "index.html" : f;
}

function buildNav() {
  const nav = document.querySelector("nav.sidebar");
  if (!nav) return;
  const actuelle = pageActuelle();
  nav.innerHTML = `<div class="brand">🏊🚴🏃 Ironman Coach<small>Samy — ${typeof BLOC !== "undefined" ? BLOC.nom : ""}</small></div>` +
    PAGES.map(p =>
      `<a href="${p.file}" class="${p.file === actuelle ? "active" : ""}">` +
      `<span class="num">${p.num}</span>${p.title}</a>`
    ).join("");
}

function buildPager() {
  const main = document.querySelector("main.content");
  if (!main) return;
  const i = PAGES.findIndex(p => p.file === pageActuelle());
  if (i === -1) return;
  const prec = PAGES[i - 1], suiv = PAGES[i + 1];
  const div = document.createElement("div");
  div.className = "pager";
  div.innerHTML =
    (prec ? `<a href="${prec.file}">← ${prec.title}</a>` : "<span></span>") +
    (suiv ? `<a href="${suiv.file}">${suiv.title} →</a>` : "<span></span>");
  main.appendChild(div);
}

/* ---------- 3. Store générique ----------
   state = simple dictionnaire { "cle.plate": valeur }.
   - loadState()/saveState() : lecture/écriture localStorage
   - bindAll() : connecte tous les éléments [data-bind] de la page.
     Checkbox -> booléen ; input/textarea/select -> texte.
     La sauvegarde est AUTOMATIQUE à chaque modification. */

let state = loadState();

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  syncVersFichier();
  flashSaved();
}

/* Petit indicateur "✓ sauvegardé" en bas à droite */
let flashTimer = null;
function flashSaved() {
  let el = document.getElementById("save-indicator");
  if (!el) {
    el = document.createElement("div");
    el.id = "save-indicator";
    el.textContent = "✓ sauvegardé";
    document.body.appendChild(el);
  }
  el.classList.add("visible");
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => el.classList.remove("visible"), 1200);
}

function bindAll(racine = document) {
  racine.querySelectorAll("[data-bind]").forEach(el => {
    const cle = el.dataset.bind;
    // Valeur initiale depuis le store
    if (el.type === "checkbox") el.checked = !!state[cle];
    else if (state[cle] !== undefined) el.value = state[cle];
    // Sauvegarde à chaque changement
    el.addEventListener("change", () => {
      state[cle] = (el.type === "checkbox") ? el.checked : el.value;
      saveState();
      // Événement global : les pages (dashboard, cartes séance) peuvent réagir
      document.dispatchEvent(new CustomEvent("state:change", { detail: { cle } }));
    });
  });
}

/* ---------- 4. Checklists persistées (ul.progress) ---------- */
function initProgress() {
  document.querySelectorAll("ul.progress[data-store]").forEach(ul => {
    const prefixe = ul.dataset.store;
    ul.querySelectorAll("li").forEach((li, i) => {
      const texte = li.innerHTML;
      const cle = `${prefixe}.${i}`;
      li.innerHTML = `<label><input type="checkbox" data-bind="${cle}"><span>${texte}</span></label>`;
    });
  });
}

/* ---------- Utilitaires dates (partagés par journal + dashboard) ---------- */
const JOURS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/* Date du jour en "AAAA-MM-JJ" LOCALE (pas UTC — sinon bug entre minuit et 2h à Bruxelles) */
function aujourdhuiISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const MOIS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/* Renvoie la liste des dates "AAAA-MM-JJ" du bloc (28 jours à partir de BLOC.debut) */
function datesDuBloc() {
  const dates = [];
  const d = new Date(BLOC.debut + "T12:00:00");
  for (let i = 0; i < BLOC.semaines.length * 7; i++) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function dateJolie(iso) {
  const d = new Date(iso + "T12:00:00");
  return `${JOURS_FR[d.getDay()]} ${d.getDate()} ${MOIS_FR[d.getMonth()]}`;
}

function estAujourdhui(iso) {
  return iso === aujourdhuiISO();
}

/* ---------- Initialisation commune à toutes les pages ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildNav();
  initProgress();  // AVANT bindAll : initProgress crée des [data-bind]
  // bindAll est appelé par chaque page APRÈS son rendu dynamique éventuel,
  // mais on couvre aussi les pages purement statiques :
  bindAll();
  buildPager();
});
