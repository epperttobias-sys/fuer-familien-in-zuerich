// Schnell-Lauf: Ergebnis einzelner Quellen (data/parts/quellen.json) in die bestehende site/events.json einsetzen,
// ohne den ganzen nächtlichen Lauf abzuwarten.
import { readFile, writeFile } from "node:fs/promises";
import { merge } from "./lib.mjs";
const j = async p => JSON.parse(await readFile(new URL("../" + p, import.meta.url), "utf8"));
const part = await j("data/parts/quellen.json"), cur = await j("site/events.json");
const codes = new Set(Object.keys(part.quellen || {}));
const keep = cur.events.filter(e => !codes.has(e.q));
const events = merge([...keep, ...part.events]);
const out = JSON.stringify({ ...cur, quellen: { ...(cur.quellen || {}), ...part.quellen }, events }, null, 1);
await writeFile(new URL("../site/events.json", import.meta.url), out + "\n");
await writeFile(new URL("../site/events.js", import.meta.url), "window.FAMILIENAGENDA = " + out + ";\n");
console.log(`Quellen ${[...codes].join(", ")}: ${part.events.length} Anlässe eingesetzt, total ${events.length}`);
