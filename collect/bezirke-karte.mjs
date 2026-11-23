// Einmalig/bei Bedarf: Bezirksgrenzen des Kantons Zürich von geo.admin.ch holen, vereinfachen und als kleine SVG-Karte
// nach site/bezirke-karte.js schreiben (window.BEZIRKE_KARTE).
import { writeFile } from "node:fs/promises";
const NAMES = { 101: "Affoltern", 102: "Andelfingen", 103: "Bülach", 104: "Dielsdorf", 105: "Hinwil", 106: "Horgen", 107: "Meilen", 108: "Pfäffikon", 109: "Uster", 110: "Winterthur", 111: "Dietikon", 112: "Zürich" };
const W = 320, TOL = 0.0018;
const dp = (pts, tol) => { // Douglas-Peucker
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]]; let idx = 0, max = 0;
  for (let i = 1; i < pts.length - 1; i++) { const p = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9, d = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / L; if (d > max) { max = d; idx = i; } }
  return max > tol ? [...dp(pts.slice(0, idx + 1), tol).slice(0, -1), ...dp(pts.slice(idx), tol)] : [a, b];
};
const feats = [];
for (const nr of Object.keys(NAMES)) {
  const r = await fetch(`https://api3.geo.admin.ch/rest/services/api/MapServer/ch.swisstopo.swissboundaries3d-bezirk-flaeche.fill/${nr}?geometryFormat=geojson&sr=4326`, { headers: { "User-Agent": "Mozilla/5.0 (compatible; FamilienZuerichBot/1.0)" } });
  const j = await r.json(); const g = j.feature.geometry;
  const polys = g.type === "MultiPolygon" ? g.coordinates : g.type === "Polygon" ? [g.coordinates] : (g.geometries || []).flatMap(x => x.type === "MultiPolygon" ? x.coordinates : [x.coordinates]);
  console.log(nr, g.type, polys.length);
  feats.push({ nr: +nr, name: NAMES[nr], polys });
  await new Promise(r => setTimeout(r, 400));
}
let minx = 99, miny = 99, maxx = -99, maxy = -99;
for (const f of feats) for (const p of f.polys) for (const ring of p) for (const [x, y] of ring) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
const k = Math.cos(((miny + maxy) / 2) * Math.PI / 180), sx = W / ((maxx - minx) * k), H = Math.round((maxy - miny) * sx);
const P = ([x, y]) => [((x - minx) * k * sx).toFixed(1), ((maxy - y) * sx).toFixed(1)];
const out = [];
for (const f of feats) {
  let d = "", best = 0, lab = null;
  for (const poly of f.polys) for (const ring of poly) {
    const sm = dp(ring, TOL); if (sm.length < 4) continue;
    d += "M" + sm.map(p => P(p).join(",")).join("L") + "Z";
    if (ring.length > best) { best = ring.length; let ax = 0, ay = 0; for (const p of ring) { ax += p[0]; ay += p[1]; } lab = P([ax / ring.length, ay / ring.length]); }
  }
  if (!lab) { console.log("leer", f.name); continue; }
  out.push({ nr: f.nr, name: f.name, d, lx: +lab[0], ly: +lab[1] });
}
await writeFile(new URL("../site/bezirke-karte.js", import.meta.url), `// Bezirksgrenzen Kanton Zürich (Quelle: swisstopo, swissBOUNDARIES3D via geo.admin.ch), vereinfacht\nwindow.BEZIRKE_KARTE=${JSON.stringify({ w: W, h: H, bezirke: out })};\n`);
console.log("ok", W, H, out.map(b => b.name + ":" + b.d.length).join(" "));
