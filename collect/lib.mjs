// Reine Logik ohne Netzwerk: Seiten lesen, Kinder-Events erkennen, Alter und Zeit herausfinden.
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ss", laquo: "«", raquo: "»", ndash: "–", mdash: "–", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", rsquo: "’", hellip: "…" };

export function decode(s) {
  return String(s ?? "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, c) => {
    if (c[0] === "#") {
      const n = c[1].toLowerCase() === "x" ? parseInt(c.slice(2), 16) : parseInt(c.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED[c] ?? m;
  });
}

export function strip(html) {
  return decode(String(html ?? "").replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

export function listFromHtml(html) {
  const m = html.match(/data-entities="([^"]*)"/);
  if (!m) throw new Error("Keine Eventliste im Seitencode gefunden");
  return JSON.parse(decode(m[1])).data;
}

const ADMIN = /gemeinderatssitzung|gemeindeversammlung|urnengang|kartonsammlung|papiersammlung|häckseldienst|sonderabfall|christbaumsammlung|elternabend|elternbildung|femmes-tische|deutschkurs|spielgruppe|yoga|senior|mittagstisch|gottesdienst für erwachsene/i;
const KIDS_NAME = /kinder|chind|famili|eltern-?kind|vater-kind|gschicht|märli|maerli|samichlaus|kerzenzieh|krabbel|chrabbel|fiire mit|zirkus|circus|räbe|puppentheater|kasperli|buchstart|storytime|kamishibai|vorläse|värsli|kreativraum|fasnacht|weihnachtsmärt|christchindli|\bkind\b|elki|knirps|bastel/i;
const KIDS_TEXT = /hauptzielgruppe:\s*(familien|kleinkinder|kinder)|für (die )?(kinder|familien|klein und gross|gross und klein)|kinder (sind )?willkommen|für kinder empfehlenswert|kategorie:?\s*(kinder|famili)/i;
export const KIDS_CATEGORIES = new Set(["14", "18"]);
const SKIP_CATEGORIES = new Set(["7", "19"]);
const MAX_DAYS = 60;
const LATE_HOUR = 20; // Später beginnt kein Anlass für Kinder, ausser die Kategorie oder der Titel sagt es.
const HORIZON_DAYS = 365;

const day = s => Date.parse(s + "T00:00:00Z") / 864e5;

export function normalizeRow(row) {
  const name = strip(row.name);
  return {
    id: String(row.id), name, von: row._datumVon, bis: row._datumBis || row._datumVon,
    ort: strip(row.lokalitaet), veranstalter: strip(row.organisator),
    kategorie: String(row._hauptkategorieId ?? ""), datumText: strip(row._anlassDate),
  };
}

// Lohnt sich die Detailseite? Sitzungen, Abfalltermine und laufende Kurse fallen hier weg.
export function isCandidate(ev, today) {
  if (!ev.von || ev.bis < today) return false;
  if (day(ev.von) - day(today) > HORIZON_DAYS) return false;
  if (day(ev.bis) - day(ev.von) > (ev.long ? 120 : MAX_DAYS)) return false;
  if (SKIP_CATEGORIES.has(ev.kategorie) && !KIDS_NAME.test(ev.name)) return false;
  return !ADMIN.test(ev.name) || KIDS_NAME.test(ev.name);
}

export function detailText(html, name) {
  const mainAt = html.search(/<main[\s>]/i);
  const body = html.slice(Math.max(0, mainAt >= 0 ? mainAt : html.search(/<body[\s>]/i)));
  let t = strip(body);
  const toc = t.lastIndexOf("Inhaltsverzeichnis");
  const from = toc >= 0 ? toc + 18 : 0;
  const at = t.indexOf(name, from);
  t = t.slice(at >= 0 ? at : from);
  const end = t.search(/Fussbereich|Zur Übersicht|Webstatistik/);
  return (end > 0 ? t.slice(0, end) : t).slice(0, 4000);
}

// Link zum Veranstalter auf der Detailseite (externe Website, keine Gemeinde-, Karten- oder Social-Links)
const LINK_NO = /facebook|instagram|twitter|x\.com|linkedin|youtube|whatsapp|tiktok|google\.|goo\.gl|maps\.|geoweb|baustelle|apple\.com|geo\.admin|map\.geo|swisstopo|sbb\.ch|search\.ch|local\.ch|i-web|iweb|cmi-|cookiebot|matomo|\.pdf($|\?)|mailto:|tel:|javascript:/i;
export function detailLink(html, domain) {
  const mainAt = html.search(/<main[\s>]/i);
  let body = html.slice(Math.max(0, mainAt >= 0 ? mainAt : html.search(/<body[\s>]/i)));
  const cut = body.search(/<footer[\s>]|Fussbereich|<\/main>/i); if (cut > 0) body = body.slice(0, cut);
  const host = (domain || "").replace(/^www\./, "").split("/")[0];
  const cands = [];
  for (const m of body.matchAll(/<a\b[^>]*href="(https?:\/\/[^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const u = decode(m[1]), t = strip(m[2]);
    let h; try { h = new URL(u).host.replace(/^www\./, ""); } catch { continue; }
    if (LINK_NO.test(u) || (host && (h === host || h.endsWith("." + host)))) continue;
    cands.push({ u, score: /website|webseite|homepage|www\.|weitere inf|mehr inf|anmeld|tickets?|programm|link/i.test(t) ? 2 : 1 });
  }
  cands.sort((a, b) => b.score - a.score);
  return cands[0] ? cands[0].u : "";
}

export function parseTime(text) {
  const m = text.match(/\d{4}\s*,\s*(\d{1,2})[.:](\d{2})(?:\s*Uhr)?(?:\s*(?:-|–|bis)\s*(\d{1,2})[.:](\d{2}))?/);
  if (!m) return "";
  return m[3] ? `${m[1]}.${m[2]} - ${m[3]}.${m[4]}` : `${m[1]}.${m[2]}`;
}

const WORDS = { ein: 1, eins: 1, einem: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12 };
const N = "(\\d{1,2}|ein|eins|einem|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)";
const num = s => (/\d/.test(s) ? Number(s) : WORDS[s.toLowerCase()]);
const age = (min, max, label) => ({ min, max: Math.min(max, 12), label });

export function parseAge(text) {
  let m;
  if ((m = text.match(new RegExp(`${N}\\s*Monate?n?\\s*(?:bis|und|-|–)\\s*(?:zu\\s*)?${N}\\s*Jahre?n?`, "i"))))
    return age(0, num(m[2]), `${num(m[1])} Monate bis ${num(m[2])} Jahre`);
  if ((m = text.match(new RegExp(`${N}\\s*(?:bis\\s*(?:ca\\.\\s*)?|-\\s*|–\\s*|und\\s*)(\\d{1,3}|${N.slice(1, -1)})\\s*-?\\s*(?:Jahre?n?|J\\.|jährig)`, "i")))) {
    const a = num(m[1]), b = num(m[2]);
    if (a <= 16 && b > a) return b > 18 ? age(a, 12, `ab ${a} Jahren`) : a > 12 ? null : age(a, b, `${a} bis ${b} Jahre`);
  }
  if ((m = text.match(new RegExp(`\\bab\\s*(?:ca\\.\\s*)?${N}\\s*Jahre?n?`, "i")))) {
    const a = num(m[1]);
    if (a <= 12) {
      const cap = text.match(/bis ca\.\s*(\d{1,2})\s*Jahre/i);
      return cap && Number(cap[1]) > a ? age(a, Number(cap[1]), `${a} bis ca. ${cap[1]} Jahre`) : age(a, 12, `ab ${a} Jahren`);
    }
    return null;
  }
  if ((m = text.match(new RegExp(`für\\s+${N}\\s*-?\\s*jährige`, "i")))) return age(num(m[1]), num(m[1]), `${num(m[1])} Jahre`);
  if (/Kindergarten bis (zur )?2\. Klasse/i.test(text)) return age(4, 8, "Kindergarten bis 2. Klasse");
  if (/Kindergartenalter|Kindergartenkinder/i.test(text)) return age(4, 6, "Kindergarten");
  if (/(für|mit|Ihren) Kleinkinder/i.test(text)) return age(0, 3, "Kleinkinder");
  return null;
}

// Alter aus dem Titel, auch ohne Jahreszahl (Baby, ElKi, Familie, Schulstufe). Gilt nur für den Titel, nicht für die Detailseite.
export function nameAge(name) {
  let m;
  const n = name.replace(/(\d)\s*-\s*(bis|und)\b/gi, "$1 $2");
  if ((m = n.match(/(\d{1,2})\s*(?:bis|und|-|–)\s*(\d{1,2})\s*-?\s*jährige/i))) { const a = +m[1], b = +m[2]; if (b > a && a <= 12) return age(a, b, `${a} bis ${b} Jahre`); }
  const strict = parseAge(n); if (strict) return strict;
  if ((m = n.match(/\b(?:ab|ab der)\s*(\d)\.\s*Klasse/i))) return age(+m[1] + 5, 12, `ab ${m[1]}. Klasse`);
  if ((m = n.match(/(\d)\.\s*(?:bis|-|–)\s*(\d)\.\s*Klasse/i))) return age(+m[1] + 5, +m[2] + 6, `${m[1]}. bis ${m[2]}. Klasse`);
  if ((m = n.match(/bis\s*(?:zur\s*)?(\d)\.\s*Klasse/i))) return age(0, +m[1] + 6, `bis ${m[1]}. Klasse`);
  if (/\b(baby|babys|säugling|krabbel|chrabbel|babymassage)/i.test(n)) return age(0, 2, "Babys");
  if (/\b(elki|eltern-?kind|elternkind|mami\s*&\s*kind|mutter-?kind|vater-?kind|papi-?kind|müttertreff|kleinkind|chliichind|mit de chliine?s?c?h?t?e?|für die (kleinsten|kleinen)|knirps|zwerge)/i.test(n)) return age(0, 4, "Kleinkinder mit Eltern");
  if (/\bbuchstart\b|miniclub|purzel|häsli\s*-?turn|muki|vaki|eki\b|krabbel/i.test(n)) return age(0, 4, "Kleinkinder mit Eltern");
  if (/bücherzwerg|gschicht\w*[- ]?(zyt|ziit|zit)|geschichten(zeit|kiste|stunde)|erzählstunde|värslichiste|versli/i.test(n)) return age(2, 6, "Kleinkinder und Kindergarten");
  if (/open\s*sunday|kinderkino|kinderdisco|kinderfasnacht|kindermaskenball|kinderzirkus|kinderflohmi|kindertheater|kinderkonzert/i.test(n)) return age(4, 12, "Kinder");
  if (/midnight\s*sports|teenager|teens?\b|jugenddisco|jugendtreff|ab\s*12\b|oberstufe|sekundarschul/i.test(n)) return age(12, 17, "Jugendliche");
  if (/vorschul/i.test(n)) return age(4, 6, "Vorschulalter");
  if (/unterstufe/i.test(n)) return age(6, 9, "Unterstufe");
  if (/mittelstuf/i.test(n)) return age(9, 12, "Mittelstufe");
  if (/primarschul|schulpflichtig|schulkinder/i.test(n)) return age(6, 12, "Primarschulalter");
  if (/famili|gross und klein|klein und gross|jung und alt|generationen/i.test(n)) return age(0, 12, "Familien, alle Alter");
  return null;
}
// Nicht für Kinder, auch wenn ein Kinder-Wort vorkommt
export const ADULT_ONLY = /ü\s?18|\b18\+|für erwachsene\b|nur für erwachsene|für senior|senioren|seniorinnen|männerabend|frauenabend|väter-?\/?männerabend|preisjass|jassturnier|apéro\b(?!.*kind)|gemeindeversammlung|infoabend für eltern|elternabend|elternbildung|elternworkshop|eltern begleiten|schulsystem/i;

// Liest ein Event samt Detailseite aus. text ist der Inhalt der Detailseite.
export function classify(ev, text) {
  const ageInfo = parseAge(ev.name) ?? parseAge(text);
  const time = parseTime(text);
  const late = parseInt(time, 10) >= LATE_HOUR;
  const kids = KIDS_CATEGORIES.has(ev.kategorie) || KIDS_NAME.test(ev.name) || (!late && (KIDS_TEXT.test(text) || ageInfo !== null));
  return { kids, time, age: ageInfo };
}

const norm = s => s.toLowerCase().replace(/[^a-zäöü0-9]/g, "");

// Dieselbe Veranstaltung steht oft mehrfach: pro Gemeinde doppelt oder in mehreren Agenden.
export function merge(events) {
  const out = [], bySite = new Map(), across = new Map();
  for (const e of [...events].sort((a, b) => a.id.localeCompare(b.id))) {
    const site = `${e.gemeinden[0]}|${e.von}|${norm(e.name).slice(0, 12)}`;
    const wide = `${e.von}|${norm(e.name)}|${norm(e.ort)}`;
    const twin = bySite.get(site) ?? across.get(wide);
    if (twin) {
      for (const g of e.gemeinden) if (!twin.gemeinden.includes(g)) twin.gemeinden.push(g);
      twin.time ||= e.time;
      twin.age ??= e.age;
      continue;
    }
    bySite.set(site, e); across.set(wide, e); out.push(e);
  }
  return out.sort((a, b) => a.von.localeCompare(b.von) || a.name.localeCompare(b.name, "de"));
}

// ---------- Datumsangaben auf Deutsch ----------
const MONTHS = { jan: 1, feb: 2, mär: 3, mae: 3, mar: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dez: 12 };
const monthOf = w => MONTHS[String(w).toLowerCase().slice(0, 3)] ?? null;
const pad = n => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y < 100 ? 2000 + Number(y) : y}-${pad(m)}-${pad(d)}`;
const MW = "([A-Za-zÄäÖöÜü]{3,9})\\.?";

// Liest «8. Nov. 2026», «7. – 8. Nov. 2026», «23.10. – 8.11.2026», «9. November 2026, 14:00 Uhr – 13. November 2026».
export function parseDateRange(text) {
  let m;
  if ((m = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})?\s*[–-]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/))) {
    const y2 = Number(m[6]), y1 = m[3] ? Number(m[3]) : Number(m[2]) > Number(m[5]) ? y2 - 1 : y2;
    return { von: ymd(y1, m[2], m[1]), bis: ymd(y2, m[5], m[4]) };
  }
  if ((m = text.match(new RegExp(`(\\d{1,2})\\.\\s*${MW}\\s*(\\d{4}|\\d{2})?[^–]{0,40}[–]\\s*(\\d{1,2})\\.\\s*${MW}\\s*(\\d{4}|\\d{2})`))) && monthOf(m[2]) && monthOf(m[5])) {
    const y2 = Number(m[6]), y1 = m[3] ? Number(m[3]) : monthOf(m[2]) > monthOf(m[5]) ? y2 - 1 : y2;
    return { von: ymd(y1, monthOf(m[2]), m[1]), bis: ymd(y2, monthOf(m[5]), m[4]) };
  }
  if ((m = text.match(new RegExp(`(\\d{1,2})\\.\\s*[–-]\\s*(\\d{1,2})\\.\\s*${MW}\\s*(\\d{4}|\\d{2})`))) && monthOf(m[3]))
    return { von: ymd(m[4], monthOf(m[3]), m[1]), bis: ymd(m[4], monthOf(m[3]), m[2]) };
  if ((m = text.match(new RegExp(`(\\d{1,2})\\.\\s*${MW}\\s*(\\d{4})`))) && monthOf(m[2])) {
    const d = ymd(m[3], monthOf(m[2]), m[1]);
    return { von: d, bis: d };
  }
  if ((m = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/))) { const d = ymd(m[3], m[2], m[1]); return { von: d, bis: d }; }
  return null;
}

const attr = (html, name) => decode((html.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] ?? "");
const abs = (base, href) => new URL(decode(href), base).href;

// ---------- Gemeinde aus einer Adresse (für kantonsweite Quellen) ----------
const slugify = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
let GIDX = {};
// G: { code: { name } } aus site/gemeinden.js
export function setGemeindeIndex(G) { GIDX = {}; for (const [c, g] of Object.entries(G)) GIDX[slugify(g.name)] = c; }
export const gemeindeByName = n => GIDX[slugify(String(n).replace(/\s+ZH$|\s*\(ZH\)$/, ""))] || "";
// Adresse «Strasse 5, 8424 Embrach» → Gemeinde-Code. Ortsteile (Effretikon, Gattikon …) über geo.admin.ch, gemerkt im Cache.
export async function gemeindeForAddress(addr, get, cache, prefix = "") {
  const m = String(addr).match(/\b(\d{4})\s+([A-ZÄÖÜ][^,;()]*)/); if (!m) return "";
  const byName = gemeindeByName(m[2].trim()); if (byName) return byName;
  if (!/^8/.test(m[1])) return "";
  const key = prefix + "geo:" + slugify(addr); if (key in cache) return cache[key];
  let code = "";
  try {
    const s = JSON.parse(await get("https://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&origins=address,zipcode&limit=1&sr=4326&searchText=" + encodeURIComponent(addr)));
    const a = s.results?.[0]?.attrs;
    if (a) {
      const j = JSON.parse(await get(`https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry=${a.lon},${a.lat}&sr=4326&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill&tolerance=0&returnGeometry=false&imageDisplay=10,10,96&mapExtent=${a.lon - 0.01},${a.lat - 0.01},${a.lon + 0.01},${a.lat + 0.01}`));
      const g = j.results?.[0]?.attributes; if (g) code = gemeindeByName(g.gemname || g.label || "");
    }
  } catch { return ""; }
  cache[key] = code; return code;
}

// ---------- Bausteine für die verschiedenen Agenda-Systeme ----------
// Jeder Baustein liefert Einträge: { id, name, von, bis, ort, veranstalter, kategorie, hint, url, detailKey, time }
export const SYSTEMS = {
  // i-web (Uster, Egg, Zollikon …): Liste steht als JSON im Seitencode.
  async iweb(site, get) {
    const base = `https://${site.domain}`;
    const rows = listFromHtml(await get(base + (site.path ?? "/anlaesseaktuelles")));
    return rows.map(row => {
      const ev = normalizeRow(row);
      return { ...ev, hint: "", url: `${base}/_rte/anlass/${ev.id}`, detailKey: ev.id, time: "" };
    });
  },

  // Agenda mit «weiter»-Seiten (Maur, Volketswil, Küsnacht, Herrliberg, Oetwil).
  async eventitem(site, get) {
    const listUrl = `https://${site.domain}${site.path}`;
    const items = [], seen = new Set();
    for (let page = 1; page <= (site.maxPages ?? 30); page++) {
      const html = await get(page === 1 ? listUrl : `${listUrl}/eventsjsRequest/0/eventspage/${page}`);
      const blocks = html.split(/<li[^>]*class="[^"]*event-item/).slice(1);
      let fresh = 0;
      for (const b of blocks) {
        const a = b.match(/<a[^>]*href="([^"]*\/event\/(\d+)\/eventdate\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/);
        if (!a) continue;
        const id = `${a[2]}-${a[3]}`;
        if (seen.has(id)) continue;
        seen.add(id); fresh++;
        const dateHtml = (b.match(/class="[^"]*event-date[^"]*"[^>]*>([\s\S]*?)<\/p>/) || [])[1] ?? "";
        const dateText = strip(dateHtml);
        const range = parseDateRange(dateText);
        const von = attr(dateHtml, "datetime") || range?.von;
        if (!von) continue;
        const bis = range && range.bis > von ? range.bis : von;
        items.push({ id, name: strip(a[4]), von, bis, ort: "", veranstalter: "", kategorie: "", hint: "", url: abs(listUrl, a[1]), detailKey: a[2], time: parseTime(dateText) });
      }
      if (!fresh) break;
    }
    return items;
  },

  // iCalendar-Feed (OneGov Ottenbach, WordPress Gossau/Fischenthal, Joomla Thalheim): Titel, Zeit, Ort und Beschreibung stehen im Feed.
  // Link zum Anlass: URL im Feed, sonst die Agenda-Seite (site.page), sonst OneGov-Muster.
  async ical(site, get) {
    const txt = (await get(`https://${site.domain}${site.path}`)).replace(/\r?\n[ \t]/g, "");
    const loc = (iso) => { const d = new Date(iso); const z = d.toLocaleString("sv-SE", { timeZone: "Europe/Zurich" }); return { d: z.slice(0, 10), t: z.slice(11, 16).replace(":", ".") }; };
    const val = (b, k) => { const m = b.match(new RegExp(`^${k}(?:;[^:\n]*)?:(.*)$`, "m")); return m ? m[1].replace(/\\n/g, " ").replace(/\\([,;\\])/g, "$1").trim() : ""; };
    const when = v => /^\d{8}T\d{6}Z$/.test(v) ? loc(v.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/, "$1-$2-$3T$4:$5:$6Z")) : /^\d{8}/.test(v) ? { d: `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`, t: /T(\d\d)(\d\d)/.test(v) ? v.replace(/^.*T(\d\d)(\d\d).*$/, "$1.$2") : "" } : null;
    const items = [];
    for (const b of txt.split("BEGIN:VEVENT").slice(1)) {
      const st = when(val(b, "DTSTART")), en = when(val(b, "DTEND")) || st;
      if (!st) continue;
      const name = val(b, "SUMMARY"), uid = val(b, "UID") || name + st.d;
      const t = st.t && st.t !== "00.00" ? (en.t && en.t !== st.t && en.d === st.d ? `${st.t} - ${en.t}` : st.t) : "";
      items.push({ id: uid.replace(/@.*$/, "").slice(0, 80), name: name.charAt(0) + (name === name.toUpperCase() ? name.slice(1).toLowerCase() : name.slice(1)), von: st.d, bis: en.d < st.d ? st.d : en.d,
        ort: val(b, "LOCATION").split(",")[0], veranstalter: "", kategorie: "", hint: `${val(b, "DESCRIPTION")} ${val(b, "CATEGORIES").replace(/Youth/g, "Jugend").replace(/Library/g, "Bibliothek")}`,
        url: val(b, "URL") || (site.page ? `https://${site.domain}${site.page}` : `https://${site.domain}/event/${uid.replace(/@.*$/, "")}`), detailKey: null, time: t });
    }
    return items;
  },

  // TYPO3 «sf_event_mgt» (Ossingen): Kacheln mit Tag, Monat und Jahr
  async sfevent(site, get) {
    const listUrl = `https://${site.domain}${site.path}`;
    const html = await get(listUrl), items = [];
    for (const b of html.split(/class="event-list-item/).slice(1)) {
      const href = (b.match(/href="([^"]+)"/) || [])[1]; if (!href) continue;
      const id = (decode(href).match(/\[event\]=(\d+)/) || decode(href).match(/%5Bevent%5D=(\d+)/) || [])[1]; if (!id) continue;
      const d = (b.match(/class="bigday">\s*(\d{1,2})/) || [])[1], mo = (b.match(/class="month">\s*([A-Za-zäÄ]+)/) || [])[1], y = (b.match(/<\/span>\s*(\d{4})/) || [])[1];
      const month = mo && monthOf(mo); if (!d || !month || !y) continue;
      const name = strip((b.match(/class="event-title">([\s\S]*?)(?:<!--|<\/h3>)/) || [])[1] ?? "");
      const von = ymd(Number(y), month, d);
      items.push({ id, name, von, bis: von, ort: "", veranstalter: "", kategorie: "", hint: "", url: abs(listUrl, href), detailKey: id, time: "" });
    }
    return items;
  },

  // Einfache Terminliste «li.event» mit Monat und Tag, Jahr in der Adresse (Berg am Irchel)
  async eventlist(site, get) {
    const listUrl = `https://${site.domain}${site.path}`;
    const html = await get(listUrl), items = [], seen = new Set();
    for (const b of html.split(/<li class="event\b/).slice(1)) {
      const a = b.match(/<a href="([^"]*\/(\d{4})\/([^"\/]+)\/?)"[^>]*>([\s\S]*?)<\/a>/); if (!a || seen.has(a[3])) continue;
      const mo = (b.match(/event-month">\s*([A-Za-zäÄ]+)/) || [])[1], d = (b.match(/event-day">\s*(\d{1,2})/) || [])[1];
      const month = mo && monthOf(mo); if (!month || !d) continue;
      seen.add(a[3]); const von = ymd(Number(a[2]), month, d);
      items.push({ id: a[3], name: strip(a[4]), von, bis: von, ort: "", veranstalter: "", kategorie: "", hint: "", url: abs(listUrl, a[1]), detailKey: a[3], time: "" });
    }
    return items;
  },

  // TYPO3-Kalender mit Monatsansicht (Schwerzenbach). Kurzbeschreibung steht schon in der Liste.
  async bss(site, get) {
    let url = `https://${site.domain}${site.path}`;
    const items = [];
    for (let i = 0; i < (site.months ?? 6) && url; i++) {
      const html = await get(url);
      const head = strip((html.match(/<div class="text-center">\s*<span>([^<]*)<\/span>/) || [])[1] ?? "");
      const mm = head.match(/([A-Za-zäÄ]+)\s+(\d{4})/);
      const month = mm && monthOf(mm[1]);
      for (const b of html.split('class="bss-event-detail-link"').slice(1)) {
        const href = (b.match(/href="([^"]*)"/) || [])[1];
        const app = decode(href ?? "").match(/appointment%5D=(\d+)/);
        const titles = [...b.matchAll(/class="bss_calendar_day_title">([\s\S]*?)<\/div>/g)].map(x => strip(x[1]));
        const d = (titles[0] || "").match(/^(\d{1,2})\./);
        if (!app || !d || !month) continue;
        const von = ymd(Number(mm[2]), month, d[1]);
        const hint = strip((b.match(/event-preview-body-row[^>]*>([\s\S]*?)<\/div>/) || [])[1] ?? "");
        items.push({ id: app[1], name: titles[1] || attr(b, "data-title"), von, bis: von, ort: "", veranstalter: "", kategorie: "", hint, url: abs(`https://${site.domain}/`, href), detailKey: null, time: parseTime(`${von.slice(0, 4)}, ${hint}`) });
      }
      const next = html.match(/<a href="([^"]*month%5D=next[^"]*)"/);
      url = next ? abs(`https://${site.domain}/`, next[1]) : null;
    }
    return items;
  },

  // RSS-Feed mit einem Eintrag pro Termin (Wetzikon). Beschreibung: «16.11.2026 | 16:00 Uhr - 18:00 Uhr<br/>Kategorie: …<br/>Ort: …».
  async rss(site, get) {
    const xml = await get(`https://${site.domain}${site.path}`);
    const items = [];
    for (const b of xml.split(/<item>/).slice(1)) {
      const tag = t => decode((b.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] ?? "").replace(/^<!\[CDATA\[|\]\]>$/g, "");
      const desc = decode(tag("description"));
      const link = tag("link").replace(/^http:/, "https:");
      const id = (link.match(/[?&]i=(\d+)/) || [])[1];
      const d = desc.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (!id || !d) continue;
      const von = ymd(d[3], d[2], d[1]);
      const t = desc.match(/(\d{1,2})[:.](\d{2})\s*Uhr(?:\s*-\s*(\d{1,2})[:.](\d{2}))?/);
      const time = t ? (t[3] ? `${t[1]}.${t[2]} - ${t[3]}.${t[4]}` : `${t[1]}.${t[2]}`) : "";
      const ort = strip((desc.match(/Ort:\s*([^<]*)/) || [])[1] ?? "");
      items.push({ id: `${id}-${von}`, name: strip(tag("title")), von, bis: von, ort, veranstalter: "", kategorie: "", hint: "", url: link, detailKey: id, time });
    }
    return items;
  },

  // WordPress «The Events Calendar» mit JSON-Schnittstelle (Pfäffikon ZH).
  async tribe(site, get) {
    const items = [], today = new Date().toISOString().slice(0, 10);
    for (let page = 1; page <= 8; page++) {
      const j = JSON.parse(await get(`https://${site.domain}/wp-json/tribe/events/v1/events?per_page=50&page=${page}&start_date=${today}`));
      for (const e of j.events || []) {
        const hm = d => d.slice(11, 16).replace(":", ".");
        const time = e.all_day ? "" : (e.end_date && e.end_date !== e.start_date ? `${hm(e.start_date)} - ${hm(e.end_date)}` : hm(e.start_date));
        items.push({ id: String(e.id), name: strip(decode(e.title || "")), von: e.start_date.slice(0, 10), bis: (e.end_date || e.start_date).slice(0, 10),
          ort: strip(decode((e.venue && e.venue.venue) || "")), veranstalter: "", kategorie: "", hint: strip(decode(e.description || "")).slice(0, 800),
          url: e.url, detailKey: null, time });
      }
      if (!j.total_pages || page >= j.total_pages) break;
    }
    return items;
  },

  // Stadt Zürich: Such-Schnittstelle der städtischen Agenda, gefiltert auf die Zielgruppen Kinder und Familien.
  async stzh(site, get) {
    const base = "https://www.stadt-zuerich.ch", items = [], seen = new Set();
    for (const tg of ["kinder", "familien"]) {
      const j = JSON.parse(await get(`${base}/stzh/search?lang=de&compResource=/content/web/de/aktuell/veranstaltungen/jcr:content/mainparsys/search&q_target_groups=events:audience/${tg}`));
      for (const r of j.results || []) {
        if (!r.href || !r.eventDateStart || seen.has(r.href)) continue;
        seen.add(r.href);
        const von = r.eventDateStart.slice(0, 10), bis = (r.eventDateEnd || r.eventDateStart).slice(0, 10);
        const hm = d => d.slice(11, 16).replace(":", ".");
        const t1 = hm(r.eventDateStart), t2 = r.eventDateEnd ? hm(r.eventDateEnd) : "";
        const time = t1 === "00.00" ? "" : t2 && t2 !== t1 && von === bis ? `${t1} - ${t2}` : t1;
        const ort = strip(decode(r.eventLocation || "")).replace(/^\(weitere Daten vorhanden\)\s*/, "").split(",")[0].trim().slice(0, 70);
        const id = r.href.replace(/\.html.*$/, "").split("/").pop() + "-" + (r.href.match(/calentry=(\d+)/) || [, "1"])[1];
        items.push({ id, name: strip(decode(r.heading || "")), von, bis: bis < von ? von : bis, ort, veranstalter: "", kategorie: "14",
          hint: strip(decode(r.description || "")), url: abs(base, r.href), detailKey: null, time });
      }
    }
    return items;
  },

  // Stadt Winterthur: Veranstaltungsliste mit Seiten, Kinder-Erkennung über die Detailseite wie bei den anderen Gemeinden.
  async winti(site, get) {
    const base = "https://stadt.winterthur.ch", items = [], seen = new Set();
    // zuerst die Zielgruppen Kinder (330), Familien (342) und Kinder/Jugendliche (1446), danach die ganze Liste
    for (const tg of ["330", "342", "1446", ""]) for (let page = 1; page <= (site.maxPages ?? 40); page++) {
      const qs = [tg && "targetGroup=" + tg, page > 1 && "page=" + page].filter(Boolean).join("&");
      const html = await get(`${base}/veranstaltungen${qs ? "?" + qs : ""}`);
      let fresh = 0;
      for (const b of html.split(/<a [^>]*href="\/veranstaltung\//).slice(1)) {
        const slug = b.slice(0, b.indexOf('"'));
        if (!slug || seen.has(slug)) continue;
        const range = parseDateRange(strip((b.match(/<p class="text-sm uppercase">([\s\S]*?)<\/p>/) || [])[1] ?? ""));
        const name = strip((b.match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] ?? "");
        if (!range || !name) continue;
        seen.add(slug); fresh++;
        const ps = [...((b.match(/<div class="mt-2">([\s\S]*?)<\/div>/) || [])[1] ?? "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(x => strip(x[1]));
        const tp = ps.find(x => /\d{1,2}:\d{2}/.test(x)) || "";
        const tm = tp.match(/(\d{1,2}):(\d{2})(?:\s*[–-]\s*(\d{1,2}):(\d{2}))?/);
        const time = !tm || (tm[1] === "00" && tm[2] === "00") ? "" : tm[3] ? `${tm[1]}.${tm[2]} - ${tm[3]}.${tm[4]}` : `${tm[1]}.${tm[2]}`;
        const ort = (ps.find(x => x !== tp) || "").split(",")[0].slice(0, 70);
        items.push({ id: slug, name, ...range, ort, veranstalter: "", kategorie: tg ? "14" : "", hint: "", url: `${base}/veranstaltung/${slug}`, detailKey: slug, time });
      }
      if (!fresh) break;
    }
    return items;
  },

  // kinderthur.ch (Verein Kinderthur): Kinder-Agenda für Winterthur. Liste über die WordPress-Schnittstelle,
  // Datum und Ort aus den Event-Daten (JSON-LD) der Anlass-Seite; nur bei Änderungen neu geladen.
  async kinderthur(site, get, cache, code) {
    const base = "https://www.kinderthur.ch", items = [], cutoff = new Date(Date.now() - 200 * 864e5).toISOString();
    const nice = s => s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    for (let page = 1; page <= 6; page++) {
      let list; try { list = JSON.parse(await get(`${base}/wp-json/wp/v2/ajde_events?per_page=100&page=${page}&_fields=id,link,title,class_list,modified,date`)); } catch { break; }
      if (!Array.isArray(list) || !list.length) break;
      for (const e of list) {
        const key = `${code}:kt:${e.id}`; let c = cache[key];
        if (!c || c.mod !== e.modified) {
          let html; try { html = await get(e.link); } catch { continue; }
          const dates = [];
          for (const m of html.matchAll(/"@type":\s*"Event"[\s\S]*?"startDate":\s*"(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{2})[^"]*",\s*"endDate":\s*"(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{2})/g)) {
            const d = (y, mo, da) => `${y}-${mo.padStart(2, "0")}-${da.padStart(2, "0")}`, h = (a, b) => `${a.padStart(2, "0")}.${b}`;
            const von = d(m[1], m[2], m[3]), bis = d(m[6], m[7], m[8]), t1 = h(m[4], m[5]), t2 = h(m[9], m[10]);
            const time = t1 === "00.00" ? "" : t2 !== "23.59" && t2 !== t1 && von === bis ? `${t1} - ${t2}` : t1;
            if (!dates.some(x => x.von === von)) dates.push({ von, bis: bis < von ? von : bis, time });
          }
          const ort = decode((html.match(/"location":\s*\[\{"@type":"Place","name":"([^"]*)"/) || [])[1] || "");
          c = cache[key] = { mod: e.modified, dates, ort, seen: new Date().toISOString().slice(0, 10) };
        } else c.seen = new Date().toISOString().slice(0, 10);
        const cl = e.class_list || [], age = (cl.find(x => /^event_type_2-ab-\d+-jahr/.test(x)) || "").replace(/^event_type_2-ab-(\d+)-jahr.*/, "ab $1 Jahren");
        const ort = c.ort || nice((cl.find(x => x.startsWith("event_location-")) || "").replace("event_location-", ""));
        c.dates.forEach((x, i) => items.push({ id: `kt${e.id}-${i}`, name: strip(decode(e.title?.rendered || "")), ...x, ort: ort.slice(0, 70), veranstalter: "",
          kategorie: "14", hint: age, url: e.link, detailKey: null }));
      }
      if (list[list.length - 1].date < cutoff) break;
    }
    return items;
  },

  // Allgemeine Liste: Links auf Anlass-Seiten (site.link, regulärer Ausdruck), Datum im Linktext oder im Text davor/danach.
  // site.path darf {p} für die Seitenzahl enthalten (site.pages Seiten ab site.p0). Für Drupal (Oberrieden), TYPO3 calendarize (Kilchberg) u.a.
  async links(site, get) {
    const base = `https://${site.domain}`, re = new RegExp(site.link), items = [], seen = new Set();
    const GENERIC = /^(details?|mehr|weiter(lesen)?|weiterlesen ….*|mehr erfahren|zum anlass|anzeigen|›|»|→)$/i;
    const pages = site.path.includes("{p}") ? site.pages ?? 3 : 1;
    for (let p = 0; p < pages; p++) {
      const url = base + site.path.replace("{p}", String(p + (site.p0 ?? 0)));
      let html; try { html = await get(url); } catch (e) { if (p === 0) throw e; break; }
      const main = (html.match(/<main[\s\S]*<\/main>/i) || [html])[0];
      const A = [...main.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: abs(url, m[1]), inner: m[2], at: m.index, end: m.index + m[0].length })).filter(a => re.test(a.href));
      // gleiche Adresse hintereinander (Titel + «Details») als ein Eintrag
      const groups = [];
      for (const a of A) { const g = groups[groups.length - 1]; if (g && g.href === a.href) { g.list.push(a); g.end = a.end; } else groups.push({ href: a.href, list: [a], at: a.at, end: a.end }); }
      let fresh = 0;
      groups.forEach((g, i) => {
        const pre = strip(main.slice(i ? groups[i - 1].end : Math.max(0, g.at - 600), g.at)).slice(-160);
        const post = strip(main.slice(g.end, i + 1 < groups.length ? groups[i + 1].at : g.end + 600)).slice(0, 300);
        const inner = g.list.map(a => a.inner).join(" "), itext = strip(inner);
        const range = parseDateRange(itext) || parseDateRange(pre) || parseDateRange(post);
        if (!range) return;
        const id = g.href.replace(/[?#].*$/, "").replace(/\/$/, "").split("/").pop();
        if (seen.has(id + range.von)) return;
        const okName = t => t && !GENERIC.test(t) && !/^\W*\d|\bUhr$|^(Mo|Di|Mi|Do|Fr|Sa|So)\w*,/.test(t) && !parseDateRange(t);
        const head = [...inner.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(x => strip(x[1])).find(okName) || "";
        const parts = g.list.flatMap(a => [strip(a.inner), ...[...a.inner.matchAll(/<(?:span|div|p|strong|b)[^>]*>([^<]{3,})</gi)].map(x => strip(x[1]))]);
        const name = head || parts.filter(okName).sort((a, b) => a.length - b.length)[0] || "";
        if (!name || name.length > 140) return;
        seen.add(id + range.von); fresh++;
        const ctx = /\d{4}/.test(itext) ? itext : pre + " " + itext;
        const tm = ctx.match(/(\d{1,2}):(\d{2})(?:\s*Uhr)?(?:\s*(?:-|–|—|bis)\s*(\d{1,2}):(\d{2}))?|(\d{1,2})\.(\d{2})\s*Uhr/);
        const time = !tm ? "" : tm[5] ? `${tm[5]}.${tm[6]}` : tm[3] ? `${tm[1]}.${tm[2]} - ${tm[3]}.${tm[4]}` : `${tm[1]}.${tm[2]}`;
        items.push({ id: id + "-" + range.von, name: name.replace(/^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag),?\s*\d{1,2}\.\d{1,2}\.\d{4}\s*/, ""), ...range, ort: "", veranstalter: "", kategorie: site.kat ?? "", hint: head ? itext.slice(0, 400) : "", url: g.href, detailKey: id, time });
      });
      if (!fresh && p > 0) break;
    }
    return items;
  },

  // Zürcher Museen: Schnittstelle der Museumsagenda, nur «Für Kinder geeignet». Ausstellungen ohne festes Datum fallen weg.
  async museen(site, get) {
    const list = JSON.parse(await get("https://zuercher-museen.ch/api/experiences?suitableForKids=true")), items = [];
    for (const e of list) {
      const info = decode(e.experienceInfo || "").replace(/ /g, " ");
      if (/^bis\b/i.test(info)) continue;
      // nur ausdrücklich für Familien und Kinder gedachte Angebote, keine allgemeinen Führungen oder Gespräche
      const t = decode(e.title || "");
      if (!/famili|kinder|kids|junior|workshop|atelier|geschichten|märchen|maerchen|bastel|gestalten|entdeck|forsch|rätsel|zoo|tiere|ferien/i.test(t)) continue;
      const range = parseDateRange(info); if (!range) continue;
      const tm = info.match(/(\d{1,2})(?::(\d{2}))?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*Uhr/) || info.match(/(\d{1,2})(?::(\d{2}))?\s*Uhr/);
      const hm = (h, m) => `${h}.${m || "00"}`;
      const time = !tm ? "" : tm[3] && tm.length > 4 ? `${hm(tm[1], tm[2])} - ${hm(tm[3], tm[4])}` : hm(tm[1], tm[2]);
      items.push({ id: "zm" + e.id, g: "zuerich", name: decode(e.title || "").trim(), ...range, ort: decode(e.museum || "").slice(0, 70), veranstalter: decode(e.museum || ""), kategorie: "14",
        hint: (e.flags || []).map(f => f.label).join(" "), url: e.detailUrl, detailKey: null, time });
    }
    return items;
  },

  // Squarespace-Kalender (viele private Höfe, Ateliers, kleine Bühnen): Listenansicht der Seite lesen. Zu jedem Anlass steht ein
  // «Google Kalender»-Link mit Titel und genauer Zeit (UTC). ?format=json/ical sind per robots.txt gesperrt und werden nicht benutzt.
  async squarespace(site, get) {
    const base = `https://${site.domain}`, html = await get(base + site.page), items = [], seen = new Set();
    const zh = d => new Date(d).toLocaleString("sv-SE", { timeZone: "Europe/Zurich" });
    const utc = s => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11) || "00"}:${s.slice(11, 13) || "00"}:00Z`;
    let detail = "";
    const re = new RegExp(`href="(${site.page}/\\d{4}/\\d{1,2}/\\d{1,2}/[^"?#]+)"|href="https?://www\\.google\\.com/calendar/event\\?action=TEMPLATE&(?:amp;)?text=([^&"]*)&(?:amp;)?dates=(\\d{8}(?:T\\d{6}Z)?)/(\\d{8}(?:T\\d{6}Z)?)`, "g");
    for (const m of html.matchAll(re)) {
      if (m[1]) { detail = m[1]; continue; }
      if (!detail || seen.has(detail)) continue;
      seen.add(detail);
      const name = decodeURIComponent(m[2].replace(/\+/g, " ")).replace(/\s+/g, " ").trim();
      if (site.skip && new RegExp(site.skip, "i").test(name)) continue;
      const allDay = !m[3].includes("T"), s = allDay ? m[3].replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3") : zh(utc(m[3])), e = allDay ? s : zh(utc(m[4]));
      const von = s.slice(0, 10), bis = e.slice(0, 10) < von ? von : e.slice(0, 10);
      const hm = t => t.slice(11, 16).replace(":", ".");
      items.push({ id: "sq" + detail.split("/").pop().slice(-40), g: site.g, name, von, bis, ort: site.ort || "", veranstalter: site.name, kategorie: site.kids ? "14" : "",
        hint: "", url: base + detail, detailKey: null, time: allDay ? "" : `${hm(s)} - ${hm(e)}`, ...(site.tip ? { tip: true } : {}) });
    }
    return items;
  },

  // localcities.ch: Veranstaltungen, die Vereine, Höfe, Märkte und private Veranstalter selbst erfassen (Daten von guidle).
  // Liste je Kategorie im Umkreis von Zürich, Seite für Seite; Wiederholungen eines Anlasses werden zu einem Eintrag zusammengefasst.
  // Gemeinde aus «PLZ Ort» der Karte; Orte ausserhalb des Kantons fallen weg. Vorauswahl über den Titel, damit nur
  // Familien-Anlässe (und keine Weindegustation) eine Detailseite brauchen.
  async localcities(site, get, cache, code) {
    const base = "https://www.localcities.ch", until = new Date(Date.now() + (site.days ?? 60) * 864e5).toISOString().slice(0, 10);
    const NO = new RegExp(site.no || "$^", "i"), byId = new Map();
    // site.local: Gemeinde-Seiten ohne Kategorie, für Orte wie den Wildnispark, deren Anlässe nicht nach «Kinder» klingen
    // («Willkommen bei den Wildschweinen!»): alles, was am genannten Ort stattfindet, zählt.
    const jobs = [...site.cats.map(c => ({ ...c, q: `${site.path}?category_id%5B%5D=${c.id}&radius=${site.radius || "radius_25"}` })),
      ...(site.local || []).map(l => ({ re: l.re || "$^", venue: l.venue, pages: l.pages ?? 6, q: `${l.path}?radius=radius_5` }))];
    for (const cat of jobs) {
      const want = new RegExp(cat.re, "i"), venue = cat.venue ? new RegExp(cat.venue, "i") : null;
      for (let p = 1; p <= (cat.pages ?? site.maxPages ?? 25); p++) {
        const html = await get(`${base}${cat.q}${p > 1 ? `&page=${p}` : ""}`);
        const cards = [...html.matchAll(/<div class="row teaser[^"]*"[\s\S]*?href="(\/de\/veranstaltungen\/[^"?]+\/(\d+))\?[^"]*?eventDateTime=(\d\d)\.(\d\d)\.(\d{4})(?:%20%20(\d\d:\d\d)(?:%20-%20(\d\d:\d\d))?)?[^"]*"[\s\S]*?<h2\s+class="h3">([\s\S]*?)<\/h2>[\s\S]*?<p>[^<]*<\/p>\s*<p>([^<]*)<\/p>/g)];
        if (process.env.DEBUG_LC) console.log("lc", cat.id, p, cards.length, cards.at(-1)?.slice(3, 6).join("."), byId.size);
        if (!cards.length) break;
        let last = "";
        for (const m of cards) {
          const [, path, id, dd, mm, yy, t1, t2, rawName, place] = m, d = `${yy}-${mm}-${dd}`; last = d;
          const name = decode(strip(rawName)).replace(/\s+/g, " ").trim();
          if (!(want.test(name) || (venue && venue.test(place))) || (NO.test(name) && !/kinder|famili|kids|jugend/i.test(name))) continue;
          const ev = byId.get(id);
          if (ev) { if (d < ev.von) ev.von = d; if (d > ev.bis) ev.bis = d; continue; }
          byId.set(id, { id: "lc" + id, name, von: d, bis: d, place: decode(place).trim(), url: base + path, time: t1 ? (t2 ? `${t1.replace(":", ".")} - ${t2.replace(":", ".")}` : t1.replace(":", ".")) : "" });
        }
        if (last > until) break;
      }
    }
    const items = [];
    for (const ev of byId.values()) {
      const g = await gemeindeForAddress(ev.place, get, cache, `${code}:`); if (!g) continue;
      items.push({ id: ev.id, g, name: ev.name, von: ev.von, bis: ev.bis, ort: ev.place.slice(0, 80), veranstalter: "", kategorie: "14", hint: "",
        url: ev.url, detailKey: ev.id, time: ev.time, long: true });
    }
    return items;
  },

  // kindaling.de/…/zuerich: Kinder- und Familienanlässe, die private Anbieter selbst eintragen. Liste nach Tagen gruppiert
  // («Mittwoch, 25. November»), jede Karte mit Titel, Anbieter, Ort, Zeit und Alter. Detailseite liefert den Link zum Anbieter.
  async kindaling(site, get, cache, code) {
    const base = "https://www.kindaling.de", items = [], seen = new Set(), now = new Date();
    const MON = { januar: 1, februar: 2, märz: 3, maerz: 3, april: 4, mai: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 };
    const until = new Date(Date.now() + (site.days ?? 60) * 864e5).toISOString().slice(0, 10);
    const NO = new RegExp(site.no || "$^", "i"), places = new Map();
    for (const path of site.paths) {
      let last = "";
      for (let p = 1; p <= (site.maxPages ?? 15); p++) {
        const html = await get(`${base}${path}${p > 1 ? `?page=${p}` : ""}`);
        const parts = html.split(/<div class="activity-list__activities__container-title">/).slice(1);
        if (!parts.length) break;
        for (const part of parts) {
          const h = part.match(/^\s*\w+,\s*(\d{1,2})\.\s*([A-Za-zäÄ]+)/); if (!h) continue;
          const mo = MON[h[2].toLowerCase()]; if (!mo) continue;
          let y = now.getFullYear(); if (mo < now.getMonth() + 1 - 1) y++;
          const d = `${y}-${String(mo).padStart(2, "0")}-${String(h[1]).padStart(2, "0")}`; last = d;
          for (const c of part.matchAll(/<a id="search-result-cta-(\d+)" href="([^"]+)"[\s\S]*?<\/a>/g)) {
            const [card, id, href] = c, txt = s => decode(strip(s || "")).replace(/\s+/g, " ").trim();
            const name = txt((card.match(/activiti__title">([\s\S]*?)<\/span>/) || [])[1]);
            if (!name || NO.test(name) || seen.has(id + d)) continue;
            seen.add(id + d);
            const prov = txt((card.match(/text_provider">([\s\S]*?)<\/div>/) || [])[1]);
            const place = txt((card.match(/activiti__address">[\s\S]*?<span>([\s\S]*?)<\/span>/) || [])[1]);
            const clock = txt((card.match(/icon_clock[\s\S]*?<span>([\s\S]*?)<\/span>/) || [])[1]);
            const ag = txt((card.match(/activiti__age">[\s\S]*?<span>([\s\S]*?)<\/span>/) || [])[1]).match(/(\d{1,2})\s*-\s*(\d{1,2})/);
            const tags = [...card.matchAll(/category-tag">([^<]*)</g)].map(m => decode(m[1]).trim()).join(" ");
            if (site.skipTags && new RegExp(site.skipTags, "i").test(tags)) continue;
            const t = clock.match(/(\d{1,2}):(\d{2})(?:\s*-\s*(\d{1,2}):(\d{2}))?/);
            items.push({ id: `kd${id}-${d}`, name, von: d, bis: d, place, prov, url: base + href, detailKey: `kd${id}`,
              time: t ? `${t[1].padStart(2, "0")}.${t[2]}${t[3] ? ` - ${t[3].padStart(2, "0")}.${t[4]}` : ""}` : "",
              hint: ag && +ag[1] <= 12 ? `${ag[1]} bis ${ag[2]} Jahre` : "" });
          }
        }
        if (last > until) break;
      }
    }
    const out = [];
    for (const ev of items) {
      // «Zürich Oerlikon / Seebach» → Zürich; sonst Ort über die Gemeindesuche (fällt weg, wenn ausserhalb des Kantons)
      const key = ev.place.split(/\s*\/\s*/)[0];
      if (!places.has(key)) places.set(key, gemeindeByName(key.split(" ")[0]) || gemeindeByName(key) || await gemeindeForAddress(key, get, cache, `${code}:`));
      const g = places.get(key); if (!g) continue;
      out.push({ id: ev.id, g, name: ev.name, von: ev.von, bis: ev.bis, ort: ev.place, veranstalter: ev.prov, kategorie: "14", hint: ev.hint,
        url: ev.url, detailKey: ev.detailKey, time: ev.time });
    }
    return out;
  },

  // Regionale Tourismus-Agenden mit guidle-Block (z. B. zuercher-weinland.ch): Liste je Monat (?monat=YYYYMM) mit
  // Kategorie, Titel, «Ort, Veranstaltungsort» und «TT.MM.JJJJ / HH.MM – HH.MM». Kinderveranstaltungen zählen immer,
  // sonst nur Titel, die nach Familienanlass klingen (site.re), ohne Degustationen und Ähnliches (site.no).
  async guidleteaser(site, get, cache, code) {
    const items = [], seen = new Set(), now = new Date(), WANT = new RegExp(site.re, "i"), NO = new RegExp(site.no || "$^", "i");
    const places = new Map();
    for (let i = 0; i < (site.months ?? 3); i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1), m = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
      const html = await get(`https://${site.domain}${site.page}?monat=${m}`);
      for (const c of html.matchAll(/<div class="event-teaser-categories">([^<]*)<\/div>\s*<h3[^>]*>\s*<a href="([^"]+)">([\s\S]*?)<\/a><\/h3>\s*<p class="event-teaser-location">([^<]*)<\/p>\s*<p class="event-teaser-date">([^<]*)<\/p>/g)) {
        const [, cats, url, rawName, loc, when] = c, name = decode(strip(rawName)).replace(/­/g, "").replace(/\s+/g, " ").trim();
        if (seen.has(url)) continue; seen.add(url);
        const kids = /kinderveranstaltung/i.test(cats);
        if (!kids && (!WANT.test(name) || NO.test(name))) continue;
        if (NO.test(name) && !/kinder|famili/i.test(name)) continue;
        const w = decode(when).match(/(\d\d)\.(\d\d)\.(\d{4})(?:\s*\/\s*(\d\d)\.(\d\d)(?:\s*\S\s*(\d\d)\.(\d\d))?)?/); if (!w) continue;
        const von = `${w[3]}-${w[2]}-${w[1]}`, ort = decode(loc).replace(/\s+/g, " ").trim(), key = ort.split(",")[0].trim();
        if (!places.has(key)) places.set(key, gemeindeByName(key) || await gemeindeForAddress(key, get, cache, `${code}:`));
        const g = places.get(key); if (!g) continue;
        items.push({ id: "gt" + url.split("/").filter(Boolean).pop(), g, name, von, bis: von, ort, veranstalter: "", kategorie: "14", hint: "",
          url, detailKey: null, time: w[4] ? `${w[4]}.${w[5]}${w[6] ? ` - ${w[6]}.${w[7]}` : ""}` : "" });
      }
    }
    return items;
  },

  // Katholische Kirche im Kanton Zürich (forum-magazin.ch): Agenda aller Pfarreien, Rubrik «Kinder und Familien», Seite für Seite
  // («Mehr Veranstaltungen laden»). Die Gemeinde kommt aus der Adresse auf der Anlass-Seite (einmal geladen, dann gemerkt).
  async forum(site, get, cache, code) {
    const base = "https://www.forum-magazin.ch", Q = "?category=kinder-und-familien", items = [], seen = new Set();
    const until = new Date(Date.now() + (site.days ?? 90) * 864e5).toISOString().slice(0, 10).replace(/-/g, "");
    let url = base + "/agenda/" + Q;
    for (let page = 0; page < (site.maxPages ?? 20) && url; page++) {
      const html = await get(url);
      for (const b of html.split(/class="agenda__grid-event"/).slice(1)) {
        const href = b.match(/href="(\/([a-z0-9-]+)\/agenda\/(\d{8})-[^"]*?-(\d+)\/)"/) || [];
        if (!href[1] || seen.has(href[4])) continue;
        seen.add(href[4]);
        const cats = [...((b.match(/<ul class="agenda__event-category">([\s\S]*?)<\/ul>/) || [])[1] || "").matchAll(/<li>([^<]*)<\/li>/g)].map(x => decode(x[1]).trim());
        const name = strip((b.match(/<h1 class="agenda__event-title">([\s\S]*?)<\/h1>/) || [])[1] ?? "");
        const von = `${href[3].slice(0, 4)}-${href[3].slice(4, 6)}-${href[3].slice(6, 8)}`;
        const tm = strip((b.match(/<time class="agenda__time"[^>]*>([\s\S]*?)<\/time>/) || [])[1] ?? "").match(/(\d{1,2})\.(\d{2})(?:\s*(?:bis|-|–)\s*(\d{1,2})\.(\d{2}))?/);
        const time = tm ? (tm[3] ? `${tm[1]}.${tm[2]} - ${tm[3]}.${tm[4]}` : `${tm[1]}.${tm[2]}`) : "";
        const pfarrei = strip((b.match(/<p class="agenda__event-location">([\s\S]*?)<\/p>/) || [])[1] ?? "");
        const key = `${code}:fa:${href[4]}`;
        if (!(key in cache)) {
          let addr = ""; try { const d = await get(base + href[1]); addr = decode((d.match(/"address":\s*"([^"]*)"/) || [])[1] || ""); } catch {}
          cache[key] = { addr, g: addr ? await gemeindeForAddress(addr, get, cache, code + ":") : "" };
        }
        // Gemeinde: Adresse, sonst erster Ort in Klammern bei der Pfarrei, sonst Pfarrei-Kürzel in der Adresse
        const g = cache[key].g || gemeindeByName((pfarrei.match(/\(([^)]+?)(?:\s+-\s|\))/) || [])[1] || "") || gemeindeByName(href[2]) || gemeindeByName(href[2].split("-")[0]);
        if (!g) continue;
        items.push({ id: "fa" + href[4], g, name, von, bis: von, ort: (cache[key].addr.split(",")[0] || pfarrei).slice(0, 70), veranstalter: "Kath. Pfarrei " + pfarrei.replace(/\s*\(.*$/, ""), kategorie: "14",
          hint: cats.join(" "), url: base + href[1], detailKey: null, time });
      }
      const next = html.match(/hx-get="(\/agenda\/after\/(\d{8})\/)"/);
      url = next && next[2] <= until ? base + next[1] + Q : null;
    }
    return items;
  },

  // Programmseiten von Veranstaltern (Theater, Konzerthäuser, Filmclubs …): je Seite ein Angebot mit einem oder mehreren Terminen.
  // site.pages: Adressen oder { u, g }; site.index + site.link: Seiten aus einer Übersicht. Termine aus JSON-LD «Event» oder aus dem Text.
  // site.g: Gemeinde des Veranstaltungsorts, sonst aus der Adresse im JSON-LD.
  async termine(site, get, cache, code) {
    const pages = (site.pages || []).map(p => typeof p === "string" ? { u: p } : p);
    for (const ix of [].concat(site.index || [])) {
      try { const h = await get(ix); const re = new RegExp(site.link);
        for (const m of h.matchAll(/<a\b[^>]*href="([^"#]+)"/gi)) { const u = abs(ix, m[1]); if (re.test(u) && !pages.some(p => p.u === u)) pages.push({ u }); } } catch {}
    }
    const items = [], today = new Date().toISOString().slice(0, 10);
    const MONTHRE = "(Januar|Februar|März|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jan|Feb|Mär|Apr|Jun|Jul|Aug|Sep|Sept|Okt|Nov|Dez)\\.?";
    for (const pg of pages.slice(0, site.max ?? 60)) {
      let html; try { html = await get(pg.u); } catch { continue; }
      const title = strip((html.match(/<meta property="og:title" content="([^"]*)"/) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] ?? "").replace(/\s+[|–-]\s+[^|–-]*$/, "").trim() || site.name;
      if (site.only && !new RegExp(site.only, "i").test(title + " " + pg.u)) continue;
      if (site.onlyText && !new RegExp(site.onlyText, "i").test(strip(html))) continue;
      // 1) JSON-LD
      const lds = [];
      for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
        try { const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") { if (/Event/.test([].concat(o["@type"]).join(" ")) && o.startDate) lds.push(o); if (o["@graph"]) walk(o["@graph"]); if (o.subEvent) walk(o.subEvent); } }; walk(JSON.parse(m[1])); } catch {}
      }
      let found = 0;
      const dup = new Set();
      for (const e of lds) {
        const k = (e.name || "") + e.startDate; if (dup.has(k)) continue; dup.add(k);
        const von = String(e.startDate).slice(0, 10), bis = String(e.endDate || e.startDate).slice(0, 10), t = String(e.startDate).slice(11, 16);
        const loc = e.location || {}, addr = typeof loc.address === "string" ? loc.address : [loc.address?.streetAddress, [loc.address?.postalCode, loc.address?.addressLocality].filter(Boolean).join(" ")].filter(Boolean).join(", ");
        const g = pg.g || site.g || (addr ? await gemeindeForAddress(addr, get, cache, code + ":") : "");
        if (!g) continue;
        items.push({ id: (e.url || pg.u).replace(/^https?:\/\/[^/]+/, "").slice(-60) + von + t, g, name: decode(e.name || title), von, bis: bis < von ? von : bis, ort: decode(loc.name || "").slice(0, 70), veranstalter: site.name,
          kategorie: "14", hint: decode(e.description || "").slice(0, 300), url: e.url || pg.u, detailKey: null, time: t && t !== "00:00" ? t.replace(":", ".") : "" });
        found++;
      }
      if (found) continue;
      // 2) Termine im Text
      const main = (html.match(/<main[\s\S]*<\/main>/i) || [html])[0], seen = new Set();
      // Abschnitte nach Zwischentiteln: der Titel über einem Termin ist meist der Name des Stücks
      const secs = main.split(/(?=<h[2-4][\s>])/i).map(h => ({ head: strip((h.match(/^<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1] ?? ""), text: strip(h) }));
      for (const sec of secs) { const text = sec.text;
      const re = new RegExp(`(\\d{1,2})\\.\\s?(\\d{1,2})\\.\\s?(\\d{4}|\\d{2})?(?!\\d)|(\\d{1,2})\\.\\s?${MONTHRE}\\s*(\\d{4})?`, "g");
      for (const m of text.matchAll(re)) {
        let d, mo, y;
        if (m[1]) { d = +m[1]; mo = +m[2]; y = m[3] ? +m[3] : 0; } else { d = +m[4]; mo = monthOf(m[5].replace("Maerz", "Mär")); y = m[6] ? +m[6] : 0; }
        if (!mo || mo > 12 || d > 31 || !d) continue;
        if (!y) { y = +today.slice(0, 4); if (ymd(y, mo, d) < today) y++; if ((Date.parse(ymd(y, mo, d)) - Date.parse(today)) / 864e5 > 240) continue; } else if (y < 100) y += 2000;
        const von = ymd(y, mo, d); if (von < today || seen.has(von + sec.head)) continue;
        const after = text.slice(m.index + m[0].length, m.index + m[0].length + 40).match(/^[^0-9]{0,12}(\d{1,2})[:.](\d{2})(?![.\d])/);
        seen.add(von + sec.head);
        const nm = pg.name || (sec.head && sec.head.length < 90 && !/^\W*\d|termine|daten|vorstellungen|tickets|spielplan|programm/i.test(sec.head) ? sec.head : title);
        items.push({ id: pg.u.replace(/^https?:\/\/[^/]+/, "").slice(-50) + von + nm.slice(0, 10), g: pg.g || site.g, name: nm, von, bis: von, ort: site.ort || "", veranstalter: site.name, kategorie: "14", hint: "", url: pg.u, detailKey: null,
          time: after ? `${after[1]}.${after[2]}` : "" });
      } }
    }
    // gleicher Anlass am gleichen Tag nur einmal, der Eintrag mit Uhrzeit gewinnt
    const best = new Map();
    for (const x of items.filter(x => x.g)) { const k = x.url + x.von + x.name; const o = best.get(k); if (!o || (!o.time && x.time)) best.set(k, x); }
    return [...best.values()];
  },

  // kinderregion.ch: redaktionell ausgewählte Familien-Tipps (Kindertheater, Advent, Samichlaus …) mit Link direkt zum Anbieter.
  // Listen-Seiten werden auf der Startseite und bei «Veranstaltungen» gefunden. Einträge: «Ort | Datum | Alter Titel Beschreibung».
  async kinderregion(site, get) {
    const base = "https://kinderregion.ch", lists = new Set([base + "/de/veranstaltungen/"]);
    for (const u of [base + "/de/", base + "/de/veranstaltungen/"]) { try { for (const m of (await get(u)).matchAll(/href="(https:\/\/kinderregion\.ch\/de\/liste\/[a-z0-9-]+\/)"/g)) lists.add(m[1]); } catch {} }
    const skip = new RegExp(site.skipHosts || "^$"), items = [], seen = new Set(), today = new Date().toISOString().slice(0, 10);
    const y4 = y => (y ? (+y < 100 ? 2000 + +y : +y) : 0);
    const ZH = /Zürich|Zürcher|Bernhard[- ]Theater|Stadelhofen|Kanzlei|Hechtplatz|Purpur|Rigiblick|Millers|Opernhaus|Tonhalle|Schauspielhaus|Landesmuseum|Zoo Zürich/;
    for (const lu of lists) {
      let html; try { html = await get(lu); } catch { continue; }
      for (const m of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
        const href = decode(m[1]); if (/kinderregion\.ch/.test(href) || skip.test(href)) continue;
        const parts = m[2].split(/<\/(?:p|span|div|h\d)>/i).map(strip).filter(Boolean), txt = strip(m[2]);
        // Datum: «19. bis 21.11.26», «8.11.26 bis 17.1.27», «ab 4.11.26», «13.12.26», «7./8.12.26», «20. bis 22. November 2026»
        let von, bis, d;
        const t = txt.replace(/(\d{1,2})\.\/(\d{1,2})\./g, "$1. bis $2.");
        if ((d = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})?\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/))) { const yb = y4(d[6]), ya = y4(d[3]) || (+d[2] > +d[5] ? yb - 1 : yb); von = ymd(ya, d[2], d[1]); bis = ymd(yb, d[5], d[4]); }
        else if ((d = t.match(/(\d{1,2})\.\s*(?:bis|–|-)\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/))) { von = ymd(y4(d[4]), d[3], d[1]); bis = ymd(y4(d[4]), d[3], d[2]); }
        else if ((d = t.match(/ab\s+(\d{1,2})\.(\d{1,2})\.(\d{2,4})/))) { von = ymd(y4(d[3]), d[2], d[1]); bis = new Date(Math.max(Date.parse(von), Date.parse(today)) + 30 * 864e5).toISOString().slice(0, 10); }
        else if ((d = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/))) { von = bis = ymd(y4(d[3]), d[2], d[1]); }
        else { const r = parseDateRange(t.replace(/Bis am\s+/i, "")); if (!r) continue; ({ von, bis } = r); if (/^\s*bis\s/i.test(t)) von = today; }
        if (bis < today) continue;
        // Ort → Gemeinde: Zürcher Häuser, sonst ein Gemeindename im Text
        const segs = (parts.length > 1 ? parts : [txt]).flatMap(x => x.split(/\s*\|\s*/)).map(x => x.trim()).filter(Boolean);
        const ortSeg = segs.find(x => !/\d/.test(x) && x.length < 50) || "";
        const inOrt = (txt.match(/\b(?:in|im|auf dem|am)\s+([A-ZÄÖÜ][\wäöü-]+(?:\s(?:am|an der|bei)\s[A-ZÄÖÜ][\wäöü]+)?)/g) || []).map(x => x.replace(/^\S+(\s(dem|der))?\s+/, ""));
        let g = gemeindeByName(ortSeg) || (ZH.test(ortSeg) ? "zuerich" : "");
        if (!g) for (const w of ortSeg.split(/[\s,]+/).reverse()) { const c = gemeindeByName(w); if (c && w.length > 3 && !/^(Dorf|Wald|Wil|Hausen|Berg)$/.test(w)) { g = c; break; } }
        if (!g) for (const w of inOrt) { const c = gemeindeByName(w); if (c && !/^(Dorf|Wald|Wil|Hausen|Berg|Stammheim)$/.test(w)) { g = c; break; } }
        if (!g && ZH.test(txt) && !/Zug\b|Schwyz|Liechtenstein|Luzern|Aargau|St\. ?Gallen|Thurgau|Jona|Rapperswil/.test(txt)) g = "zuerich";
        if (!g) continue;
        // Titel: erster Teil ohne Datum, der nicht der Ort ist
        let title = /\bin [A-ZÄÖÜ]/.test(ortSeg) ? ortSeg : segs.find(x => !/\d/.test(x) && x !== ortSeg && x.length > 3 && x.length < 90 && !/^(diverse|alle)\b/i.test(x)) || segs.find(x => !/^\d|^ab \d|^bis/.test(x) && x !== ortSeg) || ortSeg;
        title = title.replace(/^(ab \d+ Jahren?|alle)\s+/i, "").split(/(?<=[a-zäöü])\s+(?=[A-ZÄÖÜ][a-zäöü]+ [a-zäöü]+ [a-zäöü]+ )/)[0].slice(0, 90);
        const age = (txt.match(/ab (\d{1,2}) Jahren?/) || [])[0] || "";
        const id = href.replace(/^https?:\/\//, "").replace(/[?#].*$/, "").slice(0, 70) + von;
        if (seen.has(id)) continue; seen.add(id);
        items.push({ id, g, name: title, von, bis, long: true, tip: true, ort: ortSeg.slice(0, 60), veranstalter: "", kategorie: "14", hint: age + " " + txt.slice(0, 300), url: href, detailKey: null, time: "" });
      }
    }
    return items;
  },

  // Kacheln mit Datum und Titel (Erlenbach).
  async tiles(site, get) {
    const listUrl = `https://${site.domain}${site.path}`;
    const html = await get(listUrl);
    const items = [];
    for (const b of html.split(/<li[^>]*class="[^"]*\btile\b/).slice(1)) {
      const href = (b.match(new RegExp(`href="([^"]*${site.linkPart}[^"]*)"`)) || [])[1];
      const range = parseDateRange(strip((b.match(/<time[^>]*>([\s\S]*?)<\/time>/) || [])[1] ?? ""));
      const name = strip((b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] ?? "");
      if (!href || !range || !name) continue;
      const slug = href.replace(/\/$/, "").split("/").pop();
      items.push({ id: slug, name, ...range, ort: "", veranstalter: "", kategorie: "", hint: strip((b.match(/<\/h1>\s*<p>([\s\S]*?)<\/p>/) || [])[1] ?? ""), url: abs(listUrl, href), detailKey: slug, time: "" });
    }
    return items;
  },
};

function extras(text) {
  const ort = (text.match(/Veranstaltungsort\s+(.+?)\s+Lageplan/) || [])[1]?.replace(/\s+\S*(strasse|weg|gasse|platz|rain)\s.*$/i, "").replace(/\s+\d{4}\s.*$/, "").slice(0, 70) ?? "";
  const veranstalter = (text.match(/Organisator\s+(.+?)\s+(iCalendar|Seite als PDF|$)/) || [])[1]?.slice(0, 70) ?? "";
  return { ort, veranstalter };
}

// Holt eine Gemeinde. fetchText lädt eine Adresse, cache spart Detailseiten, die schon bekannt sind.
export async function collectSite(code, site, { fetchText, cache, today, wait = async () => {} }) {
  const get = async url => { const t = await fetchText(url); await wait(); return t; };
  const items = [];
  for (const name of [site.system ?? "iweb", ...(site.extra ?? [])]) {
    const system = SYSTEMS[name];
    if (!system) throw new Error(`Unbekanntes System: ${name}`);
    items.push(...await system(site, get, cache, code));
  }
  const result = [];
  for (const ev of items) {
    if (!isCandidate(ev, today)) continue;
    const key = `${code}:${ev.detailKey ?? ev.id}`;
    let info = cache[key];
    if (!info || day(today) - day(info.seen) > 14 || (ev.detailKey && !("lk" in info))) {
      let text = `${ev.name} ${ev.hint}`, lk = "";
      if (ev.detailKey) { try { const html = await get(ev.url); text = detailText(html, ev.name); lk = detailLink(html, site.domain); } catch { info = null; } }
      const fresh = { ...classify(ev, `${ev.hint} ${text}`), ...extras(text), lk, seen: today };
      if (info !== null) cache[key] = fresh;
      info = fresh;
    }
    // Zielgruppe «Kinder/Familien» in der Agenda gilt immer, auch wenn die Detailseite schon früher anders eingestuft wurde
    if ((info.kids || KIDS_CATEGORIES.has(ev.kategorie)) && !ADULT_ONLY.test(ev.name)) result.push({
      gemeinden: [ev.g || code], id: `${ev.g || code}-${ev.id}`, ...(site.quelle ? { q: code } : {}), ...(ev.tip ? { tip: 1 } : {}), name: ev.name, von: ev.von, bis: ev.bis,
      ort: ev.ort || info.ort || "", veranstalter: ev.veranstalter || info.veranstalter || "",
      time: ev.time || info.time, age: nameAge(ev.name) ?? info.age, url: ev.url, ...(info.lk && !LINK_NO.test(info.lk) ? { w: info.lk } : {}),
    });
  }
  return { rows: items.length, events: result };
}

// Vereine: Kinder-Angebote am Namen erkennen und einer Gruppe zuordnen
const CLUB_NO = /senior|veteran|alt[- ]?pfadi|altherren|männerchor|maennerchor|frauenchor|frauenturn|männerturn|damenriege|herrenriege|seniorenturn|kiwanis|rotary|lions|partei|\bsvp\b|\bfdp\b|\bsp\b|die mitte|\bglp\b|\bevp\b|grüne|gewerbe|landfrauen|pensionierte|rentner|60\s*\+|schützen|jäger|jagd|imker|ornitholog(?!.*jugend)|fasn|gugge|zunft|quartierverein|dorfverein|verkehrsverein|verschönerung|wanderverein|kulturverein|kirchenchor|samariter(?!.*jugend)|freundeskreis|stiftung|genossenschaft|club 2|aktive senioren|verband\b|familiengärten|familiengarten|hundesport|motorsport|supporter|gönner|aktivriege|damenturn|damen|herren|krippe|kindertagesst|kinderheim|jugendberatung|tagesfamilien|kita\b|hauseigentümer|privatwald/i;
export const CLUB_GROUPS = [
  ["pfadi", "Pfadi und Jugendgruppen", /pfadi|cevi|jungwacht|blauring|jubla|jungschar|jugendtreff|jugendarbeit|jugendverein/i],
  ["kampf", "Kampfsport", /judo|karate|taekwondo|kampf|aikido|\bbox|ringen|ringer|kung.?fu|wing.?(tsun|chun)|ju.?jitsu|jiu.?jitsu|kickbox|muay|selbstverteidigung|soo bahk|hapkido|kendo|capoeira|budo|ikigaido|skema|fecht|krav maga|dojo/i],
  ["sport", "Sport", /\bfc\b|fussball|football|turn|unihockey|floorball|handball|volleyball|basketball|tennis|badminton|schwimm|wasserball|leichtathletik|\blv\b|\bla\b|\bski|snowboard|eishockey|eislauf|curling|reit|pony|velo|bike|\brad|orientierungslauf|\bol\b|rugby|hockey|tischtennis|rhönrad|kletter|segel|ruder|kanu|golf|inline|skater|sport|athlet|gymnastik|trampolin|schach/i],
  ["musik", "Musik und Tanz", /jugendmusik|musikschule|kadetten|kinderchor|jugendchor|tanz|ballett|tambour|singschule|musik/i],
  ["familie", "Familie und Eltern", /eltern|famili|mütter|muetter|väter|spielgruppe|ludothek|elki|krabbel|kita|tagesfamilien/i],
  ["kreativ", "Zirkus, Kreativ und Natur", /zirkus|circus|robot|forscher|science|freizeit-?werkstatt|naturspielgruppe|waldjugend|jugendfeuerwehr|kind & kunst|kinderkunst/i],
];
export function classifyClub(name) {
  if (CLUB_NO.test(name)) return null;
  for (const [k, , re] of CLUB_GROUPS) if (re.test(name)) return k;
  if (/kinder|jugend|kids|juniors?\b/i.test(name)) return "pfadi";
  return null;
}
