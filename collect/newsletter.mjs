// Stellt die Wochenend-Tipps zusammen: site/newsletter/<datum>.html, index.html und feed.xml (RSS).
// Der RSS-Feed kann von einem Newsletter-Dienst (RSS-to-Email) automatisch verschickt werden.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";

const BASE = "https://epperttobias-sys.github.io/fuer-familien-in-zuerich/";
const DIR = "site/newsletter";
const data = JSON.parse(await readFile("site/events.json", "utf8"));
const G = data.gemeinden || {};
const plusSrc = await readFile("site/ausflug-plus.js", "utf8").catch(() => "");
const PLUS = (() => { try { return JSON.parse(plusSrc.slice(plusSrc.indexOf("["), plusSrc.lastIndexOf("]") + 1)); } catch { return []; } })();

// Zeit in Zürich
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const wd = now.getDay(); // 0 So … 6 Sa
const fri = wd === 0 ? add(now, -2) : wd === 6 ? add(now, -1) : add(now, 5 - wd);
const DAYS = [0, 1, 2].map(i => iso(add(fri, i)));
const [FR, SA, SO] = DAYS;

const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], MON = ["Jan.", "Feb.", "März", "April", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
const dOf = s => new Date(s + "T12:00:00");
const fmtDay = s => { const d = dOf(s); return WT[d.getDay()] + " " + d.getDate() + ". " + MON[d.getMonth()]; };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const HI = /m[äa]r[kt]t?\b|märt|weihnachtsmarkt|chilbi|zirkus|circus|fest\b|festival|advent|samichlaus|chlaus|weihnacht|theater|kasperli|märchen|figuren|puppen|konzert|kino|zauber|laterne|räbe|kerzenziehen|eisbahn|bauernhof|hof\b|tier|basteln|guetzli|lebkuchen|kranz|lichter|fackel|schlitt|fasnacht|oster|kürbis|halloween|spielfest|familientag|kinderfest|führung|workshop/i;
const NO = /kurs\b|kurse\b|anmeld|treff\b|elki|eltern-kind-treff|spielgruppe|krabbel|training|probe\b|lektion|sprechstunde|beratung|gottesdienst|\bmesse\b|abonnement|20\d\d\/20\d\d|ausstellung|öffnungszeit|geöffnet|ludothek|bibliothek|deutsch|yoga|turnen\b|mutter.?kind|vater.?kind|sitzung|versammlung|ausgebucht|abgesagt|fällt aus|verschoben|mami|papi|kurs:/i;
const CHURCH = /kommunion|eucharist|andacht|gottesdienst|feier\b|fiire|liturgie|predigt/i;

const gOf = e => G[e.gemeinden?.[0]] || {};
const span = e => (dOf(e.bis) - dOf(e.von)) / 864e5;
const cand = (data.events || [])
  .filter(e => e.von <= SO && e.bis >= FR && !NO.test(e.name) && gOf(e).name)
  .map(e => {
    let s = 0;
    if (HI.test(e.name)) s += 3;
    if (e.q) s += 2;
    if (e.age) s += 1;
    if (e.time) s += 1;
    if (span(e) > 3) s -= 3;
    if (CHURCH.test(e.name)) s -= 2;
    return { e, s, day: DAYS.find(d => d >= e.von && d <= e.bis), bez: gOf(e).bezirk || "Weitere", gem: gOf(e).name };
  })
  .filter(x => x.s >= 2);

// Doppelte Titel (gleicher Name, gleicher Tag) nur einmal
const seen = new Set();
const uniq = cand.sort((a, b) => b.s - a.s).filter(x => { const k = x.e.name.toLowerCase().replace(/\W+/g, "") + x.day; if (seen.has(k)) return false; seen.add(k); return true; });

const single = uniq.filter(x => span(x.e) <= 3);
const longRun = uniq.filter(x => span(x.e) > 3 && HI.test(x.e.name)).slice(0, 6);

// Highlights: die besten, höchstens 2 pro Bezirk
const top = [], perB = {};
for (const x of single) { if (top.length >= 8) break; if ((perB[x.bez] = (perB[x.bez] || 0) + 1) <= 2) top.push(x); }
const topSet = new Set(top);
const byBez = {};
for (const x of single) if (!topSet.has(x)) (byBez[x.bez] = byBez[x.bez] || []).push(x);
const sortT = (a, b) => (a.day + (a.e.time || "99")).localeCompare(b.day + (b.e.time || "99"), "de", { numeric: true });
Object.values(byBez).forEach(l => { l.sort((a, b) => b.s - a.s); l.splice(6); l.sort(sortT); });
top.sort(sortT);

// Ausflugstipps: wechseln jede Woche, im Winter ohne Selberpflücken
const week = Math.floor((dOf(FR) - new Date("2026-01-02T12:00:00")) / (7 * 864e5));
const m = dOf(FR).getMonth() + 1, winter = m <= 3 || m >= 11;
const SUMMER = /(märz|april|mai)\s*bis\s*(ende\s*)?(sept|okt)|nur im sommer|sommersaison|im winter geschlossen/i;
const pick = k => { const l = PLUS.filter(p => p.k === k && G[p.g] && !(winter && SUMMER.test(p.t))); return l.length ? l[((week % l.length) + l.length) % l.length] : null; };
const tips = [pick("hof"), pick("beiz"), winter ? pick("erlebnis") : pick("pflueck")].filter(Boolean);

// HTML (mit Inline-Styles, damit es auch im E-Mail-Programm gut aussieht)
const C = { ink: "#1f2a37", muted: "#5b6573", line: "#e5e7eb", accent: "#0f6db3", soft: "#eef5fb" };
const link = e => e.w || e.url;
const item = (x, showBez) => {
  const e = x.e, a = e.von > FR ? e.von : FR, z = e.bis < SO ? e.bis : SO, when = (a < z ? fmtDay(a) + " – " + fmtDay(z) : fmtDay(a)) + (e.time ? ", " + e.time.replace(/\s*-\s*/, "–") + " Uhr" : "");
  const meta = [when, x.gem + (showBez ? " (Bezirk " + x.bez + ")" : ""), e.ort && e.ort !== x.gem ? e.ort : "", e.age?.label || ""].filter(Boolean).map(esc).join(" · ");
  return `<li style="margin:0 0 12px;padding:0;list-style:none"><a href="${esc(link(e))}" style="color:${C.accent};font-weight:600;text-decoration:none">${esc(e.name)}</a><br><span style="color:${C.muted};font-size:14px">${meta}</span></li>`;
};
const h2 = t => `<h2 style="font-size:18px;margin:28px 0 10px;color:${C.ink}">${t}</h2>`;
const ul = l => `<ul style="margin:0;padding:0">${l.join("")}</ul>`;
const BEZ = Object.keys(byBez).filter(b => byBez[b].length).sort((a, b) => a.localeCompare(b, "de"));
const title = `Wochenend-Tipps für Familien: ${fmtDay(FR).replace(/^\S+ /, "")} bis ${fmtDay(SO).replace(/^\S+ /, "")}`;
const total = single.length + longRun.length;

const body = `<div style="max-width:640px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${C.ink};line-height:1.45;font-size:16px">
<p style="margin:0 0 4px;color:${C.muted};font-size:14px">Für Familien in Zürich · Wochenend-Tipps</p>
<h1 style="font-size:24px;margin:0 0 12px">${esc(title)}</h1>
<p style="margin:0 0 8px">Hallo! Hier ist eine Auswahl aus ${total} Anlässen für Kinder an diesem Wochenende im Kanton Zürich, von Gemeinden, Höfen, Vereinen und kleinen Anbietern.</p>
${top.length ? h2("⭐ Unsere Highlights") + ul(top.map(x => item(x, true))) : ""}
${longRun.length ? h2("📆 Läuft das ganze Wochenende") + ul(longRun.map(x => item(x, true))) : ""}
${tips.length ? h2("🐄 Ausflugstipps") + ul(tips.map(p => `<li style="margin:0 0 12px;list-style:none"><a href="${esc(p.w || p.q)}" style="color:${C.accent};font-weight:600;text-decoration:none">${esc(p.n)}</a> <span style="color:${C.muted};font-size:14px">· ${esc(G[p.g].name)}</span><br><span style="font-size:15px">${esc(p.t)}</span></li>`)) : ""}
${BEZ.length ? h2("📍 Weitere Anlässe nach Bezirk") + BEZ.map(b => `<h3 style="font-size:15px;margin:18px 0 8px;color:${C.muted};text-transform:uppercase;letter-spacing:.04em">Bezirk ${esc(b)}</h3>` + ul(byBez[b].map(x => item(x, false)))).join("") : ""}
<p style="margin:28px 0 0;padding:14px 16px;background:${C.soft};border-radius:10px">Alle Anlässe, gefiltert nach deiner Gemeinde und dem Alter deiner Kinder, findest du in der App: <a href="${BASE}#events" style="color:${C.accent};font-weight:600">Für Familien in Zürich</a></p>
<p style="margin:16px 0 0;color:${C.muted};font-size:13px">Automatisch zusammengestellt aus den Agenden der Gemeinden und weiteren öffentlichen Quellen. Angaben ohne Gewähr; Zeiten, Preise und Anmeldung bitte beim Anlass prüfen.</p>
</div>`;

const page = (t, inner, extra = "") => `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title><link rel="alternate" type="application/rss+xml" title="Wochenend-Tipps" href="feed.xml">
<meta name="description" content="Wochenend-Tipps für Familien im Kanton Zürich: Anlässe für Kinder, Höfe und Ausflugsziele.">
</head><body style="margin:0;padding:20px 14px;background:#fff">${inner}${extra}</body></html>
`;

await mkdir(DIR, { recursive: true });
await writeFile(`${DIR}/${FR}.html`, page(title, body));

// Archiv und Feed
const issues = (await readdir(DIR)).filter(f => /^\d{4}-\d\d-\d\d\.html$/.test(f)).sort().reverse();
const nav = `<div style="max-width:640px;margin:36px auto 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${C.ink};border-top:1px solid ${C.line};padding-top:16px">
<h2 style="font-size:17px;margin:0 0 8px">📬 Jede Woche per E-Mail</h2>
<p style="margin:0 0 16px;font-size:15px" id="nl-signup">Die Anmeldung für den Newsletter folgt bald. Bis dahin erscheinen die Tipps jeden Donnerstag hier. Du kannst diese Seite als Lesezeichen speichern oder den <a href="feed.xml" style="color:${C.accent}">RSS-Feed</a> abonnieren.</p>
<h2 style="font-size:17px;margin:0 0 8px">Frühere Ausgaben</h2>
<ul style="margin:0;padding-left:18px;font-size:15px">${issues.slice(0, 20).map(f => `<li><a href="${f}" style="color:${C.accent}">Wochenende ab ${esc(fmtDay(f.slice(0, 10)))} ${f.slice(0, 4)}</a></li>`).join("")}</ul>
<p style="margin:16px 0 0;font-size:14px"><a href="../" style="color:${C.accent}">← Zur App «Für Familien in Zürich»</a></p></div>`;
await writeFile(`${DIR}/index.html`, page(title, body, nav));

const rfc = s => new Date(s + "T07:00:00+01:00").toUTCString();
const items = [];
for (const f of issues.slice(0, 8)) {
  const html = await readFile(`${DIR}/${f}`, "utf8");
  const t = (html.match(/<title>([^<]*)<\/title>/) || [, "Wochenend-Tipps"])[1];
  const inner = html.slice(html.indexOf("<body"), html.lastIndexOf("</body>")).replace(/^<body[^>]*>/, "");
  items.push(`<item><title>${t}</title><link>${BASE}newsletter/${f}</link><guid isPermaLink="true">${BASE}newsletter/${f}</guid><pubDate>${rfc(f.slice(0, 10))}</pubDate><description><![CDATA[${inner.replace(/]]>/g, "]]&gt;")}]]></description></item>`);
}
await writeFile(`${DIR}/feed.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Für Familien in Zürich: Wochenend-Tipps</title><link>${BASE}newsletter/</link>
<description>Jeden Donnerstag die besten Anlässe für Kinder am Wochenende im Kanton Zürich.</description><language>de-ch</language>
${items.join("\n")}
</channel></rss>
`);
console.log(`Newsletter ${FR}: ${top.length} Highlights, ${longRun.length} lang, ${BEZ.length} Bezirke, ${tips.length} Ausflugstipps, ${total} Kandidaten`);
