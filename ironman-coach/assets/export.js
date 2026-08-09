/* ============================================================
   IRONMAN COACH — export.js
   Sauvegarde MULTI-BLOCS : export/import JSON + export Excel.

   Principe de durabilité : chaque bloc vit sous sa propre clé
   localStorage ("ironman-samy-blocN"). Ajouter un bloc ne touche
   JAMAIS aux clés des blocs passés. Ici, on lit TOUTES les clés
   pour exporter l'historique complet — le fichier exporté contient
   donc toujours tout, depuis le premier jour.

   REGISTRE = catalogue des blocs passés (id → titre des séances),
   pour que l'export Excel reste lisible même quand le site affiche
   un bloc plus récent. Quand un bloc se termine : on ajoute son
   catalogue ici (voir README).
   ============================================================ */

"use strict";

/* ---------- Registre des blocs ---------- */
const REGISTRE = [
  {
    cle: "ironman-samy-bloc1",
    nom: "Bloc 1 — Reprise & Fondations",
    periode: "13 juillet – 9 août 2026 (remplacé le 31/07 par le Bloc 2)",
    /* Catalogue compact : id → [semaine, type, titre] */
    seances: {
      "s1-lun": [1, "muscu", "Upper A"], "s1-mar": [1, "natation", "Natation — retrouvailles"],
      "s1-mer": [1, "muscu", "Lower A"], "s1-jeu": [1, "velo", "Vélo Z2 45 min"],
      "s1-ven": [1, "muscu", "Upper B"], "s1-sam": [1, "natation", "Natation + marche"],
      "s1-dim": [1, "muscu", "Lower B"],
      "s2-lun": [2, "muscu", "Upper A"], "s2-mar": [2, "natation", "Natation — volume léger"],
      "s2-mer": [2, "muscu", "Lower A"], "s2-jeu": [2, "velo", "Vélo Z2 55 min"],
      "s2-ven": [2, "muscu", "Upper B"], "s2-sam": [2, "natation", "Natation + marche"],
      "s2-dim": [2, "muscu", "Lower B"],
      "s3-lun": [3, "muscu", "Upper A"], "s3-mar": [3, "natation", "Natation — premiers 100 m"],
      "s3-mer": [3, "muscu", "Lower A"], "s3-jeu": [3, "velo", "Vélo Z2 70 min"],
      "s3-ven": [3, "muscu", "Upper B"], "s3-sam": [3, "natation", "Natation + marche longue"],
      "s3-dim": [3, "muscu", "Lower B"],
      "s4-lun": [4, "muscu", "Upper A + relevé"], "s4-mar": [4, "test", "TEST — 200 m nage"],
      "s4-mer": [4, "muscu", "Lower A + relevé"], "s4-jeu": [4, "test", "TEST — 20 min vélo"],
      "s4-ven": [4, "muscu", "Upper B allégé"], "s4-sam": [4, "natation", "Natation souple + marche"],
      "s4-dim": [4, "test", "BILAN du bloc"],
    },
    tests: {
      "test-nage": "200 m nage chrono", "test-velo": "20 min vélo — effort max",
      "test-muscu": "Relevé de charges", "test-corps": "Poids & mensurations",
      "test-bilan": "Bilan libre",
    },
  },
  /* Le bloc COURANT est décrit par programme-data.js (BLOC/TESTS)
     et injecté dynamiquement par blocsConnus() ci-dessous. */
];

/* Renvoie la liste complète des blocs : registre (passés) + bloc courant. */
function blocsConnus() {
  const courant = {
    cle: STORE_KEY,
    nom: BLOC.nom,
    periode: dateJolie(datesDuBloc()[0]) + " – " + dateJolie(datesDuBloc()[27]),
    seances: {}, tests: {}, courant: true,
  };
  BLOC.semaines.forEach(sem => sem.seances.forEach(s => {
    courant.seances[s.id] = [sem.num, s.type, s.titre + (s.optionnel ? " (optionnelle)" : "")];
  }));
  TESTS.forEach(t => { courant.tests[t.id] = t.titre; });
  // Blocs du registre, sans doublon avec le courant
  return REGISTRE.filter(b => b.cle !== STORE_KEY).concat([courant]);
}

/* Lit les données d'un bloc depuis localStorage (objet plat ou {}). */
function donneesDuBloc(cle) {
  try { return JSON.parse(localStorage.getItem(cle)) || {}; }
  catch { return {}; }
}

/* ---------- Export / Import JSON (tous les blocs) ---------- */
function exportJSON() {
  const data = { exporte_le: new Date().toISOString(), version: 2, blocs: {} };
  blocsConnus().forEach(b => { data.blocs[b.cle] = donneesDuBloc(b.cle); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ironman-samy-${aujourdhuiISO()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSON(fichier) {
  const lecteur = new FileReader();
  lecteur.onload = () => {
    try {
      const data = JSON.parse(lecteur.result);
      if (data.version === 2 && data.blocs) {
        // Format actuel : restaure chaque bloc sous sa clé
        Object.entries(data.blocs).forEach(([cle, donnees]) =>
          localStorage.setItem(cle, JSON.stringify(donnees || {})));
      } else if (data.donnees) {
        // Ancien format (v1) : un seul bloc
        localStorage.setItem(data.bloc || STORE_KEY, JSON.stringify(data.donnees));
      } else throw new Error("format");
      // Pousse l'import dans le fichier disque AVANT de recharger (envoi synchrone),
      // sinon le rechargement ré-écraserait l'import avec l'ancien contenu du fichier.
      if (typeof syncEnvoyer === "function") syncEnvoyer(true);
      location.reload();
    } catch {
      alert("Fichier invalide — il faut un export .json du site.");
    }
  };
  lecteur.readAsText(fichier);
}

/* ---------- Export Excel (.xlsx, multi-feuilles, tous les blocs) ---------- */
const STATUT_LABELS = { "": "À faire", "faite": "Faite", "adaptee": "Faite (adaptée)", "pas-pu": "Pas pu" };

function exporterExcel() {
  const blocs = blocsConnus();
  const wb = XLSX.utils.book_new();

  /* --- Feuille Infos --- */
  const infos = [
    ["IRONMAN COACH — Journal d'entraînement de Samy"],
    ["Exporté le", new Date().toLocaleString("fr-BE")],
    ["Objectif", "Ironman complet — été 2028 (3,8 km nage / 180 km vélo / 42,2 km course)"],
    [],
    ["Bloc", "Période", "Séances faites", "Pas pu"],
  ];
  blocs.forEach(b => {
    const d = donneesDuBloc(b.cle);
    const ids = Object.keys(b.seances);
    const faites = ids.filter(id => { const s = d[`seance.${id}.statut`] || (d[`seance.${id}.fait`] ? "faite" : ""); return s === "faite" || s === "adaptee"; }).length;
    const pasPu = ids.filter(id => d[`seance.${id}.statut`] === "pas-pu").length;
    infos.push([b.nom, b.periode, `${faites}/${ids.length}`, pasPu]);
  });
  const wsInfos = XLSX.utils.aoa_to_sheet(infos);
  wsInfos["!cols"] = [{ wch: 34 }, { wch: 40 }, { wch: 14 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, wsInfos, "Infos");

  /* --- Feuille Séances --- */
  const seancesRows = [["Bloc", "Semaine", "Type", "Séance", "Statut", "Fait le", "Difficulté (1-10)", "Données", "Raison / adaptation", "Ressenti"]];
  blocs.forEach(b => {
    const d = donneesDuBloc(b.cle);
    Object.entries(b.seances).forEach(([id, [sem, type, titre]]) => {
      const statut = d[`seance.${id}.statut`] || (d[`seance.${id}.fait`] ? "faite" : "");
      const aDesDonnees = statut || d[`seance.${id}.donnees`] || d[`seance.${id}.ressenti`];
      // Blocs passés : on n'exporte que les séances renseignées ; bloc courant : tout
      if (!b.courant && !aDesDonnees) return;
      seancesRows.push([
        b.nom, sem, (TYPE_LABELS[type] || type), titre,
        b.courant || statut ? (STATUT_LABELS[statut] ?? statut) : "Non renseignée",
        d[`seance.${id}.faitele`] || "", d[`seance.${id}.rpe`] || "",
        d[`seance.${id}.donnees`] || "", d[`seance.${id}.raison`] || "", d[`seance.${id}.ressenti`] || "",
      ]);
    });
  });
  const wsSeances = XLSX.utils.aoa_to_sheet(seancesRows);
  wsSeances["!cols"] = [{ wch: 26 }, { wch: 8 }, { wch: 9 }, { wch: 34 }, { wch: 14 }, { wch: 11 }, { wch: 9 }, { wch: 36 }, { wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsSeances, "Séances");

  /* --- Feuille Journal (union des dates de tous les blocs) --- */
  const parDate = {};
  blocs.forEach(b => {
    const d = donneesDuBloc(b.cle);
    Object.keys(d).forEach(k => {
      const m = k.match(/^journal\.(\d{4}-\d{2}-\d{2})\.(.+)$/);
      if (!m) return;
      (parDate[m[1]] = parDate[m[1]] || {})[m[2]] = d[k];
    });
  });
  const champsJournal = [
    ["poids", "Poids (kg)"], ["pas", "Pas"], ["eau", "Eau (L)"], ["electrolytes", "Électrolytes"],
    ["calories", "Calories"], ["proteines", "Protéines (g)"], ["sommeil", "Sommeil (h)"],
    ["pied_douleur", "Douleur pied matin (0-10)"], ["pied", "Rééduc pied"], ["ressenti", "Ressenti / notes"],
  ];
  const journalRows = [["Date"].concat(champsJournal.map(c => c[1]))];
  Object.keys(parDate).sort().forEach(date => {
    const j = parDate[date];
    const valeurs = champsJournal.map(([cle]) => cle === "pied" ? (j[cle] ? "✓" : "") : (j[cle] ?? ""));
    if (valeurs.some(v => v !== "" && v !== false)) journalRows.push([date].concat(valeurs));
  });
  const wsJournal = XLSX.utils.aoa_to_sheet(journalRows);
  wsJournal["!cols"] = [{ wch: 11 }].concat(champsJournal.map(([cle]) => ({ wch: cle === "ressenti" ? 60 : 12 })));
  XLSX.utils.book_append_sheet(wb, wsJournal, "Journal");

  /* --- Feuille Tests --- */
  const testsRows = [["Bloc", "Test", "Mesure", "Valeur"]];
  blocs.forEach(b => {
    const d = donneesDuBloc(b.cle);
    Object.keys(d).forEach(k => {
      const m = k.match(/^tests\.([^.]+)\.(.+)$/);
      if (!m || d[k] === "" || d[k] === undefined) return;
      testsRows.push([b.nom, b.tests[m[1]] || m[1], m[2], d[k]]);
    });
  });
  const wsTests = XLSX.utils.aoa_to_sheet(testsRows);
  wsTests["!cols"] = [{ wch: 26 }, { wch: 28 }, { wch: 14 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsTests, "Tests");

  /* --- Feuille Séances libres --- */
  const libresRows = [["Bloc", "Semaine", "Quoi", "Date", "Données", "Ressenti"]];
  blocs.forEach(b => {
    const d = donneesDuBloc(b.cle);
    for (let w = 1; w <= 10; w++) {
      const n = +d[`extra.w${w}.count`] || 0;
      for (let i = 0; i < n; i++) {
        libresRows.push([b.nom, w, d[`extra.w${w}.${i}.titre`] || "", d[`extra.w${w}.${i}.date`] || "",
                         d[`extra.w${w}.${i}.donnees`] || "", d[`extra.w${w}.${i}.ressenti`] || ""]);
      }
    }
  });
  const wsLibres = XLSX.utils.aoa_to_sheet(libresRows);
  wsLibres["!cols"] = [{ wch: 26 }, { wch: 8 }, { wch: 34 }, { wch: 11 }, { wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsLibres, "Séances libres");

  XLSX.writeFile(wb, `ironman-samy-${aujourdhuiISO()}.xlsx`);
}
