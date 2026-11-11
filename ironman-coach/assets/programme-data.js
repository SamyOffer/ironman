/* ============================================================
   IRONMAN COACH — programme-data.js
   TOUT le contenu du bloc d'entraînement est ici, en données.
   Le code (programme.html, site simple) ne fait que l'afficher.

   >>> BLOC 4 — Reprise claire : triathlon + sèche douce
       (lundi 16 novembre 2026 → dimanche 21 février 2027, 14 semaines)

   ARCHIVES : rien n'est jamais supprimé.
   - Les données des Blocs 1, 2 et 3 restent dans le cloud sous
     "ironman-samy-bloc1/2/3" ; elles sont dans chaque export Excel/.json
     et consultables sur le site simple (menu ⋯ → « Blocs passés »).
   - Le programme du Bloc 3 est conservé tel quel dans
     ironman-coach/archives/programme-bloc3.js.

   POURQUOI CE BLOC (décidé avec Samy le 12 nov. 2026) :
   - Bloc 2 : 7 séances notées sur 28. Bloc 3 : 1 séance notée en 5 semaines.
     Samy est d'accord pour aller au sport tous les jours, à condition que
     ce soit CLAIR : chaque jour = une séance précise, un jour fixe, et une
     « version courte » écrite d'avance pour les jours sans énergie.
   - Il ne compte plus les calories (« ça me saoule ») et se sent parfois
     sans énergie avant la séance → la nutrition passe en méthode
     « assiette », avec une collation avant chaque séance.
   - Natation le lundi (1×), puis lundi + mardi à partir de la semaine 7.
   - Pas couru depuis août (fasciite) : la course repart du tout début.
   - Séances de salle ≤ 1 h 30. Examens les 10 déc., 4 janv. et 22 janv.
     (Noël et nouvel an ne comptent pas pour lui).
   - Étape intermédiaire : triathlon M (format olympique) été 2027.

   Structure d'une séance (module unique, valable pour TOUS les sports) :
   {
     id, type ("muscu" | "natation" | "velo" | "course" | "test" | "repos"),
     jour (0 = lundi … 6 = dimanche), titre, duree, objectif,
     contenu (liste d'étapes), pourquoi, hint, optionnel
   }

   Les 14 semaines sont GÉNÉRÉES depuis le tableau PLAN (une ligne par
   semaine) + les 3 séances de muscu (MUSCU).
   ============================================================ */

"use strict";

const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/* ---------- La semaine type ----------
   S1-S6  : Lun natation · Mar vélo · Mer Lower · Jeu Upper A · Ven course · Sam Upper B · Dim course
   S7-S14 : le mardi devient la 2e natation ; le vélo passe à 25-30 min après chaque Upper.
   Contraintes respectées : 48 h entre deux courses, aucune course la veille
   ni le lendemain du Lower, vélo la veille du Lower (souple, ça ne gêne pas). */

/* ---------- Les 3 séances de muscu ----------
   Toutes les séries de travail à 0-2 reps de l'échec. Épaules en premier. */
const MUSCU = {
  upperA: {
    jour: 3, nom: "Upper A — épaules & largeur",
    duree: "~60 min + vélo",
    objectif: "Élévations latérales en premier, chaque série dure, puis vélo souple sur place.",
    contenu: [
      "1. Élévations latérales haltères — 4 × 12-20",
      "2. Tirage vertical prise large (ou tractions) — 4 × 6-10",
      "3. Développé incliné haltères — 3 × 8-12",
      "4. Tirage menton haltères prise large — 3 × 12-15",
      "5. Curl incliné haltères — 3 × 10-15",
      "6. Extension triceps corde — 3 × 12-15",
      "7. Roulette abdominale à genoux — 3 × 8-12 (trop dur ? planche bassin enroulé 3 × 30-45 s)",
    ],
    court: "exos 1, 2 et 3 seulement, pas de vélo (≈ 35 min)",
    pourquoi: "Pour un « V », les deltoïdes latéraux et les dorsaux font la largeur, le haut des pecs et les bras remplissent. Un muscle prioritaire se travaille frais, en début de séance, et ce qui le fait grandir, c'est le nombre de séries dures par semaine, pas les kilos sur la barre (Pelland 2025). Le 7 octobre, le curl incliné était dur : c'est normal, c'est l'exercice où le biceps est le plus étiré. Garde la charge, vise le haut de la fourchette de reps avant d'augmenter.",
    hint: "Ex : charges, reps en réserve, séries ajoutées...",
  },
  lower: {
    jour: 2, nom: "Lower complet + mollets Rathleff",
    duree: "~55-60 min",
    objectif: "Un seul Lower par semaine : le vélo et la course font le reste. Mollets Rathleff obligatoires.",
    contenu: [
      "1. Hack squat ou presse — 4 × 8-12, amplitude complète",
      "2. Soulevé de terre roumain — 3 × 8-12, hip-hinge strict",
      "3. Leg extension — 2 × 12-15, dernière série à l'échec",
      "4. Leg curl allongé — 3 × 10-15",
      "5. Fentes bulgares haltères — 2 × 8-10 par côté",
      "6. Mollets Rathleff — 3 × 12 unilatéral, SERVIETTE ROULÉE SOUS LES ORTEILS, montée 2 s / pause 2 s / descente 3 s",
      "7. Hip thrust — 3 × 10-12, pause 2 s en haut, côtes basses, bassin enroulé au verrouillage",
    ],
    court: "exos 1, 2 et 6 (Rathleff) seulement (≈ 35 min)",
    pourquoi: "Avec un vélo, deux courses et deux natations, les jambes reçoivent déjà beaucoup : un Lower dur suffit. Il est placé le mercredi pour être à deux jours de chaque course (vendredi et dimanche) : mollets frais = foulée propre = pied protégé. Le protocole Rathleff (serviette sous les orteils) reste le traitement le mieux validé de la fasciite ; il se fait maintenant trois fois par semaine (lundi et vendredi à la maison, mercredi ici), comme dans l'étude.",
    hint: "Ex : charges, douleur pied pendant les mollets, fatigue 0-10...",
  },
  upperB: {
    jour: 5, nom: "Upper B — épaisseur & bras",
    duree: "~60 min + vélo",
    objectif: "Deuxième passage épaules/dos de la semaine, bras et haut des pecs, puis vélo souple.",
    contenu: [
      "1. Élévations latérales poulie, unilatéral — 4 × 12-15",
      "2. Rowing haltère unilatéral — 3 × 8-12",
      "3. Tirage vertical prise neutre — 3 × 8-12",
      "4. Écarté poulie basse (haut des pecs) — 3 × 12-15",
      "5. Curl marteau — 3 × 10-12",
      "6. Extension nuque haltère — 3 × 10-12",
      "7. Face pull — 2 × 15-20",
      "8. Relevés de genoux suspendu — 3 × 10-15, en ENROULANT le bassin vers toi en haut",
    ],
    court: "exos 1 à 4 seulement, pas de vélo (≈ 35 min)",
    pourquoi: "Par semaine : deltoïdes latéraux 11 séries, dorsaux 7, rowing 3, haut des pecs 6, biceps 6, triceps 6, arrière d'épaule 2, abdos 9. C'est la répartition d'un physique, pas d'un programme de force. Progression : d'abord les reps dans la fourchette, puis la charge ; quand un muscle prioritaire stagne 3 semaines, +1 série dessus.",
    hint: "Ex : charges, reps en réserve, séries ajoutées...",
  },
};

/* ---------- Le plan, une ligne par semaine ----------
   nat = natation du lundi (longueurs de 33 m du corps de séance),
   nat2 = natation du mardi (à partir de S7), velo = vélo du mardi (S1-S6),
   c1 = course du vendredi, c2 = course du dimanche.
   notes = consignes d'un jour précis (clé = jour, 0 = lundi).
   maint = semaine « plus de féculents » ; releve = relevé de charges. */
const PLAN = [
  { num: 1, theme: "Reprise claire", du: "16 nov.",
    focus: "On repart de zéro, exprès facile. Lundi matin : pesée à jeun + tour de taille → page Tests (« Mesures de départ »). En salle, trouve pour chaque exercice la charge qui laisse 2 reps en réserve et note-la dans Hevy. Course : tu n'as pas couru depuis août, alors 1 minute suffit.",
    nat: { corps: "6 × 33 m crawl, repos 30-45 s au bord", lg: 6 },
    velo: "45 min Z2", c1: "8 × (1' course / 2' marche)", c2: "8 × (1' / 2')",
    muscuNote: "Semaine de calibrage : charge à 2 reps en réserve sur chaque exercice, note-la dans Hevy" },
  { num: 2, theme: "Installer le rythme", du: "23 nov.",
    focus: "Même semaine, un cran plus loin. Si la douleur pied au réveil dépasse 2/10 deux matins de suite, la course suivante redevient le format de la semaine 1.",
    nat: { corps: "8 × 33 m crawl, repos 30 s", lg: 8 },
    velo: "60 min Z2", c1: "10 × (1' / 2')", c2: "8 × (1'30 / 2')",
    muscuNote: "Progression normale : reps dans la fourchette d'abord, puis la charge" },
  { num: 3, theme: "Segments de 2 minutes", du: "30 nov.",
    focus: "Première décision de nutrition lundi, sur la moyenne 7 jours (voir « Manger sans compter »). Examen le jeudi 10 : la semaine prochaine sera allégée, celle-ci est normale.",
    nat: { corps: "10 × 33 m crawl, repos 30 s", lg: 10 },
    velo: "60 min Z2", c1: "7 × (2' / 2')", c2: "8 × (2' / 1'30)",
    muscuNote: "Progression normale" },
  { num: 4, theme: "Semaine d'examen (jeudi 10)", du: "7 déc.",
    focus: "Semaine allégée, pas annulée : bouger aide à réviser. Mercredi Lower en version courte, jeudi Upper A après l'examen en version courte ou repos. Course : on garde le format de la semaine 3 vendredi.",
    nat: { corps: "10 × 33 m crawl, repos 30 s", lg: 10 },
    velo: "45 min Z2 souple", c1: "7 × (2' / 2')", c2: "6 × (3' / 2')",
    notes: { 2: "Veille d'examen : version courte (exos 1, 2 et 6), couché tôt", 3: "JOUR D'EXAMEN : après l'examen, version courte si tu es frais, sinon repos (statut ✗, raison « examen »)" },
    muscuNote: "Semaine allégée : garde tes charges, ne cherche pas à monter" },
  { num: 5, theme: "3 et 4 minutes + premier tempo", du: "14 déc.",
    focus: "Premier relevé de charges → page Tests. Mardi, la seule intensité du bloc : 3 × 5 min de tempo au vélo. Natation : premières 2 longueurs d'affilée.",
    nat: { corps: "6 × 66 m crawl (2 longueurs d'affilée), repos 40 s", lg: 12 },
    velo: "60 min Z2 + 3 × 5 min tempo", c1: "5 × (3' / 2')", c2: "5 × (4' / 2')",
    muscuNote: "Relevé de charges : reporte tes 2-3 meilleures séries dans la page Tests", releve: true },
  { num: 6, theme: "Semaine « plus de féculents »", du: "21 déc.",
    focus: "+1 poing de féculents à chaque repas toute la semaine, entraînement inchangé. Ça recharge l'énergie et le moral ; le poids peut remonter de 0,5 kg (eau et glycogène), c'est normal. Dernier vélo du mardi : la semaine prochaine, la 2e natation le remplace.",
    nat: { corps: "8 × 66 m crawl, repos 40 s", lg: 16 },
    velo: "75 min Z2", c1: "5 × (4' / 2')", c2: "4 × (5' / 2')",
    muscuNote: "Semaine où les charges doivent monter : profite de l'énergie", maint: true },
  { num: 7, theme: "Deux natations par semaine", du: "28 déc.",
    focus: "Le mardi devient ta 2e natation (technique). Le vélo passe à 25-30 min après chaque Upper. Révisions pour le 4 janvier : dimanche, course tôt et couché tôt.",
    nat: { corps: "4 × 99 m (3 longueurs d'affilée), repos 45 s + 4 × 33 m", lg: 16 },
    nat2: "A", c1: "4 × (5' / 2')", c2: "3 × (6' / 2')",
    notes: { 6: "Veille d'examen : course le matin, couché tôt" },
    muscuNote: "Progression normale" },
  { num: 8, theme: "Semaine d'examen (lundi 4)", du: "4 janv.",
    focus: "Lundi = examen : la natation se fait après si tu es frais, sinon tu la sautes (✗ « examen ») et tu gardes celle de mardi. Le reste de la semaine est normal.",
    nat: { corps: "4 × 99 m, repos 45 s + 4 × 33 m", lg: 16 },
    nat2: "A", c1: "3 × (6' / 2')", c2: "3 × (8' / 2')",
    notes: { 0: "JOUR D'EXAMEN : après l'examen si tu es frais, sinon repos (statut ✗, raison « examen »)" },
    muscuNote: "Progression normale" },
  { num: 9, theme: "8 et 10 minutes", du: "11 janv.",
    focus: "Deuxième relevé de charges → page Tests. Photo du mois, même lumière que le 16 novembre.",
    nat: { corps: "5 × 99 m, repos 45 s + 4 × 33 m", lg: 19 },
    nat2: "A", c1: "3 × (8' / 2')", c2: "2 × (10' / 2')",
    muscuNote: "Relevé de charges → page Tests", releve: true },
  { num: 10, theme: "Semaine d'examen (vendredi 22)", du: "18 janv.",
    focus: "Même dose de course que dimanche dernier, rien de nouveau. Jeudi Upper A en version courte, vendredi course après l'examen ou sautée. Dimanche normal.",
    nat: { corps: "4 × 132 m (4 longueurs d'affilée), repos 45 s + 4 × 33 m", lg: 20 },
    nat2: "B", c1: "2 × (10' / 2')", c2: "2 × (10' / 2')",
    notes: { 3: "Veille d'examen : version courte (exos 1, 2, 3), couché tôt", 4: "JOUR D'EXAMEN : course après l'examen si tu es frais, sinon tu la sautes (✗ « examen ») — dimanche reste normal" },
    muscuNote: "Semaine d'examen : garde tes charges" },
  { num: 11, theme: "15 minutes continues", du: "25 janv.",
    focus: "Dimanche : tes premières 15 minutes sans marcher. Allure conversation, ~170 pas/min, regard loin.",
    nat: { corps: "3 × 198 m (6 longueurs d'affilée), repos 1 min + 4 × 33 m", lg: 22 },
    nat2: "B", c1: "2 × (10' / 2')", c2: "15 min en continu",
    muscuNote: "Progression normale" },
  { num: 12, theme: "20 minutes + « plus de féculents »", du: "1er févr.",
    focus: "Deuxième semaine à +1 poing de féculents par repas, entraînement inchangé. Dimanche : 20 minutes en continu.",
    nat: { corps: "3 × 198 m, repos 1 min + 6 × 33 m", lg: 24 },
    nat2: "B", c1: "2 × (12' / 2')", c2: "20 min en continu",
    muscuNote: "Semaine où les charges doivent monter", maint: true },
  { num: 13, theme: "Assimilation", du: "8 févr.",
    focus: "Volume stable, rien de nouveau : on arrive frais à la semaine des tests.",
    nat: { corps: "2 × 264 m (8 longueurs d'affilée), repos 1 min + 4 × 33 m", lg: 20 },
    nat2: "B", c1: "20 min en continu", c2: "25 min en continu",
    muscuNote: "Séances normales, pas de série ajoutée cette semaine" },
  { num: 14, theme: "Tests et bilan", du: "15 févr.",
    focus: "Lundi test nage (200 m), mardi test vélo (20 min), vendredi test course (cap 30 min), dimanche pesée + tour de taille + bilan. Relevé final de charges mercredi et jeudi. Résultats → page Tests, puis export du .json.",
    tests: true, muscuNote: "Relevé final de charges → page Tests", releve: true },
];

const COLLATION = "Avant : si ton dernier repas date de plus de 2 h, collation 60-90 min avant (banane + 2 galettes de riz, ou 3-4 dattes + compote)";

/* ---------- Générateurs ---------- */
function _court(txt) {
  return `⚡ Pas d'énergie ? Mange ta collation, attends 20 min, fais l'échauffement et la 1re série. Toujours rien ? Version courte : ${txt}. Une version courte compte comme faite (statut ≈).`;
}

function _muscu(sem, cle) {
  const m = MUSCU[cle];
  const id = `w${sem.num}-${["lun", "mar", "mer", "jeu", "ven", "sam", "dim"][m.jour]}`;
  const avant = [];
  if (sem.notes && sem.notes[m.jour]) avant.push("📌 " + sem.notes[m.jour]);
  if (sem.muscuNote) avant.push(sem.muscuNote);
  avant.push(COLLATION);
  const apres = [];
  if (cle !== "lower") apres.push(sem.num <= 6
    ? "Puis 15 min de vélo Z2 souple (120-135 bpm) sur un vélo de la salle — la première chose à sauter si tu es pressé"
    : "Puis 25-30 min de vélo Z2 (120-140 bpm) sur un vélo de la salle — c'est ton vélo de la semaine, ne le saute pas");
  if (cle === "lower") apres.push("Jamais la veille ni le lendemain d'une course : c'est pour ça qu'il est le mercredi");
  apres.push(_court(m.court));
  return { id, jour: m.jour, type: "muscu", titre: `${JOURS_COURTS[m.jour]} · ${m.nom}`,
    duree: cle === "lower" ? m.duree : (sem.num <= 6 ? "~60 min + 15 min de vélo" : "~60 min + 25-30 min de vélo"),
    objectif: m.objectif, contenu: avant.concat(m.contenu, apres), pourquoi: m.pourquoi, hint: m.hint };
}

function _course(sem, jour, format, n) {
  const continu = /continu/.test(format);
  const id = `w${sem.num}-${jour === 4 ? "ven" : "dim"}`;
  const contenu = [];
  if (sem.notes && sem.notes[jour]) contenu.push("📌 " + sem.notes[jour]);
  contenu.push(
    "5 min de marche rapide pour échauffer",
    `${format} — allure où tu peux parler`,
    "5 min de marche pour finir",
    "Clifton + semelles, petits pas rapides (~170/min), atterris sous ton corps",
    "Côtes basses, bassin sous les côtes : si le bas du dos tire, raccourcis les segments",
    "Douleur pied > 3/10 pendant → stop, tu rentres en marchant, statut ≈ avec la raison",
    "Douleur au réveil > 2/10 le lendemain → tu répètes ce format la semaine prochaine au lieu de monter",
  );
  if (jour === 4) contenu.push("Le soir : mollets Rathleff à la maison, 3 × 12 par jambe sur une marche, serviette roulée sous les orteils (si pied ≤ 3/10)");
  if (jour === 6) contenu.push("Pied qui dit non ce matin ? Remplace par 45 min de vélo Z2 à la salle (statut ≈)");
  contenu.push(_court(continu ? "10 min en continu puis marche" : "la moitié des répétitions"));
  return { id, jour, type: "course", titre: `${JOURS_COURTS[jour]} · Marche/course n°${n} — ${format}`,
    duree: "~30-45 min",
    objectif: continu
      ? `${format} à allure conversation, puis 5 min de marche. Pied ≤ 3/10 ou on s'arrête.`
      : `${format}, allure conversation. Pied ≤ 3/10 ou on s'arrête AU MILIEU de la séance, pas après.`,
    contenu,
    pourquoi: "Tu n'as pas couru depuis août, et ta dernière course s'était finie à 8/10 de douleur. Le pied va mieux (il ne fait mal que pieds nus sur sol froid) : c'est le moment de reprendre, mais par le bas. Les deux courses sont à 48 h l'une de l'autre et à deux jours du Lower : c'est le délai de réparation des tissus du pied. Un seul curseur monte à la fois (durée des segments OU récupération OU nombre de répétitions). Objectif de l'été : les 10 km du triathlon M.",
    hint: "Ex : format tenu ?, douleur pied 0-10 pendant / après, FC, essoufflement...",
  };
}

function _velo(sem, format) {
  const tempo = /tempo/.test(format);
  return { id: `w${sem.num}-mar`, jour: 1, type: "velo", titre: `Mar · Vélo — ${format}`,
    duree: format.split(" ")[0] + " min",
    objectif: tempo
      ? "Z2 (120-140 bpm) avec 3 × 5 min de tempo à 150-160 bpm, 5 min de Z2 souple entre chaque."
      : "Zone 2 stricte : 120-140 bpm, cadence 85-90, tu peux parler.",
    contenu: (tempo
      ? ["10 min d'échauffement", "3 × (5 min tempo 150-160 bpm / 5 min Z2 souple)", "Complète en Z2 jusqu'à la durée, 5 min calme"]
      : ["5 min d'échauffement, puis Z2 jusqu'à la durée, 5 min calme", "3 × 30 s de cadence 100+ répartis pour délier"])
      .concat([COLLATION, "Bidon d'eau, et une banane pendant si tu dépasses 60 min", "Une série, un podcast : le vélo Z2 doit être facile, presque ennuyeux", _court("30 min de Z2")]),
    pourquoi: tempo
      ? "La seule intensité structurée du bloc : le tempo élève ton plafond pendant que la Z2 élargit la base. En août, tes vélos à « difficulté 5-6 » fatiguaient sans construire : ici, c'est dosé."
      : "Le moteur d'un triathlète se construit ici, à faible coût pour le pied. Un triathlon se fait loin sous le seuil : rouler trop fort trop souvent est l'erreur n°1. Placé la veille du Lower, en Z2 il ne gêne pas.",
    hint: "Ex : distance, FC moyenne, watts, sensations jambes...",
  };
}

function _nat(sem) {
  const n = sem.nat, tot = n.lg + 6;
  const contenu = [];
  if (sem.notes && sem.notes[0]) contenu.push("📌 " + sem.notes[0]);
  contenu.push(
    "Échauffement : 2 × 33 m souple (crawl ou brasse)",
    "2 × 33 m battements de jambes avec planche",
    `Corps de séance : ${n.corps}`,
    "Pour finir : 2 × 33 m dos",
    "Besoin de t'arrêter au milieu ? 15 s au bord et tu repars — ça compte",
    "Expire À FOND sous l'eau, en continu dès que le visage est dans l'eau",
    "Allonge le bras devant à chaque mouvement : moins de mouvements par longueur = meilleure nage",
    "Respire tous les 3 temps ; trop dur ? 2 temps du côté confortable",
    "Le soir : mollets Rathleff à la maison, 3 × 12 par jambe sur une marche, serviette roulée sous les orteils",
    _court("la moitié du corps de séance"),
  );
  return { id: `w${sem.num}-lun`, jour: 0, type: "natation",
    titre: `Lun · Natation — ${tot} longueurs (≈ ${Math.round(tot * 33 / 10) * 10} m)`,
    duree: "~30-45 min",
    objectif: "Technique d'abord, zéro pression sur le chrono. Neptunium, bassin de 33 m.",
    contenu,
    pourquoi: "La natation est ta discipline la plus en retard (1,5 km au triathlon M de l'été, 3,8 km à l'Ironman). La première séance de la semaine, le lundi, quand tu es le plus frais. On allonge les blocs nagés d'affilée petit à petit : 1 longueur, puis 2, 3, 4, 6, 8. Si un bloc est trop dur, coupe-le en deux, sans culpabiliser.",
    hint: "Ex : longueurs faites, arrêts, essoufflement, ce qui a marché...",
  };
}

function _nat2(sem) {
  const A = sem.nat2 === "A";
  const corps = A
    ? ["6 × 33 m éducatifs, repos 30 s : 2 « rattrapé » (une main attend l'autre devant), 2 poings fermés, 2 respiration tous les 3 temps",
       "6 × 33 m crawl relâché : compte tes mouvements de bras par longueur et essaie d'en faire 1 de moins"]
    : ["4 × 33 m éducatifs (rattrapé, poings fermés), repos 30 s",
       "3 × 99 m crawl régulier, repos 45 s : la 3e aussi facile que la 1re"];
  const tot = A ? 18 : 19;
  return { id: `w${sem.num}-mar`, jour: 1, type: "natation",
    titre: `Mar · Natation 2 — technique (${tot} longueurs)`,
    duree: "~30-40 min",
    objectif: "Séance technique : nager mieux, pas plus. Lendemain de la natation du lundi.",
    contenu: ["Échauffement : 2 × 33 m souple, 2 × 33 m jambes avec planche"].concat(corps,
      ["Pour finir : 2 × 33 m dos", COLLATION, _court("l'échauffement + les éducatifs")]),
    pourquoi: "En natation, la technique compte plus que la forme physique : deux séances par semaine font progresser beaucoup plus vite qu'une seule plus longue, parce que la sensation de l'eau s'installe. Le vélo de la semaine passe en sortie de tes deux Upper.",
    hint: "Ex : mouvements par longueur, éducatifs réussis...",
  };
}

function _test(id, jour, titre, duree, objectif, contenu, pourquoi, hint) {
  return { id, jour, type: "test", titre: `${JOURS_COURTS[jour]} · ${titre}`, duree, objectif, contenu, pourquoi, hint };
}

function _semaineTests(sem) {
  const w = `w${sem.num}`;
  return [
    _test(`${w}-lun`, 0, "TEST — 200 m nage chrono", "~30 min",
      "Échauffement complet, 3 min de repos, puis 6 longueurs enchaînées (198 m) chronométrées à l'Apple Watch.",
      ["6 × 33 m progressifs en échauffement", "3 min de repos complet", "6 × 33 m enchaînées sans pause, chrono", "Note le chrono et tes sensations → page Tests"],
      "Ta première référence nage. Pour situer : 4:30-5:00 serait très correct pour un début.",
      "Chrono, sensations..."),
    _test(`${w}-mar`, 1, "TEST — 20 min vélo max", "~40 min",
      "20 min à l'effort maximal SOUTENABLE et régulier : la plus grande distance possible.",
      ["10 min d'échauffement progressif avec 2 × 30 s appuyés", "3 min tranquille",
       "TEST : 20 min à fond régulier — les 5 premières minutes doivent sembler « trop faciles »",
       "Note distance, vitesse moyenne, FC moyenne, watts si affichés → page Tests", "10 min retour au calme"],
      "Le test de 20 min estime ton seuil (≈ 95 % de la moyenne) et calibre tes zones vélo du prochain bloc. Référence de juin : 14 km en 32 min (~26 km/h).",
      "Distance, vitesse moy., FC, watts, gestion..."),
    _muscu(sem, "lower"),
    _muscu(sem, "upperA"),
    _test(`${w}-ven`, 4, "TEST — Course continue (cap 30 min)", "~45 min",
      "Courir en continu à allure conversation, aussi longtemps que possible, STOP à 30 min.",
      ["10 min d'échauffement : marche rapide + 3 × 1 min de course facile",
       "TEST : cours en continu, allure conversation, jusqu'à 30 min MAXIMUM",
       "Tu t'arrêtes avant si : douleur pied > 3/10, ou tu n'arrives plus à parler",
       "5 min de marche pour finir",
       "Note : durée tenue, distance, FC moyenne, douleur pied → page Tests"],
      "L'objectif n'est PAS la vitesse : c'est la durée tenue à allure aisée. En juin tu étais mort après 300 m ; en août tu tenais 1 minute. On mesure le chemin.",
      "Durée tenue, distance, FC, douleur, gestion..."),
    _muscu(sem, "upperB"),
    _test(`${w}-dim`, 6, "BILAN du bloc + pesée + export", "~20 min",
      "Repos complet. Pesée à jeun, tour de taille, photo, bilan écrit, export du fichier.",
      ["Pèse-toi à jeun + tour de taille au nombril → page Tests",
       "Photo dans la même lumière que celle du 16 novembre",
       "Remplis le bilan libre : ce qui a marché, ce qui a coincé, le pied, l'énergie, la natation",
       "Menu ⋯ → « Sauvegarde .json » → envoie-moi le fichier",
       "Repos. Mérité."],
      "Avec ce fichier on construit la suite : la préparation du triathlon M de l'été, les zones vélo sur ton test, et la décision sèche / remontée des calories.",
      "Ton bilan libre du bloc..."),
  ];
}

function _semaine(sem) {
  if (sem.tests) return { num: sem.num, theme: sem.theme + " · " + sem.du, focus: sem.focus, seances: _semaineTests(sem) };
  const seances = [
    _nat(sem),
    sem.nat2 ? _nat2(sem) : _velo(sem, sem.velo),
    _muscu(sem, "lower"),
    _muscu(sem, "upperA"),
    _course(sem, 4, sem.c1, 1),
    _muscu(sem, "upperB"),
    _course(sem, 6, sem.c2, 2),
  ];
  return { num: sem.num, theme: sem.theme + " · " + sem.du, focus: sem.focus, seances };
}

const BLOC = {
  nom: "Bloc 4 — Reprise claire",
  debut: "2026-11-16",
  objectifBloc:
    "Quatorze semaines, une séance par jour, chaque jour la même place : Lun natation · Mar vélo (natation 2 dès le 28 déc.) · " +
    "Mer Lower · Jeu Upper A · Ven course · Sam Upper B · Dim course. Chaque séance a sa version courte pour les jours sans énergie : " +
    "une version courte vaut mieux que rien. Nutrition sans compter (méthode de l'assiette + collation avant la séance), pilotée par " +
    "la moyenne du poids sur 7 jours (cible : −0,25 à −0,5 kg/semaine). Course repartie de zéro, pied ≤ 3/10. " +
    "Fin du bloc le 21 février : 20 à 30 min de course continue, 200 m de crawl d'affilée, charges gardées ou en hausse, tour de taille en baisse. " +
    "Cap suivant : triathlon M à l'été 2027. Règle absolue : sommeil ≥ 7 h 30.",
  semaines: PLAN.map(_semaine),
};

/* ---------- Règles d'agencement de la semaine ---------- */
const AGENCEMENT = [
  "<strong>Une séance par jour, toujours au même jour</strong> : Lun natation · Mar vélo (natation 2 à partir du 28 déc.) · Mer Lower · Jeu Upper A · Ven course · Sam Upper B · Dim course. Le site met la séance du jour en avant : tu n'as qu'à l'ouvrir.",
  "<strong>Pas d'énergie ?</strong> Collation, 20 min, échauffement et 1re série. Toujours rien : version courte (écrite dans chaque séance). Elle compte comme faite (≈). La seule séance ratée, c'est celle où tu ne vas pas.",
  "<strong>Un jour raté ne se rattrape pas</strong> : le lendemain, tu fais la séance du lendemain. Jamais deux séances le même jour pour compenser.",
  "<strong>Pied > 3/10 pendant une course</strong> : stop au milieu, tu rentres en marchant, statut ≈ + raison. Douleur au réveil en hausse 2 jours de suite : la course suivante devient 45 min de vélo Z2.",
  "<strong>Muscu puis vélo, jamais l'inverse.</strong> Une seule intensité dans le bloc : le tempo vélo de la semaine 5.",
  "<strong>Semaines d'examen</strong> (10 déc., 4 janv., 22 janv.) : la veille en version courte et couché tôt, le jour même après l'examen si tu es frais, sinon repos (✗ « examen »).",
  "<strong>Nutrition</strong> : sans compter. Protéines à chaque repas, collation avant la séance, détail dans « Manger sans compter ». Pesée chaque matin : c'est la moyenne sur 7 jours qui décide, toutes les 2 semaines.",
  "<strong>Chaque jour</strong> : rééduc pied 5 min (le 1er étirement avant de poser le pied le matin) + routine posture 5 min. Rathleff à la maison le lundi et le vendredi soir.",
  "<strong>Chaque matin (20 s)</strong> : poids, énergie 1-5, faim 1-5, douleur pied au réveil. Tour de taille le lundi. Photo toutes les 4 semaines, même lumière.",
];

/* ---------- MANGER SANS COMPTER ----------
   Samy ne veut plus compter les calories, et se sent parfois sans énergie
   avant la séance. Méthode de l'assiette (portions à la main) + collation
   avant la séance + la balance qui tranche toutes les 2 semaines. */
const NUTRITION = {
  titre: "Manger sans compter", icone: "🍽",
  intro: "Pas d'appli, pas de calories. Trois repas construits pareil, une collation avant la séance, et la balance qui dit toutes les deux semaines s'il faut un peu plus ou un peu moins.",
  assiette: [
    "<b>Protéines : 1 paume entière</b> (épaisseur de la main) à CHAQUE repas — 150-200 g de poulet, dinde, bœuf 5 %, poisson, thon, ou 3-4 œufs. C'est ce qui garde le muscle et coupe la faim.",
    "<b>Féculents : 1 poing</b> — riz, pommes de terre, patate douce, pâtes sans gluten, quinoa, galettes de riz. 2 poings au repas qui précède le Lower, une course ou le vélo.",
    "<b>Légumes : la moitié de l'assiette</b> — tout ce que tu aimes, à volonté.",
    "<b>Gras : 1 pouce</b> — huile d'olive, ½ avocat, une petite poignée d'amandes.",
  ],
  collation: [
    "<b>60-90 min avant chaque séance</b>, si ton dernier repas date de plus de 2 h : banane + 2 galettes de riz, ou 3-4 dattes + une compote. C'est ça qui règle le « je sens que je vais faire une mauvaise séance ».",
    "<b>Après la séance</b> : ton repas suivant, avec sa paume de protéines. Pas besoin de shaker si le repas arrive dans les 2 h ; sinon whey isolate (sans lactose, vérifie le casher).",
  ],
  pilotage: [
    "<b>Pesée chaque matin</b>, à jeun, après les toilettes. Le site calcule la moyenne sur 7 jours : un chiffre isolé ne veut rien dire.",
    "<b>Toutes les 2 semaines (lundi des semaines 3, 5, 7, 9, 11, 13)</b>, regarde la pastille « Poids moy. 7 j » :",
    "Perte entre 0,25 et 0,5 kg/sem → tu ne changes rien.",
    "Perte plus faible (ou poids stable) → enlève ½ poing de féculents au dîner, pas plus.",
    "Perte plus rapide, OU énergie ≤ 2/5 plusieurs jours → ajoute 1 poing de féculents par jour.",
    "<b>Semaines 6 et 12</b> : +1 poing de féculents à chaque repas, entraînement inchangé.",
  ],
  exemple: [
    "Matin : 3 œufs + 2 galettes de riz + un fruit",
    "Midi : poulet (1 paume) + riz (1 poing) + légumes + huile d'olive",
    "Collation avant la séance : banane + 2 galettes de riz",
    "Soir : poisson ou bœuf 5 % (1 paume) + pommes de terre (1 poing) + légumes",
  ],
};

function htmlNutrition(compact) {
  const N = NUTRITION, ul = l => `<ul>${l.map(t => `<li>${t}</li>`).join("")}</ul>`;
  return `<div class="routine">
    <h4>${N.icone} ${N.titre}</h4>
    <p class="rp-quand">${N.intro}</p>
    <p><b>Chaque repas</b></p>${ul(N.assiette)}
    <p><b>Autour de la séance</b></p>${ul(N.collation)}
    <details class="rp-plus"><summary>La balance décide (toutes les 2 semaines)</summary>${ul(N.pilotage)}</details>
    <details class="rp-plus"><summary>Exemple de journée</summary>${ul(N.exemple)}</details>
  </div>`;
}

/* ---------- TESTS du bloc ---------- */
const TESTS = [
  {
    id: "test-depart", titre: "Mesures de départ", quand: "Lundi 16 novembre, à jeun",
    protocole: "Pesée à jeun au réveil, tour de taille au niveau du nombril (détendu, expiration naturelle), photo de face et de profil dans une lumière que tu pourras reproduire.",
    cible: "Référence du bloc. Le 11 septembre : 66 kg, 18,9 % (balance). C'est le poids moyen sur 7 jours et le tour de taille qui comptent, pas le % de la balance.",
    champs: [
      { cle: "poids", label: "Poids à jeun (kg)", type: "number" },
      { cle: "taille", label: "Tour de taille (cm)", type: "number" },
      { cle: "photo", label: "Photo faite ? (oui / non, où elle est rangée)", type: "text" },
      { cle: "notes", label: "Remarques", type: "textarea" },
    ],
  },
  {
    id: "test-nage", titre: "200 m nage chrono", quand: "Semaine 14, lundi 15 février",
    protocole: "Échauffement complet (6 × 33 m progressifs), 3 min de repos, puis 6 × 33 m enchaînées (198 m) chronométrées à l'Apple Watch.",
    cible: "Première référence nage. Nager les 6 longueurs sans t'arrêter = bloc réussi ; 4:30-5:00 = très bien.",
    champs: [
      { cle: "chrono", label: "Chrono (mm:ss)", type: "text" },
      { cle: "ressenti", label: "Sensations", type: "textarea" },
    ],
  },
  {
    id: "test-velo", titre: "20 min vélo — effort max", quand: "Semaine 14, mardi 16 février",
    protocole: "10 min d'échauffement, puis 20 min à l'effort maximal soutenable et RÉGULIER. Noter tout ce que la machine et la montre affichent.",
    cible: "Référence de juin : 14 km en 32 min (~26 km/h). Ce test calibre les zones vélo du prochain bloc (seuil ≈ 95 % de la moyenne des 20 min).",
    champs: [
      { cle: "distance", label: "Distance (km)", type: "number" },
      { cle: "vitesse", label: "Vitesse moy. (km/h)", type: "number" },
      { cle: "fc", label: "FC moyenne (bpm)", type: "number" },
      { cle: "watts", label: "Watts moy. (si affichés)", type: "number" },
      { cle: "ressenti", label: "Gestion de l'effort / sensations", type: "textarea" },
    ],
  },
  {
    id: "test-course", titre: "Course continue — cap 30 min", quand: "Semaine 14, vendredi 19 février",
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
    id: "test-muscu", titre: "Relevés de charges (Hevy)", quand: "Semaines 5, 9 et 14",
    protocole: "Pas de test séparé : reporte ici tes 2-3 meilleures séries Upper et Lower de la semaine (exercice × charge × reps × reps en réserve). Une ligne par relevé, datée.",
    cible: "En sèche, garder ses charges = gagner. Élévations latérales, tirage et rowing qui montent = le bloc fonctionne.",
    champs: [
      { cle: "upper", label: "Meilleures séries Upper (date · exo × kg × reps)", type: "textarea" },
      { cle: "lower", label: "Meilleures séries Lower (date · exo × kg × reps)", type: "textarea" },
    ],
  },
  {
    id: "test-corps", titre: "Poids, tour de taille & photo de fin", quand: "Dimanche 21 février, à jeun",
    protocole: "Pesée à jeun au réveil + tour de taille au nombril, détendu. Photo dans la même lumière que le 16 novembre.",
    cible: "Cible : −3 à −5 kg sur la moyenne 7 jours, tour de taille −4 à −6 cm, charges gardées. Le critère final reste le miroir.",
    champs: [
      { cle: "poids", label: "Poids à jeun (kg)", type: "number" },
      { cle: "taille", label: "Tour de taille (cm)", type: "number" },
      { cle: "notes", label: "Miroir, énergie, faim, remarques", type: "textarea" },
    ],
  },
  {
    id: "test-bilan", titre: "Bilan libre du bloc", quand: "Dimanche 21 février",
    protocole: "Écris librement : ce qui a marché, ce qui a coincé, le pied, l'énergie, le sommeil, la natation, la motivation.",
    cible: "Ce texte + ton export .json = tout ce dont j'ai besoin pour construire la préparation du triathlon M.",
    champs: [
      { cle: "bilan", label: "Ton bilan du bloc", type: "textarea" },
      { cle: "pied", label: "État du pied : douleur moyenne du bloc (0-10) et tendance", type: "text" },
    ],
  },
];

/* ---------- JOURNAL : champs quotidiens ---------- */
const JOURNAL_CHAMPS = [
  { cle: "poids", label: "Poids à jeun (kg)", type: "number", largeur: "petit" },
  { cle: "energie", label: "Énergie (1-5)", type: "number", largeur: "petit" },
  { cle: "faim", label: "Faim (1-5)", type: "number", largeur: "petit" },
  { cle: "pied_douleur", label: "Douleur pied au réveil (0-10)", type: "number", largeur: "petit" },
  { cle: "pied", label: "Rééduc pied faite (5 min)", type: "checkbox" },
  { cle: "posture", label: "Routine posture faite (5 min)", type: "checkbox" },
  { cle: "taille", label: "Tour de taille (cm, le lundi)", type: "number", largeur: "petit" },
  { cle: "sommeil", label: "Sommeil (h)", type: "number", largeur: "petit" },
  { cle: "ressenti", label: "Ressenti / repas / notes libres", type: "textarea" },
];

/* ---------- ROUTINE POSTURE — 5 min, tous les jours ----------
   Bascule antérieure du bassin. Ce qu'il faut savoir avant de la lire :
   85 % des hommes de ton âge ont une bascule antérieure et n'ont mal nulle
   part (Herrington 2011, 120 sujets asymptomatiques) — c'est la normale, pas
   un défaut. Et la seule revue systématique du sujet (Brekke 2020, EFORT
   Open Reviews : 2013 études filtrées, 4 retenues) ne trouve AUCUNE preuve
   qu'un programme d'exercices réduise l'angle : le meilleur essai obtient
   moins de 2°, invisible à l'œil.

   Donc cette routine ne « corrige » pas ton bassin. Elle vise les deux
   choses qui bougent vraiment : le mal de bas du dos quand tu cours (tu l'as
   noté le 13 août) et la force de la ceinture abdominale à empêcher la
   cambrure. Le reste du « look » viendra de la sèche : à 13 % de gras, le
   ventre ne pousse plus en avant et l'arrondi du bas-ventre disparaît. */
const ROUTINE_POSTURE = {
  titre: "Posture", icone: "🧍", duree: "5 min",
  quand: "Tous les jours, le matin ou le soir, collée à ta rééduc pied (5 min de plus, une seule habitude). Jamais dans les 2 h avant le Lower : un étirement long réduit un peu la force sur le moment.",
  exercices: [
    {
      nom: "Dead bug",
      dose: "3 × 8 par côté",
      etapes: [
        "Sur le dos, genoux à 90°, bras tendus vers le plafond",
        "Colle le bas du dos au sol et GARDE-le collé : c'est tout l'exercice",
        "Tends une jambe lentement en expirant, reviens, change de côté",
        "Le dos décolle ? Tu descends moins bas. Une main sous les lombaires pour vérifier les premiers jours",
      ],
      pourquoi: "C'est l'exercice central : apprendre à tenir le bassin pendant que les jambes bougent. C'est exactement ce qui se passe quand tu cours, et c'est ce qui manquait le 13 août.",
    },
    {
      nom: "Fente genou à terre, bassin enroulé",
      dose: "2 × 30 s par côté",
      etapes: [
        "Genou arrière au sol, pied avant à plat devant toi",
        "Serre le fessier arrière ET enroule le bassin vers toi (pubis vers les côtes)",
        "Avance très légèrement le bassin, sans cambrer",
        "Tu dois sentir le DEVANT de la hanche arrière. Si ça tire dans le bas du dos, tu cambres au lieu d'étirer",
      ],
      pourquoi: "L'étirement passif classique ne change presque rien (1,2° dans l'étude de référence, sans lien avec le gain de souplesse). Fait avec le fessier serré et le bassin enroulé, il devient un exercice de contrôle : tu apprends la position, tu ne l'étires pas.",
    },
    {
      nom: "Pont fessier, côtes basses",
      dose: "2 × 12, 2 s de maintien en haut",
      etapes: [
        "Sur le dos, pieds à plat, monte le bassin en ENROULANT (le pubis part vers les côtes en premier)",
        "Serre fort les fessiers en haut, côtes basses",
        "Ne monte pas plus haut en cambrant : la hauteur ne compte pas, la position du bassin oui",
        "Redescends lentement, vertèbre par vertèbre",
      ],
      pourquoi: "Les fessiers travaillent en fin d'amplitude, là où ils sont les plus faibles chez quelqu'un d'assis toute la journée. Version chargée le mercredi au Lower : le hip thrust.",
    },
  ],
  autotest: {
    titre: "Avant tout : lequel des trois est le tien ?",
    intro: "L'arrondi du bas-ventre a trois causes possibles, et elles ne se soignent pas pareil. Deux minutes devant un miroir suffisent à savoir laquelle domine chez toi.",
    tests: [
      "<strong>Test 1 — la position (30 s).</strong> De profil devant un miroir, debout relâché : regarde ton bas-ventre. Puis ramène les côtes au-dessus du bassin, enroule le bassin, serre légèrement les fessiers et expire à fond. Regarde à nouveau. <em>L'arrondi s'aplatit nettement</em> → la position pèse lourd, et la routine + les exercices en salle vont se voir. <em>Il ne bouge presque pas</em> → c'est du gras ou du ballonnement, la routine ne changera pas la photo.",
      "<strong>Test 2 — le ballonnement (1 jour).</strong> Photo de profil le matin à jeun, puis la même photo le soir, même lumière, même position. Une grosse différence entre les deux = distension digestive, pas du gras (le gras ne bouge pas en 12 h). Tu es intolérant au gluten ET au lactose : un écart caché (sauce, whey non isolate, trace de blé) distend le bas-ventre pour la journée. Note dans le journal ce que tu as mangé les jours où c'est pire.",
      "<strong>Test 3 — le gras.</strong> C'est la sèche qui répond, en semaines. Chez l'homme, le bas-ventre est le dépôt qui part en DERNIER : il compte plus de récepteurs alpha-2, qui freinent la libération des graisses, que de récepteurs bêta, qui l'activent. D'où les abdos qui apparaissent du haut vers le bas. Ordre de grandeur : le haut des abdos se dessine vers 14-15 %, le bas-ventre vers 11-13 %. Tu pars de 18,9 %.",
    ],
    conclusion: "À 18,9 %, le gras est presque toujours le premier contributeur, la position le deuxième, le ballonnement le troisième mais parfois spectaculaire. Et le lien marche dans les deux sens : un ventre qui pousse en avant tire lui aussi le bassin en bascule antérieure. Ce n'est donc pas « le bassin qui cause le ventre », c'est un ensemble où ta sèche agit sur les trois.",
  },
  ailleurs: [
    "<strong>En salle (déjà dans tes séances)</strong> : roulette abdominale le jeudi, hip thrust le mercredi, relevés de genoux bassin enroulé le samedi. Ces trois-là pèsent plus lourd que la routine du matin.",
    "<strong>En courant</strong> : côtes basses, bassin sous les côtes, petits pas rapides. Si le bas du dos tire, tu raccourcis les segments — c'est le même signal d'alarme que le pied.",
    "<strong>Devant le miroir ou en photo</strong> : ramène les côtes au-dessus du bassin au lieu de sortir la poitrine. La moitié de ce que tu vois est une position debout, pas une structure.",
    "<strong>Si le bas du dos continue de tirer en courant</strong> après 6 semaines de routine : c'est une visite chez le kiné, pas plus d'exercices trouvés en ligne.",
  ],
};

/* ---------- ROUTINE PIED — 5 min, tous les jours ----------
   Fasciite plantaire. Deux protocoles validés, chacun à son moment :
   - DiGiovanni 2003/2006 (JBJS) : étirement SPÉCIFIQUE du fascia, supérieur
     à l'étirement du mollet seul sur la douleur chronique du talon. 10 s ×
     10, 3 fois par jour, le premier AVANT de poser le pied le matin.
   - Rathleff 2015 (Scand J Med Sci Sports) : élévations mollet unilatérales,
     serviette roulée sous les orteils, un jour sur deux — meilleurs
     résultats à 3 mois que l'étirement seul. C'est la partie « salle »,
     elle est dans tes séances de muscu, pas ici. */
const ROUTINE_PIED = {
  titre: "Pied", icone: "🦶", duree: "5 min",
  quand: "Le premier étirement AVANT de poser le pied par terre le matin, encore dans le lit — c'est le moment qui compte le plus, et c'est lui qui fait baisser la raideur au réveil que tu notes chaque jour. Puis deux autres fois dans la journée, et le bloc massage + mollets une fois, quand tu veux.",
  exercices: [
    {
      nom: "Étirement du fascia plantaire",
      dose: "10 × 10 s, 3 fois par jour",
      etapes: [
        "Assis, croise la jambe douloureuse sur l'autre genou",
        "Avec la main du même côté, attrape la base des orteils SOUS le pied",
        "Tire les orteils vers le tibia jusqu'à sentir l'étirement sous la voûte",
        "Avec l'autre main, palpe la voûte : tu dois sentir le fascia tendu comme une corde — sinon tu tires trop peu",
        "Tiens 10 s, relâche, recommence 10 fois",
        "1re série AVANT le premier pas du matin, dans le lit. Les deux autres dans la journée, idéalement après être resté assis longtemps",
      ],
      pourquoi: "C'est l'exercice le mieux validé de ta rééduc : dans l'essai de DiGiovanni, l'étirement spécifique du fascia bat l'étirement du tendon d'Achille sur la douleur chronique du talon, et l'avantage tenait encore à deux ans. Le timing n'est pas un détail : la nuit, le fascia se raccourcit, et les premiers pas le réétirent brutalement — d'où la douleur au réveil. Tu l'étires doucement AVANT de te lever, tu supprimes ce micro-traumatisme quotidien.",
    },
    {
      nom: "Balle sous la voûte",
      dose: "1 à 2 min par pied",
      etapes: [
        "Assis, roule une balle (tennis, balle de massage, ou petite bouteille sortie du congélateur) sous la voûte",
        "Pression modérée, du talon vers les orteils, lentement",
        "Insiste là où c'est sensible, sans jamais dépasser 4/10 de douleur",
        "La bouteille congelée est intéressante le soir après une séance de course",
      ],
      pourquoi: "Effet antalgique, pas curatif : ça rend le pied plus souple pour l'étirement qui suit et ça calme après les impacts. C'est un complément, pas le traitement.",
    },
    {
      nom: "Mollets : gastrocnémien puis soléaire",
      dose: "2 × 30 s chacun, par jambe",
      etapes: [
        "Face au mur, mains en appui, jambe à étirer tendue en arrière, talon au sol → gastrocnémien",
        "Même position mais genou arrière FLÉCHI, talon toujours au sol → soléaire",
        "Étirement dans le mollet, pas dans le talon. Jamais en à-coups",
      ],
      pourquoi: "Un mollet raide augmente la tension sur le fascia à chaque pas, parce que le tendon d'Achille et le fascia sont en continuité mécanique. Les deux positions sont nécessaires : jambe tendue et genou fléchi n'étirent pas le même muscle.",
    },
    {
      nom: "Orteils : serviette et écartements",
      dose: "2 × 15 par pied",
      etapes: [
        "Assis, pied à plat sur une serviette : agrippe et fais glisser la serviette vers toi avec les orteils seulement",
        "Puis écarte les orteils au maximum sans bouger le pied, tiens 3 s, relâche — avec un élastique autour des orteils si tu en as un",
        "Le talon reste au sol, la cheville ne bouge pas",
      ],
      pourquoi: "Les petits muscles du pied soutiennent la voûte en même temps que le fascia. Plus ils sont forts, moins le fascia encaisse. C'est du long terme, pas un soulagement immédiat.",
    },
  ],
  ailleurs: [
    "<strong>En salle, le mercredi au Lower</strong> : élévations mollet unilatérales, serviette roulée sous les orteils, tempo lent (3 s de montée, 2 s de pause en haut, 3 s de descente). C'est le protocole Rathleff, la partie la plus efficace du traitement. Progression sur 8 semaines : 3 × 12, puis 4 × 10, puis 5 × 8 en ajoutant du poids dès que 12 répétitions lentes passent confortablement.",
    "<strong>Fréquence</strong> : le protocole original se fait UN JOUR SUR DEUX. Dans ce bloc : mercredi au Lower, plus lundi soir et vendredi soir à la maison (3 × 12 par jambe sur une marche d'escalier, serviette roulée sous les orteils, même tempo lent). C'est écrit dans les séances du lundi et du vendredi.",
    "<strong>Les semelles orthopédiques</strong> dans les Clifton à chaque sortie, et jamais de course en chaussures lifestyle, même 500 m.",
    "<strong>Le signal d'alarme</strong> : si la douleur au réveil monte deux jours de suite, tu sautes la course suivante et tu la remplaces par du vélo. C'est le chiffre que tu notes chaque matin qui décide, pas la sensation du moment.",
  ],
};

/* Rendu HTML de la routine — utilisé par le guide (site complet) ET par
   l'aide du site simple, pour que le contenu n'existe qu'à un seul endroit. */
function htmlRoutine(R, compact) {
  const a = R.autotest;
  const autotest = (compact || !a) ? "" :
    `<div class="card"><h3 style="margin-top:0">${a.titre}</h3><p>${a.intro}</p>
       <ul>${a.tests.map(t => `<li>${t}</li>`).join("")}</ul>
       <p><strong>${a.conclusion}</strong></p></div>`;
  const ex = R.exercices.map((e, i) => compact
    ? `<li><b>${e.nom}</b> <span class="rp-dose">${e.dose}</span>
         <ul class="rp-pas">${e.etapes.map(t => `<li>${t}</li>`).join("")}</ul></li>`
    : `<div class="card"><h3 style="margin-top:0">${i + 1}. ${e.nom} <span class="badge muscu">${e.dose}</span></h3>
         <ul>${e.etapes.map(t => `<li>${t}</li>`).join("")}</ul>
         <details><summary>Pourquoi cet exercice ?</summary><p>${e.pourquoi}</p></details></div>`).join("");
  if (compact) return `<div class="routine">
    <h4>${R.icone} ${R.titre} — ${R.duree} par jour</h4>
    <p class="rp-quand"><b>Quand :</b> ${R.quand}</p>
    <ol class="rp">${ex}</ol>
    ${R.ailleurs ? `<details class="rp-plus"><summary>Et en dehors de la routine</summary><ul>${R.ailleurs.map(t => `<li>${t}</li>`).join("")}</ul></details>` : ""}
    ${a ? `<details class="rp-plus"><summary>${a.titre}</summary><p>${a.intro}</p><ul>${a.tests.map(t => `<li>${t}</li>`).join("")}</ul><p><b>${a.conclusion}</b></p></details>` : ""}
  </div>`;
  return `${autotest}<div class="box imp"><strong>Quand ?</strong> ${R.quand}</div>${ex}
    <div class="card"><ul>${R.ailleurs.map(t => `<li>${t}</li>`).join("")}</ul></div>`;
}

/* Alias historique (guide.html) */
function htmlRoutinePosture(compact) { return htmlRoutine(ROUTINE_POSTURE, compact); }
