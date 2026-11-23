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

// HTML im Stil der App; Tabellen und Inline-Styles, damit es auch im E-Mail-Programm gut aussieht
const C = { ink: "#0d2340", muted: "#4f6684", line: "#cfdcee", accent: "#0a5cb8", soft: "#dfeafa", bg: "#f1f6fc", sun: "#ffc93c", sunInk: "#4a3500", warm: "#fff4d6" };
const FONT = "Figtree,'Segoe UI',-apple-system,Roboto,Helvetica,Arial,sans-serif", DISP = "'Bricolage Grotesque','Trebuchet MS',Figtree,Arial,sans-serif";
const link = e => e.w || e.url;
const ICONS = [[/samichlaus|chlaus|nikolaus/i, "🎅"], [/kerzen/i, "🕯️"], [/advent|weihnacht|krippe|lichter|illumination|stern/i, "🎄"], [/m[äa]rt|markt/i, "🎪"], [/zirkus|circus/i, "🎪"], [/theater|kasperli|figuren|puppen|märchen|zauber/i, "🎭"], [/kino|film/i, "🎬"], [/konzert|musik|sing/i, "🎵"], [/tier|hof|alpaka|pony|ziege/i, "🐄"], [/bastel|workshop|werkstatt|kranz|guetzli|lebkuchen/i, "✂️"], [/eis|schlitt|schnee/i, "⛸️"], [/fest|chilbi|fasnacht/i, "🎉"], [/führung|museum|ausstellung/i, "🏛️"], [/geschichte|buch|bibliothek|lesen/i, "📚"]];
const icon = n => (ICONS.find(([re]) => re.test(n)) || [, "✨"])[1];
const KI = { hof: "🐄", beiz: "🥨", pflueck: "🍓", erlebnis: "🌲" };
const WTL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"], MONL = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const longDay = s => { const d = dOf(s); return WTL[d.getDay()] + ", " + d.getDate() + ". " + MONL[d.getMonth()]; };
const timeOf = e => e.time ? e.time.replace(/\s*-\s*/, "–") + " Uhr" : "";
const whenOf = e => { const a = e.von > FR ? e.von : FR, z = e.bis < SO ? e.bis : SO; return a < z ? fmtDay(a) + " – " + fmtDay(z) : fmtDay(a); };
const pill = (t, bg = C.soft, fg = C.accent) => `<span style="display:inline-block;background:${bg};color:${fg};font-size:12px;font-weight:700;border-radius:999px;padding:3px 9px;margin:6px 4px 0 0">${esc(t)}</span>`;
const badge = (txt, bg = C.soft) => `<td width="52" valign="top" style="width:52px;padding:0 14px 0 0"><div style="width:48px;height:48px;line-height:48px;border-radius:14px;background:${bg};text-align:center;font-size:24px">${txt}</div></td>`;
const card = (x, { showDay = false } = {}) => {
  const e = x.e, place = [x.gem, e.ort && e.ort !== x.gem ? e.ort : ""].filter(Boolean).join(" · ");
  const top = [showDay ? whenOf(e) : "", timeOf(e)].filter(Boolean).join(", ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:18px;margin:0 0 10px;box-shadow:0 2px 10px rgba(13,35,64,.06)"><tr><td style="padding:14px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${badge(icon(e.name))}
<td valign="top">${top ? `<div style="font-size:13px;font-weight:700;color:${C.accent};margin:0 0 2px">${esc(top)}</div>` : ""}<a href="${esc(link(e))}" style="font-family:${DISP};font-size:17px;line-height:1.25;font-weight:800;color:${C.ink};text-decoration:none">${esc(e.name)}</a>
<div style="font-size:14px;color:${C.muted};margin-top:3px">📍 ${esc(place)}</div>${e.age?.label ? pill("🧒 " + e.age.label) : ""}</td></tr></table></td></tr></table>`;
};
const secHead = (t, sub = "") => `<h2 style="font-family:${DISP};font-size:21px;line-height:1.2;margin:30px 0 ${sub ? 2 : 12}px;color:${C.ink}">${t}</h2>${sub ? `<p style="margin:0 0 12px;color:${C.muted};font-size:14px">${sub}</p>` : ""}`;
const dayHead = s => `<div style="margin:16px 0 8px"><span style="display:inline-block;background:${C.accent};color:#fff;font-weight:800;font-size:13px;border-radius:999px;padding:5px 12px">${esc(longDay(s))}</span></div>`;
const BEZ = Object.keys(byBez).filter(b => byBez[b].length).sort((a, b) => a.localeCompare(b, "de"));
const title = `Wochenend-Tipps für Familien: ${fmtDay(FR).replace(/^\S+ /, "")} bis ${fmtDay(SO).replace(/^\S+ /, "")}`;
const total = single.length + longRun.length;
const sameMonth = dOf(FR).getMonth() === dOf(SO).getMonth();
const range = sameMonth ? `${dOf(FR).getDate()}.–${dOf(SO).getDate()}. ${MONL[dOf(SO).getMonth()]}` : `${dOf(FR).getDate()}. ${MONL[dOf(FR).getMonth()]} – ${dOf(SO).getDate()}. ${MONL[dOf(SO).getMonth()]}`;

const header = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:24px;background:${C.accent};background-image:linear-gradient(135deg,#0a5cb8 0%,#2f7fd8 60%,#5aa2ec 100%)"><tr><td style="padding:24px 22px 22px;color:#fff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top" style="color:#fff"><div style="font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;opacity:.85">Für Familien in Zürich · Wochenend-Tipps</div>
<div style="font-family:${DISP};font-size:30px;line-height:1.1;font-weight:800;margin:8px 0 8px">Euer Wochenende<br>${esc(range)}</div></td>
<td width="56" valign="top" align="right"><div style="width:48px;height:48px;border-radius:50%;background:${C.sun};box-shadow:0 0 0 8px rgba(255,201,60,.28)"></div></td></tr></table>
<div style="font-size:15px;line-height:1.45;opacity:.95;margin:0 0 14px">Hallo! Wir haben ${total} Anlässe für Kinder im ganzen Kanton gefunden, von Gemeinden, Höfen, Vereinen und kleinen Anbietern. Hier sind unsere Tipps.</div>
${DAYS.map(d => `<span style="display:inline-block;background:rgba(255,255,255,.18);color:#fff;font-weight:700;font-size:13px;border-radius:999px;padding:5px 11px;margin:0 6px 6px 0">${esc(fmtDay(d))}</span>`).join("")}
</td></tr></table>`;

const hiByDay = DAYS.map(d => [d, top.filter(x => x.day === d)]).filter(([, l]) => l.length);
const tipCard = p => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.warm};border-radius:18px;margin:0 0 10px"><tr><td style="padding:14px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${badge(KI[p.k] || "🌳", "#ffe7a3")}
<td valign="top"><a href="${esc(p.w || p.q)}" style="font-family:${DISP};font-size:17px;font-weight:800;color:${C.ink};text-decoration:none">${esc(p.n)}</a><div style="font-size:13px;font-weight:700;color:#8a6200;margin:2px 0 4px">📍 ${esc(G[p.g].name)}</div>
<div style="font-size:14px;line-height:1.45;color:${C.ink}">${esc(p.t)}</div></td></tr></table></td></tr></table>`;
const bezCard = b => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:18px;margin:0 0 10px;box-shadow:0 2px 10px rgba(13,35,64,.06)"><tr><td style="padding:14px 16px 6px">
<div style="font-family:${DISP};font-size:16px;font-weight:800;color:${C.accent};margin:0 0 6px">Bezirk ${esc(b)}</div>
${byBez[b].map(x => `<div style="padding:8px 0;border-top:1px solid #eef3fa"><a href="${esc(link(x.e))}" style="font-weight:700;color:${C.ink};text-decoration:none;font-size:15px">${icon(x.e.name)} ${esc(x.e.name)}</a><div style="font-size:13px;color:${C.muted};margin-top:2px">${esc([whenOf(x.e), timeOf(x.e), x.gem].filter(Boolean).join(" · "))}</div></div>`).join("")}
</td></tr></table>`;

const body = `<div style="max-width:620px;margin:0 auto;font-family:${FONT};color:${C.ink};line-height:1.45;font-size:16px">
${header}
${hiByDay.length ? secHead("⭐ Unsere Highlights", "Die schönsten Anlässe aus verschiedenen Bezirken") + hiByDay.map(([d, l]) => dayHead(d) + l.map(x => card(x)).join("")).join("") : ""}
${longRun.length ? secHead("📆 Das ganze Wochenende", "Mehrmals geöffnet oder über mehrere Tage") + longRun.map(x => card(x, { showDay: true })).join("") : ""}
${tips.length ? secHead("🧺 Ausflugstipps der Woche", "Höfe, Ausflugsbeizen und Orte zum Entdecken") + tips.map(tipCard).join("") : ""}
${BEZ.length ? secHead("📍 Mehr in deiner Region") + BEZ.map(bezCard).join("") : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;background:${C.soft};border-radius:20px"><tr><td style="padding:20px;text-align:center">
<div style="font-family:${DISP};font-size:18px;font-weight:800;margin:0 0 6px">Noch mehr entdecken</div>
<div style="font-size:14px;color:${C.muted};margin:0 0 14px">Alle Anlässe, gefiltert nach deiner Gemeinde und dem Alter deiner Kinder. Mit dem Herz merken und mit der Familie teilen.</div>
<a href="${BASE}#events" style="display:inline-block;background:${C.sun};color:${C.sunInk};font-weight:800;text-decoration:none;border-radius:14px;padding:13px 22px">Zur App «Für Familien in Zürich»</a>
</td></tr></table>
<p style="margin:18px 6px 0;color:${C.muted};font-size:12px;line-height:1.5;text-align:center">Automatisch zusammengestellt aus den Agenden der Gemeinden und weiteren öffentlichen Quellen. Angaben ohne Gewähr; Zeiten, Preise und Anmeldung bitte beim Anlass prüfen.</p>
</div>`;

const page = (t, inner, extra = "") => `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title><link rel="alternate" type="application/rss+xml" title="Wochenend-Tipps" href="feed.xml">
<meta name="description" content="Wochenend-Tipps für Familien im Kanton Zürich: Anlässe für Kinder, Höfe und Ausflugsziele.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Figtree:wght@400;700;800&display=swap" rel="stylesheet">
</head><body style="margin:0;padding:18px 12px 30px;background:${C.bg}">${inner}${extra}</body></html>
`;

await mkdir(DIR, { recursive: true });
await writeFile(`${DIR}/${FR}.html`, page(title, body));

// Archiv und Feed
const issues = (await readdir(DIR)).filter(f => /^\d{4}-\d\d-\d\d\.html$/.test(f)).sort().reverse();
const nav = `<div style="max-width:620px;margin:24px auto 0;font-family:${FONT};color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;box-shadow:0 2px 10px rgba(13,35,64,.06)"><tr><td style="padding:20px">
<div style="font-family:${DISP};font-size:18px;font-weight:800;margin:0 0 6px">📬 Jeden Donnerstag per E-Mail</div>
<p style="margin:0;font-size:14px;color:${C.muted}" id="nl-signup">Die Anmeldung folgt bald. Bis dahin erscheinen die Tipps jeden Donnerstag hier. Speichere die Seite als Lesezeichen oder abonniere den <a href="feed.xml" style="color:${C.accent};font-weight:700">RSS-Feed</a>.</p>
</td></tr></table>
<div style="font-family:${DISP};font-size:17px;font-weight:800;margin:22px 4px 8px">Frühere Ausgaben</div>
${issues.slice(0, 20).map(f => `<a href="${f}" style="display:inline-block;background:#fff;color:${C.accent};font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;padding:7px 13px;margin:0 6px 8px 0;box-shadow:0 1px 4px rgba(13,35,64,.08)">Ab ${esc(fmtDay(f.slice(0, 10)))}</a>`).join("")}
<p style="margin:14px 4px 0;font-size:14px"><a href="../" style="color:${C.accent};font-weight:700;text-decoration:none">← Zur App «Für Familien in Zürich»</a></p></div>`;
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
