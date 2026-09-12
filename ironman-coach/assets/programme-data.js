/* ============================================================
   IRONMAN COACH — programme-data.js
   TOUT le contenu du bloc d'entraînement est ici, en données.
   Le code (programme.html, site simple) ne fait que l'afficher.

   >>> BLOC 3 — Sèche + Triathlon, UNE séance par jour
       (lundi 14 septembre → dimanche 20 décembre 2026, 14 semaines)
   (Les Blocs 1 et 2 restent sauvegardés sous leurs clés
   "ironman-samy-bloc1" / "ironman-samy-bloc2" — rien n'est perdu.)

   PRINCIPE DU BLOC : 7 séances par semaine, une par jour, jours fixes
   (Samy a demandé « une séance par jour, pas d'objectif de pas »).
   Le planning reste techniquement flexible (tu peux décaler), mais
   chaque séance porte son jour conseillé dans son titre.

   Pourquoi 3 muscu et pas 4 : quand chaque série est dure, deux Upper
   + un Lower font autant de muscle que quatre séances moyennes, et ça
   libère quatre jours pour le triathlon. Le vélo touche trois fois la
   semaine sans visite de plus : 15-20 min de Z2 souple sur les vélos
   de la salle en sortie des Upper.

   Structure d'une séance (module unique, valable pour TOUS les sports) :
   {
     id:        identifiant unique (sert de clé de sauvegarde)
     type:      "muscu" | "natation" | "velo" | "course" | "marche" | "test" | "repos"
     titre:     nom court (préfixé du jour conseillé)
     duree:     indication de durée
     objectif:  la consigne clé en une phrase
     contenu:   liste des étapes de la séance
     pourquoi:  explication du coach (affichée en accordéon)
     hint:      placeholder du champ "données" (guide sans imposer)
     optionnel: true = bonus, pas comptée dans l'assiduité
   }

   Les 14 semaines sont GÉNÉRÉES depuis le tableau PLAN ci-dessous
   (une ligne par semaine) + les 3 séances de muscu (MUSCU) : pour
   modifier une progression, on touche UNE ligne, pas 98 cartes.
   ============================================================ */

"use strict";

/* ---------- Les 3 séances de muscu du bloc ----------
   Toutes les séries de travail à 0-2 reps de l'échec. Épaules en
   premier dans les deux Upper : c'est le muscle prioritaire. */
const MUSCU = {
  upperA: {
    titre: "Lun · Upper A — épaules & largeur",
    duree: "~60 min + 15-20 min de vélo Z2",
    objectif: "Élévations latérales en premier, chaque série dure, puis 15-20 min de vélo souple sur place.",
    contenu: [
      "1. Élévations latérales haltères — 4 × 12-20",
      "2. Tirage vertical prise large (ou tractions) — 4 × 6-10",
      "3. Développé incliné haltères — 3 × 8-12",
      "4. Tirage devant haltères (upright row prise large) — 3 × 12-15",
      "5. Curl incliné haltères — 3 × 10-15",
      "6. Extension triceps corde — 3 × 12-15",
      "7. Crunch poulie — 3 × 12-15",
      "Puis 15-20 min de vélo Z2 souple (120-135 bpm) sur un vélo de la salle — la première chose à sauter si tu es pressé",
    ],
    pourquoi: "Ton ancien Upper commençait par le développé couché et finissait par 3 séries d'élévations latérales. Pour un « V », c'est l'inverse : les deltoïdes latéraux et les dorsaux font la largeur, le haut des pecs et les bras remplissent. Un muscle prioritaire se travaille frais, en début de séance (Lucas Gouiffes), et ce qui le fait grandir, c'est le nombre de séries dures par semaine, pas les kilos sur la barre (Pelland 2025).",
    hint: "Ex : charges, reps en réserve, séries ajoutées...",
  },
  lower: {
    titre: "Mer · Lower complet + mollets Rathleff",
    duree: "~55-60 min",
    objectif: "Un seul Lower par semaine : le vélo et la course font le reste. Mollets Rathleff obligatoires.",
    contenu: [
      "1. Hack squat ou presse — 4 × 8-12, amplitude complète",
      "2. Soulevé de terre roumain — 3 × 8-12, hip-hinge strict",
      "3. Leg extension — 2 × 12-15, dernière série à l'échec",
      "4. Leg curl allongé — 3 × 10-15",
      "5. Fentes bulgares haltères — 2 × 8-10 par côté (à sauter si tu manques de temps)",
      "6. Mollets Rathleff — 3 × 12 unilatéral, SERVIETTE ROULÉE SOUS LES ORTEILS, montée 2 s / pause 2 s / descente 3 s",
      "7. Gainage planche — 3 × 30-60 s",
      "Jamais la veille d'une course : mardi et dimanche restent libres",
    ],
    pourquoi: "En sèche avec deux vélos et deux courses par semaine, les jambes reçoivent déjà beaucoup : un Lower dur suffit à les entretenir, et deux Upper libèrent la place pour les épaules et le dos. Le protocole Rathleff (serviette sous les orteils) reste le traitement le mieux validé de la fasciite ; tant que tu cours, il compte double.",
    hint: "Ex : charges, douleur pied pendant les mollets, fatigue 0-10...",
  },
  upperB: {
    titre: "Ven · Upper B — épaisseur & bras",
    duree: "~60 min + 15-20 min de vélo Z2",
    objectif: "Deuxième passage épaules/dos de la semaine, bras et haut des pecs, puis 15-20 min de vélo souple.",
    contenu: [
      "1. Élévations latérales poulie, unilatéral — 4 × 12-15",
      "2. Rowing haltère unilatéral — 3 × 8-12",
      "3. Tirage vertical prise neutre — 3 × 8-12",
      "4. Écarté poulie basse (haut des pecs) — 3 × 12-15",
      "5. Curl marteau — 3 × 10-12",
      "6. Extension nuque haltère — 3 × 10-12",
      "7. Face pull — 2 × 15-20",
      "8. Relevés de genoux suspendu — 3 × 10-15",
      "Puis 15-20 min de vélo Z2 souple sur un vélo de la salle",
    ],
    pourquoi: "Par semaine, ça donne : deltoïdes latéraux 11 séries, dorsaux 7, rowing 3, haut des pecs 6, biceps 6, triceps 6, arrière d'épaule 2, abdos 9. C'est la répartition d'un physique, pas d'un programme de force. Progression : d'abord les reps dans la fourchette, puis la charge, et quand un muscle prioritaire stagne 3 semaines, +1 série dessus.",
    hint: "Ex : charges, reps en réserve, séries ajoutées...",
  },
};

/* ---------- Le plan, une ligne par semaine ----------
   c1 = course du mardi, c2 = course du dimanche, velo = jeudi, nat = samedi.
   maint = semaine à MAINTENANCE calorique (entraînement inchangé).
   releve = relevé de charges muscu (→ page Tests). */
const PLAN = [
  { num: 1, theme: "Reprise et calibrage",
    focus: "Trois semaines sans courir : on repart exactement là où le pied avait dit oui le 21 août. En salle, semaine de calibrage : trouve pour chaque exercice la charge qui te laisse 2 reps en réserve, note-la dans Hevy. Calories : 2 100, protéines 150 g, pesée chaque matin.",
    c1: "8 × (1' course / 2' marche)", c2: "8 × (1' / 2')", velo: "60 min Z2 stricte", nat: "400 m technique — première fois",
    muscuNote: "Semaine de calibrage : charge à 2 reps en réserve sur chaque exercice, tu la notes dans Hevy" },
  { num: 2, theme: "Segments de 2 minutes",
    focus: "Mardi, la séance du 21 août (10 × 1 min) ; dimanche, premiers segments de 2 minutes. Pied ≤ 3/10 ou on reste sur le format précédent.",
    c1: "10 × (1' / 2')", c2: "7 × (2' / 2')", velo: "60 min Z2 stricte", nat: "400 m technique",
    muscuNote: "Progression normale : reps dans la fourchette d'abord, puis la charge" },
  { num: 3, theme: "Un seul curseur à la fois",
    focus: "Dimanche, la récup entre les segments se réduit (1 min 30) sans allonger les segments. Fin de la 2e semaine de calories : première décision sur la moyenne 7 jours (perte < 0,25 kg/sem → −100 kcal ; > 0,5 → +100).",
    c1: "7 × (2' / 2')", c2: "8 × (2' / 1'30)", velo: "60 min Z2 stricte", nat: "500 m technique",
    muscuNote: "Progression normale" },
  { num: 4, theme: "Le cap des 3 minutes + premier relevé",
    focus: "Segments de 3 minutes. Vélo allégé jeudi pour arriver frais sur la course. Relevé de tes meilleures séries Upper et Lower → page Tests.",
    c1: "5 × (3' / 2')", c2: "6 × (3' / 2')", velo: "45 min Z2 souple (semaine allégée)", nat: "500 m technique",
    muscuNote: "Relevé de charges : reporte tes 2-3 meilleures séries dans la page Tests", releve: true },
  { num: 5, theme: "4 et 5 minutes, premier tempo vélo",
    focus: "Première intensité structurée du bloc : 3 × 5 min de tempo au vélo du jeudi (150-160 bpm). C'est la SEULE intensité du bloc — aucune zone 4 improvisée.",
    c1: "5 × (4' / 2')", c2: "4 × (5' / 2')", velo: "75 min Z2 + 3 × 5 min tempo", nat: "600 m technique",
    muscuNote: "Un muscle prioritaire stagne depuis 3 semaines ? +1 série par séance dessus" },
  { num: 6, theme: "Semaine à maintenance (calories), pas de repos",
    focus: "Tu remontes à ~2 400 kcal toute la semaine (glucides), entraînement inchangé. Ça protège le métabolisme et le moral (étude MATADOR) ; le poids peut remonter de 0,5 kg d'eau et de glycogène, c'est normal.",
    c1: "5 × (4' / 2')", c2: "4 × (5' / 2')", velo: "75 min Z2 stricte", nat: "600 m technique",
    muscuNote: "Profite des glucides : semaine où les charges doivent monter", maint: true },
  { num: 7, theme: "6 et 8 minutes",
    focus: "Retour à 2 100 kcal (ou ta valeur ajustée). Les segments passent à 6 puis 8 minutes : tu apprends à trouver un rythme de croisière. Tempo vélo le jeudi.",
    c1: "3 × (6' / 2')", c2: "3 × (8' / 2')", velo: "75 min Z2 + 3 × 5 min tempo", nat: "600-800 m : 4 × 66 m + technique",
    muscuNote: "Progression normale" },
  { num: 8, theme: "Consolidation + relevé",
    focus: "Répétition à dose égale avant la prochaine montée. Deuxième relevé de charges → page Tests. Photo du mois, tour de taille.",
    c1: "3 × (6' / 2')", c2: "3 × (8' / 2')", velo: "75 min Z2 stricte", nat: "600-800 m : 4 × 66 m + technique",
    muscuNote: "Relevé de charges → page Tests", releve: true },
  { num: 9, theme: "10 minutes, puis 15 minutes continues",
    focus: "Dimanche : tes premières 15 minutes sans marcher. Allure conversation, ~170 pas/min, regard loin. Tempo vélo le jeudi.",
    c1: "2 × (10' / 2')", c2: "15 min en continu", velo: "75 min Z2 + 3 × 5 min tempo", nat: "800 m : 6 × 66 m + technique",
    muscuNote: "Progression normale" },
  { num: 10, theme: "Répétition à dose égale",
    focus: "Même format que la semaine 9 : les tissus encaissent deux fois la même charge avant la prochaine montée. Vélo long : 90 min.",
    c1: "2 × (10' / 2')", c2: "15 min en continu", velo: "90 min Z2 stricte, barre à 45 min", nat: "800 m : 6 × 66 m + technique",
    muscuNote: "Progression normale" },
  { num: 11, theme: "20 minutes continues",
    focus: "Le format du test que le Bloc 2 n'a jamais fait : 20 minutes en continu, dimanche. Tempo vélo le jeudi.",
    c1: "2 × (10' / 2')", c2: "20 min en continu", velo: "75 min Z2 + 3 × 5 min tempo", nat: "800-1000 m : 8 × 66 m + technique",
    muscuNote: "Progression normale" },
  { num: 12, theme: "Maintenance + relevé",
    focus: "Deuxième semaine à ~2 400 kcal, entraînement inchangé. Troisième relevé de charges. Vélo long 90 min.",
    c1: "2 × (10' / 2')", c2: "20 min en continu", velo: "90 min Z2 stricte, barre à 45 min", nat: "800-1000 m : 8 × 66 m + technique",
    muscuNote: "Relevé de charges → page Tests", maint: true, releve: true },
  { num: 13, theme: "Assimilation",
    focus: "Retour au déficit. Volume stable, rien de nouveau : on arrive frais à la semaine des tests.",
    c1: "20 min en continu", c2: "25 min en continu", velo: "75 min Z2 stricte", nat: "1000 m souple",
    muscuNote: "Séances normales, pas de série ajoutée cette semaine" },
  { num: 14, theme: "Tests et bilan",
    focus: "Test course mardi (continu, cap 30 min), test vélo jeudi (20 min max, 2 jours après), test nage samedi (200 m chrono), pesée + tour de taille + bilan dimanche. Relevé final de charges lundi et mercredi. Résultats → page Tests, puis export du .json.",
    c1: null, c2: null, velo: null, nat: null,
    muscuNote: "Relevé final de charges → page Tests", releve: true, tests: true },
];

/* ---------- Générateur des 14 semaines ---------- */
function _muscu(sem, cle, id) {
  const m = MUSCU[cle];
  const note = sem.muscuNote ? [sem.muscuNote] : [];
  return { id, type: "muscu", titre: m.titre, duree: m.duree, objectif: m.objectif,
           contenu: note.concat(m.contenu), pourquoi: m.pourquoi, hint: m.hint };
}

function _course(sem, id, jour, format, n) {
  const continu = /continu/.test(format);
  return { id, type: "course", titre: `${jour} · Marche/course n°${n} — ${format}`,
    duree: continu ? "~35-45 min" : "~35-45 min",
    objectif: continu
      ? `${format} à allure conversation, puis 5 min de marche. Pied ≤ 3/10 ou on s'arrête.`
      : `${format}, allure conversation. Pied ≤ 3/10 ou on s'arrête AU MILIEU de la séance, pas après.`,
    contenu: [
      "5 min de marche rapide pour échauffer",
      continu ? `${format} — tu peux parler en courant` : `${format} — tu peux parler en courant`,
      "5 min de marche pour finir",
      "Clifton + semelles, petits pas rapides (~170/min), atterris sous ton corps",
      "Douleur pied > 3/10 pendant → stop, tu rentres en marchant, séance en « adapté » avec la raison",
      "Douleur > 2/10 le lendemain → tu répètes ce format la semaine prochaine au lieu de monter",
    ],
    pourquoi: "Le 13 août tu as fini une séance à 8/10 de douleur : c'était la séance à arrêter. Cette fois, la règle s'applique pendant, pas après. Les deux courses de la semaine sont à 48 h l'une de l'autre et jamais la veille ou le lendemain du Lower : c'est le délai de réparation des tissus du pied. Un seul curseur monte à la fois (durée des segments OU récupération OU nombre de répétitions).",
    hint: "Ex : format tenu ?, douleur pied 0-10 pendant / après, FC, essoufflement...",
  };
}

function _velo(sem, id, format) {
  const tempo = /tempo/.test(format);
  return { id, type: "velo", titre: `Jeu · Vélo — ${format}`,
    duree: format.split(" ")[0] + " min",
    objectif: tempo
      ? "Z2 (120-140 bpm) avec 3 × 5 min de tempo à 150-160 bpm, 5 min de Z2 souple entre chaque."
      : "Zone 2 stricte : 120-140 bpm, cadence 85-90, tu peux parler.",
    contenu: tempo
      ? ["10 min d'échauffement", "3 × (5 min tempo 150-160 bpm / 5 min Z2 souple)", "Complète en Z2 jusqu'à la durée, 5 min calme", "750 ml d'eau + électrolytes sur la séance"]
      : ["5 min d'échauffement, puis Z2 jusqu'à la durée, 5 min calme", "3 × 30 s de cadence 100+ répartis pour délier", "750 ml d'eau + électrolytes par heure", /90/.test(format) ? "Une barre vers 45 min : on entraîne l'alimentation en selle" : "Bidon obligatoire dès 60 min"],
    pourquoi: tempo
      ? "La seule intensité structurée du bloc : le tempo élève ton plafond pendant que la Z2 élargit la base. Dosé pour ne pas voler la récupération de la course ni de la sèche. Jamais de zone 4 improvisée : tes deux sorties « difficulté 5-6 » d'août ont fatigué sans construire."
      : "Le moteur diesel de l'Ironman se construit ici, à faible coût pour le pied et sans manger ta récupération. Un Ironman se court à 70-75 % sous le seuil : rouler trop fort trop souvent est l'erreur n°1.",
    hint: "Ex : distance, FC moyenne, watts, sensations jambes...",
  };
}

function _nat(sem, id, format) {
  return { id, type: "natation", titre: `Sam · Natation — ${format}`,
    duree: "~30-40 min",
    objectif: "Pure technique, zéro pression sur le chrono. Neptunium, créneau 8 h-10 h.",
    contenu: [
      "Échauffement 2 × 33 m souple",
      /66/.test(format) ? format.replace(/^\d+(-\d+)? m : /, "") + ", repos 30 s" : "8-10 × 33 m crawl, repos 20-30 s",
      "2 × 33 m dos pour finir",
      "Expire À FOND sous l'eau, en continu dès que le visage est dans l'eau",
      "Allonge le bras devant à chaque mouvement : moins de mouvements par longueur = meilleure nage",
      "Respire tous les 3 temps ; trop dur ? 2 temps du côté confortable",
    ],
    pourquoi: "La natation est le premier tiers de ton Ironman (3,8 km) et tu ne l'as jamais commencée. Une fois par semaine maintenant, c'est le minimum pour que la sensation de l'eau s'installe ; en janvier on passe à deux.",
    hint: "Ex : longueurs, essoufflement, ce qui a marché...",
  };
}

function _test(id, jour, titre, duree, objectif, contenu, pourquoi, hint) {
  return { id, type: "test", titre: `${jour} · ${titre}`, duree, objectif, contenu, pourquoi, hint };
}

function _semaine(sem) {
  const w = `w${sem.num}`;
  const seances = [];
  seances.push(_muscu(sem, "upperA", `${w}-lun`));
  if (sem.tests) {
    seances.push(_test(`${w}-mar`, "Mar", "TEST — Course continue (cap 30 min)", "~45 min",
      "Courir en continu à allure conversation, aussi longtemps que possible, STOP à 30 min.",
      ["10 min d'échauffement : marche rapide + 3 × 1 min de course facile",
       "TEST : cours en continu, allure conversation, jusqu'à 30 min MAXIMUM",
       "Tu t'arrêtes avant si : douleur pied > 3/10, ou tu n'arrives plus à parler",
       "5 min de marche pour finir",
       "Note : durée tenue, distance, FC moyenne, douleur pied → page Tests"],
      "Le test que le Bloc 2 n'a jamais fait. L'objectif n'est PAS la vitesse : c'est la durée tenue à allure aisée. En juin tu étais mort après 300 m ; en août tu tenais 1 minute. On mesure le chemin.",
      "Durée tenue, distance, FC, douleur, gestion..."));
  } else {
    seances.push(_course(sem, `${w}-mar`, "Mar", sem.c1, 1));
  }
  seances.push(_muscu(sem, "lower", `${w}-mer`));
  if (sem.tests) {
    seances.push(_test(`${w}-jeu`, "Jeu", "TEST — 20 min vélo max", "~40 min",
      "20 min à l'effort maximal SOUTENABLE et régulier : la plus grande distance possible.",
      ["10 min d'échauffement progressif avec 2 × 30 s appuyés", "3 min tranquille",
       "TEST : 20 min à fond régulier — les 5 premières minutes doivent sembler « trop faciles »",
       "Note distance, vitesse moyenne, FC moyenne, watts si affichés → page Tests", "10 min retour au calme"],
      "Le test de 20 min estime ton seuil (≈ 95 % de la moyenne) et calibre tes zones vélo de 2027. Référence de juin : 14 km en 32 min (~26 km/h). Deux jours après le test course.",
      "Distance, vitesse moy., FC, watts, gestion..."));
  } else {
    seances.push(_velo(sem, `${w}-jeu`, sem.velo));
  }
  seances.push(_muscu(sem, "upperB", `${w}-ven`));
  if (sem.tests) {
    seances.push(_test(`${w}-sam`, "Sam", "TEST — 200 m nage chrono", "~30 min",
      "Échauffement complet, 3 min de repos, puis 6 × 33 m enchaînées (198 m) chronométrées à l'Apple Watch.",
      ["6 × 33 m progressifs en échauffement", "3 min de repos complet", "6 × 33 m enchaînées sans pause, chrono", "Note le chrono et tes sensations → page Tests"],
      "Ta première référence nage. Pour situer : 4:30-5:00 serait très correct après des années d'arrêt.",
      "Chrono, sensations..."));
    seances.push(_test(`${w}-dim`, "Dim", "BILAN du bloc + pesée + export", "~20 min",
      "Repos complet. Pesée à jeun, tour de taille, photo, bilan écrit, export du fichier.",
      ["Pèse-toi à jeun + tour de taille au nombril → page Tests",
       "Photo dans la même lumière que celle du 14 septembre",
       "Remplis le bilan libre : ce qui a marché, ce qui a coincé, le pied, la faim, la natation",
       "Menu ⋯ → « Sauvegarde .json » → envoie-moi le fichier",
       "Repos. Mérité."],
      "Avec ce fichier on construit janvier : le régime inversé (+150 kcal/semaine jusqu'à stagnation), la natation à deux fois par semaine, et les zones vélo sur ton test.",
      "Ton bilan libre du bloc..."));
  } else {
    seances.push(_nat(sem, `${w}-sam`, sem.nat));
    const c2 = _course(sem, `${w}-dim`, "Dim", sem.c2, 2);
    c2.contenu.push("Pied qui dit non ce matin ? Remplace par 90 min de vélo Z2 (statut « adapté »)");
    seances.push(c2);
  }
  return { num: sem.num, theme: sem.theme, focus: sem.focus, seances };
}

const BLOC = {
  nom: "Bloc 3 — Sèche + Triathlon, une séance par jour",
  debut: "2026-09-14",           // lundi 14 septembre 2026
  objectifBloc:
    "Quatorze semaines, une séance par jour, jours fixes : 3 muscu (épaules et dos en premier), " +
    "2 vélos Z2 (+ 15-20 min après chaque Upper), 2 marche/course avec le pied qui vote, 1 natation. " +
    "Nutrition : sèche lente à 2 100 kcal et 150 g de protéines, ajustée toutes les 2 semaines sur la " +
    "moyenne de poids 7 jours (cible : −0,3 à −0,45 kg/semaine), semaines 6 et 12 à maintenance. " +
    "Départ 66 kg / 18,9 % (11 sept.) ; cible 20 décembre : ~61 kg, abdos hauts visibles, taille −6 cm. " +
    "Règle absolue : sommeil ≥ 7 h 30, sinon la sèche mange du muscle.",
  semaines: PLAN.map(_semaine),
};

/* ---------- Règles d'agencement de la semaine ----------
   Affichées (repliées) sur la page programme. */
const AGENCEMENT = [
  "<strong>Une séance par jour, jours fixes</strong> : Lun Upper A · Mar course · Mer Lower · Jeu vélo · Ven Upper B · Sam natation · Dim course. Tu peux décaler, mais garde les écarts ci-dessous.",
  "<strong>48 h entre deux courses</strong>, et jamais la veille ni le lendemain du Lower (mollets frais = technique propre = pied protégé).",
  "<strong>Pied > 3/10 pendant une course</strong> : stop au milieu de la séance, tu rentres en marchant, statut « adapté » + raison. Raideur matinale en hausse 2 jours de suite : la course suivante devient 90 min de vélo Z2.",
  "<strong>Muscu puis vélo, jamais l'inverse</strong> : les 15-20 min de Z2 après les Upper se font sur les vélos de la salle, en sortie de séance. Pressé ? C'est la première chose à sauter.",
  "<strong>Une seule intensité</strong> : le tempo du jeudi (3 × 5 min) une semaine sur deux à partir de la semaine 5. Aucune zone 4 improvisée dans ce bloc.",
  "<strong>Semaine minimale</strong> si la vie s'en mêle : Upper A, Lower, Upper B, le vélo du jeudi, une course. Cinq jours sur sept, à tenir 90 % du temps.",
  "<strong>Nutrition</strong> : 2 100 kcal, 150 g de protéines, 60 g de lipides, le reste en glucides. Pesée chaque matin à jeun ; toutes les 2 semaines : perte < 0,25 kg/sem → −100 kcal, perte > 0,5 → +100. Semaines 6 et 12 : ~2 400 kcal, entraînement inchangé.",
  "<strong>Chaque matin</strong> : poids, calories et protéines de la veille (30 s), douleur pied au réveil. Tour de taille au nombril le lundi. Photo toutes les 4 semaines, même lumière.",
];

/* ---------- TESTS du bloc : définitions ----------
   Affichés + saisis dans tests.html. */
const TESTS = [
  {
    id: "test-depart", titre: "Mesures de départ", quand: "Lundi 14 septembre, à jeun",
    protocole: "Pesée à jeun au réveil, tour de taille au niveau du nombril (détendu, expiration naturelle), photo de face et de profil dans une lumière que tu pourras reproduire.",
    cible: "Référence du bloc. Le 11 septembre : 66 kg, 18,9 % (balance). Le % de la balance a une erreur de 3 à 5 points : c'est le poids moyen sur 7 jours et le tour de taille qui comptent.",
    champs: [
      { cle: "poids", label: "Poids à jeun (kg)", type: "number" },
      { cle: "taille", label: "Tour de taille (cm)", type: "number" },
      { cle: "photo", label: "Photo faite ? (oui / non, où elle est rangée)", type: "text" },
      { cle: "notes", label: "Remarques", type: "textarea" },
    ],
  },
  {
    id: "test-course", titre: "Course continue — cap 30 min", quand: "Semaine 14, mardi — frais, jamais le lendemain du Lower",
    protocole: "10 min d'échauffement (marche rapide + 3 × 1 min course facile), puis course CONTINUE à allure conversation, aussi longtemps que possible, arrêt obligatoire à 30 min. Stop avant si douleur pied > 3/10 ou impossibilité de parler.",
    cible: "Tenir 20 min = objectif du bloc atteint ; 30 min = excellent. La douleur pied prime sur tout : t'arrêter à cause d'elle reste un test réussi (on a mesuré).",
    champs: [
      { cle: "duree", label: "Durée courue en continu (min:s)", type: "text" },
      { cle: "distance", label: "Distance (km)", type: "number" },
      { cle: "fc", label: "FC moyenne (bpm)", type: "number" },
      { cle: "douleur", label: "Douleur pied 0-10 (pendant / après)", type: "text" },
      { cle: "ressenti", label: "Gestion de l'effort / sensations", type: "textarea" },
    ],
  },
  {
    id: "test-velo", titre: "20 min vélo — effort max", quand: "Semaine 14, jeudi — 2 jours après le test course",
    protocole: "10 min d'échauffement, puis 20 min à l'effort maximal soutenable et RÉGULIER. Noter tout ce que la machine et la montre affichent.",
    cible: "Référence de juin : 14 km en 32 min (~26 km/h). Égaler à 61 kg = bien, dépasser = excellent. Ce test calibre les zones vélo de 2027 (seuil ≈ 95 % de la moyenne des 20 min).",
    champs: [
      { cle: "distance", label: "Distance (km)", type: "number" },
      { cle: "vitesse", label: "Vitesse moy. (km/h)", type: "number" },
      { cle: "fc", label: "FC moyenne (bpm)", type: "number" },
      { cle: "watts", label: "Watts moy. (si affichés)", type: "number" },
      { cle: "ressenti", label: "Gestion de l'effort / sensations", type: "textarea" },
    ],
  },
  {
    id: "test-nage", titre: "200 m nage chrono", quand: "Semaine 14, samedi",
    protocole: "Échauffement complet (6 × 33 m progressifs), 3 min de repos, puis 6 × 33 m enchaînées (198 m) chronométrées à l'Apple Watch.",
    cible: "Première référence nage de ta vie. 4:30-5:00 serait très correct après des années d'arrêt.",
    champs: [
      { cle: "chrono", label: "Chrono (mm:ss)", type: "text" },
      { cle: "ressenti", label: "Sensations", type: "textarea" },
    ],
  },
  {
    id: "test-muscu", titre: "Relevés de charges (Hevy)", quand: "Semaines 4, 8, 12 et 14",
    protocole: "Pas de test séparé : reporte ici tes 2-3 meilleures séries Upper et Lower de la semaine (exercice × charge × reps × reps en réserve). Une ligne par relevé, datée.",
    cible: "En sèche, garder ses charges = gagner. Élévations latérales, tirage et rowing qui montent = le bloc fonctionne.",
    champs: [
      { cle: "upper", label: "Meilleures séries Upper (date · exo × kg × reps)", type: "textarea" },
      { cle: "lower", label: "Meilleures séries Lower (date · exo × kg × reps)", type: "textarea" },
    ],
  },
  {
    id: "test-corps", titre: "Poids, tour de taille & photo de fin", quand: "Dimanche 20 décembre, à jeun",
    protocole: "Pesée à jeun au réveil + tour de taille au nombril, détendu. Photo dans la même lumière que le 14 septembre.",
    cible: "Départ : 66 kg / 18,9 %. Cible : ~61 kg, taille −6 cm, abdos hauts visibles au repos. Le critère final reste le miroir : satisfait ou pas.",
    champs: [
      { cle: "poids", label: "Poids à jeun (kg)", type: "number" },
      { cle: "taille", label: "Tour de taille (cm)", type: "number" },
      { cle: "notes", label: "Miroir, énergie, faim, remarques", type: "textarea" },
    ],
  },
  {
    id: "test-bilan", titre: "Bilan libre du bloc", quand: "Dimanche 20 décembre",
    protocole: "Écris librement : ce qui a marché, ce qui a coincé, le pied sur 14 semaines, la faim, le sommeil, la natation, la motivation.",
    cible: "Ce texte + ton export .json = tout ce dont j'ai besoin pour construire janvier (régime inversé, natation 2×, zones vélo).",
    champs: [
      { cle: "bilan", label: "Ton bilan du bloc", type: "textarea" },
      { cle: "pied", label: "État du pied : douleur moyenne du bloc (0-10) et tendance", type: "text" },
    ],
  },
];

/* ---------- JOURNAL : champs quotidiens ----------
   Pour ajouter/enlever un champ du journal : modifier UNIQUEMENT cette liste. */
const JOURNAL_CHAMPS = [
  { cle: "poids", label: "Poids à jeun (kg)", type: "number", largeur: "petit" },
  { cle: "calories", label: "Calories de la veille (kcal)", type: "number", largeur: "petit" },
  { cle: "proteines", label: "Protéines de la veille (g)", type: "number", largeur: "petit" },
  { cle: "pied_douleur", label: "Douleur pied au réveil (0-10)", type: "number", largeur: "petit" },
  { cle: "pied", label: "Rééduc pied faite (5 min)", type: "checkbox" },
  { cle: "taille", label: "Tour de taille (cm, le lundi)", type: "number", largeur: "petit" },
  { cle: "sommeil", label: "Sommeil (h)", type: "number", largeur: "petit" },
  { cle: "eau", label: "Eau (L)", type: "number", largeur: "petit" },
  { cle: "pas", label: "Pas (facultatif)", type: "number", largeur: "petit" },
  { cle: "electrolytes", label: "Électrolytes (nb)", type: "number", largeur: "petit" },
  { cle: "ressenti", label: "Ressenti / faim / nourriture / notes libres", type: "textarea" },
];
