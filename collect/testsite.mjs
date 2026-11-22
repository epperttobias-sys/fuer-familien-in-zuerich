// Hilfsmittel: liest die Gemeinden aus data/test-sites.json wie der nächtliche Lauf und zeigt das Ergebnis im Log.
import { readFileSync } from "node:fs";
import { SYSTEMS, collectSite, setGemeindeIndex } from "./lib.mjs";
setGemeindeIndex(JSON.parse(readFileSync("site/gemeinden.js", "utf8").replace(/^[^=]*=\s*/, "").replace(/;\s*$/, "")));
const sites = JSON.parse(readFileSync("data/test-sites.json", "utf8"));
const fetchText = async u => { const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (compatible; FamilienZuerichBot/1.0; +https://epperttobias-sys.github.io/fuer-familien-in-zuerich/)", "Accept-Language": "de-CH,de;q=0.9" }, signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(r.status + " " + u); return r.text(); };
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
for (const [code, site] of Object.entries(sites)) {
  console.log("\n######", site.name);
  try {
    const raw = await SYSTEMS[site.system](site, fetchText, {}, code);
    console.log("roh:", raw.length, "ab heute:", raw.filter(e => e.bis >= today).length); raw.sort((a, b) => (a.von < today) - (b.von < today) || a.von.localeCompare(b.von)); raw.slice(0, 12).forEach(e => console.log("  ", e.von, e.bis, e.time, "|", e.name, "|", e.url));
    const r = await collectSite(code, site, { fetchText, cache: {}, today, wait: () => new Promise(r => setTimeout(r, 700)) });
    console.log("Kinder:", r.events.length); r.events.slice(0, 60).forEach(e => console.log("  K", e.von, e.time, "|", e.gemeinden.join(","), "|", e.name, "|", e.ort, "|", JSON.stringify(e.age)));
    const byG = {}; r.events.forEach(e => byG[e.gemeinden[0]] = (byG[e.gemeinden[0]] || 0) + 1); console.log("Gemeinden:", Object.keys(byG).length, JSON.stringify(byG));
  } catch (e) { console.log("FEHLER", e.message); }
}
