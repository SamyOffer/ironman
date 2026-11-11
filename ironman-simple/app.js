/* ============================================================
   IRONMAN SIMPLE — app.js
   Une page, zéro friction. MÊMES DONNÉES que le site complet :
   même clé localStorage, mêmes noms de champs — les deux sites
   sont interchangeables à tout moment.
   Les données du programme (BLOC, TESTS...) viennent du fichier
   partagé ../ironman-coach/assets/programme-data.js.
   ============================================================ */

"use strict";

/* ---------- Store (identique au site complet) ----------
   STORE_KEY est fourni par sync-fichier.js (chargé avant), qui a aussi
   déjà rempli localStorage depuis le fichier SPORT/donnees-ironman.json. */
let state = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } })();

let toastTimer = null;
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  syncVersFichier();
  const t = document.getElementById("toast");
  t.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visible"), 1100);
}
function set(cle, val) { state[cle] = val; save(); }

/* ---------- Utilitaires (aussi utilisés par export.js partagé) ---------- */
const JOURS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const TYPE_LABELS = { muscu: "Muscu", natation: "Natation", velo: "Vélo", course: "Course", marche: "Marche", test: "Test", repos: "Repos" };
const ICONES = { muscu: "🏋️", natation: "🏊", velo: "🚴", course: "🏃", marche: "🚶", test: "🧪", repos: "🌙" };

function aujourdhuiISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function datesDuBloc() {
  const dates = []; const d = new Date(BLOC.debut + "T12:00:00");
  for (let i = 0; i < BLOC.semaines.length * 7; i++) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
  return dates;
}
function dateJolie(iso) {
  const d = new Date(iso + "T12:00:00");
  return `${JOURS_FR[d.getDay()]} ${d.getDate()} ${MOIS_FR[d.getMonth()]}`;
}
function decalerDate(iso, n) {
  const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function statutDe(id) { return state[`seance.${id}.statut`] || (state[`seance.${id}.fait`] ? "faite" : ""); }
function estFaite(id) { const s = statutDe(id); return s === "faite" || s === "adaptee"; }

/* ============================================================
   1. STATS (pastilles du haut)
   ============================================================ */
function renderStats() {
  const dates = datesDuBloc(), auj = aujourdhuiISO();
  const toutes = BLOC.semaines.flatMap(s => s.seances);
  const nonOpt = toutes.filter(s => !s.optionnel);
  const faites = nonOpt.filter(s => estFaite(s.id)).length;
  const bonus = toutes.filter(s => s.optionnel && estFaite(s.id)).length;
  let attendues = 0;
  BLOC.semaines.forEach((sem, wi) => {
    const joursActifs = dates.slice(wi * 7, wi * 7 + 7)
      .filter(d => !BLOC.repriseReelle || d >= BLOC.repriseReelle);
    const joursEcoules = joursActifs.filter(d => d <= auj).length;
    if (joursActifs.length)
      attendues += sem.seances.filter(s => !s.optionnel).length * joursEcoules / joursActifs.length;
  });
  attendues = Math.round(attendues);
  const assiduite = attendues ? Math.min(100, Math.round(100 * faites / attendues)) : null;
  // Dernière douleur pied renseignée
  let douleur = null, dDouleur = null;
  dates.filter(d => d <= auj).forEach(d => {
    const v = state[`journal.${d}.pied_douleur`];
    if (v !== undefined && v !== "") { douleur = v; dDouleur = d; }
  });
  // Poids moyen sur 7 jours et tendance vs les 7 jours précédents (la sèche se pilote là-dessus)
  const p7 = poidsMoyen(auj, 0), p14 = poidsMoyen(auj, 7);
  const delta = (p7 !== null && p14 !== null) ? p7 - p14 : null;
  const deltaTxt = delta === null ? "" : ` (${delta > 0 ? "+" : ""}${delta.toFixed(2)} kg/sem)`;
  const deltaOk = delta === null || (delta <= -0.2 && delta >= -0.6);
  document.getElementById("stats").innerHTML = `
    <div class="pastille ${p7 === null ? "" : (deltaOk ? "ok" : "warn")}">
      <b>${p7 === null ? "—" : p7.toFixed(1)}</b><span>Poids moy. 7 j${deltaTxt}</span></div>
    <div class="pastille ${assiduite === null || assiduite >= 80 ? "ok" : "warn"}">
      <b>${assiduite === null ? "—" : assiduite + " %"}</b><span>Assiduité</span></div>
    <div class="pastille"><b>${faites}/${nonOpt.length}</b><span>Séances${bonus ? " (+" + bonus + " bonus)" : ""}</span></div>
    <div class="pastille ${douleur === null || +douleur <= 2 ? "ok" : "warn"}">
      <b>${douleur === null ? "—" : douleur + "/10"}</b><span>Pied au réveil</span></div>`;
}

/* Ouvre la section des routines et y amène l'écran */
function ouvrirRoutines(e) {
  e.preventDefault();
  const sec = document.getElementById("section-routines");
  sec.open = true;
  sec.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Moyenne des pesées sur la fenêtre de 7 jours qui se termine il y a `decalage` jours (null si aucune pesée) */
function poidsMoyen(auj, decalage) {
  const vals = [];
  for (let i = decalage; i < decalage + 7; i++) {
    const v = state[`journal.${decalerDate(auj, -i)}.poids`];
    if (v !== undefined && v !== "" && !isNaN(v)) vals.push(+v);
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

/* ============================================================
   2. JOURNAL RAPIDE (un jour affiché, navigation ‹ ›)
   ============================================================ */
let jourAffiche = aujourdhuiISO();

function champJour(cle, label, type = "number") {
  const k = `journal.${jourAffiche}.${cle}`;
  return `<label class="champ"><span>${label}</span>
    <input type="${type}" step="any" inputmode="decimal" value="${state[k] ?? ""}"
      onchange="set('journal.${jourAffiche}.${cle}', this.value)"></label>`;
}

function renderJour() {
  const auj = aujourdhuiISO();
  const kReeduc = `journal.${jourAffiche}.pied`;
  const kPosture = `journal.${jourAffiche}.posture`;
  const kNote = `journal.${jourAffiche}.ressenti`;
  document.getElementById("carte-jour").innerHTML = `
    <div class="jour-entete">
      <button class="fleche" onclick="jourAffiche=decalerDate(jourAffiche,-1);renderJour()">‹</button>
      <b>${jourAffiche === auj ? "Aujourd'hui — " : ""}${dateJolie(jourAffiche)}</b>
      <button class="fleche" onclick="jourAffiche=decalerDate(jourAffiche,1);renderJour()">›</button>
    </div>
    <div class="jour-grille">
      ${champJour("poids", "Poids à jeun (kg)")}
      ${champJour("energie", "Énergie (1-5)")}
      ${champJour("faim", "Faim (1-5)")}
      ${champJour("pied_douleur", "Pied réveil (0-10)")}
      <div class="champ"><span>&nbsp;</span>
        <div class="toggle ${state[kReeduc] ? "actif" : ""}"
             onclick="set('${kReeduc}', !state['${kReeduc}']); renderJour(); renderStats(); renderGraphs()">
          ${state[kReeduc] ? "✓ Rééduc pied" : "Rééduc pied 5 min"}</div></div>
      <div class="champ"><span>&nbsp;</span>
        <div class="toggle ${state[kPosture] ? "actif" : ""}"
             onclick="set('${kPosture}', !state['${kPosture}']); renderJour(); renderStats(); renderGraphs()">
          ${state[kPosture] ? "✓ Posture" : "Posture 5 min"}</div></div>
      <button class="lien-routines" onclick="ouvrirRoutines(event)">voir les exos ↓</button>
      <div class="jour-plus" id="jour-plus">
        ${champJour("taille", "Taille nombril (cm, lundi)")} ${champJour("sommeil", "Sommeil (h)")}
      </div>
      <div class="jour-note" id="jour-note">
        <label class="champ"><span>Note libre (repas, énergie, pied...)</span>
        <textarea onchange="set('${kNote}', this.value)">${state[kNote] ?? ""}</textarea></label>
      </div>
    </div>
    <button class="lien-note" onclick="document.getElementById('jour-plus').classList.toggle('ouvert')">+ plus de champs</button>
    <button class="lien-note" onclick="document.getElementById('jour-note').classList.toggle('ouvert')">+ note</button>`;
  // Note déjà remplie → visible d'office
  if (state[kNote]) document.getElementById("jour-note").classList.add("ouvert");
}

/* ============================================================
   2 bis. LA SÉANCE DU JOUR — un seul bandeau, une seule chose à faire
   ============================================================ */
function seanceDuJour() {
  const dates = datesDuBloc(), auj = aujourdhuiISO();
  const i = dates.indexOf(auj);
  if (i < 0) return null;
  const sem = BLOC.semaines[Math.floor(i / 7)];
  return { semaineIndex: Math.floor(i / 7), seance: sem.seances.find(s => s.jour === i % 7) };
}

function renderAujourdhui() {
  const el = document.getElementById("aujourdhui");
  const dates = datesDuBloc(), auj = aujourdhuiISO();
  let txt, s = null, wi = 0;
  if (auj < dates[0]) {
    s = BLOC.semaines[0].seances[0];
    txt = `Le bloc commence ${dateJolie(dates[0]).toLowerCase()}`;
  } else {
    const t = seanceDuJour();
    if (!t || !t.seance) { el.hidden = true; return; }
    s = t.seance; wi = t.semaineIndex; txt = "Aujourd'hui";
  }
  const fait = estFaite(s.id);
  el.hidden = false;
  el.className = "aujourdhui-bandeau" + (fait ? " fait" : "");
  el.innerHTML = `<span class="aj-label">${txt}${fait ? " · ✓ fait" : ""}</span>
    <b>${ICONES[s.type] || "•"} ${s.titre.replace(/^\w+ · /, "")}</b>
    <small>${s.duree} — ${s.objectif}</small>
    <span class="aj-lien">voir la séance ↓</span>`;
  el.onclick = () => {
    semaineAffichee = wi; renderChips(); renderSeances();
    const carte = document.getElementById(`s-${s.id}`);
    carte.classList.add("ouverte");
    carte.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

/* ============================================================
   3. SEMAINES + SÉANCES
   ============================================================ */
let semaineAffichee = (() => {
  const dates = datesDuBloc(), auj = aujourdhuiISO();
  if (auj < dates[0]) return 0;
  if (auj > dates[dates.length - 1]) return BLOC.semaines.length - 1;
  return Math.floor(dates.indexOf(auj) / 7);
})();

function renderChips() {
  document.getElementById("chips-semaines").innerHTML = BLOC.semaines.map((sem, i) =>
    `<button class="chip ${i === semaineAffichee ? "actif" : ""}"
       onclick="semaineAffichee=${i};renderChips();renderSeances()">Semaine ${sem.num}</button>`).join("");
  const sem = BLOC.semaines[semaineAffichee];
  document.getElementById("theme-semaine").innerHTML = `<b>${sem.theme}</b>${sem.focus ? `<br>${sem.focus}` : ""}`;
}

function boutonsStatut(id) {
  const s = statutDe(id);
  const b = (val, txt, titre) =>
    `<button class="st ${s === val ? "actif" : ""}" data-s="${val}" title="${titre}"
       onclick="event.stopPropagation(); toucherStatut('${id}', '${val}')">${txt}</button>`;
  return `<div class="statuts">${b("faite", "✓", "Faite")}${b("adaptee", "≈", "Faite en adapté")}${b("pas-pu", "✗", "Pas pu")}</div>`;
}

/* Un tap = statut ; re-tap sur le même = retour à « à faire » */
function toucherStatut(id, val) {
  const nouveau = statutDe(id) === val ? "" : val;
  set(`seance.${id}.statut`, nouveau);
  if ((nouveau === "faite" || nouveau === "adaptee") && !state[`seance.${id}.faitele`])
    set(`seance.${id}.faitele`, aujourdhuiISO());
  majSeanceDOM(id);
  renderStats(); renderGraphs(); renderAujourdhui();
}

function majSeanceDOM(id) {
  const el = document.getElementById(`s-${id}`);
  if (!el) return;
  const s = statutDe(id);
  el.classList.toggle("faite", estFaite(id));
  el.classList.toggle("paspu", s === "pas-pu");
  el.querySelectorAll(".st").forEach(b => b.classList.toggle("actif", b.dataset.s === s));
  const raison = el.querySelector(".raison");
  if (raison) {
    raison.classList.toggle("visible", s === "adaptee" || s === "pas-pu");
    raison.querySelector("span").textContent = s === "pas-pu" ? "Pourquoi pas pu ?" : "Quoi à la place / de changé ?";
  }
  const date = el.querySelector(`[data-role="faitele"]`);
  if (date) date.value = state[`seance.${id}.faitele`] ?? "";
}

function renderSeance(s) {
  const st = statutDe(s.id);
  const classe = estFaite(s.id) ? "faite" : (st === "pas-pu" ? "paspu" : "");
  const raisonVisible = st === "adaptee" || st === "pas-pu";
  const t = seanceDuJour();
  const estAuj = t && t.seance && t.seance.id === s.id;
  return `
  <div class="seance ${classe} ${estAuj ? "aujourdhui ouverte" : ""}" id="s-${s.id}">
    <div class="ligne" onclick="this.parentElement.classList.toggle('ouverte')">
      <div class="sport ${s.type}">${ICONES[s.type] || "•"}</div>
      <div class="nom"><b>${estAuj ? '<span class="tag-auj">Aujourd\'hui</span> ' : ""}${s.titre}${s.optionnel ? " · bonus" : ""}</b><small>${s.duree} — ${s.objectif}</small></div>
      ${boutonsStatut(s.id)}
    </div>
    <div class="details">
      <ul>${s.contenu.map(c => `<li>${c}</li>`).join("")}</ul>
      <button class="lien-pourquoi" onclick="this.nextElementSibling.classList.toggle('ouvert')">pourquoi cette séance ?</button>
      <div class="pourquoi">${s.pourquoi}</div>
      <div class="raison ${raisonVisible ? "visible" : ""}">
        <label class="champ"><span>${st === "pas-pu" ? "Pourquoi pas pu ?" : "Quoi à la place / de changé ?"}</span>
        <input type="text" value="${(state[`seance.${s.id}.raison`] ?? "").replace(/"/g, "&quot;")}"
          onchange="set('seance.${s.id}.raison', this.value)"></label>
      </div>
      <div class="grille">
        <label class="champ"><span>Faite le</span>
          <input type="date" data-role="faitele" value="${state[`seance.${s.id}.faitele`] ?? ""}"
            onchange="set('seance.${s.id}.faitele', this.value)"></label>
        <label class="champ"><span>Difficulté</span>
          <input type="number" min="1" max="10" value="${state[`seance.${s.id}.rpe`] ?? ""}"
            onchange="set('seance.${s.id}.rpe', this.value)"></label>
        <label class="champ"><span>Données (${s.hint || "libre"})</span>
          <input type="text" value="${(state[`seance.${s.id}.donnees`] ?? "").replace(/"/g, "&quot;")}"
            onchange="set('seance.${s.id}.donnees', this.value)"></label>
        <label class="champ pleine"><span>Ressenti</span>
          <textarea onchange="set('seance.${s.id}.ressenti', this.value)">${state[`seance.${s.id}.ressenti`] ?? ""}</textarea></label>
      </div>
    </div>
  </div>`;
}

/* Séances libres de la semaine affichée */
function renderLibres() {
  const w = BLOC.semaines[semaineAffichee].num;
  const n = +state[`extra.w${w}.count`] || 0;
  let html = "";
  for (let i = 0; i < n; i++) {
    const p = `extra.w${w}.${i}`;
    html += `
    <div class="seance faite">
      <div class="ligne" style="cursor:default">
        <div class="sport repos">✨</div>
        <div class="nom" style="display:flex;gap:8px">
          <input type="text" placeholder="Séance libre (quoi ?)" value="${(state[`${p}.titre`] ?? "").replace(/"/g, "&quot;")}"
            style="flex:1;background:var(--bg);border:1px solid var(--bord);border-radius:10px;padding:8px 10px"
            onchange="set('${p}.titre', this.value)">
          <input type="date" value="${state[`${p}.date`] ?? ""}"
            style="background:var(--bg);border:1px solid var(--bord);border-radius:10px;padding:8px"
            onchange="set('${p}.date', this.value)">
        </div>
        <button class="suppr" onclick="supprimerLibre(${w}, ${i})">✕</button>
      </div>
    </div>`;
  }
  html += `<button class="ajout-libre" onclick="set('extra.w${w}.count', ${n + 1}); renderSeances()">+ Séance libre (non prévue)</button>`;
  return html;
}

function supprimerLibre(w, i) {
  const champs = ["titre", "date", "donnees", "ressenti"];
  const n = +state[`extra.w${w}.count`] || 0;
  if (champs.some(c => state[`extra.w${w}.${i}.${c}`]) && !confirm("Supprimer cette séance libre ?")) return;
  for (let j = i; j < n - 1; j++) champs.forEach(c => {
    const suiv = state[`extra.w${w}.${j + 1}.${c}`];
    if (suiv === undefined) delete state[`extra.w${w}.${j}.${c}`]; else state[`extra.w${w}.${j}.${c}`] = suiv;
  });
  champs.forEach(c => delete state[`extra.w${w}.${n - 1}.${c}`]);
  state[`extra.w${w}.count`] = n - 1;
  save(); renderSeances();
}

function renderSeances() {
  const sem = BLOC.semaines[semaineAffichee];
  document.getElementById("liste-seances").innerHTML = sem.seances.map(renderSeance).join("") + renderLibres();
}

/* ============================================================
   4. TESTS (repliés, générés depuis TESTS partagé)
   ============================================================ */
function renderTests() {
  document.getElementById("liste-tests").innerHTML = TESTS.map(t => `
    <div class="test-item">
      <b>${t.titre}</b>
      <div class="quand">${t.quand} — ${t.protocole}</div>
      <div class="grille-test">
        ${t.champs.map(c => {
          const k = `tests.${t.id}.${c.cle}`;
          if (c.type === "textarea")
            return `<label class="champ pleine"><span>${c.label}</span>
              <textarea onchange="set('${k}', this.value)">${state[k] ?? ""}</textarea></label>`;
          return `<label class="champ"><span>${c.label}</span>
            <input type="${c.type}" step="any" value="${state[k] ?? ""}" onchange="set('${k}', this.value)"></label>`;
        }).join("")}
      </div>
    </div>`).join("");
}

/* ============================================================
   5. GRAPHIQUES compacts (sparklines + barres, SVG maison)
   ============================================================ */
function sparkline(valeurs) {
  const pts = valeurs.map((v, i) => ({ i, v })).filter(p => p.v !== null && p.v !== "" && p.v !== undefined && !isNaN(p.v));
  if (pts.length < 2) return `<div class="vide">bientôt (≥ 2 mesures)</div>`;
  const vs = pts.map(p => +p.v);
  const min = Math.min(...vs), max = Math.max(...vs), marge = Math.max((max - min) * .2, .5);
  const X = i => 4 + (i / (valeurs.length - 1)) * 192, Y = v => 50 - ((v - (min - marge)) / ((max + marge) - (min - marge))) * 44;
  let d = "";
  pts.forEach(p => { d += (d ? " L" : "M") + X(p.i).toFixed(1) + "," + Y(+p.v).toFixed(1); });
  const dernier = pts[pts.length - 1];
  return `<svg viewBox="0 0 200 56"><path class="spark" d="${d}"/>
    <circle class="spark-point" cx="${X(dernier.i).toFixed(1)}" cy="${Y(+dernier.v).toFixed(1)}" r="3"/>
    <text x="196" y="12" text-anchor="end" font-size="11" fill="var(--texte-2)">${+dernier.v}</text></svg>`;
}

function barres(donnees) {
  if (!donnees.some(b => b.y > 0)) return `<div class="vide">bientôt</div>`;
  const larg = 200 / donnees.length;
  return `<svg viewBox="0 0 200 56">` + donnees.map((b, i) => {
    const h = b.max ? Math.max((b.y / b.max) * 40, b.y ? 3 : 0) : 0;
    return `<rect class="barre-s ${b.y >= b.max ? "" : "partiel"}" x="${(i * larg + larg * .2).toFixed(1)}" y="${(46 - h).toFixed(1)}" width="${(larg * .6).toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>
      <text x="${(i * larg + larg / 2).toFixed(1)}" y="55" text-anchor="middle" font-size="9" fill="var(--texte-2)">S${b.x}</text>`;
  }).join("") + `</svg>`;
}

function renderGraphs() {
  const dates = datesDuBloc();
  const toutes = BLOC.semaines.flatMap(s => s.seances);
  document.getElementById("graphs").innerHTML = `
    <div class="graph"><div class="titre-graph">Poids (kg)</div>${sparkline(dates.map(d => state[`journal.${d}.poids`] ?? null))}</div>
    <div class="graph"><div class="titre-graph">Tour de taille (cm)</div>${sparkline(dates.map(d => state[`journal.${d}.taille`] ?? null))}</div>
    <div class="graph"><div class="titre-graph">Énergie (1-5)</div>${sparkline(dates.map(d => { const v = state[`journal.${d}.energie`]; return v === undefined || v === "" ? null : v; }))}</div>
    <div class="graph"><div class="titre-graph">Douleur pied au réveil</div>${sparkline(dates.map(d => { const v = state[`journal.${d}.pied_douleur`]; return v === undefined || v === "" ? null : v; }))}</div>
    <div class="graph"><div class="titre-graph">Séances faites / semaine</div>${barres(BLOC.semaines.map((sem, wi) => ({
      x: sem.num, y: sem.seances.filter(s => !s.optionnel && estFaite(s.id)).length, max: sem.seances.filter(s => !s.optionnel).length })))}</div>
    <div class="graph"><div class="titre-graph">Rééduc pied / semaine</div>${barres(BLOC.semaines.map((sem, wi) => ({
      x: sem.num, y: dates.slice(wi * 7, wi * 7 + 7).filter(d => state[`journal.${d}.pied`]).length, max: 7 })))}</div>
    <div class="graph"><div class="titre-graph">Routine posture / semaine</div>${barres(BLOC.semaines.map((sem, wi) => ({
      x: sem.num, y: dates.slice(wi * 7, wi * 7 + 7).filter(d => state[`journal.${d}.posture`]).length, max: 7 })))}</div>`;
}

/* ============================================================
   6. BLOCS PASSÉS — consultation des archives (lecture seule)
   Les données de chaque bloc restent sous leur clé (ironman-samy-blocN),
   dans le cloud et dans les exports. REGISTRE vient d'export.js.
   ============================================================ */
function ouvrirArchives() {
  const echap = t => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const passes = REGISTRE.filter(b => b.cle !== STORE_KEY).slice().reverse();
  const html = passes.map(b => {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(b.cle)) || {}; } catch { /* illisible */ }
    const faites = Object.keys(b.seances).filter(id => {
      const st = d[`seance.${id}.statut`] || (d[`seance.${id}.fait`] ? "faite" : "");
      return st === "faite" || st === "adaptee";
    });
    const lignes = faites.map(id => {
      const [n, , titre] = b.seances[id];
      const notes = [d[`seance.${id}.donnees`], d[`seance.${id}.ressenti`]].filter(Boolean).map(echap).join(" · ");
      return `<li><b>S${n} · ${echap(titre)}</b>${d[`seance.${id}.faitele`] ? " — " + d[`seance.${id}.faitele`] : ""}${notes ? `<br><small>${notes}</small>` : ""}</li>`;
    });
    const libres = [];
    Object.keys(d).forEach(k => { const m = k.match(/^extra\.w(\d+)\.(\d+)\.titre$/); if (m && d[k]) libres.push(`<li><b>S${m[1]} · séance libre</b>${d[`extra.w${m[1]}.${m[2]}.date`] ? " — " + d[`extra.w${m[1]}.${m[2]}.date`] : ""}<br><small>${echap(d[k])}</small></li>`); });
    const jours = new Set(Object.keys(d).filter(k => k.startsWith("journal.")).map(k => k.split(".")[1]));
    const tests = Object.keys(b.tests || {}).filter(t => Object.keys(d).some(k => k.startsWith(`tests.${t}.`) && d[k] !== ""))
      .map(t => `<li><b>${echap(b.tests[t])}</b> : ${Object.keys(d).filter(k => k.startsWith(`tests.${t}.`)).map(k => `${k.split(".")[2]} ${echap(d[k])}`).join(" · ")}</li>`);
    return `<details class="archive"><summary><b>${echap(b.nom)}</b><br><small>${echap(b.periode)} · ${faites.length} séance(s) notée(s) · ${jours.size} jour(s) de journal</small></summary>
      ${lignes.length + libres.length ? `<ul>${lignes.join("")}${libres.join("")}</ul>` : "<p>Aucune séance notée.</p>"}
      ${tests.length ? `<p><b>Tests</b></p><ul>${tests.join("")}</ul>` : ""}</details>`;
  }).join("");
  document.getElementById("archives-contenu").innerHTML = html +
    `<p class="aj-note">Tout est aussi dans l'export Excel (menu ⋯), une feuille par type de données, tous blocs confondus.</p>`;
  document.getElementById("dlg-archives").showModal();
}

/* ============================================================
   Démarrage
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sous-titre").textContent = BLOC.nom + " · " + dateJolie(datesDuBloc()[0]).split(" ").slice(1).join(" ") + " → " + dateJolie(datesDuBloc()[datesDuBloc().length - 1]).split(" ").slice(1).join(" ");
  renderStats(); renderAujourdhui(); renderJour(); renderChips(); renderSeances(); renderTests(); renderGraphs();
  document.getElementById("liste-nutrition").innerHTML = htmlNutrition(true);
  document.getElementById("liste-routines").innerHTML =
    htmlRoutine(ROUTINE_PIED, true) + htmlRoutine(ROUTINE_POSTURE, true);
  // Fermer le menu ⋯ quand on clique ailleurs
  document.addEventListener("click", e => {
    const menu = document.getElementById("menu");
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
});
