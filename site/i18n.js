/* Sprachwahl DE/EN: übersetzt die Bedienoberfläche im Browser.
   Inhalte aus den Quellen (Titel und Beschreibungen von Anlässen, Namen) bleiben im Original. */
(function(){
"use strict";
const D={
// Start
"Für Familien in Zürich":"For Families in Zurich","Was machen wir heute?":"What shall we do today?","Heute in deiner Region":"Today in your area",
"Anlässe für Kinder":"Events for kids","Gemeinde oder Thema suchen …":"Search town or topic …","🔍 Gemeinde oder Thema suchen …":"🔍 Search town or topic …",
"Gemeinde oder Thema suchen":"Search town or topic","Gemeinde-Auswahl aufheben":"Clear town","Bereiche":"Sections","Löwe":"Lion","Herz":"Heart",
"Events":"Events","Saison-Highlights":"Seasonal highlights","Saisonale Highlights":"Seasonal highlights","Samichlaus, Advent und Weihnachten":"St Nicholas, Advent and Christmas",
"Kinderarzt & Notfall":"Paediatrician & emergency","144 · Ärztefon · Apotheken":"144 · Doctor hotline · Pharmacies","Kita & Betreuung":"Daycare & childcare",
"Kitas, Krippen, Horte und Kindergärten":"Daycare, nurseries, after-school care, kindergartens","Orte und Ideen zum Feiern":"Places and ideas for parties",
"Event-Räume":"Venues","Säle und Waldhütten für Feste":"Halls and forest huts for parties","Säle und Waldhütten zum Mieten":"Halls and forest huts to rent",
"Vereine":"Clubs","Ludotheken, Bibliotheken, Beratung":"Toy libraries, libraries, advice","Ausflugsziele":"Day trips","Tierparks, Museen, Burgen und mehr":"Zoos, museums, castles and more",
"Restaurants":"Restaurants","Wo Kinder spielen können":"Where kids can play","Familienangebote":"Family services","Was es in deiner Gemeinde gibt":"What your town offers",
"Spielplätze":"Playgrounds","Mit Karte für jede Gemeinde":"With a map for every town","Ferienkurse":"Holiday courses","Was läuft in den Schulferien?":"What's on in the school holidays?",
"Kindergeburtstag":"Kids' birthday","Schulferien":"School holidays","Wann ist schulfrei?":"When are the school holidays?","Sport, Musik, Pfadi und mehr":"Sport, music, scouts and more",
"Was gerade Saison hat":"What's in season now","Ziele zum Entdecken":"places to discover","Lokale mit Spielmöglichkeit":"places where kids can play","Vereine für Kinder":"clubs for kids",
"Spielplätze mit Karte":"playgrounds with map","Praxen und Apotheken":"practices and pharmacies",
// allgemein
"Übersicht":"Overview","← Übersicht":"← Overview","Zurück zur Übersicht":"Back to overview","Alle Gemeinden":"All towns","Alle":"All","Keine":"None","Gemeinde":"Town","Gemeinde:":"Town:",
"Gemeinde suchen":"Search town","Gemeinde wählen":"Choose town","Ganzen Bezirk wählen":"Select whole district","Alle Filter zurücksetzen":"Reset all filters","Zurücksetzen":"Reset",
"Website":"Website","Karte":"Map","Route":"Directions","Anrufen":"Call","Merken":"Save","Gemerkt":"Saved","Filter":"Filter","Quelle":"Source","Thema":"Topic","Datum":"Date",
"Art":"Type","Grösse":"Size","Sortieren":"Sort","Ordnen nach":"Group by","Wann":"When","Alter":"Age","Tag wählen":"Choose day","Nach Gemeinde":"By town","Nach Grösse":"By size",
"Nach Name":"By name","Nach Thema":"By topic","Nächste zuerst":"Nearest first","Nach Entfernung sortieren":"Sort by distance","Gemeinde (A–Z)":"Town (A–Z)",
"Website suchen":"Search website","Im Web suchen":"Search the web","gratis":"free","Wikipedia":"Wikipedia","Website der Gemeinde":"Town website","Eintrag bei der Gemeinde":"Town listing",
"Mehr bei der Gemeinde":"More from the town","Zum Angebot":"View offer","Nichts gefunden":"Nothing found","Nichts gefunden.":"Nothing found.","Weitere":"Other","Alles":"All",
"Dein Standort bleibt auf deinem Gerät und wird nirgends gespeichert.":"Your location stays on your device and is not stored anywhere.",
"Dein Browser kann den Standort nicht bestimmen.":"Your browser cannot determine your location.","Du hast den Standort nicht freigegeben.":"You haven't shared your location.",
"Du hast den Standort nicht freigegeben. Du kannst ihn in den Einstellungen deines Browsers erlauben.":"You haven't shared your location. You can allow it in your browser settings.",
"Der Standort konnte nicht bestimmt werden.":"Your location could not be determined.","Sortiert nach Entfernung (Luftlinie) ab deinem Standort.":"Sorted by distance (as the crow flies) from your location.",
"Sortiert nach Entfernung (Luftlinie) ab deinem Standort. Er bleibt auf deinem Gerät.":"Sorted by distance (as the crow flies) from your location. It stays on your device.",
"Die Karte konnte nicht geladen werden.":"The map could not be loaded.","Bewertungen und Fotos auf Google":"Reviews and photos on Google","Keine Gemeinde":"No town","Keine Gemeinde gewählt.":"No town selected.",
"Für diese Auswahl gibt es keine Einträge.":"There are no entries for this selection.","Zu dieser Gemeinde habe ich noch keine Einträge gefunden.":"I haven't found any entries for this town yet.",
"Wähle oben deine Gemeinde.":"Choose your town above.","für Kinder":"for kids","Bezirk":"District","Mein Bezirk":"My district","Nur meine Gemeinde":"Only my town","Ganzer Kanton":"Whole canton",
"Kanton Zürich":"Canton of Zurich","Stadt Zürich":"City of Zurich","jetzt":"now","morgen":"tomorrow","heute":"today","vorbei":"over","Uhr":"","bis":"to",
// Events
"Was läuft für Kinder in deiner Region?":"What's on for kids in your area?","Auch Anlässe ohne Altersangabe":"Include events without an age","Weitere Anlässe":"More events","Alle Anlässe":"All events",
"Passend zum Wetter":"Matching the weather","Drinnen (auch bei Regen)":"Indoors (also when it rains)","Draussen (bei schönem Wetter)":"Outdoors (in good weather)","Drinnen":"Indoors","Draussen":"Outdoors",
"Wetter: Vorhersage für 16 Tage von Open-Meteo. «Drinnen» und «Draussen» erkennt die Seite am Titel und am Ort. Das kann auch einmal danebenliegen.":"Weather: 16-day forecast from Open-Meteo. «Indoors» and «Outdoors» are guessed from the title and the venue, so they can occasionally be wrong.",
"Heute":"Today","Nächstes Wochenende":"Next weekend","Nächste 30 Tage":"Next 30 days","Nächstes":"Next","Wochenende":"weekend","Regen möglich":"Rain possible","Website des Veranstalters":"Organiser's website",
"🔗 Website des Veranstalters":"🔗 Organiser's website","Alter offen":"Any age","Kino":"Cinema","Quartiertreff":"Community centre","Anlässe":"Events","Anlass":"Event","Anlässe aus":"Events from",
"Es werden die ersten 400 Anlässe gezeigt. Wähle einen Tag oder eine Gemeinde, um die Liste einzugrenzen.":"Showing the first 400 events. Choose a day or a town to narrow the list.",
"⭐ Tipp":"⭐ Tip","Nur besondere Anlässe zeigen":"Only show special events","Auch regelmässige Treffs und Kurse zeigen":"Also show regular meetups and courses",
"Du kannst mehrere Gemeinden und Altersgruppen gleichzeitig wählen. Die Anlässe werden jede Nacht automatisch aus den Agenden der Gemeinden, von Familien-Tipps (kinderregion.ch), Anlässen von Vereinen, Höfen und privaten Veranstaltern (localcities.ch, kindaling), Theatern, Konzerthäusern, der Zauberlaterne und den Zürcher Museen gesammelt. «Ab 4 Jahren» zählt bis 12 Jahre mit. Anlässe ohne Altersangabe heissen «Alter offen». Die Erkennung kann Fehler machen, prüfe Alter, Zeit und Anmeldung bitte auf der Detailseite.":"You can select several towns and age groups at once. Events are collected automatically every night from the event calendars of the towns, family tips (kinderregion.ch), events by clubs, farms and private organisers (localcities.ch, kindaling), theatres, concert halls, the Zauberlaterne film club and the Zurich museums. «From 4 years» also counts up to 12 years. Events without an age are shown as «Any age». The detection can make mistakes, so please check age, time and registration on the detail page. Event titles are machine-translated and may sound a bit odd; names of places and organisers stay in the original.",
"Du hast noch keine Anlässe gemerkt. Tippe bei einem Anlass auf das Herz ♡.":"You haven't saved any events yet. Tap the heart ♡ on an event.",
"Für diese Auswahl gibt es keine Anlässe. Wähle einen anderen Tag, mehr Gemeinden oder ein anderes Alter.":"There are no events for this selection. Choose another day, more towns or another age.",
"Die Anlässe konnten nicht geladen werden. Die Datei events.js fehlt im selben Ordner wie diese Seite.":"The events could not be loaded. The file events.js is missing.",
"Beim letzten Sammeln nicht erreichbar:":"Not reachable during the last update:","Dort zeigen wir die älteren Daten.":"Older data is shown for these.",
"Es werden die ersten 150 Anlässe gezeigt.":"Showing the first 150 events.",
// Saison
"Alle Themen":"All topics","Nächste 8 Wochen":"Next 8 weeks","Nächste 2 Wochen":"Next 2 weeks","Nächste 4 Wochen":"Next 4 weeks","Alle Termine":"All dates","Filter Highlights":"Filter highlights",
"Was gerade Saison hat, aus den Agenden aller Gemeinden.":"What's in season, from the event calendars of all towns.","Die Highlights stammen aus den Agenden aller Gemeinden.":"The highlights come from the event calendars of all towns.",
"Die Highlights werden automatisch aus den Anlässen für Kinder herausgesucht, am Titel erkannt. Darum erscheinen je nach Jahreszeit andere Themen. Details, Zeiten und Anmeldung findest du über den Link zum Anlass.":"Highlights are picked automatically from the kids' events based on their title, so the topics change with the season. Details, times and registration are on the event's link.",
"Für diese Auswahl gibt es gerade keine Highlights. Wähle einen längeren Zeitraum.":"There are no highlights for this selection right now. Choose a longer period.",
"Samichlaus":"St Nicholas","Räbeliechtli und Laternen":"Turnip lanterns and lantern walks","Frühling":"Spring","Sommer, Badi und Ferien":"Summer, swimming and holidays","Herbst, Chilbi und Halloween":"Autumn, fairs and Halloween",
"Winter, Schnee und Eis":"Winter, snow and ice","Märkte und Feste":"Markets and festivals","Fasnacht":"Carnival","Ostern":"Easter","Bücher & Geschichten":"Books & stories","Feste, Märkte & Brauchtum":"Festivals, markets & traditions",
"Nächste":"Next","Kindergarten":"Kindergarten","in den nächsten 8 Wochen":"in the next 8 weeks",
// Räume
"Räume für Feste und Anlässe zum Mieten. Preise, freie Termine und Reservation findest du über den Link der Gemeinde.":"Rooms to rent for parties and events. Prices, availability and booking via the town's link.",
"Filter Räume":"Filter rooms","Alle Räume":"All rooms","Bis 30 Personen":"Up to 30 people","Ab 50 Personen":"50+ people","Ab 100 Personen":"100+ people","Ab 200 Personen":"200+ people",
"Preise, freie Termine und Reservation bei der Gemeinde":"Prices, availability and booking via the town","Raumvermietung der Gemeinde":"Town room rental","Raumvermietung":"Room rental",
"Zu dieser Gemeinde habe ich noch keine Räume gefunden. Schau auf der Website der Gemeinde nach.":"I haven't found any rooms for this town yet. Check the town's website.",
"Keine Liste einzelner Räume gefunden.":"No list of individual rooms found.","Für diese Auswahl kenne ich keine Räume.":"I don't know any rooms for this selection.",
"Hier stehen nur Räume, deren Personenzahl bekannt ist.":"Only rooms with a known capacity are listed here.","Räume":"Rooms","Raum":"Room","Reservation bei der Gemeinde":"Book via the town",
"Keine Seite zur Raumvermietung gefunden. Am besten direkt bei der Gemeinde nachfragen.":"No room rental page found. Best to ask the town directly.",
"Keine Seite zur Raumvermietung gefunden. Am besten bei der Abteilung Liegenschaften nachfragen.":"No room rental page found. Best to ask the town's property department.",
"Automatisch aus OpenStreetMap gesammelt. Ob und wie ein Raum gemietet werden kann, steht auf der Website der Gemeinde oder des Betreibers.":"Collected automatically from OpenStreetMap. Whether and how a room can be rented is stated on the website of the town or operator.",
"Eine zentrale Übersicht der Stadt habe ich nicht gefunden.":"I haven't found a central overview from the city.","Eine Übersicht weiterer Räume habe ich nicht gefunden.":"I haven't found an overview of further rooms.",
"Weitere Räume auf der Seite der Gemeinde.":"More rooms on the town's page.","Online buchbar über die Plattform Locaboo.":"Bookable online via Locaboo.",
"Saal":"Hall","Halle":"Sports hall","Kirchgemeinde":"Parish","Zentrum, Treffpunkt":"Centre, meeting place","Waldhütte":"Forest hut","Waldhütten":"Forest huts","Mehrzweckhalle":"Multi-purpose hall",
"Gemeindesaal":"Town hall (room)","Mehrzweckraum":"Multi-purpose room","Aula":"Assembly hall","Singsaal":"Music room","Forsthaus":"Forester's lodge","Jugendtreff":"Youth club","Jugendhaus":"Youth centre",
"Feuerstelle":"Fire pit","Schulräume":"School rooms","Räume der Gemeinde":"Town rooms","Räume der Schule":"School rooms","Sportanlagen und Sporthallen":"Sports grounds and halls",
// Ausflug
"Ausflugsziele in der Region":"Day trips in the region","Tierparks, Museen, Burgen, Aussichtstürme, Erlebnisse und Feuerstellen im Kanton Zürich.":"Zoos, museums, castles, lookout towers, activities and fire pits in the canton of Zurich.",
"Filter Ausflugsziele":"Filter day trips","Bei jedem Wetter":"Any weather","Auch bei Regen (drinnen)":"Also when it rains (indoors)","Auch bei Regen":"Also when it rains",
"Für diese Auswahl gibt es keine Ausflugsziele.":"There are no day trips for this selection.","Bauernhöfe und Hoftiere":"Farms and farm animals","🗺 Bezirke":"🗺 Districts","Bezirk auf der Karte antippen, um ihn zu wählen oder wieder abzuwählen.":"Tap a district on the map to select or deselect it.","Selber pflücken und Maislabyrinth":"Pick your own and maize maze","Bauernhöfe, Ausflugsbeizen, Selberpflücken, Tierparks, Museen und mehr":"farms, country inns, pick your own, zoos, museums and more","Ausflugsbeizen mit Spielplatz":"Country inns with playground","Bauernhöfe, Ausflugsbeizen, Tierparks, Museen, Burgen und mehr":"farms, country inns, zoos, museums, castles and more","Tiere und Tierparks":"Animals and zoos","Museen":"Museums","Erlebnis, Klettern, Minigolf":"Activities, climbing, mini golf",
"Burgen, Schlösser, Ruinen":"Castles, palaces, ruins","Aussichtspunkte und Türme":"Viewpoints and towers","Sehenswürdigkeiten":"Sights","Feuerstellen und Grillplätze":"Fire pits and barbecue spots","Feuerwehr":"Fire brigade",
"Quelle: OpenStreetMap, jede Woche aktualisiert. Öffnungszeiten und Preise bitte vor dem Besuch auf der Website prüfen. «Auch bei Regen» gilt für Museen und Hallen.":"Source: OpenStreetMap, updated weekly. Please check opening hours and prices on the website before visiting. «Also when it rains» applies to museums and indoor venues.",
// Essen
"Kinderfreundliche Restaurants":"Child-friendly restaurants","Restaurants und Cafés zum Hinsitzen, in denen Kinder etwas zu tun haben: Spielplatz direkt nebenan, Spielecke, Tiere oder Malsachen.":"Sit-down restaurants and cafés where kids have something to do: a playground next door, a play corner, animals or colouring things.",
"Filter Restaurants":"Filter restaurants","Alle Merkmale":"All features","Cafés":"Cafés","Gartenwirtschaften":"Beer gardens","Malsachen & Spiele":"Colouring & games","Spielecke drinnen":"Indoor play corner",
"Spielecke draussen":"Outdoor play area","Kindermenü":"Kids' menu","Spielplatz":"Playground","Tiere":"Animals","Kinderstühle":"High chairs","Restaurant":"Restaurant","Café":"Café",
"Lokale mit Spielplatz, Spielecke oder Malsachen":"Places with a playground, play corner or colouring things",
"Es werden die ersten 300 Orte gezeigt. Wähle oben eine Gemeinde.":"Showing the first 300 places. Choose a town above.",
"Quelle: OpenStreetMap, jede Woche aktualisiert. Ein Ort erscheint hier, wenn dort eine Spielecke, Kinderstühle oder ein Kindermenü eingetragen sind oder wenn ein Spielplatz höchstens 60 m entfernt liegt. Orte mit ✅ haben ein ausdrückliches Kinderangebot laut Familien-Ratgebern wie kinderregion.ch, KidZH, Zürich Tourismus, familienleben.ch, lolabrause.ch und femelle.ch, die Quelle ist jeweils verlinkt. Öffnungszeiten bitte vor dem Besuch prüfen.":"Source: OpenStreetMap, updated weekly. A place appears here if a play corner, high chairs or a kids' menu are listed, or if a playground is at most 60 m away. Places marked ✅ have an explicit offer for kids according to family guides such as kinderregion.ch, KidZH, Zürich Tourismus, familienleben.ch, lolabrause.ch and femelle.ch; the source is linked. Descriptions are machine-translated. Please check opening hours before visiting.",
// Familie
"Wochenend-Tipps":"Weekend tips","Jeden Donnerstag die besten Anlässe fürs Wochenende":"Every Thursday: the best events for the weekend","Familienangebote der Gemeinde":"Family services in your town","Was gibt es für Familien in deiner Gemeinde? Beratung, Spielgruppen, Bibliothek, Ludothek, Bäder und Treffpunkte. Wähle oben deine Gemeinde.":"What's there for families in your town? Advice, playgroups, library, toy library, pools and meeting places. Choose your town above.",
"Suche Familienangebote":"Search family services","Alle Angebote":"All services","Mütter- und Väterberatung":"Parent advice (mothers and fathers)","Mütterberatung":"Parent advice","Spielgruppen, Eltern- und Familienvereine":"Playgroups, parent and family associations",
"Bibliotheken":"Libraries","Ludotheken":"Toy libraries","Familienzentren und Treffpunkte":"Family centres and meeting places","Hallenbäder und Badis":"Indoor and outdoor pools","Kitas, Krippen und Horte":"Daycare, nurseries and after-school care",
"Kostenlos für Eltern mit Kindern bis 5 Jahre: Stillen, Ernährung, Schlaf, Entwicklung":"Free for parents of children up to 5: breastfeeding, nutrition, sleep, development",
"Kinder- und Jugendhilfezentren (kjz) des Kantons":"Cantonal youth and family support centres (kjz)","Spielgruppen":"Playgroups","Spielgruppe":"Playgroup","Ludothek":"Toy library","Schwimmbad":"Swimming pool",
"Übersicht Familienangebote Bezirk":"Family services overview, district","Für diese Auswahl gibt es keine Angebote.":"There are no services for this selection.",
"Quellen: Mütter- und Väterberatung und Bezirksübersichten vom Kanton Zürich, Spielgruppen, Elternvereine und Familienzentren aus den Websites und Vereinslisten der Gemeinden, Bibliotheken, Ludotheken, Bäder und Treffpunkte aus OpenStreetMap. Was dort fehlt, fehlt auch hier. Angaben ohne Gewähr, bitte vor dem Besuch auf der Website prüfen.":"Sources: parent advice and district overviews from the canton of Zurich, playgroups, parent associations and family centres from the towns' websites and club lists, libraries, toy libraries, pools and meeting places from OpenStreetMap. What's missing there is missing here too. No guarantee, please check the website before visiting.",
// Betreuung
"Kitas, Horte und Kindergärten":"Daycare, after-school care and kindergartens","Kitas, Krippen, Horte, Mittagstische und Kindergärten in deiner Gemeinde. Wähle oben deine Gemeinde.":"Daycare centres, nurseries, after-school care, lunch clubs and kindergartens in your town. Choose your town above.",
"Suche Kinderbetreuung":"Search childcare","Alle Arten":"All types","Kitas und Krippen":"Daycare and nurseries","Horte, Mittagstische und Tagesstrukturen":"After-school care, lunch clubs and day structures",
"Kindergärten":"Kindergartens","Mittagstisch":"Lunch club","Kita":"Daycare","Tagesstrukturen":"Day structures (after-school care)",
"Quellen: Kinderbetreuungs-Seiten aller Gemeinden, Standortlisten der Kita-Ketten (globegarden, KiMi, pop e poppa) und OpenStreetMap. Monatlich automatisch zusammengeführt, Websites monatlich geprüft. Freie Plätze, Tarife und Anmeldung erfährst du direkt bei der Kita oder bei der Gemeinde. Auskunft zu Betreuungsangeboten gibt auch das Kinder- und Jugendhilfezentrum deines Bezirks.":"Sources: childcare pages of all towns, location lists of daycare chains (globegarden, KiMi, pop e poppa) and OpenStreetMap, merged monthly; websites checked monthly. Ask the daycare or the town about free places, fees and registration. The youth and family support centre (kjz) of your district can also advise on childcare.",
// Vereine
"Vereine für Kinder: Sport, Musik, Pfadi und mehr":"Clubs for kids: sport, music, scouts and more","Sport, Musik, Pfadi, Familie und mehr, aus den Vereinslisten der Gemeinden. Wähle oben deine Gemeinde.":"Sport, music, scouts, family and more, from the towns' club lists. Choose your town above.",
"Filter Vereine":"Filter clubs","Alle Bereiche":"All areas","Website des Vereins":"Club website","Jugendgruppe":"Youth group","Musik und Tanz":"Music and dance","Pfadi und Jugendgruppen":"Scouts and youth groups",
"Sport":"Sport","Familie und Eltern":"Family and parents","Verein suchen, z.B. Unihockey oder Judo":"Search club, e.g. floorball or judo","Verein suchen":"Search club",
"Diese Gemeinden führen ihre Vereine anders auf, sie folgen später.":"These towns list their clubs differently; they will follow later.",
"Die Vereine stammen aus den Vereinslisten der Gemeinden und werden jede Woche aktualisiert. Ob ein Verein Kinder aufnimmt, erkennt die Seite am Namen, zum Beispiel «Pfadi», «Jugendmusik» oder «FC». Turn- und Sportvereine haben meist eine Kinder- oder Jugendriege, Musikvereine oft eine Jugendmusik. Die Website des Vereins stammt aus dem Eintrag bei der Gemeinde. Kontakte findest du dort. Für Zürich und Winterthur, die keine solche Liste haben, kommen die Vereine aus OpenStreetMap. Die Pfadi-Abteilungen aller Gemeinden stammen zusätzlich aus dem Pfadi-Finder der Pfadibewegung Schweiz.":"The clubs come from the towns' club lists and are updated weekly. Whether a club takes children is guessed from its name, e.g. «Pfadi» (scouts), «Jugendmusik» (youth band) or «FC». Gymnastics and sports clubs usually have a children's or youth section, music societies often a youth band. The club website comes from the town's listing, where you'll also find contacts. For Zurich and Winterthur, which have no such list, the clubs come from OpenStreetMap. Scout groups for all towns also come from the Swiss Guide and Scout Movement's finder.",
"Kampfsport":"Martial arts","Indoor-Spielplatz und Trampolin":"Indoor playground and trampoline","Action, Spiele und Sport":"Action, games and sport","Museum, Wissen und Workshop":"Museum, science and workshops",
"Tiere und Bauernhof":"Animals and farm","Kreativ und Basteln":"Creative and crafts",
// Spielplätze
"Öffentliche Spielplätze mit Karte. Wähle oben deine Gemeinde.":"Public playgrounds with a map. Choose your town above.","Filter Spielplätze":"Filter playgrounds","Ausstattung":"Equipment",
"Wasser oder Brunnen":"Water or fountain","Schatten oder Bäume":"Shade or trees","Am Waldrand":"At the forest edge","Auf dem Schulgelände":"On school grounds","auf dem Schulgelände":"on school grounds",
"Rollstuhlgängig":"Wheelchair accessible","Schaukel":"Swing","Rutschbahn":"Slide","Sandkasten":"Sandpit","Klettergerüst":"Climbing frame","Seilbahn":"Zip line","Bäume":"Trees",
"Wähle oben deine Gemeinde oder «Sortieren: Nächste zuerst». Oder tippe hier auf eine Gemeinde:":"Choose your town above or «Sort: nearest first». Or tap a town here:",
"Die Spielplätze werden gerade gesammelt. Schau bald wieder vorbei.":"The playgrounds are being collected. Check back soon.","in deiner Nähe":"near you","Spielplätze in":"Playgrounds in",
"Für diese Auswahl gibt es keine Spielplätze. Wähle weniger Merkmale.":"There are no playgrounds for this selection. Choose fewer features.","Karte der Spielplätze":"Playground map",
"Es werden die ersten 200 Spielplätze gezeigt.":"Showing the first 200 playgrounds.","Auf einem Schul- oder Kindergartengelände":"On school or kindergarten grounds","in der Nähe (bis 80 m)":"nearby (up to 80 m)",
"Schatten oder Dach eingetragen":"Shade or roof listed","Am Waldrand oder an einer Baumreihe":"At the forest edge or by a row of trees","Zu den Spielplätzen":"To the playgrounds",
"Liste: © OpenStreetMap-Mitwirkende (ODbL), jede Woche aktualisiert. Bewertungen und Fotos findest du über den Link zu Google beim Pin. Brunnen, Bäume und Schulgelände stammen aus Einträgen in OpenStreetMap, ohne Schätzung. Viele Spielplätze haben dort keinen Namen, dann steht «Spielplatz» und die Lage auf der Karte. Fehlt einer, kann man ihn auf openstreetmap.org selbst eintragen.":"List: © OpenStreetMap contributors (ODbL), updated weekly. Reviews and photos are available via the Google link at the pin. Fountains, trees and school grounds come from OpenStreetMap entries, without estimates. Many playgrounds have no name there; they are shown as «Playground» with their location on the map. If one is missing, you can add it yourself on openstreetmap.org.",
// Notfall
"Schnelle Hilfe für dein Kind":"Quick help for your child","Kinderarzt und Notfall":"Paediatrician and emergency","Notfallnummern, Kinder-Notfallstationen, Kinderärzte und Apotheken.":"Emergency numbers, children's emergency departments, paediatricians and pharmacies.",
"Filter Kinderarzt und Notfall":"Filter paediatrician and emergency","Lebensgefahr? Sofort anrufen":"Life in danger? Call now","Sanität, rund um die Uhr":"Ambulance, 24/7","Ärztefon, gratis, 24 h":"Doctor hotline, free, 24 h",
"Vergiftung, Tox Info":"Poisoning, Tox Info","Medgate Kids Line, 24 h":"Medgate Kids Line, 24 h","Notfallstationen":"Emergency departments","Kinderärzte":"Paediatricians","Apotheken":"Pharmacies","Telefonnummern":"Phone numbers",
"Hilfe im Kanton Zürich":"Help in the canton of Zurich","Hilfe in deiner Nähe":"Help near you","Was tun bei einem Notfall?":"What to do in an emergency?","Lebensgefahr, bewusstlos, starke Atemnot: sofort 144.":"Life in danger, unconscious, severe breathing difficulty: call 144 immediately.",
"Vergiftung: 145 anrufen, Packung bereithalten.":"Poisoning: call 145 and have the packaging ready.","Sonst zuerst die Kinderarztpraxis anrufen.":"Otherwise call your paediatrician first.",
"Praxis nicht erreichbar: Ärztefon 0800 33 66 55, gratis und rund um die Uhr.":"Practice not reachable: doctor hotline 0800 33 66 55, free and 24/7.","Kinder-Notfallstationen und Permanence":"Children's emergency departments and walk-in clinics",
"Universitäts-Kinderspital Zürich, Notfallstation":"University Children's Hospital Zurich, emergency department","Rund um die Uhr, 0 bis 18 Jahre. Mit Notfallpraxis für leichtere Fälle.":"24/7, ages 0 to 18. With an emergency practice for minor cases.",
"Notfallstation":"Emergency department","Stadtspital Zürich Triemli, Kindernotfall":"Stadtspital Zürich Triemli, children's emergency","Rund um die Uhr (24/7).":"24/7.",
"Kantonsspital Winterthur, Notfallzentrum mit Kindernotfall":"Kantonsspital Winterthur, emergency centre with children's emergency","Notfallzentrum des Spitals, der Kindernotfall ist dort integriert.":"The hospital's emergency centre, with integrated children's emergency.",
"Kinderpermanence Circle (Flughafen)":"Children's walk-in clinic Circle (airport)","The Circle, Zürich-Flughafen (Ebene G5)":"The Circle, Zurich Airport (level G5)","Täglich 8.00 bis 22.45 Uhr, bis 16 Jahre. Anrufen empfohlen.":"Daily 8.00 to 22.45, up to age 16. Calling ahead recommended.",
"Kinder-Permanence, leichtere Notfälle":"Children's walk-in clinic, minor emergencies","Mo–Fr 12 bis 20 Uhr, Sa/So/Feiertage 10 bis 20 Uhr, bis 16 Jahre, ohne Termin.":"Mon–Fri 12 to 20, Sat/Sun/holidays 10 to 20, up to age 16, no appointment needed.",
"Kinderarztpraxen":"Paediatric practices","Die Liste stammt aus OpenStreetMap und ist nicht vollständig. Eine vollständige Suche nach Kinderärztinnen und Kinderärzten bietet das Ärzteverzeichnis der FMH: doctorfmh.ch":"This list comes from OpenStreetMap and is incomplete. For a complete search of paediatricians, use the FMH doctor directory: doctorfmh.ch",
"Wähle oben deine Gemeinde oder «Nächste zuerst».":"Choose your town above or «Nearest first».","Apotheke in der Nacht":"Pharmacy at night",
"Notfallnummer der Zürcher Apotheken: 0900 55 35 55 (CHF 1.50/Min.). Rund um die Uhr offen in Zürich:":"Emergency number of Zurich pharmacies: 0900 55 35 55 (CHF 1.50/min). Open 24/7 in Zurich:",
"Wichtige Nummern":"Important numbers","Sanität, Lebensgefahr":"Ambulance, life in danger","Ärztefon Kanton Zürich: gratis, rund um die Uhr, auch Zahnarzt-Notfall":"Doctor hotline canton of Zurich: free, 24/7, also dental emergencies",
"Tox Info Suisse, Vergiftung (Notfall)":"Tox Info Suisse, poisoning (emergency)","Tox Info Suisse, Beratung":"Tox Info Suisse, advice","Medgate Kids Line, ärztliche Beratung rund um die Uhr (über die Krankenkasse)":"Medgate Kids Line, medical advice 24/7 (via health insurance)",
"Notfallnummer der Zürcher Apotheken (CHF 1.50/Min.)":"Emergency number of Zurich pharmacies (CHF 1.50/min)","Elternnotruf, Hilfe für Eltern rund um die Uhr":"Elternnotruf, help for parents 24/7",
"Pro Juventute, Beratung für Kinder und Jugendliche":"Pro Juventute, advice for children and teenagers","Polizei":"Police",
"Diese Seite ersetzt keine ärztliche Beratung. Im Zweifel 144 oder das Ärztefon anrufen. Nummern und Notfallstellen: Kanton Zürich, Kinderspital Zürich, Stadtspital Zürich, Spital Zollikerberg, KSW. Kinderarztpraxen und Apotheken: © OpenStreetMap-Mitwirkende, jede Woche aktualisiert, was dort fehlt, fehlt auch hier. Öffnungszeiten bitte vor dem Besuch prüfen.":"This page does not replace medical advice. If in doubt, call 144 or the doctor hotline. Numbers and emergency services: canton of Zurich, Children's Hospital Zurich, Stadtspital Zürich, Spital Zollikerberg, KSW. Paediatric practices and pharmacies: © OpenStreetMap contributors, updated weekly; what's missing there is missing here too. Please check opening hours before visiting.",
// Ferienkurse
"Ferienkurse und Ferienpass":"Holiday courses and holiday pass","Kurse, Lager und Anlässe in den Schulferien.":"Courses, camps and events during the school holidays.","Kurse, Lager, Workshops":"Courses, camps, workshops",
"Filter Ferienkurse":"Filter holiday courses","Wähle oben deine Gemeinde: Dann stimmen die Feriendaten und du siehst die Anlässe in deiner Nähe.":"Choose your town above to get the right holiday dates and see events near you.",
"Ferienangebote":"Holiday programmes","Jugendsportcamps Kanton Zürich":"Youth sports camps canton of Zurich","Jahrgänge je Lager":"Birth years per camp","Kurs/Ferienangebot":"Course/holiday programme",
"Rund 30 Sportlager des kantonalen Sportamts im Schnee, in der Halle oder auf dem Wasser, mit Reise, Unterkunft, Essen und Leitung. Plätze nach Eingang der Anmeldung, mit KulturLegi 50 % günstiger.":"Around 30 sports camps run by the cantonal sports office, in the snow, indoors or on the water, including travel, accommodation, meals and supervision. Places are allocated first come, first served; 50 % off with KulturLegi.",
"Ferienprogramme der Gemeinschaftszentren":"Holiday programmes of the community centres","Sportamt Stadt Zürich: Ferien-Sportkurse":"City of Zurich sports office: holiday sports courses","Ferienpass und Kurse":"Holiday pass and courses",
"Für dieses Schuljahr sind keine weiteren Ferien bekannt.":"No further holidays are known for this school year.",
"Noch keine Anlässe in diesem Zeitraum. Viele Gemeinden tragen ihre Ferienangebote erst kurz vorher ein. Wähle einen grösseren Umkreis oder schau später wieder vorbei.":"No events in this period yet. Many towns add their holiday programmes only shortly beforehand. Choose a wider area or check back later.",
"Ferienangebote: ZVV, Pro Juventute, Sportamt Kanton Zürich, Gemeinschaftszentren und Sportamt der Stadt Zürich, Stadt Winterthur. Die Anlässe stammen aus den Agenden der Gemeinden. Daten, Preise und Anmeldung bitte auf der Website des Angebots prüfen.":"Holiday programmes: ZVV, Pro Juventute, cantonal sports office, community centres and sports office of the City of Zurich, City of Winterthur. Events come from the towns' calendars. Please check dates, prices and registration on the programme's website.",
// Geburtstag
"Orte mit Geburtstagsangebot und Ideen zum selber Feiern.":"Places with birthday packages and ideas for your own party.","Filter Kindergeburtstag":"Filter kids' birthday","Jedes Alter":"Any age","10 Jahre und älter":"10 years and older",
"Tipps für den Kindergeburtstag":"Tips for a kids' birthday party","Einladen etwa 2 bis 3 Wochen vorher, beliebte Orte wie den Zoo noch früher reservieren.":"Send invitations about 2 to 3 weeks ahead; book popular places like the zoo even earlier.",
"Faustregel für die Anzahl Gäste: so viele Kinder wie das Alter des Geburtstagskindes.":"Rule of thumb for the number of guests: as many children as the birthday child's age.","2 bis 3 Stunden reichen, bei kleinen Kindern lieber kürzer.":"2 to 3 hours is enough, shorter for little ones.",
"Allergien und Abholzeit bei den Eltern erfragen.":"Ask parents about allergies and pick-up time.","Draussen feiern: einen Plan B für Regen bereithalten.":"Celebrating outdoors: have a plan B for rain.","Selber feiern":"Your own party",
"Selber feiern: Waldhütte, Feuerstelle":"Your own party: forest hut, fire pit","mit Geburtstagsangebot":"with birthday package",
"Wähle oben deine Gemeinde: Dann siehst du Waldhütten, Säle und Feuerstellen in deiner Nähe.":"Choose your town above to see forest huts, halls and fire pits near you.",
"Die Orte stammen aus Familien-Ratgebern wie momizen.com, swissfamilyfun.com und gameplaza.ch sowie von den Websites der Anbieter. Ohne eigene Website führt der Knopf zu einer Websuche. Preise, Alter und Reservation bitte direkt beim Anbieter prüfen. Waldhütten, Säle und Feuerstellen stammen aus den Bereichen Event-Räume und Ausflugsziele.":"Places come from family guides such as momizen.com, swissfamilyfun.com and gameplaza.ch and from the providers' websites. Without a website, the button runs a web search. Please check prices, ages and booking with the provider. Forest huts, halls and fire pits come from the Venues and Day trips sections.",
"Escape Rooms und Lasertag.":"Escape rooms and laser tag.","Trampolinhalle in Rüti.":"Trampoline hall in Rüti.","Erlebnisbauernhof mit Tieren, beliebt für Geburtstage im Grünen.":"Adventure farm with animals, popular for birthdays in the countryside.",
"Trampolinpark in Dübendorf.":"Trampoline park in Dübendorf.","Indoor-Spielplatz für kleinere Kinder.":"Indoor playground for younger children.","Bowling für Kindergeburtstage.":"Bowling for kids' birthdays.",
"Spielmuseum in Altstetten mit Arcade, Konsolen und VR, eigenes Geburtstagspaket.":"Games museum in Altstetten with arcade, consoles and VR, own birthday package.","Bauernhof mit Tieren in Horgen.":"Farm with animals in Horgen.",
"Erlebnisbauernhof am Pfäffikersee mit Spielplatz, Tieren und saisonalen Attraktionen.":"Adventure farm by Lake Pfäffikon with playground, animals and seasonal attractions.","Kindergeburtstage mit kreativem Programm.":"Kids' birthdays with a creative programme.",
"Grosse Kletterhalle mit Angeboten für Kindergruppen.":"Large climbing hall with offers for groups of kids.","Kletterhalle mit Angeboten für Kindergruppen.":"Climbing hall with offers for groups of kids.",
"Kunstmuseum mit Angeboten für Kinder und Familien.":"Art museum with offers for children and families.","Lasertag in der Halle, eher für grössere Kinder.":"Indoor laser tag, better for older kids.",
"Indoor-Spielplatz im Einkaufszentrum Sihlcity, günstig.":"Indoor playground in the Sihlcity shopping centre, affordable.","Bouldern mit Betreuung, eigenes Geburtstagsangebot.":"Supervised bouldering, own birthday package.",
"Saurierskelette und Fossilien, mit Angeboten für Kindergeburtstage.":"Dinosaur skeletons and fossils, with offers for kids' birthdays.","Kletterparcours im Wald, im Frühling und Sommer.":"Rope course in the forest, in spring and summer.",
"Halle für Skateboard, Scooter, BMX und Trampolin.":"Hall for skateboard, scooter, BMX and trampoline.","Indoor-Spielhalle für jüngere Kinder.":"Indoor play hall for younger children.",
"Sternwarte mitten in Zürich, für Gruppen buchbar.":"Observatory in the heart of Zurich, bookable for groups.","Kreative Geburtstagsfeiern mit Geschichten und Basteln.":"Creative birthday parties with stories and crafts.",
"Über 500 Experimente zum Ausprobieren, mit Angeboten für Gruppen und Geburtstage.":"Over 500 hands-on experiments, with offers for groups and birthdays.","Grosser Indoor-Spielplatz mit Trampolinen.":"Large indoor playground with trampolines.",
"Wildtierpark mit Programmen für Gruppen, zum Beispiel «Echt tierisch» für Kinder.":"Wildlife park with programmes for groups, e.g. «Echt tierisch» for kids.","Fliegen im Windkanal, auch als Kinderparty.":"Flying in a wind tunnel, also as a kids' party.",
"Geburtstag mit Experimenten und Forschen.":"Birthday with experiments and discovery.",
"Geführtes Erlebnis für 5 bis 10 Kinder, Mi–Sa nachmittags, CHF 38 pro Kind inkl. Eintritt. Mindestens 3 Wochen vorher buchen, oft lange vorher ausgebucht.":"Guided experience for 5 to 10 children, Wed–Sat afternoons, CHF 38 per child incl. admission. Book at least 3 weeks ahead; often booked out long in advance.",
"Kunsthaus Zürich: Kunst für Familien":"Kunsthaus Zürich: art for families","Zoo Zürich: Kindergeburtstag":"Zoo Zürich: kids' birthday","Minimum Boulderhalle: Kindergeburtstag":"Minimum bouldering hall: kids' birthday","X Labs: Science-Geburtstag":"X Labs: science birthday",
"Kikuka Kindergeburtstage":"Kikuka kids' birthdays",
// Schulferien
"Die Ferien der Volksschule in deiner Gemeinde.":"The public school holidays in your town.","Filter Schulferien":"Filter school holidays","Wähle oben deine Gemeinde für deinen Ferienplan mit Countdown.":"Choose your town above for your holiday plan with countdown.",
"Bei den meisten Gemeinden":"In most towns","Herbstferien":"Autumn holidays","Frühlingsferien":"Spring holidays","Sommerferien":"Summer holidays","Sportferien":"Sports holidays (February)","Weihnachtsferien":"Christmas holidays",
"Sportferien nach Gemeinde":"Sports holidays by town","Heuferien":"Hay holidays","Heuferien statt Frühlingsferien":"Hay holidays instead of spring holidays","In einigen Gemeinden auf dem Land":"In some rural towns",
"Ferien pro Gemeinde":"Holidays by town","Tag":"day","1 Woche":"1 week","Tag der Arbeit":"Labour Day","Für diese Gemeinde fehlen die Daten.":"Data for this town is missing.",
"Dazu kommen bis zu vier freie Tage der Schule, zum Beispiel die Brücke nach Auffahrt. Die findest du bei deiner Schule.":"Plus up to four days off set by each school, e.g. the bridge day after Ascension. Ask your school.",
"Legt jede Gemeinde selbst fest, meist 2 Wochen im Februar oder Anfang März.":"Set by each town, usually 2 weeks in February or early March.",
"Quelle: Schulferien aller Schulgemeinden, Volksschulamt Kanton Zürich. Für spätere Schuljahre zeigen wir die Empfehlung des Kantons, bis die Gemeinden ihre Daten festlegen. Zusätzlich hat jede Schule bis zu vier freie Tage, die findest du bei deiner Schule. Angaben ohne Gewähr.":"Source: school holidays of all school communities, Volksschulamt canton of Zurich. For later school years we show the canton's recommendation until the towns set their dates. Each school also has up to four days off; ask your school. No guarantee.",
// Wetter
"sonnig":"sunny","leicht bewölkt":"partly cloudy","bewölkt":"cloudy","Nebel":"fog","Nieselregen":"drizzle","Regen":"rain","Schnee":"snow","Regenschauer":"rain showers","Schneeschauer":"snow showers","Gewitter":"thunderstorm",
"Wochentags":"Weekdays","In der Nähe":"Nearby","📍 In der Nähe":"📍 Nearby","📍 Suche Standort …":"📍 Finding location …","Umkreis":"Radius","Der Standort ist nicht freigegeben. Wähle auf der Startseite deine Gemeinde, dann geht «In der Nähe» auch ohne Standort.":"Location access is not allowed. Choose your town on the start page and «Nearby» works without location too.","Der Standort konnte nicht bestimmt werden. Wähle auf der Startseite deine Gemeinde, dann geht «In der Nähe» auch ohne Standort.":"Your location could not be determined. Choose your town on the start page and «Nearby» works without location too.","Für diese Liste fehlen die Koordinaten.":"Coordinates are missing for this list.","Pädagogik":"Approach","Wald und Natur":"Forest and nature","Zweisprachig (Deutsch/Englisch)":"Bilingual (German/English)","Erkannt an Name und Website der Kita, auch wenn sie den Ansatz nur teilweise nutzt (z.B. Montessori-Material oder Waldtage). Bitte das Konzept direkt bei der Kita prüfen.":"Detected from the daycare's name and website, also when it uses the approach only partly (e.g. Montessori materials or forest days). Please check the concept directly with the daycare.","Ganzer Bezirk":"Whole district","Ganzen Bezirk wählen oder abwählen":"Select or deselect whole district","Viele Kulturräume, für Kulturveranstaltende oft vergünstigt": "Many cultural venues, often discounted for cultural organisers", "Kulturräume der Stadt Uster": "Cultural venues of the City of Uster", "Grosser Saal im Mönchhof": "Large hall in the Mönchhof", "Kleiner Saal im Mönchhof": "Small hall in the Mönchhof", "Über 20 Säle und Aussenanlagen, online buchbar": "Over 20 halls and outdoor areas, bookable online", "Quartieranlagen Chappeli, Kindhausen, Steibrugg und Gutenswil": "Neighbourhood facilities Chappeli, Kindhausen, Steibrugg and Gutenswil", "Schulhäuser ausserhalb der Schulzeit": "School buildings outside school hours", "Gemeindesaal (grosser und kleiner Saal)": "Town hall (large and small hall)", "Jürg-Wille-Saal im Gasthof Löwen": "Jürg-Wille hall in the Gasthof Löwen", "Turnhallen, Aulen und Schulküchen der Schule": "School gyms, assembly halls and school kitchens", "Waldhütten gibt es keine.": "There are no forest huts.", "Weitere Räume und Anlagen": "More rooms and facilities", "Vermietung Räume und Anlagen": "Rental of rooms and facilities", "Gebühren für Räume und Plätze (PDF)": "Fees for rooms and grounds (PDF)", "Nur eine Gebührenliste gefunden. Für die Reservation bei der Abteilung Bau und Liegenschaften nachfragen.": "Only a list of fees found. Ask the building and property department to book.", "Räume der Gemeinde nur für Einwohnerinnen, Einwohner und Dorfvereine.": "Town rooms only for residents and local clubs.", "Gemeindesaal (ca. 25 sitzend, Küche für 50)": "Town hall (approx. 25 seated, kitchen for 50)", "Chilestube (ca. 25 sitzend, über ref. Kirche)": "Chilestube (approx. 25 seated, via the Reformed church)", "Weitere Räume laut Raumverzeichnis": "More rooms in the room directory", "Räume der Rütner Schulen": "Rooms of the Rüti schools", "Mitteilung zum Nutzungsreglement": "Notice on the rules of use", "immer offen": "always open", "nach Vereinbarung": "by appointment", "auf Anfrage": "on request", "nach Absprache": "by arrangement", "geschlossen": "closed", "Tierparks, Museen, Burgen, Aussichtstürme und mehr": "zoos, museums, castles, lookout towers and more","Brunnen":"Fountain","Trinkbrunnen":"Drinking fountain","Waldrand":"Forest edge","Schatten":"Shade","Spielplatz direkt nebenan":"Playground right next door","Fotos und Bewertungen auf Google":"Photos and reviews on Google","Merkmal":"Feature","Bereich":"Area","Ferien":"Holidays","Umkreis":"Area","bei den meisten Gemeinden":"in most towns","Angebot":"Service","Wetter":"Weather","Mo":"Mon","Di":"Tue","Mi":"Wed","Do":"Thu","Fr":"Fri","Sa":"Sat","So":"Sun","Morgen":"Tomorrow","mit Karte":"with map","zum Entdecken":"to discover","mit Spielmöglichkeit":"where kids can play","und Apotheken":"and pharmacies","Die Gemeinde überarbeitet gerade das Reglement für ihre Räume. Am besten direkt nachfragen.":"The town is currently revising its rules for its rooms. Best to ask directly.","Räume und Veranstaltungsorte":"Rooms and venues","Singsäle und Mehrzweckräume":"Music rooms and multi-purpose rooms","Städtische Säle und Räume":"City halls and rooms","Raum- und Saalangebot":"Rooms and halls","Gemeindeplatz (öffentliche Anlässe)":"Town square (public events)","Beide Säle zusammen, Foyer für Apéros":"Both halls together, foyer for receptions","Liegenschaften der Gemeinde und der Schule":"Town and school properties","Waldhütte mit Unterstand":"Forest hut with shelter"
};
const WD={Mo:"Mon",Di:"Tue",Mi:"Wed",Do:"Thu",Fr:"Fri",Sa:"Sat",So:"Sun"};
const WDL={Montag:"Monday",Dienstag:"Tuesday",Mittwoch:"Wednesday",Donnerstag:"Thursday",Freitag:"Friday",Samstag:"Saturday",Sonntag:"Sunday"};
const MO={Januar:"January",Februar:"February","März":"March",April:"April",Mai:"May",Juni:"June",Juli:"July",August:"August",September:"September",Oktober:"October",November:"November",Dezember:"December",
 Jan:"Jan",Feb:"Feb",Jun:"Jun",Jul:"Jul",Mär:"Mar",Apr:"Apr",Aug:"Aug",Sep:"Sep",Okt:"Oct",Nov:"Nov",Dez:"Dec"};
const NOUN={"Anlass":["event","events"],"Anlässe":["event","events"],"Highlight":["highlight","highlights"],"Highlights":["highlight","highlights"],"Ausflugsziel":["day trip","day trips"],"Ausflugsziele":["day trip","day trips"],
 "Spielplatz":["playground","playgrounds"],"Spielplätze":["playground","playgrounds"],"Restaurant":["restaurant","restaurants"],"Restaurants":["restaurant","restaurants"],"Verein":["club","clubs"],"Vereine":["club","clubs"],
 "Angebot":["service","services"],"Angebote":["service","services"],"Raum":["room","rooms"],"Räume":["room","rooms"],"Ziel":["destination","destinations"],"Ziele":["destination","destinations"],"Ort":["place","places"],"Orte":["place","places"],
 "Gemeinde":["town","towns"],"Gemeinden":["town","towns"],"Tag":["day","days"],"Tage":["day","days"],"Tagen":["day","days"],"Woche":["week","weeks"],"Wochen":["week","weeks"],"Kinderarztpraxen":["paediatric practice","paediatric practices"],
 "Lokale":["place","places"],"Praxen":["practice","practices"]};
const MOre="(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jan|Feb|Jun|Jul|Mär|Apr|Aug|Sep|Okt|Nov|Dez)";
const WDre="(Mo|Di|Mi|Do|Fr|Sa|So)";
const noun=(n,w)=>{const e=NOUN[w];return e?(+n===1?e[0]:e[1]):null};
const tw=s=>D[s]!==undefined?D[s]:null;
function hrs(s){
  const X=window.I18N_EN||{};
  return s.replace(/"([^"]+)"/g,(m,q)=>'"'+(D[q]||X[q]||q)+'"')
   .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|Di|Mi|Do|So)\b(?![a-zäöü])/g,m=>({Mo:"Mon",Tu:"Tue",We:"Wed",Th:"Thu",Fr:"Fri",Sa:"Sat",Su:"Sun",Di:"Tue",Mi:"Wed",Do:"Thu",So:"Sun"})[m])
   .replace(/\bPH\b/g,"public holidays").replace(/\bSH\b/g,"school holidays").replace(/\boff\b/g,"closed").replace(/\bimmer offen\b/g,"always open").replace(/24\/7/g,"24/7")
   .replace(/Feiertage geschlossen/g,"closed on public holidays").replace(/Feiertage/g,"public holidays").replace(/\bgeschlossen\b/g,"closed").replace(/\boffen\b/g,"open")
   .replace(/\bnach Vereinbarung\b/g,"by appointment").replace(/\bauf Anfrage\b/g,"on request").replace(/\bJan\b/g,"Jan").replace(/\bMär\b/g,"Mar").replace(/\bMai\b/g,"May").replace(/\bOkt\b/g,"Oct").replace(/\bDez\b/g,"Dec");
}
function dates(s){
  return s.replace(new RegExp("\\b(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\\b","g"),m=>WDL[m])
   .replace(new RegExp("\\b"+WDre+"(?=( \\d{1,2}\\.)|[–\\-/,]| bis |$|\\[| \\d{1,2}:)","g"),m=>WD[m])
   .replace(new RegExp("(\\d{1,2})\\. ?"+MOre+"\\.?(?=[\\s,·:)]|$)","g"),(m,d,mo)=>d+" "+MO[mo])
   .replace(/(\d{1,2}[.:]\d{2}) ?- ?(\d{1,2}[.:]\d{2}) Uhr/g,"$1–$2").replace(/(\d{1,2}[.:]\d{2}) Uhr/g,"$1")
   .replace(/ bis /g," to ").replace(/Feiertage geschlossen/g,"closed on public holidays").replace(/Feiertage/g,"public holidays").replace(/\bgeschlossen\b/g,"closed");
}
const RULES=[
 [/^Gerade Saison: (.+)\. Die Highlights stammen aus den Agenden aller Gemeinden\.$/,(m,l)=>{let x=l;for(const k of SEASONL)x=x.split(k).join(D[k]);return "In season now: "+x+". "+D["Die Highlights stammen aus den Agenden aller Gemeinden."]}],
 [/^Andere Daten in der (.+)$/,"Other dates at $1"],[/^alle (\d+)$/,"all $1"],[/^(\d+) Ziele: (.+)$/,(m,n,r)=>{const t=tw(r);return t?n+" destinations: "+t:null}],
 [/^(.*) in den nächsten (\d+) Wochen$/,(m,a,n)=>{const r=tr(a);return (r===null?a:r)+" in the next "+n+" weeks"}],[/^(\d+) Anlässe? aus (\d+) Gemeinden?$/,(m,a,b)=>a+(a==="1"?" event":" events")+" from "+b+(b==="1"?" town":" towns")],
 [/^Gerade Saison: (.+)$/,(m,a)=>"In season now: "+(tw(a)||a)],[/^(Heute|Morgen), (.+)$/,(m,a,b)=>(a==="Heute"?"Today":"Tomorrow")+", "+dates(b)],
 [/^(.+), (-?\d+)° bis (-?\d+)°, Regen (\d+) %$/,(m,a,b,c,d)=>(tw(a)||a)+", "+b+"° to "+c+"°, rain "+d+" %"],
 [/^(\d+)[–-](\d+) Jahre$/,"$1–$2 years"],[/^(\d+) bis (ca\. )?(\d+) Jahre$/,(m,a,c,b)=>a+" to "+(c?"approx. ":"")+b+" years"],[/^(\d+) Monate bis (\d+) Jahre$/,"$1 months to $2 years"],[/^ab (\d+) Monaten$/i,"from $1 months"],[/^ab (\d+) Jahren$/i,"from $1 years"],[/^bis (\d+) Jahre$/,"up to $1 years"],[/^bis (\d+) Pers\.$/,"up to $1 people"],
 [/^in (\d+) Tagen$/,"in $1 days"],[/^(\d+) Wochen?$/,(m,n)=>n+(n==="1"?" week":" weeks")],
 [/^(\d+) (\S+) gefunden$/,(m,n,w)=>{const e=noun(n,w);return e?n+" "+e+" found":null}],
 [/^(\d+) (\S+) in (.+)$/,(m,n,w,p)=>{const e=noun(n,w);return e?n+" "+e+" in "+(tr(p)||p):null}],[/^(\d+) (\S+), (\d+) (\S+)$/,(m,a,w,b,v)=>{const e=noun(a,w),f=noun(b,v);return e&&f?a+" "+e+", "+b+" "+f:null}],[/^Spielplatz (\d+) m$/,"Playground $1 m"],[/^(.+) \(([^()]+)\)$/,(m,a,b)=>{const x=tr(a),y=tr(b);return x!==null&&y!==null?x+" ("+y+")":null}],
 [/^(\d+) (\S+)$/,(m,n,w)=>{const e=noun(n,w);return e?n+" "+e:null}],
 [/^(\d+) (\S+) (.+)$/,(m,n,w,r)=>{const e=noun(n,w),t=tw(r);return e&&t!==null?n+" "+e+" "+t:null}],
 [/^(\d+) Gemeinden?: (.+)$/,(m,n,l)=>n+(n==="1"?" town: ":" towns: ")+l],
 [/^Schuljahr ([^·]+)$/,"School year $1"],[/^Bezirk (.+)$/,"District $1"],[/^Raumvermietung (.+)$/,"Room rental $1"],
 [/^Anders in: (.+)$/,(m,l)=>"Different in: "+dates(l)],[/^Noch ohne Vereinsliste: (.+)$/,"No club list yet: $1"],
 [/^Es werden die ersten (\d+) (\S+) gezeigt\. Wähle oben eine Gemeinde(.*)$/,(m,n,w,r)=>{const e=noun(2,w);return e?"Showing the first "+n+" "+e+". Choose a town above"+(r.replace(/ oder einen Bereich/," or an area").replace(/ oder ein Angebot/," or a service")):null}],
 [/^Noch (\d+) Tage? bis zu den (.+)$/,(m,n,f)=>n+(n==="1"?" day":" days")+" until the "+(tw(f)||f).replace(/^(?!Christmas)./,c=>c.toLowerCase())],
 [/^Noch (\d+) Tage? bis (.+)$/,(m,n,f)=>n+(n==="1"?" day":" days")+" until the "+((tw(f)||f)).replace(/^(?!Christmas)./,c=>c.toLowerCase())],
 [/^Jetzt (.+?)!?$/,(m,f)=>{const t=tw(f);return t?"Now: "+t.replace(/^(?!Christmas)./,c=>c.toLowerCase())+(m.endsWith("!")?"!":""):null}],
 [/^Jetzt: (.+)$/,(m,f)=>"Now: "+(tw(f)||f)],
 [/^Ideen für die (.+)$/,(m,f)=>"Ideas for the "+(tw(f)||f).replace(/^(?!Christmas)./,c=>c.toLowerCase())],[/^Ferien bis (.+)$/,(m,d)=>"Holidays until "+dates(d)],
 [/^Hilfe in und um (.+)$/,"Help in and around $1"],
 [/^In (.+) kenne ich keine Apotheke\. Hier die nächsten:$/,"I don't know any pharmacy in $1. Here are the nearest:"],
 [/^In (.+) kenne ich keine Kinderarztpraxis\. Hier die nächsten in der Umgebung:$/,"I don't know any paediatric practice in $1. Here are the nearest in the area:"],
 [/^Zu (.+) kenne ich noch keine Waldhütte, keinen Saal und keine Feuerstelle\. Schau bei den Event-Räumen der Nachbargemeinden\.$/,"I don't know any forest hut, hall or fire pit in $1 yet. Check the venues of neighbouring towns."],
 [/^Wähle oben deine Gemeinde oder «Nächste zuerst»\. Im ganzen Kanton kenne ich (\d+) Kinderarztpraxen\.$/,"Choose your town above or «Nearest first». I know $1 paediatric practices in the whole canton."],
 [/^Anlässe in diesen Ferien \((\d+)\)$/,"Events during these holidays ($1)"],[/^Orte mit Geburtstagsangebot \((\d+)\)$/,"Places with birthday packages ($1)"],
 [/^(Sportferien|Herbstferien|Weihnachtsferien|Frühlingsferien|Sommerferien|Heuferien) (.+)$/,(m,f,r)=>tw(f)+" "+dates(r)],
 [/^Nächste (\d+) Wochen$/,"Next $1 weeks"],[/^(.+) \((\d+)\)$/,(m,a,n)=>{const t=tr(a);return t!==null?t+" ("+n+")":null}],
 [/^Jetzt: (.+)$/,"Now: $1"]
];
const SEASONL=["Samichlaus, Advent und Weihnachten","Räbeliechtli und Laternen","Herbst, Chilbi und Halloween","Sommer, Badi und Ferien","Winter, Schnee und Eis","Märkte und Feste","Bücher & Geschichten","Feste, Märkte & Brauchtum","Fasnacht","Ostern","Frühling","Samichlaus"];
const NAMEP={"Spielplatz":"Playground","Waldspielplatz":"Forest playground","Kinderspielplatz":"Playground","Aussichtspunkt":"Viewpoint","Aussichtsturm":"Lookout tower","Feuerstelle":"Fire pit","Grillstelle":"Barbecue spot","Grillplatz":"Barbecue spot","Rastplatz":"Rest area",
 "Gemeindebibliothek":"Town library","Bibliothek":"Library","Stadtbibliothek":"City library","Ludothek":"Toy library","Spielgruppe":"Playgroup","Waldspielgruppe":"Forest playgroup","Hallenbad":"Indoor pool","Freibad":"Outdoor pool","Strandbad":"Lido","Seebad":"Lake lido","Schwimmbad":"Swimming pool",
 "Kinderkrippe":"Nursery","Krippe":"Nursery","Hort":"After-school care","Mittagstisch":"Lunch club","Tagesstruktur":"Day care (school)","Tagesstrukturen":"Day care (school)","Kindergarten":"Kindergarten","Schulhaus":"School","Primarschule":"Primary school","Familienzentrum":"Family centre","Gemeinschaftszentrum":"Community centre","Waldhütte":"Forest hut","Burgruine":"Castle ruin","Ruine":"Ruin","Schloss":"Castle","Museum":"Museum","Tierpark":"Animal park","Wildpark":"Wildlife park"};
function core(s,nd){
  if(D[s]!==undefined)return D[s];
  const X=window.I18N_EN;if(X&&X[s]!==undefined)return X[s];
  for(const [re,f] of RULES){const m=s.match(re);if(m){const r=typeof f==="string"?s.replace(re,f):f(...m);if(r!=null)return r}}
  if(nd)return null;
  if(new RegExp("^"+WDre+" \\d|^\\d{1,2}\\. ?"+MOre+"|^\\d{1,2}[.:]\\d{2}|^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag), ").test(s)){
    const r=dates(s).replace(/: (\d+) Anlässe?$/,(m,n)=>": "+n+(n==="1"?" event":" events"));if(r!==s)return r}
  const pm=s.match(/^(\S+) (.{2,60})$/);if(pm&&NAMEP[pm[1]]&&!/\d{1,2}\./.test(pm[2])&&!/\b(und|für|der|die|das|mit|von|im|zum|zur)\b/.test(pm[2].replace(/^(bei|beim|an der|am|im) /,"")))return NAMEP[pm[1]]+" "+pm[2].replace(/^bei (der |dem |den )?/,"near ").replace(/^beim /,"near the ").replace(/^(an der|am|im) /,"at ");
  return null;
}
function tr(s){
  let r=core(s,s.includes(" · "));if(r!==null)return r;
  // Emoji/Symbol vorne
  const m=s.match(/^([^\p{L}\d«(]+)(.+)$/u);
  if(m){r=core(m[2]);if(r!==null)return m[1]+r;
    if(/🕒/.test(m[1]))return m[1]+hrs(m[2])}
  // Teile mit " · "
  if(s.includes(" · ")){let ch=false;const p=s.split(" · ").map(x=>{const y=tr(x);if(y!==null&&y!==x){ch=true;return y}return x});if(ch)return p.join(" · ")}
  return null;
}
const ORIG=new WeakMap(),ATTR=["placeholder","title","aria-label","alt"],AORIG=new WeakMap();
let LANG="de",obs=null;
function doText(n){
  const v=n.nodeValue;if(!v||!/[A-Za-zÄÖÜäöü]/.test(v))return;
  const o=ORIG.get(n);if(o&&v===o.en)return;
  const t=v.trim();if(!t)return;const r=tr(t.replace(/\u00AD/g,""));
  if(r===null||r===t)return;
  const en=v.replace(t,r);ORIG.set(n,{de:v,en});if(n.nodeValue!==en)n.nodeValue=en;
}
function doEl(e){
  for(const a of ATTR){const v=e.getAttribute&&e.getAttribute(a);if(!v)continue;const st=AORIG.get(e)||{};
    if(st[a]&&st[a].en===v)continue;const r=tr(v.trim());if(r!==null&&r!==v){st[a]={de:v,en:r};AORIG.set(e,st);if(e.getAttribute(a)!==r)e.setAttribute(a,r)}}
}
function walk(root){
  if(root.nodeType===3){doText(root);return}
  if(root.nodeType!==1||/^(SCRIPT|STYLE)$/.test(root.tagName)||root.closest&&root.closest(".lang-sw"))return;
  doEl(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
  while(n=w.nextNode()){if(n.nodeType===3){if(!n.parentElement.closest("script,style,.lang-sw"))doText(n)}else doEl(n)}
}
function restore(){
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
  while(n=w.nextNode()){if(n.nodeType===3){const o=ORIG.get(n);if(o&&n.nodeValue===o.en)n.nodeValue=o.de}else{const st=AORIG.get(n);if(st)for(const a in st)if(n.getAttribute(a)===st[a].en)n.setAttribute(a,st[a].de)}}
}
let busy=false,loadingEN=false;
function apply(l){
  LANG=l;document.documentElement.lang=l;
  if(obs){obs.disconnect();obs=null}
  if(l==="en"&&!window.I18N_EN&&!loadingEN){loadingEN=true;const sc=document.createElement("script");sc.src="en.js";sc.onload=()=>{if(LANG==="en"){busy=true;try{walk(document.body)}finally{busy=false;obs&&obs.takeRecords()}}};document.head.appendChild(sc)}
  if(l==="en"){walk(document.body);document.title="For Families in Zurich";
    obs=new MutationObserver(ms=>{if(busy)return;busy=true;try{for(const m of ms){if(m.type==="characterData")doText(m.target);else if(m.type==="attributes")doEl(m.target);else m.addedNodes.forEach(walk)}}finally{busy=false;obs&&obs.takeRecords()}});
    obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR})}
  else{restore();document.title="Für Familien in Zürich"}
  document.querySelectorAll(".lang-sw button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.l===l)));
}
// Umschalter auf der Startseite
const css=document.createElement("style");
css.textContent=".lang-sw{position:relative;margin:10px 0 -6px auto;width:max-content;display:flex;gap:2px;background:var(--card,#fff);border:1px solid var(--line,#d6dbe3);border-radius:999px;padding:3px;z-index:5;box-shadow:0 1px 3px rgba(0,0,0,.08)}"+
".lang-sw button{border:0;background:transparent;color:inherit;font:600 13px/1 system-ui,sans-serif;padding:7px 11px;border-radius:999px;cursor:pointer;min-width:40px}"+
".lang-sw button[aria-pressed=true]{background:var(--zh,#0f05a0);color:#fff}";
document.head.appendChild(css);
function mkSw(){const sw=document.createElement("div");sw.className="lang-sw";sw.setAttribute("role","group");sw.setAttribute("aria-label","Sprache / Language");
for(const [l,t,ti] of [["de","DE","Deutsch"],["en","EN","English"]]){const b=document.createElement("button");b.type="button";b.dataset.l=l;b.textContent=t;b.title=ti;b.lang=l;
  b.addEventListener("click",()=>{if(l===LANG)return;try{localStorage.setItem("fa-lang",l)}catch(e){}apply(l)});sw.appendChild(b)}
return sw}
const home=document.getElementById("view-home");if(home)home.prepend(mkSw());
// Auch in jedem Unterthema, oben rechts im Kopfbereich
css.textContent+=".subscene .lang-sw{position:absolute;top:12px;right:max(14px,env(safe-area-inset-right,0px));margin:0}.subscene.has-sw .sun{top:62px}.wrap .subscene.has-sw .subbar{right:112px}.wrap>.lang-sw.sub{margin:6px 0 0 auto}";
document.querySelectorAll(".wrap:not(.home)").forEach(w=>{const sc=w.querySelector(":scope>.subscene");if(sc){sc.classList.add("has-sw");sc.append(mkSw())}else{const x=mkSw();x.classList.add("sub");w.prepend(x)}});
let init="de";
try{const q=new URLSearchParams(location.search).get("lang");const s=localStorage.getItem("fa-lang");
  if(q==="en"||q==="de")init=q;else if(s)init=s;else if(!/^de/i.test(navigator.language||"de")&&/^en/i.test(navigator.language||""))init="en"}catch(e){}
apply(init);
window.I18N={set:apply,tr,get lang(){return LANG}};
})();
