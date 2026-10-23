# Oxyzen – appkoncept (utkast 1, 2026-10-21)

Syfte: en mobilapp för kunder på longevity-centret i Malmö som håller reda på
syrgaskammar-sessioner (HBOT), visar var man är i sitt protokoll och hjälper till
under själva sessionen (maskcykel-larm). Svenska först, engelska senare.

Ton: wellness, inte vård. Vi pratar om energi, sömn, fokus och återhämtning.
Vi lovar inga medicinska resultat.

---

## 1. Vad forskningen och de kända protokollen säger

| Källa | Sessioner | Tryck | Tid | Mask |
|---|---|---|---|---|
| Sagol Center / Efrati (Aging, 2020, 35 friska 64+) | 60 på 90 dagar, 5 dgr/vecka | 2,0 ATA | 90 min | 100 % O2, 5 min luftpaus var 20:e min |
| Bryan Johnson (Blueprint, 2026) | 60 på 90 dagar, 5 dgr/vecka | 2,0 ATA | 90 min | 20 min på / 5 min av |
| Efrati, kliniska program (hjärnskada, fibromyalgi, PTSD) | 40–60 | 2,0 ATA | 90–120 min | 20/5-cykler |
| "Mild HBOT" (mjuka kammare) | varierar | 1,3–1,5 ATA | 60 min | ofta utan mask |

Observationer:

- **Tröskelvärdena 20 / 40 / 60** finns inte som fasta gränser i litteraturen.
  Den tydliga datapunkten är 60 sessioner (telomer- och senescensdata från
  Sagol). 20 och 40 är erfarenhetsbaserade steg från kliniker. I appen bör vi
  därför prata om dem som *milstolpar i resan*, inte som medicinska löften.
- **20 sessioner har faktiskt stöd**: Thom m.fl. 2006 (Am J Physiol Heart Circ
  Physiol) mätte åttafaldig ökning av cirkulerande stamceller (CD34+) hos
  människor över en kur på 20 behandlingar vid 2,0 ATA. En enda session
  fördubblade dem. Mekanismen är kväveoxid-signalering. Litet urval, men det
  är den bästa förankringen vi har för "20 är minimum".
- **Dos-respons**: en översikt (Frontiers in Medicine 2023) ser en linjär
  dos-respons från 1,3 till 2,0 ATA. Mer tryck = mer effekt, men också mer
  belastning (öron, syrgastoxicitet, trötthet).
- **Luftpauserna är poängen** i "hyperoxic-hypoxic paradox": kroppen tolkar
  syrgasfallet när masken tas av som hypoxi och svarar med reparation
  (VEGF, stamceller, telomeras). Det är alltså inte en komfortgrej utan en
  del av protokollet. Bra argument för att ha larmfunktionen.
- **Äldre**: ingen riktlinje säger "max 1,6 ATA för 70+". Det är en
  försiktighetsregel från praktiken (öron, lungor, hjärta). Vi kan ha det som
  rekommenderad default i appen baserat på ålder, med personal-override.
- **Över 2,0 ATA**: kliniskt används 2,4–2,5 ATA för sårläkning och
  CO-förgiftning, inte för wellness. Lås det bakom "avancerat läge" som bara
  personal kan aktivera.

Källor: Blueprint-bloggen (blueprint.bryanjohnson.com), Aging 2020 (Hachmo,
Efrati m.fl.), Frontiers in Medicine 2023 (dos-översikt), ANZHMG-uttalande om
mild HBOT, otandp.com (sekundärkälla, kommersiell).

- **Frekvens och uppehåll**: det finns inget belägg för att effekten
  "försvinner" efter några dagars uppehåll. En retrospektiv studie på 159
  patienter (strålskador) såg samma resultat oavsett om man gjorde färre
  eller fler än 5 behandlingar per vecka; det totala antalet (30+) avgjorde.
  Kliniker (t.ex. Penn Hyperbarics) beskriver att nya kärl börjar bildas
  efter 6–8 sessioner och stabiliseras vid 30–40, och rekommenderar dagliga
  sessioner i följd. Appens påminnelse efter 5 dagar är därför formulerad
  som "kontinuiteten bär effekten", inte "effekten avtar".

---

## 2. Föreslagna protokoll i appen

Tre parametrar styr allt: **antal sessioner**, **tryck**, **tid per session**.
Protokollen är bara förinställda kombinationer plus en milstolpe-karta.

| Protokoll | Sessioner | Tryck | Tid | Mask | Målgrupp |
|---|---|---|---|---|---|
| Prova på | 1–5 | 1,5 ATA | 60 min | valfritt | nyfikna, först gången |
| Grund | 20 | 1,5–1,8 ATA | 60 min | 20/5 | "minimum för att känna skillnad" |
| Fördjupning | 40 | 1,8–2,0 ATA | 60–90 min | 20/5 | de som vill fortsätta |
| Longevity | 60 | 2,0 ATA | 90 min | 20/5 | fullt forskningsprotokoll |
| Bryan Johnson | 60 på 90 dagar | 2,0 ATA | 90 min | 20/5, 5 dgr/vecka | biohackers, säljer sig själv på namnet |
| Senior / Varsam | 20–40 | 1,5–1,6 ATA | 60 min | 20/5 eller utan | 65+ eller känsliga öron |
| Underhåll | 4–8 / månad | valfritt | 60 min | 20/5 | efter avslutad 60-kur och paus |

Milstolpar, utkast 2. Varje milstolpe har en rubrik (visas i ringen och
tidslinjen), en kort text (push-notis och kort i Hem) och en längre text
(när man trycker på milstolpen). Tonen är "så här brukar det kännas" och
"så här säger forskningen", aldrig "du kommer att".

| Session | Rubrik | Kort text (push) | Lång text (vid tryck) |
|---|---|---|---|
| 1 | Första andetaget | Första sessionen klar. Många känner sig lugna och lite sömniga efteråt, det är helt normalt. | Redan efter en session fördubblas antalet cirkulerande stamceller tillfälligt (Thom 2006). Det är inget du märker, men kroppen har börjat svara. Drick vatten, ta det lugnt i kväll och notera hur du sover. |
| 3 | Rytmen sitter | Tre sessioner. Nu brukar tryckutjämningen i öronen gå på rutin. | De första gångerna handlar mest om att vänja sig: trycket, masken, att sitta still. Från och med nu kan du börja lägga märke till små saker, som att du somnar lättare eller känner dig jämnare i energin. |
| 10 | Halvvägs till grund | Tio sessioner. Det är här många först beskriver att sömnen och energin känns annorlunda. | Du har gjort tio av de tjugo som de flesta program ser som ett minimum. Effekterna i det här skedet är subtila och individuella. Titta gärna på dina egna måendekurvor i appen, de säger mer än någon generell beskrivning. |
| 20 | Grund klar | Tjugo sessioner. Det är den kur forskningen mätt stamcellsökning över. Bra jobbat. | I en studie från 2006 ökade antalet cirkulerande stamceller åtta gånger över en kur på tjugo sessioner vid 2,0 ATA. Tjugo är också det minsta antal de flesta kliniker rekommenderar för att få en kännbar effekt. Du kan avsluta här, pausa, eller fortsätta mot 40. |
| 30 | Halvvägs i resan | Trettio sessioner. Halvvägs till det fulla 60-protokollet. | Nu är du i det spann där de flesta beskriver att återhämtning efter träning och fokus under dagen känns annorlunda. Fortsätt med samma rytm, 3–5 gånger i veckan ger bäst kontinuitet. |
| 40 | Fördjupning klar | Fyrtio sessioner. Du är i det spann som kliniska program jobbar i. | Program för hjärnhälsa, fibromyalgi och återhämtning efter skada använder ofta 40 sessioner. Vi gör inga medicinska påståenden, men du har nu gett kroppen den dos som de programmen bygger på. Vill du gå hela vägen är det 20 kvar. |
| 50 | Slutspurt | Femtio sessioner. Tio kvar till hela forskningsprotokollet. | Håll i rytmen den sista biten. Det är kontinuiteten över hela kuren som studierna bygger på, inte enskilda sessioner. |
| 60 | Longevity klar | Sextio sessioner. Hela forskningsprotokollet. Nu är det dags för paus. | Sextio sessioner på ungefär tre månader är det protokoll som Sagol Center studerade 2020, där man såg längre telomerer och färre åldrade celler i immunsystemet. Vi rekommenderar en paus på 4–8 veckor. Appen säger till när det är dags att börja med underhåll. |

Protokoll-specifika avvikelser:

- **Prova på** har bara milstolpe 1 och ett eget avslut: "Vill du fortsätta?
  Grund är tjugo sessioner och det är där effekterna brukar börja synas."
- **Senior/Varsam** byter ut texten på 1 och 3 till att handla om öron och
  lugnt tempo, och skippar stamcells-siffrorna.
- **Bryan Johnson** får en extra rad per vecka: "Vecka 4 av 12. Blueprint-
  tempot är fem dagar i veckan." Namnet bör kontrolleras juridiskt, se nedan.
- **Underhåll** har inga milstolpar, bara en månadsräkning.

Efter 60: appen föreslår paus, visar datum när Underhåll kan starta, och
skickar en push när pausen är över.

---

## 3. Skärmar

1. **Hem** – stor progress-ring ("Session 23 av 60"), nästa milstolpe, nästa
   bokade tid, kvarvarande sessioner på kortet, senaste måendetrend.
2. **Min resa** – tidslinje med milstolparna ovan, var man är, vad som väntar.
3. **Sessionsläge** – startas i kammaren. Stor timer, tryck och mål-tid,
   maskcykel-indikator (20 min på / 5 min av), larm med ljud + vibration +
   blinkande skärm vid varje byte. Skärmen hålls tänd. Går att stänga av
   maskcykeln för dem som vill sitta utan mask eller prata i telefon.
   Val av cykel: 20/5 (standard), 25/5, 30/5 eller av.
4. **Efter sessionen** – tre snabba frågor (energi, sömn senaste natten,
   fokus; 1–5) plus fritext. Tar 10 sekunder. Ger kurvorna i Hem.
5. **Historik** – lista och kalender över alla sessioner med tryck, tid, mask.
6. **Protokoll** – välj protokoll, se parametrarna, byt protokoll (med
   bibehållen räkning).
7. **Profil** – ålder, rekommenderat tryck, kontraindikations-checklista
   (förkylning, öroninflammation, graviditet, lungsjukdom m.m.), samtycke.

Personalen (admin-webb):

- Skapa kund, registrera köpt paket (antal sessioner).
- Checka in en session (datum, tryck, tid, mask) – alternativt kunden gör det
  själv och personalen bekräftar.
- Se saldo, skicka push ("du har 3 sessioner kvar", "pausen är slut").
- Senare: import från CRM/bokningssystem.

---

## 4. Teknik och kostnad

**Appen: Expo (React Native).** En kodbas som ger iOS-app, Android-app och
en webbversion. Anledningen till att inte köra ren webbapp (PWA):

- iOS-PWA kan inte spela larmljud eller vibrera pålitligt när skärmen är låst
  eller appen ligger i bakgrunden. Maskcykel-larmet är kärnfunktionen i
  kammaren, så det måste fungera.
- Push-notiser till iOS-PWA kräver att användaren lägger appen på hemskärmen,
  vilket få gör.
- App Store-närvaro ger trovärdighet för ett premiumkoncept.

Kostnad: Expo gratis, Apple Developer 99 USD/år, Google Play 25 USD engång.

**Backend: Supabase** (Postgres + auth + API + row-level security). Gratis
upp till 500 MB databas och 50 000 månadsaktiva användare, vilket räcker i
flera år. Alternativ är Firebase, men Supabase ger vanlig SQL som är enklare
att koppla till CRM senare.

**Inloggning:** e-post med engångskod eller magisk länk. Inga lösenord.
BankID är möjligt senare men kostar via ombud.

**Admin-webb:** enkel Next.js-sida på Vercel (gratis) mot samma Supabase.
Alternativt Retool/Appsmith gratisnivå om vi vill slippa bygga.

**Datamodell (grov):**

- `customer` – namn, e-post, telefon, födelseår, protokoll, samtycken
- `purchase` – kund, antal sessioner, pris, datum, källa (manuell/CRM)
- `session` – kund, datum, tryck, längd, maskläge, utförd av, anteckning
- `checkin` – session, energi, sömn, fokus, fritext
- `protocol` – namn, antal, tryck, tid, maskcykel, milstolpar (JSON)

Saldo = summa köpta − antal genomförda.

Löpande kostnad: ca 0 kr/mån tills vi passerar tusentals kunder.

---

## 4b. Status 2026-10-21

Första versionen av appen är byggd i `app/` (Expo). Allt lokalt, ingen
inloggning. Se `app/README.md` för struktur och hur man kör. Påminnelse
efter X dagar (default 5) finns som inställning.

## 5. Saker att reda ut

1. **Får man ha mobilen i kammaren?** I en multiplace-kammare med vanlig luft
   (21 % O2) och mask är det ofta okej, i monoplace med 100 % O2 är det
   förbjudet. Kolla med leverantören. Om nej: timern körs på en platta
   utanför kammaren eller på en skärm genom fönstret, och appen loggar i
   efterhand.
2. **Vem registrerar sessionen** – kunden (scannar QR i kammaren) eller
   personalen? Förslag: kunden startar sessionsläget, personalen bekräftar.
3. **Hälsodata och GDPR** – måendesvar och kontraindikationer är hälsodata
   (särskild kategori). Kräver uttryckligt samtycke och lagring inom EU
   (Supabase har Frankfurt). Hanteras i profil-steget.
4. **Påståenden** – marknadsföringslagen och Konsumentverket är hårda mot
   hälsopåståenden. Milstolpe-texterna ovan är skrivna som "många upplever",
   inte "du får". Bör gås igenom innan lansering.
5. **Bokning** – ska appen också boka tider, eller bara tracka? Bokning är
   ett eget projekt. Förslag: länka till befintligt bokningssystem i v1.
6. **Namnet "Bryan Johnson-protokollet"** – att använda en levande persons
   namn i en betald tjänst är juridiskt osäkert (namnrätt, varumärket
   Blueprint). Säkrare: kalla det "Blueprint-stil" eller "60/90/2.0" med
   beskrivningen "samma protokoll som Bryan Johnson kör".
7. **Hårbåt / kryo / andra tjänster** – datamodellen bör ha en `service_type`
   från start så att fler tjänster kan tracka på samma sätt.
