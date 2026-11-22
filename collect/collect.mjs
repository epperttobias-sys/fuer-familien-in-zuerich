// Läuft jede Nacht: holt alle Gemeinden und schreibt site/events.json.
import { readFile, writeFile } from "node:fs/promises";
import { collectSite, merge, setGemeindeIndex } from "./lib.mjs";

const root = new URL("..", import.meta.url);
const path = p => new URL(p, root);
const readJson = async (p, fallback) => { try { return JSON.parse(await readFile(path(p), "utf8")); } catch { return fallback; } };

const DELAY_MS = 400;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchText(url) {
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; FamilienZuerichBot/1.0; +https://epperttobias-sys.github.io/fuer-familien-in-zuerich/; sammelt einmal pro Nacht)", "Accept-Language": "de-CH,de;q=0.9" }, signal: AbortSignal.timeout(30000) });
      if (res.ok) return res.text();
      last = new Error(`${res.status} bei ${url}`); if (res.status === 404) break;
    } catch (e) { last = e; }
    await sleep(3000 * (i + 1));
  }
  throw last;
}

const ONLY = process.env.BEZIRK || "";
const slug = s => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[^a-z0-9]+/g, "-");
const all = await readJson("collect/gemeinden.json", {});
// Gemeinde-Namen für kantonsweite Quellen (Anlässe werden der Gemeinde des Veranstaltungsorts zugeordnet)
setGemeindeIndex(JSON.parse((await readFile(path("site/gemeinden.js"), "utf8")).replace(/^[^=]*=\s*/, "").replace(/;\s*$/, "")));
// system «keine»: Gemeinde ohne lesbare Agenda (nur PDF, externe App), bleibt für Wetter und Karte drin
// «eventitem» läuft als eigener, langsamer Durchgang, weil alle diese Gemeinden beim gleichen Anbieter liegen
const CODES = (process.env.CODES || "").split(",").map(s => s.trim()).filter(Boolean);
const sites = Object.fromEntries(Object.entries(all).filter(([c, s]) => s.system !== "keine" && (!CODES.length || CODES.includes(c))).filter(([, s]) => !ONLY || (ONLY === "eventitem" ? s.system === "eventitem" : s.bezirk === ONLY && s.system !== "eventitem")));
const cacheFile = ONLY ? `data/cache-${slug(ONLY)}.json` : "data/cache.json";
const cache = await readJson("data/cache.json", {});
try { const { readdir } = await import("node:fs/promises"); for (const f of await readdir(path("data/"))) if (/^cache-.*\.json$/.test(f)) Object.assign(cache, await readJson("data/" + f, {})); } catch {}
const previous = await readJson("site/events.json", { events: [] });
previous.events ??= [];
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });

const events = [], status = {}, quellen = {}, failed = [];
// Kantonsweite Quellen (quelle: true) sind keine Gemeinde: eigener Status, keine Gemeinde-Auswahl
const st = (code, site) => (site.quelle ? quellen : status);
async function runSite(code, site) {
  const r = await collectSite(code, site, { fetchText, cache, today, wait: () => sleep(site.delay ?? DELAY_MS) });
  events.push(...r.events);
  st(code, site)[code] = { name: site.name, bezirk: site.bezirk, domain: site.domain, ok: true, count: r.events.length };
  console.log(`${site.name}: ${r.rows} Events gelesen, ${r.events.length} für Kinder`);
}
for (const [code, site] of Object.entries(sites)) {
  try { await runSite(code, site); }
  catch (err) { failed.push([code, site]); console.error(`${site.name} fehlgeschlagen: ${err.message}`); }
}
// Zweiter Versuch nach einer Pause: nächtliche Netzstörungen dauern oft nur Minuten
if (failed.length) {
  console.log(`${failed.length} Gemeinden fehlgeschlagen, neuer Versuch in 3 Minuten`);
  await sleep(180000);
  for (const [code, site] of failed) {
    try { await runSite(code, site); }
    catch (err) {
      // Fällt eine Gemeinde aus, bleiben ihre bisherigen Events stehen.
      const old = previous.events.filter(e => (site.quelle ? e.q === code : e.gemeinden[0] === code && !e.q) && e.bis >= today);
      events.push(...old);
      st(code, site)[code] = { name: site.name, bezirk: site.bezirk, domain: site.domain, ok: false, count: old.length };
      console.error(`${site.name} auch im zweiten Versuch fehlgeschlagen: ${err.message}`);
    }
  }
}

if (ONLY) {
  const mine = Object.fromEntries(Object.entries(cache).filter(([k]) => sites[k.split(":")[0]]));
  await writeFile(path(cacheFile), JSON.stringify(mine) + "\n");
  const { mkdir } = await import("node:fs/promises"); await mkdir(path("data/parts/"), { recursive: true });
  await writeFile(path(`data/parts/${slug(ONLY)}.json`), JSON.stringify({ bezirk: ONLY, status, quellen, events }) + "\n");
  console.log(`Bezirk ${ONLY}: ${events.length} Anlässe aus ${Object.keys(sites).length} Gemeinden`);
  process.exit(0);
}
await writeFile(path(cacheFile), JSON.stringify(cache) + "\n");
if (!Object.values(status).some(s => s.ok) && !Object.values(quellen).some(s => s.ok)) {
  console.error("Keine Gemeinde erreichbar, die bisherigen Daten bleiben bestehen.");
  process.exit(1);
}
const merged = merge(events);
const out = JSON.stringify({ stand: today, gemeinden: status, quellen, events: merged }, null, 1);
await writeFile(path("site/events.json"), out + "\n");
await writeFile(path("site/events.js"), "window.FAMILIENAGENDA = " + out + ";\n");
console.log(`Fertig: ${merged.length} Anlässe`);
