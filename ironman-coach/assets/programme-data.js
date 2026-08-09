/* ============================================================
   IRONMAN COACH — programme-data.js
   TOUT le contenu du bloc d'entraînement est ici, en données.
   Le code (programme.html) ne fait que l'afficher.

   >>> BLOC 2 — la course à pied entre en piste (3 → 30 août 2026)
   (Le Bloc 1 de juillet reste sauvegardé dans le navigateur sous
   la clé "ironman-samy-bloc1" — rien n'est perdu.)

   PLANNING FLEXIBLE : chaque semaine est un MENU de séances,
   sans jour imposé. Samy les agence lui-même (règles : AGENCEMENT).

   Structure d'une séance (module unique, valable pour TOUS les sports) :
   {
     id:        identifiant unique (sert de clé de sauvegarde)
     type:      "muscu" | "natation" | "velo" | "course" | "marche" | "test" | "repos"
     titre:     nom court
     duree:     indication de durée
     objectif:  la consigne clé en une phrase
     contenu:   liste des étapes de la séance
     pourquoi:  explication du coach (affichée en accordéon)
     hint:      placeholder du champ "données" (guide sans imposer)
     optionnel: true = bonus, pas comptée dans l'assiduité
   }
   ============================================================ */

"use strict";

const BLOC = {
  nom: "Bloc 2 — Fondations + Course",
  debut: "2026-08-03",           // lundi 3 août 2026
  objectifBloc:
    "La course à pied entre enfin dans le jeu — en marche/course, parce que ta fasciite " +
    "et ta base aérobie imposent la patience sur les IMPACTS, pas sur le volume. " +
    "Muscu à fond (progression normale), vélo en soutien, natation optionnelle ce mois-ci. " +
    "Fin août : ton premier test course, la référence des deux ans qui viennent. " +
    "Règle absolue du mois : le pied décide. Douleur > 3/10 = on adapte, jamais on force.",

  semaines: [
    /* ================= SEMAINE 1 (3-9 août) ================= */
    {
      num: 1,
      theme: "La course entre en piste — marche/course",
      focus:
        "Grande nouveauté : 3 séances de course en alternance marche/course, Clifton aux pieds, " +
        "semelles dedans. Les intervalles vont te sembler ridiculement courts — c'est voulu : " +
        "ton cœur s'adapte en quelques jours, tes tendons et ta voûte plantaire en plusieurs " +
        "semaines. Ce sont EUX qui dictent le rythme du mois. Muscu normale, vélo en soutien.",
      seances: [
        { id: "w1-c1", type: "course", titre: "Marche/Course n°1 — la première", duree: "~35 min",
          objectif: "8× (1 min course très lente / 2 min marche). Allure : tu peux parler en courant.",
          contenu: [
            "5 min de marche rapide pour échauffer",
            "8× (1 min de course TRÈS lente / 2 min de marche)",
            "5 min de marche pour finir",
            "Petits pas rapides, atterris sous ton corps (pas devant), regard loin",
            "Douleur pied : au-dessus de 3/10 → on arrête et on rentre en marchant, c'est OK",
            "Note ta douleur pied pendant/après dans les données",
          ],
          pourquoi: "Être essoufflé après 300 m, c'est juste une base aérobie jamais construite — ça se corrige vite en découpant l'effort. Et la reprise post-fasciite se fait par impacts courts et espacés : c'est le protocole standard. La frustration d'aujourd'hui est le prix de la cheville qui tiendra un marathon dans deux ans.",
          hint: "Ex : les 8 répétitions passées ?, douleur pied 0-10, essoufflement..." },

        { id: "w1-c2", type: "course", titre: "Marche/Course n°2", duree: "~35 min",
          objectif: "Même format : 8× (1 min / 2 min). Minimum 48 h après la n°1.",
          contenu: [
            "5 min marche rapide",
            "8× (1 min course lente / 2 min marche)",
            "5 min marche",
            "Vérifie ce matin : raideur du pied au réveil ? Si en hausse, décale d'un jour",
          ],
          pourquoi: "La répétition à dose égale : on laisse les tissus encaisser la même charge deux fois avant d'augmenter quoi que ce soit. Les 48 h entre deux courses sont le temps de réparation des micro-contraintes du pied.",
          hint: "Ex : douleur pied 0-10, sensations vs la n°1..." },

        { id: "w1-c3", type: "course", titre: "Marche/Course n°3", duree: "~40 min",
          objectif: "10× (1 min / 2 min) — seulement si les 2 premières sont passées proprement.",
          contenu: [
            "5 min marche rapide",
            "10× (1 min course lente / 2 min marche)",
            "5 min marche",
            "Si douleur > 2/10 le lendemain des séances précédentes : reste à 8 répétitions",
          ],
          pourquoi: "Première petite augmentation (+2 répétitions), conditionnée à la réaction du pied. C'est comme ça qu'on progressera tout le mois : le pied vote avant chaque montée.",
          hint: "Ex : 8 ou 10 reps ?, douleur, essoufflement en fin de séance..." },

        { id: "w1-upA", type: "muscu", titre: "Upper A", duree: "~60 min",
          objectif: "Progression normale, règle d'or, RIR 1-2.",
          contenu: [
            "Ta séance Upper A dans Hevy",
            "Haut de la fourchette de reps atteint → monte la charge",
            "5 min de gainage pour finir",
          ],
          pourquoi: "Tu as gardé la muscu en juillet : on continue la progression normale. La fréquence ×2 par groupe musculaire reste le schéma le plus efficace pour l'hypertrophie.",
          hint: "Ex : charges, progression..." },

        { id: "w1-loA", type: "muscu", titre: "Lower A", duree: "~60 min",
          objectif: "Progression normale + mollets excentriques (tes amortisseurs de coureur).",
          contenu: [
            "Ta séance Lower A dans Hevy",
            "Finisher Rathleff : 3×12 élévations mollets unilatérales, SERVIETTE ROULÉE SOUS LES ORTEILS, montée 2 s / pause 2 s / descente 3 s",
            "Jamais la veille d'une séance de course si tu peux l'éviter",
          ],
          pourquoi: "Des mollets forts absorbent l'impact avant qu'il n'arrive à ta voûte plantaire. La serviette roulée sous les orteils tend le fascia pendant l'élévation (mécanisme de treuil) : c'est le protocole exact de l'essai de Rathleff 2015, le traitement le mieux validé de la fasciite. Maintenant que tu cours, il compte double.",
          hint: "Ex : charges, douleur pied pendant les mollets..." },

        { id: "w1-upB", type: "muscu", titre: "Upper B", duree: "~60 min",
          objectif: "Progression normale, règle d'or.",
          contenu: ["Ta séance Upper B dans Hevy"],
          pourquoi: "Constance. Deuxième passage haut du corps de la semaine.",
          hint: "Ex : charges..." },

        { id: "w1-loB", type: "muscu", titre: "Lower B", duree: "~60 min",
          objectif: "Progression normale + mollets.",
          contenu: ["Ta séance Lower B dans Hevy", "Mollets protocole Rathleff : 3×12 unilatéral, serviette sous les orteils, tempo lent"],
          pourquoi: "À placer loin du Lower A (48 h min) et pas la veille d'une course.",
          hint: "Ex : charges, fatigue de la semaine 0-10..." },

        { id: "w1-v1", type: "velo", titre: "Vélo Z2", duree: "60 min",
          objectif: "Zone 2 stricte : FC 120-140, tu peux parler.",
          contenu: [
            "5 min échauffement, 50 min Z2 cadence 85-90, 5 min calme",
            "750 ml d'eau (électrolytes si dispo) sur la séance",
          ],
          pourquoi: "Le vélo passe en soutien ce mois-ci : il entretient le moteur aérobie sans impact, pendant que le pied apprend la course. C'est aussi ta soupape : course impossible → vélo à la place.",
          hint: "Ex : distance, FC moyenne, watts..." },

        { id: "w1-v2", type: "velo", titre: "Vélo Z2 long", duree: "75 min",
          objectif: "75 min Z2 continue. Hydratation complète.",
          contenu: [
            "5 min échauffement, 65 min Z2, 5 min calme",
            "Toutes les 15 min : 30 s de cadence 100+ pour délier",
          ],
          pourquoi: "La sortie la plus longue de la semaine : l'endurance profonde se construit ici, à faible coût pour le pied.",
          hint: "Ex : distance, FC, mental..." },

        { id: "w1-nat", type: "natation", titre: "Natation technique (optionnelle)", duree: "~30 min", optionnel: true,
          objectif: "500-600 m au feeling, pure technique, zéro pression.",
          contenu: [
            "Échauffement 2×33 m souple",
            "8-10×33 m crawl, repos 20-30 s — expiration complète, allonge devant",
            "2×33 m dos pour finir",
          ],
          pourquoi: "Je ne vais pas te mentir : la natation est le premier tiers de ton Ironman (3,8 km) et tu ne l'as pas touchée en juillet. Ce mois-ci elle reste optionnelle pour laisser la place à la course — mais en septembre elle redevient non négociable. Chaque passage est un investissement.",
          hint: "Ex : longueurs, sensations..." },
      ],
    },

    /* ================= SEMAINE 2 (10-16 août) ================= */
    {
      num: 2,
      theme: "Segments de 2 minutes",
      focus:
        "Les segments de course passent à 2 minutes, toujours à allure conversation. " +
        "Si le pied a bronché en semaine 1 (douleur > 3 pendant, ou raideur matinale en hausse), " +
        "on reste sur le format 1 min/2 min une semaine de plus — dis-le-moi dans le ressenti.",
      seances: [
        { id: "w2-c1", type: "course", titre: "Marche/Course — 7× (2'/2')", duree: "~40 min",
          objectif: "7× (2 min course lente / 2 min marche). ~14 min courues.",
          contenu: [
            "5 min marche rapide",
            "7× (2 min course lente / 2 min marche)",
            "5 min marche",
            "Toujours : petits pas rapides, tu peux parler, pied ≤ 3/10",
          ],
          pourquoi: "On double la durée des segments mais pas le volume total couru : la charge monte sur UN seul curseur à la fois.",
          hint: "Ex : reps passées, douleur pied, essoufflement..." },
        { id: "w2-c2", type: "course", titre: "Marche/Course — 7× (2'/2')", duree: "~40 min",
          objectif: "Même format. 48 h après la précédente.",
          contenu: ["5 min marche", "7× (2 min / 2 min)", "5 min marche"],
          pourquoi: "Répétition à dose égale avant la prochaine montée. La régularité fait l'adaptation.",
          hint: "Ex : douleur, sensations vs c1..." },
        { id: "w2-c3", type: "course", titre: "Marche/Course — 8× (2'/1'30)", duree: "~40 min",
          objectif: "8× (2 min course / 1 min 30 marche) — la récup se réduit un peu.",
          contenu: ["5 min marche", "8× (2 min / 1 min 30)", "5 min marche", "Si le pied dit non : reste sur 7× (2'/2')"],
          pourquoi: "Réduire la marche entre les segments rapproche doucement du courir-continu, sans allonger les impacts d'un coup.",
          hint: "Ex : format tenu ?, douleur, fin de séance..." },

        { id: "w2-upA", type: "muscu", titre: "Upper A", duree: "~60 min",
          objectif: "Règle d'or, RIR 1-2.",
          contenu: ["Upper A dans Hevy", "Gainage 5 min"],
          pourquoi: "Rien de nouveau : la constance EST le programme.", hint: "Ex : charges..." },
        { id: "w2-loA", type: "muscu", titre: "Lower A", duree: "~60 min",
          objectif: "Progression + mollets excentriques.",
          contenu: ["Lower A dans Hevy", "Mollets Rathleff : 3×12 unilatéral, serviette sous les orteils, tempo lent"],
          pourquoi: "Toujours pas la veille d'une course.", hint: "Ex : charges, pied..." },
        { id: "w2-upB", type: "muscu", titre: "Upper B", duree: "~60 min",
          objectif: "Règle d'or.", contenu: ["Upper B dans Hevy"],
          pourquoi: "Deuxième passage haut du corps.", hint: "Ex : charges..." },
        { id: "w2-loB", type: "muscu", titre: "Lower B", duree: "~60 min",
          objectif: "Progression + mollets.", contenu: ["Lower B dans Hevy", "Mollets Rathleff : 3×12 unilatéral, serviette sous les orteils"],
          pourquoi: "48 h après le Lower A.", hint: "Ex : charges, fatigue 0-10..." },

        { id: "w2-v1", type: "velo", titre: "Vélo Z2", duree: "60 min",
          objectif: "Z2 stricte, cadence 85-90.",
          contenu: ["5 min échauffement, 50 min Z2, 5 min calme", "3× 30 s cadence 100+ réparties"],
          pourquoi: "Soutien aérobie sans impact.", hint: "Ex : distance, FC..." },
        { id: "w2-v2", type: "velo", titre: "Vélo Z2 long", duree: "90 min",
          objectif: "90 min Z2 — teste un apport solide (barre) à mi-séance.",
          contenu: ["5 min échauffement, 80 min Z2, 5 min calme", "750 ml/h + 1 barre vers 45 min"],
          pourquoi: "On rallonge le vélo ET on commence à entraîner l'alimentation en selle : une compétence d'Ironman à part entière, qui s'apprend tôt.",
          hint: "Ex : distance, la barre est bien passée ?..." },

        { id: "w2-nat", type: "natation", titre: "Natation technique (optionnelle)", duree: "~30 min", optionnel: true,
          objectif: "500-700 m technique au feeling.",
          contenu: ["Échauffement souple", "Répétitions de 33 m, repos larges", "Focus expiration + allonge"],
          pourquoi: "Chaque passage entretient la sensation de l'eau — septembre te dira merci.",
          hint: "Ex : longueurs, sensations..." },
      ],
    },

    /* ================= SEMAINE 3 (17-23 août) ================= */
    {
      num: 3,
      theme: "Le cap des 3 minutes",
      focus:
        "Segments de 3 minutes (~15-18 min courues par séance) : la plus grosse semaine de course " +
        "du bloc. Le vélo goûte au tempo. Si tout passe proprement, le test de 20 minutes de la " +
        "semaine prochaine sera une formalité. Le pied vote toujours avant chaque montée.",
      seances: [
        { id: "w3-c1", type: "course", titre: "Marche/Course — 5× (3'/2')", duree: "~35 min",
          objectif: "5× (3 min course lente / 2 min marche).",
          contenu: ["5 min marche", "5× (3 min / 2 min)", "5 min marche"],
          pourquoi: "3 minutes en continu : ton corps apprend à trouver un rythme de croisière à l'intérieur du segment — c'est le début du « courir posé ».",
          hint: "Ex : reps, douleur pied, essoufflement..." },
        { id: "w3-c2", type: "course", titre: "Marche/Course — 6× (3'/2')", duree: "~40 min",
          objectif: "6× (3 min / 2 min). 48 h après la précédente.",
          contenu: ["5 min marche", "6× (3 min / 2 min)", "5 min marche"],
          pourquoi: "+1 répétition : petite montée de volume à durée de segment égale.",
          hint: "Ex : douleur, régularité de l'allure..." },
        { id: "w3-c3", type: "course", titre: "Marche/Course — 5× (4'/2')", duree: "~40 min",
          objectif: "5× (4 min / 2 min) — seulement si c1 et c2 sont passées sans alerte.",
          contenu: ["5 min marche", "5× (4 min / 2 min)", "5 min marche", "Alerte pied → reste sur 3 min"],
          pourquoi: "Dernière marche avant le test : 4 minutes continues × 5, c'est déjà 20 minutes de course dans la séance.",
          hint: "Ex : format tenu, douleur, confiance pour le test..." },

        { id: "w3-upA", type: "muscu", titre: "Upper A", duree: "~60 min",
          objectif: "Règle d'or.", contenu: ["Upper A dans Hevy", "Gainage 5 min"],
          pourquoi: "Semaine de pic aussi pour le haut du corps.", hint: "Ex : charges..." },
        { id: "w3-loA", type: "muscu", titre: "Lower A", duree: "~60 min",
          objectif: "Progression + mollets.", contenu: ["Lower A dans Hevy", "Mollets Rathleff : 3×12 unilatéral, serviette sous les orteils"],
          pourquoi: "Surveille le pied : s'il monte au-dessus de 3/10 sur les mollets, allège.", hint: "Ex : charges, pied..." },
        { id: "w3-upB", type: "muscu", titre: "Upper B", duree: "~60 min",
          objectif: "Règle d'or.", contenu: ["Upper B dans Hevy"],
          pourquoi: "Constance.", hint: "Ex : charges..." },
        { id: "w3-loB", type: "muscu", titre: "Lower B", duree: "~60 min",
          objectif: "Progression + mollets.", contenu: ["Lower B dans Hevy", "Mollets Rathleff : 3×12 unilatéral, serviette sous les orteils"],
          pourquoi: "Pas la veille d'une course ni du vélo tempo.", hint: "Ex : charges, fatigue..." },

        { id: "w3-v1", type: "velo", titre: "Vélo Z2 + tempo", duree: "75 min",
          objectif: "Z2 avec 3× 5 min de tempo (soutenu mais pas à fond, FC ~150-160).",
          contenu: [
            "10 min échauffement",
            "3× (5 min tempo / 5 min Z2 souple)",
            "Complète en Z2 jusqu'à 75 min, 5 min calme",
          ],
          pourquoi: "Première touche d'intensité structurée du bloc : le tempo élève ton plafond pendant que la Z2 élargit la base. Dosé pour ne pas voler la récupération de la course.",
          hint: "Ex : vitesses/watts en tempo, FC, sensations jambes..." },
        { id: "w3-v2", type: "velo", titre: "Vélo Z2 long", duree: "90 min",
          objectif: "90 min Z2, hydratation + barre.",
          contenu: ["5 min échauffement, 80 min Z2, 5 min calme", "750 ml/h + 1 barre"],
          pourquoi: "L'endurance profonde continue de s'empiler, semaine après semaine.",
          hint: "Ex : distance, mental sur 90 min..." },

        { id: "w3-nat", type: "natation", titre: "Natation technique (optionnelle)", duree: "~30 min", optionnel: true,
          objectif: "500-700 m au feeling.",
          contenu: ["Répétitions 33 m souples, focus technique"],
          pourquoi: "Toujours optionnelle, toujours un bon investissement.",
          hint: "Ex : longueurs..." },
      ],
    },

    /* ================= SEMAINE 4 (24-30 août) ================= */
    {
      num: 4,
      theme: "Assimilation + TESTS du mois",
      focus:
        "Volume course réduit pour arriver frais aux deux tests : COURSE (courir continu, cap 20 min) " +
        "et VÉLO (20 min max). Deux jours d'écart minimum entre les deux, jamais au lendemain d'un Lower. " +
        "Résultats à remplir dans la page « Tests du bloc », puis export du .json pour ton coach.",
      seances: [
        { id: "w4-c1", type: "course", titre: "Course assimilation — 6× (2'/2')", duree: "~35 min",
          objectif: "Format facile : on garde le geste, on ne creuse pas la fatigue.",
          contenu: ["5 min marche", "6× (2 min / 2 min)", "5 min marche"],
          pourquoi: "Semaine allégée en course : les tests se réussissent frais, pas fatigué.",
          hint: "Ex : douleur, légèreté..." },
        { id: "w4-c2", type: "course", titre: "Course assimilation — 4× (3'/2')", duree: "~30 min",
          objectif: "Courte et souple. Pas dans les 48 h avant le test course.",
          contenu: ["5 min marche", "4× (3 min / 2 min)", "5 min marche"],
          pourquoi: "Dernier rappel du geste avant le test.",
          hint: "Ex : sensations..." },
        { id: "w4-tc", type: "test", titre: "TEST — Course continue (cap 20 min)", duree: "~40 min",
          objectif: "Courir en continu à allure conversation, aussi longtemps que possible, STOP à 20 min.",
          contenu: [
            "10 min échauffement : marche rapide + 3× 1 min de course facile",
            "TEST : cours en continu, allure conversation, jusqu'à 20 min MAXIMUM",
            "Tu t'arrêtes avant si : douleur pied > 3/10, ou tu n'arrives plus à parler",
            "5 min marche pour finir",
            "Note : durée tenue, distance, FC moyenne, douleur pied → page Tests",
          ],
          pourquoi: "Ton premier test course : la référence de départ des deux ans à venir. L'objectif n'est PAS la vitesse — c'est la durée tenue à allure aisée. En juin tu étais mort après 300 m ; on mesure le chemin parcouru.",
          hint: "Durée tenue, distance, FC, douleur, gestion..." },

        { id: "w4-upA", type: "muscu", titre: "Upper A + relevé de charges", duree: "~60 min",
          objectif: "Séance normale, et note tes 2-3 meilleures séries → page Tests.",
          contenu: ["Upper A dans Hevy", "Reporte tes meilleures séries (exo × kg × reps) dans la page Tests"],
          pourquoi: "Tes données Hevy de cette semaine SONT le test muscu.", hint: "Ex : meilleures séries..." },
        { id: "w4-loA", type: "muscu", titre: "Lower A + relevé de charges", duree: "~60 min",
          objectif: "Séance normale + relevé. Jamais la veille d'un test.",
          contenu: ["Lower A dans Hevy", "Relevé des meilleures séries → page Tests", "Mollets Rathleff 3×12"],
          pourquoi: "Test bas du corps. Garde des jambes correctes pour les tests course/vélo.", hint: "Ex : meilleures séries..." },
        { id: "w4-upB", type: "muscu", titre: "Upper B", duree: "~60 min",
          objectif: "Séance normale.", contenu: ["Upper B dans Hevy"],
          pourquoi: "Le haut du corps ne gêne pas les tests — séance normale.", hint: "Ex : charges..." },
        { id: "w4-loB", type: "muscu", titre: "Lower B allégé", duree: "~45 min",
          objectif: "-1 série par exercice, charges normales.",
          contenu: ["Lower B dans Hevy, une série de moins partout", "Mollets Rathleff 3×12 léger"],
          pourquoi: "On entretient sans creuser : les jambes servent aux tests cette semaine.", hint: "Ex : sensations..." },

        { id: "w4-v1", type: "velo", titre: "Vélo Z2 souple", duree: "45 min",
          objectif: "Récupération active entre les tests.",
          contenu: ["45 min Z2 très souple, cadence fluide"],
          pourquoi: "Fait tourner les jambes sans fatigue — idéal la veille ou le lendemain d'un test.",
          hint: "Ex : sensations..." },
        { id: "w4-tv", type: "test", titre: "TEST — 20 min vélo max", duree: "~40 min",
          objectif: "20 min à l'effort maximal SOUTENABLE et régulier : la plus grande distance possible.",
          contenu: [
            "10 min échauffement progressif avec 2× 30 s appuyés",
            "3 min tranquille",
            "TEST : 20 min à fond régulier — les 5 premières minutes doivent sembler « trop faciles »",
            "Note distance, vitesse moyenne, FC moyenne, watts si affichés → page Tests",
            "10 min retour au calme",
          ],
          pourquoi: "Le test de 20 min estime ton seuil (≈ 95 % de la moyenne) et calibrera tes zones vélo du Bloc 3. Référence de juin : ~26 km/h. Deux jours minimum après le test course.",
          hint: "Distance, vitesse moy., FC, watts, gestion..." },

        { id: "w4-nat", type: "natation", titre: "Natation souple (optionnelle)", duree: "~30 min", optionnel: true,
          objectif: "Nage plaisir. Si tu as nagé 2× ce mois-ci : fais le 200 m chrono (page Tests).",
          contenu: ["500-600 m au feeling, ou test 200 m si tu t'en sens"],
          pourquoi: "Récupération active + éventuelle référence nage pour septembre.",
          hint: "Ex : longueurs ou chrono 200 m..." },

        { id: "w4-bilan", type: "test", titre: "BILAN du bloc + export", duree: "~20 min",
          objectif: "Pesée, mensurations, bilan écrit, export du fichier pour ton coach.",
          contenu: [
            "Pèse-toi à jeun + tour de taille au nombril → page Tests",
            "Remplis le bilan libre (ce qui a marché / coincé, l'état du pied, la natation : on en parle)",
            "Tableau de bord → « Exporter mes données » → envoie-moi le .json",
            "Repos complet ce jour-là. Mérité.",
          ],
          pourquoi: "Avec ce fichier je calibre le Bloc 3 : allures course sur ton test, zones vélo sur tes 20 min, et le retour structuré de la natation.",
          hint: "Ton bilan libre du mois..." },
      ],
    },
  ],
};

/* ---------- Règles d'agencement de la semaine ----------
   Le planning est LIBRE : ces règles aident Samy à placer ses
   séances intelligemment. Affichées (repliées) sur la page programme. */
const AGENCEMENT = [
  "<strong>Jamais 2 courses sur 2 jours consécutifs</strong> : minimum 48 h entre deux séances de course — c'est le délai de réparation des tissus du pied.",
  "<strong>Course et Lower : jamais le même jour</strong>, et évite la course le lendemain d'un Lower (mollets frais = technique propre = pied protégé).",
  "<strong>Deux séances le même jour ? OK</strong> : course le matin + Upper plus tard, ou muscu + vélo court. Évite Lower + vélo long le même jour.",
  "<strong>Sépare Upper A/Upper B et Lower A/Lower B</strong> d'au moins 2 jours chacun.",
  "<strong>Garde 1 jour full repos</strong> par semaine (marche tranquille OK).",
  "<strong>Douleur pied > 3/10 pendant une course</strong> : stop, remplace par du vélo (statut « ≈ adapté »), raconte-moi. Raideur matinale en hausse 2 jours de suite : saute la course suivante.",
  "<strong>Semaine 4</strong> : test course et test vélo à 2 jours d'écart minimum, frais, jamais le lendemain d'un Lower.",
  "<strong>La natation optionnelle</strong> se glisse n'importe quand (créneau 8h-10h au Neptunium). Séance impossible ? Statut « ✗ Pas pu » + raison — je lis tout.",
];

/* ---------- TESTS du bloc : définitions ----------
   Affichés + saisis dans tests.html. Même logique modulaire. */
const TESTS = [
  {
    id: "test-course", titre: "Course continue — cap 20 min", quand: "Semaine 4 — frais, jamais après un Lower ou une autre course",
    protocole: "10 min d'échauffement (marche rapide + 3×1 min course facile), puis course CONTINUE à allure conversation, aussi longtemps que possible, arrêt obligatoire à 20 min. Stop avant si douleur pied > 3/10 ou impossibilité de parler.",
    cible: "Premier relevé course de ta vie : pas de chrono à battre. Tenir 8-10 min en continu serait déjà une vraie progression vs les 300 m de juin ; 20 min = excellent. La douleur pied prime sur tout : t'arrêter à cause d'elle reste un test réussi (on a mesuré).",
    champs: [
      { cle: "duree", label: "Durée courue en continu (min:s)", type: "text" },
      { cle: "distance", label: "Distance (km)", type: "number" },
      { cle: "fc", label: "FC moyenne (bpm)", type: "number" },
      { cle: "douleur", label: "Douleur pied 0-10 (pendant / après)", type: "text" },
      { cle: "ressenti", label: "Gestion de l'effort / sensations", type: "textarea" },
    ],
  },
  {
    id: "test-velo", titre: "20 min vélo — effort max", quand: "Semaine 4 — 2 jours min. après le test course",
    protocole: "10 min d'échauffement, puis 20 min à l'effort maximal soutenable et RÉGULIER. Noter tout ce que la machine et la montre affichent.",
    cible: "Référence de juin : ~26 km/h. Égaler = bien, dépasser = excellent. Ce test calibre les zones vélo du Bloc 3 (seuil ≈ 95 % de la moyenne des 20 min).",
    champs: [
      { cle: "distance", label: "Distance (km)", type: "number" },
      { cle: "vitesse", label: "Vitesse moy. (km/h)", type: "number" },
      { cle: "fc", label: "FC moyenne (bpm)", type: "number" },
      { cle: "watts", label: "Watts moy. (si affichés)", type: "number" },
      { cle: "ressenti", label: "Gestion de l'effort / sensations", type: "textarea" },
    ],
  },
  {
    id: "test-muscu", titre: "Relevé de charges (Hevy)", quand: "Semaine 4 — tes séances Upper/Lower normales",
    protocole: "Pas de test séparé : reporte ici tes 2-3 meilleures séries Upper et Lower de la semaine 4 (exercice × charge × reps).",
    cible: "Progression continue vs juillet : la règle d'or fait son travail, on la mesure bloc après bloc.",
    champs: [
      { cle: "upper", label: "Meilleures séries Upper (exo × kg × reps)", type: "textarea" },
      { cle: "lower", label: "Meilleures séries Lower (exo × kg × reps)", type: "textarea" },
    ],
  },
  {
    id: "test-nage", titre: "200 m nage chrono (optionnel)", quand: "Semaine 4 — seulement si tu as nagé au moins 2× dans le mois",
    protocole: "Échauffement complet (6×33 m progressifs), 3 min de repos, puis 6×33 m enchaînées (198 m) chronométrées à l'Apple Watch.",
    cible: "Si tu ne l'as pas fait, aucun souci ce mois-ci — mais ce sera LA priorité de septembre. Pour situer : 4:30-5:00 serait très correct après des années d'arrêt.",
    champs: [
      { cle: "chrono", label: "Chrono (mm:ss)", type: "text" },
      { cle: "ressenti", label: "Sensations", type: "textarea" },
    ],
  },
  {
    id: "test-corps", titre: "Poids & mensurations", quand: "Dernier jour du bloc (30 août), à jeun",
    protocole: "Pesée à jeun au réveil + tour de taille au niveau du nombril, détendu.",
    cible: "Départ juin : 66 kg, ~18 % MG. En recomposition, le poids peut peu bouger alors que tu progresses : tour de taille et miroir comptent autant que la balance.",
    champs: [
      { cle: "poids", label: "Poids à jeun (kg)", type: "number" },
      { cle: "taille", label: "Tour de taille (cm)", type: "number" },
      { cle: "notes", label: "Miroir, énergie, remarques", type: "textarea" },
    ],
  },
  {
    id: "test-bilan", titre: "Bilan libre du bloc", quand: "Dernier jour du bloc (30 août)",
    protocole: "Écris librement : ce qui a marché, ce qui a coincé, l'état de ton pied sur le mois, les Clifton, la natation (on doit en parler), ta motivation.",
    cible: "Ce texte + ton export .json = tout ce dont j'ai besoin pour construire le Bloc 3 sur mesure.",
    champs: [
      { cle: "bilan", label: "Ton bilan du mois", type: "textarea" },
      { cle: "pied", label: "État du pied : douleur moyenne du mois (0-10) et tendance", type: "text" },
    ],
  },
];

/* ---------- JOURNAL : champs quotidiens ----------
   Pour ajouter/enlever un champ du journal : modifier UNIQUEMENT cette liste. */
const JOURNAL_CHAMPS = [
  { cle: "poids", label: "Poids (kg)", type: "number", largeur: "petit" },
  { cle: "pas", label: "Pas", type: "number", largeur: "petit" },
  { cle: "eau", label: "Eau (L)", type: "number", largeur: "petit" },
  { cle: "electrolytes", label: "Électrolytes (nb)", type: "number", largeur: "petit" },
  { cle: "calories", label: "Calories (kcal)", type: "number", largeur: "petit" },
  { cle: "proteines", label: "Protéines (g)", type: "number", largeur: "petit" },
  { cle: "sommeil", label: "Sommeil (h)", type: "number", largeur: "petit" },
  { cle: "pied_douleur", label: "Douleur pied au réveil (0-10)", type: "number", largeur: "petit" },
  { cle: "pied", label: "Rééduc pied faite (5 min)", type: "checkbox" },
  { cle: "ressenti", label: "Ressenti / nourriture / notes libres", type: "textarea" },
];
