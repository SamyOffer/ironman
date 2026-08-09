# Ironman Coach — Samy · Bloc 2

Site de suivi d'entraînement 100 % local : HTML/CSS/JS vanilla, zéro dépendance,
zéro build. **Double-clique sur `index.html`** — ça marche hors-ligne, en `file://`.

## Structure

```
ironman-coach/
├── index.html                  Tableau de bord (stats, séance du jour, graphiques, export)
├── programme.html              Les 4 semaines de séances (cartes cochables)
├── journal.html                Journal quotidien (28 jours)
├── tests.html                  Tests de fin de bloc (saisie des résultats)
├── guide.html                  Explications du coach (plan 2 ans, zones, technique)
└── assets/
    ├── style.css               Design system complet (variables CSS, dark mode auto)
    ├── main.js                 Moteur : nav, pager, sauvegarde auto (localStorage)
    ├── charts.js               Graphiques SVG (ligne + barres), zéro dépendance
    ├── seance.js               LE module "carte de séance" réutilisé partout
    ├── export.js               Export MULTI-BLOCS : Excel .xlsx + JSON + import
    ├── vendor/xlsx.full.min.js SheetJS (génération Excel hors-ligne, seule lib embarquée)
    └── programme-data.js       LE BLOC COURANT (séances, tests, champs journal)
```

## Philosophie du code : contenu = données, code = affichage

Le principe qui rend tout modulable : **les pages ne contiennent presque pas de
contenu**. Séances, tests et champs du journal sont des objets JS dans
`programme-data.js`. Le code se contente de les afficher avec un module unique
(`renderSeance`) qui fonctionne pour n'importe quel sport.

Concrètement :

- **Ajouter une séance / un sport** → un objet dans `BLOC.semaines[x].seances`.
  Un nouveau type de sport = 1 ligne dans `TYPE_LABELS` (seance.js) + 1 ligne de
  couleur `.badge` (style.css). Rien d'autre.
- **Ajouter un champ au journal** → un objet dans `JOURNAL_CHAMPS`.
- **Ajouter un test** → un objet dans `TESTS`.
- **Ajouter une page au site** → créer le HTML (copier une page existante) +
  1 ligne dans `PAGES` (main.js). Nav et pager se mettent à jour seuls.
- **Changer une couleur** → variables dans `:root` de style.css (light + dark).
- **Créer le Bloc 2** → dupliquer `programme-data.js` avec les nouvelles données
  et changer `STORE_KEY` dans assets/sync-fichier.js (ex : `ironman-samy-bloc2`)
  pour repartir sur une sauvegarde propre en gardant l'ancienne intacte.

## Sauvegarde des données

- **Sur disque, dans un vrai fichier** : `assets/sync-fichier.js` (chargé en
  premier sur chaque page, il définit `STORE_KEY`) pousse chaque modification
  vers un petit serveur local (`~/Library/Application Support/ironman-sauvegarde/
  serveur-sauvegarde.py`, port 8123) qui écrit `donnees-ironman.json` — visible
  via le lien `SPORT/donnees-ironman.json`. Le serveur est lancé au démarrage du
  Mac par le LaunchAgent `com.samy.ironman-sauvegarde` ; s'il est éteint, les
  pages affichent un bandeau rouge (relance : « Démarrer la sauvegarde.command »
  dans SPORT). Une copie par jour est gardée dans `sauvegarde/historique/`.
  Au chargement, le fichier remplit `localStorage` AVANT les autres scripts :
  le fichier est la source de vérité, le navigateur n'est qu'une copie de travail
  (le plus récent des deux gagne, horodatage `_maj`).
- **Automatique** : tout élément portant `data-bind="une.cle"` est lu/écrit dans
  `localStorage` à chaque modification (indicateur « ✓ sauvegardé » en bas à droite),
  puis `syncVersFichier()` pousse le tout dans le fichier.
  Pour rendre n'importe quel nouveau champ persistant, il suffit de lui donner un
  attribut `data-bind` — aucun JS à écrire.
- **Export Excel** : un .xlsx multi-feuilles (Infos / Séances / Journal / Tests /
  Séances libres) couvrant TOUS les blocs depuis le début — lisible par n'importe qui.
- **Export JSON** : sauvegarde technique complète (tous les blocs), à envoyer au
  coach et à réimporter en cas de pépin.
- **Import** : restaure un export v2 (multi-blocs) ou v1 (ancien format, un bloc).
- **Durabilité** : chaque bloc a sa clé localStorage (`ironman-samy-blocN`).
  Passer au bloc suivant n'efface RIEN : les exports incluent toujours l'historique.
  Quand un bloc se termine, son catalogue (id → titre) est ajouté au REGISTRE
  d'export.js pour que l'Excel reste lisible à vie.

Grâce au fichier disque, les données survivent au changement de navigateur
(Safari, Arc, Chrome...) et aux nettoyages de `localStorage`. Seule condition :
le serveur de sauvegarde doit tourner (bandeau rouge sinon).

## Planning flexible & statuts

Les séances ne sont PAS attachées à un jour : chaque semaine est un menu de
7 séances que Samy agence lui-même (règles d'agencement dans `AGENCEMENT`,
affichées repliées sur la page programme). Chaque séance a un statut :
`""` (à faire), `faite`, `adaptee` (faite mais modifiée/remplacée — raison
demandée), `pas-pu` (empêchement — raison demandée et conservée pour analyse).
Le champ « Faite le » enregistre la date réelle (pré-rempli à aujourd'hui).
Les séances non prévues se loggent via « + Ajouter une séance libre »
(stockage `extra.w<num>.*`). Les aides de chaque page sont dans des
`<details class="aide">` repliés par défaut.

## Données clés du bloc

- Bloc 2 « Fondations + Course » : 3 → 30 août 2026 (4 semaines).
  Nouveauté : course à pied en marche/course (3×/sem), natation optionnelle
  (flag `optionnel: true`, exclue de l'assiduité), champ journal
  `pied_douleur` (douleur au réveil) avec graphique dédié au dashboard.
- Clé de sauvegarde : `ironman-samy-bloc2`. Les données de juillet restent
  dans le navigateur sous `ironman-samy-bloc1` (non affichées, non perdues).
- Format des clés : `seance.<id>.statut|faitele|raison|rpe|donnees|ressenti`,
  `journal.<date>.<champ>`, `tests.<id>.<champ>`, `extra.w<num>.<i>.<champ>`,
  `checklist-bloc1.<n>`.
