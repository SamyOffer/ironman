/* ============================================================
   IRONMAN COACH — programme-data.js
   TOUT le contenu du bloc d'entraînement est ici, en données.
   Le moteur qui choisit la séance du jour est dans file-seances.js.

   >>> BLOC 4 — Reprise claire, en FILE D'ATTENTE
       (démarré le lundi 16 novembre 2026 ; se termine quand la
       progression course est finie et que les tests sont faits)

   ARCHIVES : rien n'est jamais supprimé.
   - Les données des Blocs 1, 2 et 3 restent dans le cloud sous
     "ironman-samy-bloc1/2/3" ; elles sont dans chaque export et
     consultables sur le site simple (menu ⋯ → « Blocs passés »).
   - Le programme du Bloc 3 est conservé dans archives/programme-bloc3.js.

   POURQUOI UNE FILE D'ATTENTE (décidé avec Samy le 20 nov. 2026) :
   avec des séances collées à des dates, rater un jour cassait tout —
   la séance était perdue, la rattraper décalait la semaine, et après
   deux ou trois jours ratés le site proposait une séance préparée par
   des séances jamais faites. Désormais :
   - chaque sport a sa PROGRESSION en étapes, qui avance quand tu fais
     une séance, pas quand les jours passent ;
   - chaque jour, le site propose UNE séance : le sport le plus en retard
     sur les 7 derniers jours, en respectant les règles du pied ;
   - un sport peut être mis en pause (natation jusqu'à mi-décembre) ;
   - les tests arrivent à la fin de la progression course, pas à une date.

   Structure d'une séance (module unique, valable pour TOUS les sports) :
   { id, piste, etape, type, titre, duree, objectif, contenu, pourquoi, hint }
   ============================================================ */

"use strict";

/* ---------- Les 3 séances de muscu, en rotation A → Lower → B ---------- */
const MUSCU = {
  upperA: {
    nom: "Upper A — épaules & largeur",
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
    pourquoi: "Pour un « V », les deltoïdes latéraux et les dorsaux font la largeur, le haut des pecs et les bras remplissent. Un muscle prioritaire se travaille frais, en début de séance, et ce qui le fait grandir, c'est le nombre de séries dures par semaine, pas les kilos sur la barre (Pelland 2025). Le curl incliné est dur parce que c'est l'exercice où le biceps est le plus étiré : garde la charge, vise le haut de la fourchette avant d'augmenter.",
    hint: "Ex : charges, reps en réserve, séries ajoutées...",
  },
  lower: {
    nom: "Lower complet + mollets Rathleff",
    objectif: "Un seul Lower dans la rotation : le vélo et la course font le reste. Mollets Rathleff obligatoires.",
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
    pourquoi: "Avec la course et le vélo, les jambes reçoivent déjà beaucoup : un Lower dur dans la rotation suffit. Le site ne te le propose jamais le lendemain d'une course, et ne te propose pas de course le lendemain du Lower : mollets frais = foulée propre = pied protégé. Le protocole Rathleff reste le traitement le mieux validé de la fasciite.",
    hint: "Ex : charges, douleur pied pendant les mollets, fatigue 0-10...",
  },
  upperB: {
    nom: "Upper B — épaisseur & bras",
    objectif: "Deuxième passage épaules/dos de la rotation, bras et haut des pecs, puis vélo souple.",
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
    pourquoi: "Sur une rotation complète : deltoïdes latéraux 11 séries, dorsaux 7, rowing 3, haut des pecs 6, biceps 6, triceps 6, arrière d'épaule 2, abdos 9. C'est la répartition d'un physique, pas d'un programme de force. Progression : d'abord les reps dans la fourchette, puis la charge ; quand un muscle prioritaire stagne 3 semaines, +1 série dessus.",
    hint: "Ex : charges, reps en réserve, séries ajoutées...",
  },
};
const ROTATION_MUSCU = ["upperA", "lower", "upperB"];

/* ---------- Les progressions, étape par étape ----------
   Une étape avance quand la séance est marquée ✓ (faite en entier).
   ≈ (version courte, douleur, adaptée) = on refait la même étape.
   Pour la muscu, la rotation avance dans les deux cas. */
const COURSE_ETAPES = [
  "8 × (1' course / 2' marche)", "8 × (1' / 2')", "10 × (1' / 2')", "8 × (1'30 / 2')",
  "7 × (2' / 2')", "8 × (2' / 1'30)", "5 × (3' / 2')", "6 × (3' / 2')",
  "5 × (4' / 2')", "5 × (4' / 2')", "4 × (5' / 2')", "4 × (5' / 2')",
  "3 × (6' / 2')", "3 × (6' / 2')", "3 × (8' / 2')", "3 × (8' / 2')",
  "2 × (10' / 2')", "2 × (10' / 2')", "2 × (12' / 2')", "15 min en continu",
  "20 min en continu", "20 min en continu", "25 min en continu",
];

/* lg = longueurs de 33 m du corps de séance ; tech = séance technique */
const NAT_ETAPES = [
  { corps: "6 × 33 m crawl, repos 30-45 s au bord", lg: 6 },
  { corps: "8 × 33 m crawl, repos 30 s", lg: 8 },
  { corps: "10 × 33 m crawl, repos 30 s", lg: 10 },
  { corps: "6 × 66 m crawl (2 longueurs d'affilée), repos 40 s", lg: 12 },
  { corps: "8 × 66 m crawl, repos 40 s", lg: 16 },
  { tech: "A" },
  { corps: "4 × 99 m (3 longueurs d'affilée), repos 45 s + 4 × 33 m", lg: 16 },
  { tech: "A" },
  { corps: "5 × 99 m, repos 45 s + 4 × 33 m", lg: 19 },
  { tech: "B" },
  { corps: "4 × 132 m (4 longueurs d'affilée), repos 45 s + 4 × 33 m", lg: 20 },
  { tech: "B" },
  { corps: "3 × 198 m (6 longueurs d'affilée), repos 1 min + 4 × 33 m", lg: 22 },
  { corps: "3 × 198 m, repos 1 min + 6 × 33 m", lg: 24 },
];
const NAT_DEUX_PAR_SEMAINE = 5;   // à partir de l'étape 6, la natation vise 2 séances / 7 jours

/* Après la dernière étape, le vélo tourne sur les 3 dernières */
const VELO_ETAPES = [
  "45 min Z2", "60 min Z2", "60 min Z2", "60 min Z2 + 3 × 5 min tempo",
  "75 min Z2", "60 min Z2 + 3 × 5 min tempo", "75 min Z2", "90 min Z2",
];

const PISTES = {
  muscu:    { nom: "Muscu", icone: "🏋️", cible: 3 },
  course:   { nom: "Course", icone: "🏃", cible: 2, etapes: COURSE_ETAPES.length },
  natation: { nom: "Natation", icone: "🏊", cible: 1, etapes: NAT_ETAPES.length, pausable: true },
  velo:     { nom: "Vélo", icone: "🚴", cible: 1 },
};

/* Dates à connaître (le moteur les affiche dans le bandeau du jour) */
const EXAMENS = ["2026-12-10", "2027-01-04", "2027-01-22"];
const NATATION_REPRISE_POSSIBLE = "2026-12-15";   // à partir de là, le site rappelle qu'on peut réactiver la natation

const COLLATION = "Avant : si ton dernier repas date de plus de 2 h, collation 60-90 min avant (banane + 2 galettes de riz, ou 3-4 dattes + compote)";

function _court(txt) {
  return `⚡ Pas d'énergie ? Mange ta collation, attends 20 min, fais l'échauffement et la 1re série. Toujours rien ? Version courte : ${txt}. Marque-la ≈ : elle compte.`;
}

/* ---------- Fabriques de séances ----------
   n = numéro de la séance dans sa piste (1, 2, 3…), etape = index 0-based */
function seanceMuscu(n) {
  const cle = ROTATION_MUSCU[(n - 1) % 3], m = MUSCU[cle];
  const avant = [];
  if (n <= 3) avant.push("Première rotation : trouve pour chaque exercice la charge qui laisse 2 reps en réserve, note-la dans Hevy");
  if (n > 3 && n % 12 === 0) avant.push("📏 Relevé de charges : reporte tes 2-3 meilleures séries dans les Tests du bloc");
  avant.push(COLLATION);
  const apres = cle === "lower"
    ? ["Pas de course demain : le site s'en charge"]
    : ["Puis 20-30 min de vélo Z2 (120-140 bpm) sur un vélo de la salle"];
  apres.push(_court(m.court));
  return { id: `muscu-${n}`, piste: "muscu", etape: (n - 1) % 3, cle, type: "muscu",
    titre: `Muscu · ${m.nom}`, duree: cle === "lower" ? "~55-60 min" : "~60 min + 20-30 min de vélo",
    objectif: m.objectif, contenu: avant.concat(m.contenu, apres), pourquoi: m.pourquoi, hint: m.hint };
}

function seanceCourse(n, etape) {
  const format = COURSE_ETAPES[etape], continu = /continu/.test(format);
  return { id: `course-${n}`, piste: "course", etape, type: "course",
    titre: `Course · étape ${etape + 1}/${COURSE_ETAPES.length} — ${format}`,
    duree: "~30-45 min",
    objectif: continu
      ? `${format} à allure conversation, puis 5 min de marche. Pied ≤ 3/10 ou on s'arrête.`
      : `${format}, allure conversation. Pied ≤ 3/10 ou on s'arrête AU MILIEU de la séance, pas après.`,
    contenu: [
      "5 min de marche rapide pour échauffer",
      `${format} — allure où tu peux parler`,
      "5 min de marche pour finir",
      "Clifton + semelles, petits pas rapides (~170/min), atterris sous ton corps",
      "Côtes basses, bassin sous les côtes : si le bas du dos tire, raccourcis les segments",
      "Douleur pied > 3/10 pendant → stop, tu rentres en marchant, marque ≈ : la prochaine course refera cette étape",
      "Le soir : mollets Rathleff à la maison, 3 × 12 par jambe sur une marche, serviette roulée sous les orteils (si pied ≤ 3/10)",
      _court(continu ? "10 min en continu puis marche" : "la moitié des répétitions"),
    ],
    pourquoi: "Tu n'as pas couru depuis août, et ta dernière course s'était finie à 8/10 de douleur. On reprend par le bas et l'étape n'avance que si la précédente est passée en entier (✓). Si tu n'as pas couru depuis plus de 10 jours, le site te fait redescendre d'une étape. Le site laisse toujours 48 h entre deux courses et ne met jamais une course juste avant ou après le Lower. Objectif de l'été : les 10 km du triathlon M.",
    hint: "Ex : format tenu ?, douleur pied 0-10 pendant / après, FC, essoufflement...",
  };
}

function seanceVelo(n, etape) {
  const i = etape < VELO_ETAPES.length ? etape : VELO_ETAPES.length - 3 + ((etape - VELO_ETAPES.length) % 3);
  const format = VELO_ETAPES[i], tempo = /tempo/.test(format);
  return { id: `velo-${n}`, piste: "velo", etape, type: "velo",
    titre: `Vélo — ${format}`, duree: format.split(" ")[0] + " min",
    objectif: tempo
      ? "Z2 (120-140 bpm) avec 3 × 5 min de tempo à 150-160 bpm, 5 min de Z2 souple entre chaque."
      : "Zone 2 stricte : 120-140 bpm, cadence 85-90, tu peux parler.",
    contenu: (tempo
      ? ["10 min d'échauffement", "3 × (5 min tempo 150-160 bpm / 5 min Z2 souple)", "Complète en Z2 jusqu'à la durée, 5 min calme"]
      : ["5 min d'échauffement, puis Z2 jusqu'à la durée, 5 min calme", "3 × 30 s de cadence 100+ répartis pour délier"])
      .concat([COLLATION, "Bidon d'eau, et une banane pendant si tu dépasses 60 min", "Une série, un podcast : le vélo Z2 doit être facile, presque ennuyeux", _court("30 min de Z2")]),
    pourquoi: tempo
      ? "La seule intensité structurée du bloc : le tempo élève ton plafond pendant que la Z2 élargit la base. En août, tes vélos à « difficulté 5-6 » fatiguaient sans construire : ici, c'est dosé."
      : "Le moteur d'un triathlète se construit ici, à faible coût pour le pied. Un triathlon se fait loin sous le seuil : rouler trop fort trop souvent est l'erreur n°1. Tant que la natation est en pause, le vélo prend sa place dans la semaine.",
    hint: "Ex : distance, FC moyenne, watts, sensations jambes...",
  };
}

function seanceNatation(n, etape) {
  const e = NAT_ETAPES[etape];
  const base = { id: `natation-${n}`, piste: "natation", etape, type: "natation", duree: "~30-45 min",
    hint: "Ex : longueurs faites, arrêts, essoufflement, ce qui a marché..." };
  if (e.tech) {
    const A = e.tech === "A";
    return Object.assign(base, {
      titre: `Natation · étape ${etape + 1}/${NAT_ETAPES.length} — technique (${A ? 18 : 19} longueurs)`,
      objectif: "Séance technique : nager mieux, pas plus. Bassin de 33 m.",
      contenu: ["Échauffement : 2 × 33 m souple, 2 × 33 m jambes avec planche"].concat(A
        ? ["6 × 33 m éducatifs, repos 30 s : 2 « rattrapé » (une main attend l'autre devant), 2 poings fermés, 2 respiration tous les 3 temps",
           "6 × 33 m crawl relâché : compte tes mouvements de bras par longueur et essaie d'en faire 1 de moins"]
        : ["4 × 33 m éducatifs (rattrapé, poings fermés), repos 30 s", "3 × 99 m crawl régulier, repos 45 s : la 3e aussi facile que la 1re"],
        ["Pour finir : 2 × 33 m dos", COLLATION, _court("l'échauffement + les éducatifs")]),
      pourquoi: "En natation, la technique compte plus que la forme physique. À partir d'ici, le site vise deux natations par semaine : la sensation de l'eau s'installe beaucoup plus vite.",
    });
  }
  const tot = e.lg + 6;
  return Object.assign(base, {
    titre: `Natation · étape ${etape + 1}/${NAT_ETAPES.length} — ${tot} longueurs (≈ ${Math.round(tot * 33 / 10) * 10} m)`,
    objectif: "Technique d'abord, zéro pression sur le chrono. Bassin de 33 m.",
    contenu: [
      "Échauffement : 2 × 33 m souple (crawl ou brasse)",
      "2 × 33 m battements de jambes avec planche",
      `Corps de séance : ${e.corps}`,
      "Pour finir : 2 × 33 m dos",
      "Besoin de t'arrêter au milieu ? 15 s au bord et tu repars — ça compte",
      "Expire À FOND sous l'eau, en continu dès que le visage est dans l'eau",
      "Allonge le bras devant à chaque mouvement : moins de mouvements par longueur = meilleure nage",
      "Respire tous les 3 temps ; trop dur ? 2 temps du côté confortable",
      COLLATION,
      _court("la moitié du corps de séance"),
    ],
    pourquoi: "La natation est ta discipline la plus en retard (1,5 km au triathlon M, 3,8 km à l'Ironman). On allonge les blocs nagés d'affilée petit à petit : 1 longueur, puis 2, 3, 4, 6. Si un bloc est trop dur, coupe-le en deux, marque ≈ et la prochaine fois tu refais la même étape.",
  });
}

/* ---------- Les tests : débloqués à la fin de la progression course ---------- */
const SEANCES_TESTS = {
  "test-course": { piste: "course", type: "test", titre: "TEST — Course continue (cap 30 min)", duree: "~45 min",
    objectif: "Courir en continu à allure conversation, aussi longtemps que possible, STOP à 30 min.",
    contenu: ["10 min d'échauffement : marche rapide + 3 × 1 min de course facile",
      "TEST : cours en continu, allure conversation, jusqu'à 30 min MAXIMUM",
      "Tu t'arrêtes avant si : douleur pied > 3/10, ou tu n'arrives plus à parler",
      "5 min de marche pour finir", "Note : durée tenue, distance, FC moyenne, douleur pied → Tests du bloc"],
    pourquoi: "L'objectif n'est PAS la vitesse : c'est la durée tenue à allure aisée. En juin tu étais mort après 300 m ; en août tu tenais 1 minute. On mesure le chemin.",
    hint: "Durée tenue, distance, FC, douleur, gestion..." },
  "test-velo": { piste: "velo", type: "test", titre: "TEST — 20 min vélo max", duree: "~40 min",
    objectif: "20 min à l'effort maximal SOUTENABLE et régulier : la plus grande distance possible.",
    contenu: ["10 min d'échauffement progressif avec 2 × 30 s appuyés", "3 min tranquille",
      "TEST : 20 min à fond régulier — les 5 premières minutes doivent sembler « trop faciles »",
      "Note distance, vitesse moyenne, FC moyenne, watts si affichés → Tests du bloc", "10 min retour au calme"],
    pourquoi: "Le test de 20 min estime ton seuil (≈ 95 % de la moyenne) et calibre tes zones vélo du prochain bloc. Référence de juin : 14 km en 32 min (~26 km/h).",
    hint: "Distance, vitesse moy., FC, watts, gestion..." },
  "test-nage": { piste: "natation", type: "test", titre: "TEST — 200 m nage chrono", duree: "~30 min",
    objectif: "Échauffement complet, 3 min de repos, puis 6 longueurs enchaînées (198 m) chronométrées.",
    contenu: ["6 × 33 m progressifs en échauffement", "3 min de repos complet", "6 × 33 m enchaînées sans pause, chrono", "Note le chrono et tes sensations → Tests du bloc"],
    pourquoi: "Ta première référence nage. Nager les 6 longueurs sans t'arrêter = bloc réussi ; 4:30-5:00 = très bien.",
    hint: "Chrono, sensations..." },
  "test-bilan": { piste: "bilan", type: "test", titre: "BILAN du bloc + pesée + export", duree: "~20 min",
    objectif: "Pesée à jeun, tour de taille, photo, bilan écrit, export du fichier.",
    contenu: ["Pèse-toi à jeun + tour de taille au nombril → Tests du bloc",
      "Photo dans la même lumière que celle du départ",
      "Remplis le bilan libre : ce qui a marché, ce qui a coincé, le pied, l'énergie, la natation",
      "Menu ⋯ → « Sauvegarde .json » → envoie-moi le fichier"],
    pourquoi: "Avec ce fichier on construit la suite : la préparation du triathlon M de l'été, les zones vélo sur ton test, et la décision sèche / remontée des féculents.",
    hint: "Ton bilan libre du bloc..." },
};
function seanceTest(id) { return Object.assign({ id, etape: 0 }, SEANCES_TESTS[id], { contenu: [...SEANCES_TESTS[id].contenu] }); }

/* Fabrique unique : retrouve n'importe quelle séance depuis sa piste, son n° et son étape */
function fabriquerSeance(piste, n, etape) {
  if (piste === "muscu") return seanceMuscu(n);
  if (piste === "course") return seanceCourse(n, etape);
  if (piste === "velo") return seanceVelo(n, etape);
  if (piste === "natation") return seanceNatation(n, etape);
  return null;
}

/* ---------- Le bloc ----------
   Plus de séances par semaine : BLOC.semaines ne sert qu'à découper le
   calendrier pour le journal et les graphiques (20 semaines de marge). */
const BLOC = {
  nom: "Bloc 4 — Reprise claire",
  debut: "2026-11-16",
  objectifBloc:
    "Une séance par jour, choisie par le site selon ce que tu as vraiment fait : 3 muscu, 2 courses, 1 vélo et 1 à 2 natations " +
    "sur 7 jours glissants. Chaque sport avance par étapes : rater un jour ne casse rien, tu reprends là où tu en étais. " +
    "Chaque séance a sa version courte pour les jours sans énergie. Nutrition sans compter, pilotée par la moyenne du poids sur 7 jours. " +
    "Le bloc se termine quand la progression course est finie (25 min en continu) et que les tests sont faits. " +
    "Cap suivant : triathlon M à l'été 2027. Règle absolue : sommeil ≥ 7 h 30.",
  semaines: Array.from({ length: 20 }, (_, i) => ({ num: i + 1, theme: `Semaine ${i + 1}`, focus: "", seances: [] })),
};

/* ---------- Les règles du système ---------- */
const AGENCEMENT = [
  "<strong>Chaque jour, le site te propose UNE séance</strong> : le sport le plus en retard sur les 7 derniers jours (objectif : 3 muscu, 2 courses, 1 vélo, 1 à 2 natations). Tu l'ouvres, tu la fais, tu tapes ✓.",
  "<strong>Rater un jour ne casse rien</strong> : chaque sport avance par étapes. Demain, le site te propose la suite, là où tu en étais. Jamais deux séances le même jour pour rattraper.",
  "<strong>✓ = faite en entier</strong> : l'étape avance. <strong>≈ = version courte ou adaptée</strong> : elle compte dans ta semaine, mais la prochaine fois tu refais la même étape.",
  "<strong>« Autre séance »</strong> si celle du jour ne te va pas ; <strong>« Pas le temps aujourd'hui »</strong> pour un jour off ; <strong>« J'ai fait autre chose »</strong> pour noter ce que tu as vraiment fait.",
  "<strong>Le pied est protégé automatiquement</strong> : 48 h entre deux courses, jamais de course la veille ou le lendemain du Lower. Plus de 10 jours sans courir : la course redescend d'une étape.",
  "<strong>Pied > 3/10 pendant une course</strong> : stop au milieu, tu rentres en marchant, ≈ avec la raison.",
  "<strong>Natation en pause</strong> tant que tu ne peux pas nager : le vélo prend sa place. Tu la réactives dans « Ma progression » ; elle reprend à ta dernière étape.",
  "<strong>Repos</strong> : après 6 séances en 6 jours, le site te conseille un jour off (tu peux quand même t'entraîner).",
  "<strong>Nutrition</strong> : sans compter, détail dans « Manger sans compter ». Pesée chaque matin : la moyenne sur 7 jours décide, toutes les 2 semaines.",
  "<strong>Chaque jour</strong> : rééduc pied 5 min + routine posture 5 min. Chaque matin : poids, énergie et faim de 1 à 5, douleur pied au réveil.",
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
    "<b>Toutes les 2 semaines</b>, regarde la pastille « Poids moy. 7 j » :",
    "Perte entre 0,25 et 0,5 kg/sem → tu ne changes rien.",
    "Perte plus faible (ou poids stable) → enlève ½ poing de féculents au dîner, pas plus.",
    "Perte plus rapide, OU énergie ≤ 2/5 plusieurs jours → ajoute 1 poing de féculents par jour.",
    "<b>Une semaine sur six</b> (le bandeau du jour te prévient) : +1 poing de féculents à chaque repas, entraînement inchangé.",
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
    id: "test-depart", titre: "Mesures de départ", quand: "Au départ du bloc, à jeun (si pas encore fait : demain matin)",
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
    id: "test-nage", titre: "200 m nage chrono", quand: "À la fin de la progression course — le site te le propose",
    protocole: "Échauffement complet (6 × 33 m progressifs), 3 min de repos, puis 6 × 33 m enchaînées (198 m) chronométrées à l'Apple Watch.",
    cible: "Première référence nage. Nager les 6 longueurs sans t'arrêter = bloc réussi ; 4:30-5:00 = très bien.",
    champs: [
      { cle: "chrono", label: "Chrono (mm:ss)", type: "text" },
      { cle: "ressenti", label: "Sensations", type: "textarea" },
    ],
  },
  {
    id: "test-velo", titre: "20 min vélo — effort max", quand: "À la fin de la progression course — le site te le propose",
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
    id: "test-course", titre: "Course continue — cap 30 min", quand: "Après la dernière étape course (25 min en continu) — le site te le propose",
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
    id: "test-muscu", titre: "Relevés de charges (Hevy)", quand: "Toutes les 12 séances de muscu (le site te le rappelle) + à la fin du bloc",
    protocole: "Pas de test séparé : reporte ici tes 2-3 meilleures séries Upper et Lower de la semaine (exercice × charge × reps × reps en réserve). Une ligne par relevé, datée.",
    cible: "En sèche, garder ses charges = gagner. Élévations latérales, tirage et rowing qui montent = le bloc fonctionne.",
    champs: [
      { cle: "upper", label: "Meilleures séries Upper (date · exo × kg × reps)", type: "textarea" },
      { cle: "lower", label: "Meilleures séries Lower (date · exo × kg × reps)", type: "textarea" },
    ],
  },
  {
    id: "test-corps", titre: "Poids, tour de taille & photo de fin", quand: "Au bilan de fin de bloc, à jeun",
    protocole: "Pesée à jeun au réveil + tour de taille au nombril, détendu. Photo dans la même lumière que la photo de départ.",
    cible: "Cible : −3 à −5 kg sur la moyenne 7 jours, tour de taille −4 à −6 cm, charges gardées. Le critère final reste le miroir.",
    champs: [
      { cle: "poids", label: "Poids à jeun (kg)", type: "number" },
      { cle: "taille", label: "Tour de taille (cm)", type: "number" },
      { cle: "notes", label: "Miroir, énergie, faim, remarques", type: "textarea" },
    ],
  },
  {
    id: "test-bilan", titre: "Bilan libre du bloc", quand: "Au bilan de fin de bloc",
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
      pourquoi: "Les fessiers travaillent en fin d'amplitude, là où ils sont les plus faibles chez quelqu'un d'assis toute la journée. Version chargée au Lower : le hip thrust.",
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
    "<strong>En salle (déjà dans tes séances)</strong> : roulette abdominale à l'Upper A, hip thrust au Lower, relevés de genoux bassin enroulé à l'Upper B. Ces trois-là pèsent plus lourd que la routine du matin.",
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
    "<strong>En salle, au Lower</strong> : élévations mollet unilatérales, serviette roulée sous les orteils, tempo lent (3 s de montée, 2 s de pause en haut, 3 s de descente). C'est le protocole Rathleff, la partie la plus efficace du traitement. Progression sur 8 semaines : 3 × 12, puis 4 × 10, puis 5 × 8 en ajoutant du poids dès que 12 répétitions lentes passent confortablement.",
    "<strong>Fréquence</strong> : le protocole original se fait UN JOUR SUR DEUX. Dans ce bloc : au Lower, plus le soir de chaque course à la maison (3 × 12 par jambe sur une marche d'escalier, serviette roulée sous les orteils, même tempo lent). Ça fait 2 à 3 fois par semaine ; c'est écrit dans les séances concernées.",
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
