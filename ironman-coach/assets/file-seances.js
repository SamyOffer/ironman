/* ============================================================
   FILE-SEANCES — le moteur qui choisit la séance du jour
   Partagé par le site simple et le site complet. Fonctions PURES :
   elles lisent un objet `st` (l'état sauvegardé) et ne l'écrivent jamais.

   Données sauvegardées :
   seance.<piste>-<n>.statut|faitele|etape|titre|type|rpe|donnees|ressenti
       une séance faite (✓ "faite" ou ≈ "adaptee"), n = 1, 2, 3… par piste
   seance.test-<x>.statut|faitele…        les tests de fin de bloc
   libre.count, libre.<i>.type|titre|date  « J'ai fait autre chose »
   journal.<date>.off = true              « Pas le temps aujourd'hui »
   journal.<date>.passer = "course,velo"  « Autre séance » (pistes écartées ce jour-là)
   journal.<date>.forcer = true           s'entraîner malgré le repos conseillé
   reglage.natation = "actif"             sinon la natation est en pause
   ============================================================ */

"use strict";

const PISTES_ORDRE = ["course", "muscu", "natation", "velo"];   // départage à égalité

function fsDecaler(iso, n) {
  const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fsEcart(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
function fsFait(statut) { return statut === "faite" || statut === "adaptee"; }

function natationEnPause(st) { return st["reglage.natation"] !== "actif"; }

/* Toutes les séances du programme marquées ✓ ou ≈, triées par piste puis n° */
function seancesFaites(st) {
  const liste = [];
  Object.keys(st).forEach(k => {
    const m = k.match(/^seance\.((muscu|course|velo|natation)-(\d+))\.statut$/);
    if (!m || !fsFait(st[k])) return;
    const id = m[1];
    liste.push({ id, piste: m[2], n: +m[3], statut: st[k], date: st[`seance.${id}.faitele`] || "",
      etape: st[`seance.${id}.etape`] === undefined ? null : +st[`seance.${id}.etape`],
      type: m[2], titre: st[`seance.${id}.titre`] || id });
  });
  Object.keys(SEANCES_TESTS).forEach(id => {
    if (fsFait(st[`seance.${id}.statut`])) liste.push({ id, piste: "test", n: 0, statut: st[`seance.${id}.statut`],
      date: st[`seance.${id}.faitele`] || "", type: SEANCES_TESTS[id].piste === "bilan" ? "repos" : SEANCES_TESTS[id].piste,
      titre: SEANCES_TESTS[id].titre });
  });
  return liste.sort((a, b) => a.piste.localeCompare(b.piste) || a.n - b.n);
}

function seancesLibres(st) {
  const n = +st["libre.count"] || 0, liste = [];
  for (let i = 0; i < n; i++) {
    if (!st[`libre.${i}.date`] && !st[`libre.${i}.titre`]) continue;
    liste.push({ id: `libre-${i}`, i, libre: true, type: st[`libre.${i}.type`] || "autre",
      titre: st[`libre.${i}.titre`] || "Séance libre", date: st[`libre.${i}.date`] || "" });
  }
  return liste;
}

/* Tout ce qui a été fait (programme + libres), avec une date */
function activites(st) { return seancesFaites(st).concat(seancesLibres(st)).filter(a => a.date); }

/* Mêmes activités, mais seulement sur une fenêtre [debut, fin] incluse */
function activitesEntre(st, debut, fin) { return activites(st).filter(a => a.date >= debut && a.date <= fin); }

/* Étape à proposer pour la prochaine séance d'une piste, vue depuis `jour` */
function prochaineEtape(st, piste, jour) {
  const faites = seancesFaites(st).filter(s => s.piste === piste);
  if (!faites.length) return 0;
  const derniere = faites[faites.length - 1];
  let etape = (derniere.etape ?? 0) + (derniere.statut === "faite" ? 1 : 0);
  if (piste === "course" || piste === "natation") {
    const dates = faites.map(s => s.date).filter(Boolean).sort();
    const ecart = dates.length ? fsEcart(dates[dates.length - 1], jour) : 0;
    const total = PISTES[piste].etapes;
    if (etape < total) etape -= ecart > 21 ? 2 : ecart > 10 ? 1 : 0;   // reprise après une absence
  }
  return Math.max(0, etape);
}

/* La prochaine séance d'une piste (null si la progression est finie) */
function prochaineSeance(st, piste, jour) {
  const n = seancesFaites(st).filter(s => s.piste === piste).reduce((m, s) => Math.max(m, s.n), 0) + 1;
  if (piste === "muscu") return seanceMuscu(n);
  const etape = prochaineEtape(st, piste, jour);
  if (PISTES[piste].etapes && etape >= PISTES[piste].etapes) return null;
  return fabriquerSeance(piste, n, etape);
}

function testsDebloques(st, jour) { return prochaineEtape(st, "course", jour) >= COURSE_ETAPES.length; }

function testsRestants(st, jour) {
  if (!testsDebloques(st, jour)) return [];
  const restants = ["test-course", "test-velo", "test-nage"]
    .filter(id => !fsFait(st[`seance.${id}.statut`]))
    .filter(id => !(id === "test-nage" && natationEnPause(st)));
  if (!restants.length && !fsFait(st["seance.test-bilan.statut"])) restants.push("test-bilan");
  return restants;
}
function blocTermine(st) { return fsFait(st["seance.test-bilan.statut"]); }

/* Combien de séances d'une piste viser sur 7 jours glissants */
function cibleSemaine(st, piste, jour) {
  const pause = natationEnPause(st);
  if (piste === "natation") return pause ? 0 : (prochaineEtape(st, "natation", jour) >= NAT_DEUX_PAR_SEMAINE ? 2 : 1);
  if (piste === "velo") return pause ? 2 : 1;
  return PISTES[piste].cible;
}

/* Le cœur : la liste ordonnée des séances possibles ce jour-là */
function candidatsDuJour(st, jour) {
  const hier = activitesEntre(st, fsDecaler(jour, -1), fsDecaler(jour, -1));
  const courseHier = hier.some(a => a.type === "course");
  const muscuHier = hier.some(a => a.type === "muscu");
  const lowerHier = hier.some(a => a.piste === "muscu" && ROTATION_MUSCU[(a.n - 1) % 3] === "lower");
  const semaine = activitesEntre(st, fsDecaler(jour, -6), fsDecaler(jour, -1));
  const passer = (st[`journal.${jour}.passer`] || "").split(",").filter(Boolean);

  const derniereDate = piste => semaine.concat(activites(st)).filter(a => a.type === piste).map(a => a.date).sort().pop() || "";
  const liste = [];

  // Tests de fin de bloc : passent devant tout, avec les règles de leur sport
  testsRestants(st, jour).forEach(id => {
    const s = seanceTest(id);
    if (passer.includes(id)) return;
    if (s.piste === "course" && (courseHier || lowerHier)) return;
    liste.push({ seance: s, score: 100 });
  });

  PISTES_ORDRE.forEach(piste => {
    if (passer.includes(piste)) return;
    if (piste === "natation" && natationEnPause(st)) return;
    const s = prochaineSeance(st, piste, jour);
    if (!s) return;
    if (piste === "course" && (courseHier || lowerHier)) return;
    if (piste === "muscu" && (muscuHier || (s.cle === "lower" && courseHier))) return;
    const faites = semaine.filter(a => a.type === piste).length;
    liste.push({ seance: s, score: cibleSemaine(st, piste, jour) - faites, derniere: derniereDate(piste) });
  });

  return liste.sort((a, b) => b.score - a.score
    || (a.derniere || "").localeCompare(b.derniere || "")
    || PISTES_ORDRE.indexOf(a.seance.piste) - PISTES_ORDRE.indexOf(b.seance.piste))
    .map(c => c.seance);
}

/* Ce que le site affiche pour un jour donné */
function planDuJour(st, jour) {
  if (blocTermine(st)) return { etat: "termine" };
  const fait = activites(st).filter(a => a.date === jour);
  if (fait.length) return { etat: "fait", fait };
  if (st[`journal.${jour}.off`]) return { etat: "off" };
  const candidats = candidatsDuJour(st, jour);
  const recentes = activitesEntre(st, fsDecaler(jour, -6), fsDecaler(jour, -1));
  const joursActifs = new Set(recentes.map(a => a.date)).size;
  if (joursActifs >= 6 && !st[`journal.${jour}.forcer`]) return { etat: "repos", seance: candidats[0] || null };
  return { etat: "seance", seance: candidats[0] || null, autres: candidats.slice(1) };
}

/* Demain : on simule que la séance proposée aujourd'hui est faite (si elle ne l'est pas déjà) */
function planDeDemain(st, jour) {
  const auj = planDuJour(st, jour);
  let sim = st;
  if (auj.etat === "seance" && auj.seance) {
    sim = Object.assign({}, st);
    const s = auj.seance;
    sim[`seance.${s.id}.statut`] = "faite";
    sim[`seance.${s.id}.faitele`] = jour;
    sim[`seance.${s.id}.etape`] = s.etape;
  }
  const copie = Object.assign({}, sim);
  delete copie[`journal.${fsDecaler(jour, 1)}.off`];
  return planDuJour(copie, fsDecaler(jour, 1));
}

/* Messages liés à la date : examens, semaine « plus de féculents », retour de la natation */
function messagesDuJour(st, jour) {
  const msgs = [];
  if (EXAMENS.includes(fsDecaler(jour, 1))) msgs.push("📚 Examen demain : fais la version courte et couche-toi tôt.");
  if (EXAMENS.includes(jour)) msgs.push("📚 Jour d'examen : la séance après l'examen si tu es frais, sinon « Pas le temps aujourd'hui ».");
  const semaine = Math.floor(fsEcart(BLOC.debut, jour) / 7);
  if (semaine > 0 && semaine % 6 === 5) msgs.push("🍚 Semaine « plus de féculents » : +1 poing de féculents à chaque repas, entraînement inchangé.");
  if (natationEnPause(st) && jour >= NATATION_REPRISE_POSSIBLE) msgs.push("🏊 Tu peux de nouveau nager ? Réactive la natation dans « Ma progression ».");
  return msgs;
}
