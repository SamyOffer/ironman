/* ============================================================
   IRONMAN COACH — charts.js
   Mini-bibliothèque de graphiques SVG, zéro dépendance.
   Deux fonctions, réutilisables partout :

   ligneSVG(conteneur, points, options)
     points  = [{x: "libellé", y: nombre}]   (les y null sont ignorés)
     options = { unite: "kg", decimales: 1 }

   barresSVG(conteneur, barres, options)
     barres  = [{x: "libellé", y: nombre, max: nombre}]
     -> hauteur proportionnelle à y/max, colorée vert si 100 %, orange sinon.

   Les couleurs viennent du CSS (classes .ligne .point .barre .axe),
   donc le dark mode fonctionne tout seul.
   ============================================================ */

"use strict";

const CH = { l: 640, h: 220, m: { haut: 14, bas: 26, gauche: 42, droite: 12 } };

function _svg(contenu) {
  return `<svg viewBox="0 0 ${CH.l} ${CH.h}" xmlns="http://www.w3.org/2000/svg" role="img">${contenu}</svg>`;
}

/* Graphique en ligne (ex : évolution du poids) */
function ligneSVG(conteneur, points, options = {}) {
  const el = typeof conteneur === "string" ? document.querySelector(conteneur) : conteneur;
  const valides = points.filter(p => p.y !== null && p.y !== undefined && p.y !== "" && !isNaN(p.y));
  if (valides.length < 2) {
    el.innerHTML = `<p style="color:var(--text-2);text-align:center">Pas encore assez de données — remplis ton journal ${valides.length === 1 ? "encore un jour" : "quelques jours"} et le graphique apparaîtra ici.</p>`;
    return;
  }
  const ys = valides.map(p => +p.y);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const marge = Math.max((yMax - yMin) * 0.15, 0.5);       // un peu d'air en haut/bas
  const bas = yMin - marge, haut = yMax + marge;
  const zoneL = CH.l - CH.m.gauche - CH.m.droite;
  const zoneH = CH.h - CH.m.haut - CH.m.bas;
  const dec = options.decimales ?? 1;

  const X = i => CH.m.gauche + (points.length === 1 ? 0 : (i / (points.length - 1)) * zoneL);
  const Y = v => CH.m.haut + zoneH - ((v - bas) / (haut - bas)) * zoneH;

  // Trace uniquement les points renseignés, dans l'ordre
  let d = "", cercles = "", labels = "";
  points.forEach((p, i) => {
    if (p.y === null || p.y === undefined || p.y === "" || isNaN(p.y)) return;
    const x = X(i), y = Y(+p.y);
    d += (d ? " L" : "M") + `${x.toFixed(1)},${y.toFixed(1)}`;
    cercles += `<circle class="point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"><title>${p.x} : ${(+p.y).toFixed(dec)} ${options.unite || ""}</title></circle>`;
  });

  // Quelques libellés en X (max ~7 pour rester lisible)
  const pas = Math.max(1, Math.ceil(points.length / 7));
  points.forEach((p, i) => {
    if (i % pas === 0 || i === points.length - 1)
      labels += `<text x="${X(i).toFixed(1)}" y="${CH.h - 8}" text-anchor="middle">${p.x}</text>`;
  });

  el.innerHTML = _svg(
    `<line class="axe" x1="${CH.m.gauche}" y1="${CH.m.haut}" x2="${CH.m.gauche}" y2="${CH.h - CH.m.bas}"/>` +
    `<line class="axe" x1="${CH.m.gauche}" y1="${CH.h - CH.m.bas}" x2="${CH.l - CH.m.droite}" y2="${CH.h - CH.m.bas}"/>` +
    `<text x="${CH.m.gauche - 6}" y="${Y(yMax) + 4}" text-anchor="end">${yMax.toFixed(dec)}</text>` +
    `<text x="${CH.m.gauche - 6}" y="${Y(yMin) + 4}" text-anchor="end">${yMin.toFixed(dec)}</text>` +
    `<path class="ligne" d="${d}"/>` + cercles + labels
  );
}

/* Graphique en barres (ex : séances faites par semaine) */
function barresSVG(conteneur, barres, options = {}) {
  const el = typeof conteneur === "string" ? document.querySelector(conteneur) : conteneur;
  const zoneL = CH.l - CH.m.gauche - CH.m.droite;
  const zoneH = CH.h - CH.m.haut - CH.m.bas;
  const larg = Math.min(70, (zoneL / barres.length) * 0.6);

  let rects = "", labels = "";
  barres.forEach((b, i) => {
    const cx = CH.m.gauche + (i + 0.5) * (zoneL / barres.length);
    const ratio = b.max ? Math.min(b.y / b.max, 1) : 0;
    const h = Math.max(ratio * zoneH, b.y > 0 ? 4 : 0);
    const complet = b.max && b.y >= b.max;
    rects += `<rect class="barre ${complet ? "" : "partiel"}" x="${(cx - larg / 2).toFixed(1)}" y="${(CH.m.haut + zoneH - h).toFixed(1)}" width="${larg.toFixed(1)}" height="${h.toFixed(1)}" rx="4"><title>${b.x} : ${b.y}/${b.max}</title></rect>`;
    labels += `<text x="${cx.toFixed(1)}" y="${CH.h - 8}" text-anchor="middle">${b.x}</text>`;
    labels += `<text x="${cx.toFixed(1)}" y="${(CH.m.haut + zoneH - h - 6).toFixed(1)}" text-anchor="middle">${b.y}/${b.max}</text>`;
  });

  el.innerHTML = _svg(
    `<line class="axe" x1="${CH.m.gauche}" y1="${CH.h - CH.m.bas}" x2="${CH.l - CH.m.droite}" y2="${CH.h - CH.m.bas}"/>` +
    rects + labels
  );
}
