# Oxyzen – mobilapp

Kundapp för syrgaskammar-sessioner (HBOT). Expo / React Native, körs på iOS,
Android och webb från samma kod. Svenska. All data sparas lokalt på enheten
(ingen inloggning, ingen server) i den här versionen.

## Köra

```bash
npm install --legacy-peer-deps
npx expo start
```

- Tryck `w` för webbläsare, eller skanna QR-koden med Expo Go på telefonen.
- iOS: Expo Go räcker för allt utom bakgrundsnotiser som kräver en
  development build (`npx eas-cli@latest build --profile development`).
- Typkontroll: `npm run typecheck`.

## Struktur

```
src/app/              Skärmar (Expo Router, filnamn = route)
  _layout.tsx         Root: store, stack, påminnelse-synk
  onboarding.tsx      Namn, födelseår, protokoll, köpta sessioner
  (tabs)/index.tsx    Hem: progressring, nästa milstolpe, statistik, måendekurva
  (tabs)/journey.tsx  Min resa: milstolpe-tidslinje
  (tabs)/history.tsx  Historik: alla sessioner, redigera/ta bort
  (tabs)/profile.tsx  Profil, protokoll, köp, larm- och påminnelseinställningar
  session-setup.tsx   Tryck, längd, maskcykel inför session
  session.tsx         Sessionsläge: timer, maskcykel, larm, pausa, avsluta
  checkin.tsx         Tre frågor efter sessionen (energi, sömn, fokus)
  milestone.tsx       Lång text för en milstolpe
  protocols.tsx       Byt protokoll
  add-sessions.tsx    Registrera köpt paket
  log-session.tsx     Logga session i efterhand
src/lib/
  protocols.ts        Alla protokoll och milstolpetexter (redigera här)
  store.tsx           State, reducer, AsyncStorage, härledda värden
  alarm.ts            Ljud, vibration, bakgrundsnotiser för maskbyten
  reminder.ts         Påminnelse X dagar efter senaste session
  types.ts, theme.ts, format.ts
src/components/       ui.tsx (kort, knappar, rader), ProgressRing, TrendChart
assets/alarm.wav      Larmljud (genererat)
```

## Hur sessionsläget fungerar

- Tiden räknas från en tidsstämpel, inte från en räknare, så den är rätt
  även om appen legat i bakgrunden.
- Faserna byggs upp av maskcykeln (20/5 osv). Vid varje fasbyte: ljud,
  vibration och blinkande bakgrund. Kan stängas av var för sig under Profil.
- På iOS/Android schemaläggs dessutom en lokal notis per maskbyte, så larmet
  kommer även med låst skärm. Det går inte i webbläsaren.
- Pausa stoppar klockan och planerar om notiserna.
- Avsluta före halva tiden: sessionen sparas inte. Efter halva tiden:
  sparas med faktisk längd.

## PWA (webbapp som installeras på hemskärmen)

Samma kod byggs till en statisk webbsida med manifest, ikoner och service
worker, så att den går att lägga på hemskärmen på iPhone och Android.

```bash
npm run build:web     # bygger till dist/
npm run serve:web     # testar bygget lokalt på http://localhost:8090
```

Filerna som gör den till en PWA ligger i `public/`:

- `index.html` – HTML-mall med manifest-länk, Apple-metataggar och
  registrering av service workern
- `manifest.json` – namn, färger, ikoner, `display: standalone`
- `sw.js` – cachar appen så den startar utan nät
- `icon-*.png`, `apple-touch-icon.png` – genererade ikoner (ring i mässing
  på sand). Byt ut mot riktiga när loggan finns som bild.

Hosting: ladda upp `dist/` till valfri statisk host. Gratisalternativ som
fungerar direkt: Cloudflare Pages, Netlify, Vercel. Kräver HTTPS, vilket
alla tre ger automatiskt. Eftersom appen är en single-page app behöver
hosten skicka `index.html` för alla sökvägar (Netlify: `_redirects` med
`/* /index.html 200`, Vercel: `rewrites` i `vercel.json`).

Installera på iPhone: öppna adressen i Safari, tryck Dela, "Lägg till på
hemskärmen".

Begränsningar i PWA jämfört med native:

- Inga notiser med låst skärm på iOS, så maskbytes-larmet kräver att appen
  är öppen med skärmen tänd. Appen håller skärmen vaken under sessionen
  (Wake Lock, iOS 16.4+).
- Påminnelsen efter X dagar visas som kort i appen, inte som push.

## Nästa steg

- Backend (Supabase) + inloggning + admin-webb så att centret registrerar
  köp och sessioner. Se `../docs/koncept.md`.
- App Store / Google Play via EAS Build.
- Engelska.
