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
const ICONES = { muscu: "🏋️", natation: "🏊", velo: "🚴", course: "🏃", marche: "🚶", test: "🧪", repos: "🌙", autre: "✨" };

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
  const auj = aujourdhuiISO();
  const sept = activitesEntre(state, decalerDate(auj, -6), auj);
  const jours7 = new Set(sept.map(a => a.date)).size;
  const etapeCourse = Math.min(prochaineEtape(state, "course", auj), COURSE_ETAPES.length);
  // Dernière douleur pied renseignée (30 derniers jours)
  let douleur = null;
  for (let i = 30; i >= 0; i--) {
    const v = state[`journal.${decalerDate(auj, -i)}.pied_douleur`];
    if (v !== undefined && v !== "") douleur = v;
  }
  const p7 = poidsMoyen(auj, 0), p14 = poidsMoyen(auj, 7);
  const delta = (p7 !== null && p14 !== null) ? p7 - p14 : null;
  const deltaTxt = delta === null ? "" : ` (${delta > 0 ? "+" : ""}${delta.toFixed(2)} kg/sem)`;
  const deltaOk = delta === null || (delta <= -0.2 && delta >= -0.6);
  document.getElementById("stats").innerHTML = `
    <div class="pastille ${p7 === null ? "" : (deltaOk ? "ok" : "warn")}">
      <b>${p7 === null ? "—" : p7.toFixed(1)}</b><span>Poids moy. 7 j${deltaTxt}</span></div>
    <div class="pastille ${jours7 >= 5 ? "ok" : (jours7 >= 3 ? "" : "warn")}">
      <b>${jours7}/7</b><span>Jours actifs (7 j)</span></div>
    <div class="pastille"><b>${etapeCourse}/${COURSE_ETAPES.length}</b><span>Étapes course</span></div>
    <div class="pastille ${douleur === null || +douleur <= 2 ? "ok" : "warn"}">
      <b>${douleur === null ? "—" : douleur + "/10"}</b><span>Pied au réveil</span></div>`;
}

/* Ouvre une section repliée et y amène l'écran */
function ouvrirSection(e, idSection) {
  if (e) e.preventDefault();
  const sec = document.getElementById(idSection);
  sec.open = true;
  sec.scrollIntoView({ behavior: "smooth", block: "start" });
}
function ouvrirRoutines(e) { ouvrirSection(e, "section-routines"); }

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
   3. AUJOURD'HUI — la séance proposée par la file d'attente
   ============================================================ */
const SEANCES_VUES = {};   // id → séance affichée (pour enregistrer étape/titre au ✓)

function nomCourt(s) { return s ? `${ICONES[s.type] || "•"} ${s.titre}` : ""; }

function ligneDemain() {
  const auj = aujourdhuiISO(), p = planDeDemain(state, auj);
  if (p.etat === "seance" && p.seance) return `<p class="demain">Demain probablement : <b>${nomCourt(p.seance)}</b> <small>(${p.seance.duree})</small> — prévois ton créneau dès maintenant.</p>`;
  if (p.etat === "repos") return `<p class="demain">Demain : repos conseillé (6 jours d'entraînement d'affilée).</p>`;
  return "";
}

function renderAujourdhui() {
  const auj = aujourdhuiISO(), el = document.getElementById("aujourdhui");
  const p = planDuJour(state, auj);
  const msgs = messagesDuJour(state, auj).map(m => `<p class="aj-msg">${m}</p>`).join("");
  const boutons = (avecAutre) => `<div class="aj-actions">
      ${avecAutre ? `<button onclick="passerSeance()">🔄 Autre séance</button>` : ""}
      <button onclick="pasLeTemps()">⏳ Pas le temps aujourd'hui</button>
      <button onclick="ouvrirLibre()">✍️ J'ai fait autre chose</button>
    </div>`;
  let html = "";
  if (p.etat === "termine") {
    html = `<div class="aj-entete fait">🎉 Bloc terminé</div><p>Tests faits, bilan rempli : envoie-moi l'export .json (menu ⋯) et on construit la préparation du triathlon M.</p>`;
  } else if (p.etat === "fait") {
    html = `<div class="aj-entete fait">✓ Fait aujourd'hui</div>` +
      p.fait.map(a => a.libre ? `<p>✨ ${a.titre}</p>` : renderSeance(seanceDepuisFaite(a))).join("") + ligneDemain();
  } else if (p.etat === "off") {
    html = `<div class="aj-entete">Jour off</div>
      <p>Pas de souci : rien n'est perdu, la séance attend demain.</p>${ligneDemain()}
      <div class="aj-actions"><button onclick="annulerOff()">↩︎ Finalement, j'ai le temps</button>
      <button onclick="ouvrirLibre()">✍️ J'ai fait autre chose</button></div>`;
  } else if (p.etat === "repos") {
    html = `<div class="aj-entete">Repos conseillé</div>
      <p>Tu t'es entraîné 6 jours sur les 6 derniers : un jour off aide à progresser. Tu peux quand même y aller.</p>
      <div class="aj-actions"><button onclick="set('journal.${auj}.forcer', true); renderTout()">💪 Je veux m'entraîner</button>
      <button onclick="ouvrirLibre()">✍️ J'ai fait autre chose</button></div>${ligneDemain()}`;
  } else if (!p.seance) {
    html = `<div class="aj-entete">Rien de possible aujourd'hui</div>
      <p>Tu as écarté toutes les séances. Repos, ou note ce que tu as fait.</p>
      <div class="aj-actions"><button onclick="set('journal.${auj}.passer', ''); renderTout()">↩︎ Revoir les propositions</button>
      <button onclick="ouvrirLibre()">✍️ J'ai fait autre chose</button></div>`;
  } else {
    const s = p.seance;
    html = `<div class="aj-entete">Aujourd'hui</div>${renderSeance(s, true)}${boutons(p.autres.length > 0)}${ligneDemain()}`;
  }
  el.innerHTML = msgs + html;
}

/* Reconstruit la carte d'une séance faite (pour pouvoir compléter ressenti, date…) */
function seanceDepuisFaite(a) {
  if (a.piste === "test") return seanceTest(a.id);
  return fabriquerSeance(a.piste, a.n, a.etape ?? 0) || { id: a.id, type: a.type, titre: a.titre, duree: "", objectif: "", contenu: [], pourquoi: "" };
}

function passerSeance() {
  const auj = aujourdhuiISO(), p = planDuJour(state, auj);
  if (!p.seance) return;
  const cle = p.seance.piste === "test" || p.seance.id.startsWith("test-") ? p.seance.id : p.seance.piste;
  const liste = (state[`journal.${auj}.passer`] || "").split(",").filter(Boolean);
  liste.push(cle);
  set(`journal.${auj}.passer`, liste.join(","));
  renderTout();
}
function pasLeTemps() { set(`journal.${aujourdhuiISO()}.off`, true); renderTout(); }
function annulerOff() { const k = `journal.${aujourdhuiISO()}.off`; delete state[k]; save(); renderTout(); }

/* ---------- Carte de séance ---------- */
function boutonsStatut(id) {
  const s = statutDe(id);
  const b = (val, txt, titre) =>
    `<button class="st ${s === val ? "actif" : ""}" data-s="${val}" title="${titre}"
       onclick="event.stopPropagation(); toucherStatut('${id}', '${val}')">${txt}</button>`;
  return `<div class="statuts">${b("faite", "✓", "Faite en entier : l'étape avance")}${b("adaptee", "≈", "Version courte ou adaptée : elle compte, mais on refait l'étape")}</div>`;
}

/* Un tap = statut ; re-tap sur le même = annulé */
function toucherStatut(id, val) {
  const nouveau = statutDe(id) === val ? "" : val;
  const s = SEANCES_VUES[id];
  if (nouveau && s) {
    if (state[`seance.${id}.etape`] === undefined) state[`seance.${id}.etape`] = s.etape ?? 0;
    state[`seance.${id}.titre`] = s.titre;
    state[`seance.${id}.type`] = s.type;
    if (!state[`seance.${id}.faitele`]) state[`seance.${id}.faitele`] = aujourdhuiISO();
  }
  if (!nouveau) delete state[`seance.${id}.faitele`];
  set(`seance.${id}.statut`, nouveau);
  renderTout();
}

function renderSeance(s, ouverte) {
  SEANCES_VUES[s.id] = s;
  const st = statutDe(s.id);
  const classe = estFaite(s.id) ? "faite" : "";
  const raisonVisible = st === "adaptee";
  return `
  <div class="seance ${classe} ${ouverte ? "ouverte" : ""}" id="s-${s.id}">
    <div class="ligne" onclick="this.parentElement.classList.toggle('ouverte')">
      <div class="sport ${s.type}">${ICONES[s.type] || "•"}</div>
      <div class="nom"><b>${s.titre}</b><small>${s.duree}${s.objectif ? " — " + s.objectif : ""}</small></div>
      ${boutonsStatut(s.id)}
    </div>
    <div class="details">
      <ul>${s.contenu.map(c => `<li>${c}</li>`).join("")}</ul>
      ${s.pourquoi ? `<button class="lien-pourquoi" onclick="this.nextElementSibling.classList.toggle('ouvert')">pourquoi cette séance ?</button>
      <div class="pourquoi">${s.pourquoi}</div>` : ""}
      <div class="raison ${raisonVisible ? "visible" : ""}">
        <label class="champ"><span>Qu'est-ce qui a changé ? (version courte, douleur…)</span>
        <input type="text" value="${(state[`seance.${s.id}.raison`] ?? "").replace(/"/g, "&quot;")}"
          onchange="set('seance.${s.id}.raison', this.value)"></label>
      </div>
      <div class="grille">
        <label class="champ"><span>Faite le</span>
          <input type="date" data-role="faitele" value="${state[`seance.${s.id}.faitele`] ?? ""}"
            onchange="set('seance.${s.id}.faitele', this.value); renderTout()"></label>
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

/* ---------- « J'ai fait autre chose » ---------- */
function ouvrirLibre() {
  document.getElementById("libre-date").value = aujourdhuiISO();
  document.getElementById("libre-titre").value = "";
  document.getElementById("dlg-libre").showModal();
}
function enregistrerLibre(e) {
  e.preventDefault();
  const titre = document.getElementById("libre-titre").value.trim();
  const n = +state["libre.count"] || 0;
  state[`libre.${n}.type`] = document.getElementById("libre-type").value;
  state[`libre.${n}.titre`] = titre || "Séance libre";
  state[`libre.${n}.date`] = document.getElementById("libre-date").value || aujourdhuiISO();
  set("libre.count", n + 1);
  document.getElementById("dlg-libre").close();
  renderTout();
}
function supprimerLibre(i) {
  if (!confirm("Supprimer cette séance ?")) return;
  ["type", "titre", "date"].forEach(c => delete state[`libre.${i}.${c}`]);
  save(); renderTout();
}

/* ============================================================
   4. MA PROGRESSION + MES DERNIERS JOURS
   ============================================================ */
function renderProgression() {
  const auj = aujourdhuiISO();
  const faites = seancesFaites(state);
  const barre = (fait, total) => `<div class="prog-barre"><div style="width:${Math.min(100, Math.round(100 * fait / total))}%"></div></div>`;
  const listeEtapes = (piste, libelles) => {
    const max = faites.filter(s => s.piste === piste && s.statut === "faite").reduce((m, s) => Math.max(m, (s.etape ?? 0) + 1), 0);
    return `<details class="rp-plus"><summary>Voir toutes les étapes</summary><ol class="etapes">${libelles.map((l, i) =>
      `<li class="${i < max ? "ok" : ""}">${i < max ? "✓ " : ""}${l}</li>`).join("")}</ol></details>`;
  };
  const eC = Math.min(prochaineEtape(state, "course", auj), COURSE_ETAPES.length);
  const eN = Math.min(prochaineEtape(state, "natation", auj), NAT_ETAPES.length);
  const nMuscu = faites.filter(s => s.piste === "muscu").length;
  const prochMuscu = seanceMuscu(nMuscu + 1);
  const nVelo = faites.filter(s => s.piste === "velo").length;
  const pause = natationEnPause(state);
  const tests = testsDebloques(state, auj);
  document.getElementById("progression").innerHTML = `
    <div class="prog">
      <div class="prog-titre">🏃 Course <span>étape ${Math.min(eC + 1, COURSE_ETAPES.length)}/${COURSE_ETAPES.length}</span></div>
      ${barre(eC, COURSE_ETAPES.length)}
      <small>${eC < COURSE_ETAPES.length ? `Prochaine : ${COURSE_ETAPES[eC]}` : "Progression finie : place aux tests !"}</small>
      ${listeEtapes("course", COURSE_ETAPES)}
    </div>
    <div class="prog ${pause ? "en-pause" : ""}">
      <div class="prog-titre">🏊 Natation <span>${pause ? "en pause" : `étape ${Math.min(eN + 1, NAT_ETAPES.length)}/${NAT_ETAPES.length}`}</span></div>
      ${barre(eN, NAT_ETAPES.length)}
      <small>${pause ? "Le vélo prend sa place. Tu reprendras à l'étape " + (eN + 1) + "." : (eN < NAT_ETAPES.length ? `Prochaine : ${seanceNatation(1, eN).titre.split(" — ")[1]}` : "Progression finie")}</small>
      <button class="prog-bouton" onclick="set('reglage.natation', ${pause ? "'actif'" : "'pause'"}); renderTout()">${pause ? "▶︎ Je peux de nouveau nager" : "⏸ Mettre la natation en pause"}</button>
      ${listeEtapes("natation", NAT_ETAPES.map((e, i) => seanceNatation(1, i).titre.split(" — ")[1]))}
    </div>
    <div class="prog">
      <div class="prog-titre">🏋️ Muscu <span>${nMuscu} faite${nMuscu > 1 ? "s" : ""}</span></div>
      <small>Prochaine : ${prochMuscu.titre.replace("Muscu · ", "")} (rotation Upper A → Lower → Upper B)</small>
    </div>
    <div class="prog">
      <div class="prog-titre">🚴 Vélo <span>${nVelo} fait${nVelo > 1 ? "s" : ""}</span></div>
      <small>Prochain : ${prochaineSeance(state, "velo", auj).titre.replace("Vélo — ", "")}</small>
    </div>
    <p class="aj-note">${tests ? "🧪 Les tests de fin de bloc sont débloqués : le site te les propose un par un." :
      "🧪 Les tests de fin de bloc arrivent quand tu auras fini la progression course."}</p>`;
}

function renderHistorique() {
  const auj = aujourdhuiISO();
  const liste = activitesEntre(state, decalerDate(auj, -13), auj).sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("historique").innerHTML = liste.length ? liste.map(a => a.libre
    ? `<div class="seance faite"><div class="ligne" style="cursor:default">
        <div class="sport ${a.type}">${ICONES[a.type] || "✨"}</div>
        <div class="nom"><b>${a.titre}</b><small>${dateJolie(a.date)} · séance libre (${TYPE_LABELS[a.type] || "autre"})</small></div>
        <button class="suppr" onclick="supprimerLibre(${a.i})">✕</button></div></div>`
    : renderSeance(seanceDepuisFaite(a)).replace("<small>", `<small>${dateJolie(a.date)} · `)).join("")
    : `<p class="aj-note">Rien encore sur les 14 derniers jours. La première séance est en haut de la page.</p>`;
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
  const auj = aujourdhuiISO();
  const nbSem = Math.max(1, Math.min(20, Math.floor(Math.max(0, (new Date(auj) - new Date(BLOC.debut)) / 864e5) / 7) + 1));
  const dates = []; for (let i = 0; i < nbSem * 7; i++) dates.push(decalerDate(BLOC.debut, i));
  const acts = activites(state);
  const parSem = Array.from({ length: nbSem }, (_, w) => dates.slice(w * 7, w * 7 + 7));
  document.getElementById("graphs").innerHTML = `
    <div class="graph"><div class="titre-graph">Poids (kg)</div>${sparkline(dates.map(d => state[`journal.${d}.poids`] ?? null))}</div>
    <div class="graph"><div class="titre-graph">Tour de taille (cm)</div>${sparkline(dates.map(d => state[`journal.${d}.taille`] ?? null))}</div>
    <div class="graph"><div class="titre-graph">Énergie (1-5)</div>${sparkline(dates.map(d => { const v = state[`journal.${d}.energie`]; return v === undefined || v === "" ? null : v; }))}</div>
    <div class="graph"><div class="titre-graph">Douleur pied au réveil</div>${sparkline(dates.map(d => { const v = state[`journal.${d}.pied_douleur`]; return v === undefined || v === "" ? null : v; }))}</div>
    <div class="graph"><div class="titre-graph">Jours d'entraînement / semaine</div>${barres(parSem.map((js, w) => ({
      x: w + 1, y: new Set(acts.filter(a => js.includes(a.date)).map(a => a.date)).size, max: 6 })))}</div>
    <div class="graph"><div class="titre-graph">Rééduc pied / semaine</div>${barres(parSem.map((js, w) => ({
      x: w + 1, y: js.filter(d => state[`journal.${d}.pied`]).length, max: 7 })))}</div>`;
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
function renderTout() {
  renderStats(); renderAujourdhui(); renderProgression(); renderHistorique(); renderGraphs();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sous-titre").textContent = BLOC.nom + " · depuis le " + dateJolie(BLOC.debut).split(" ").slice(1).join(" ");
  renderTout(); renderJour(); renderTests();
  document.getElementById("liste-nutrition").innerHTML = htmlNutrition(true);
  document.getElementById("liste-routines").innerHTML =
    htmlRoutine(ROUTINE_PIED, true) + htmlRoutine(ROUTINE_POSTURE, true);
  document.addEventListener("click", e => {
    const menu = document.getElementById("menu");
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
});
