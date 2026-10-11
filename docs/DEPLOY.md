# Hosait: test og produksjon

Test: `https://spilka.hosait.com` (Spilka Industri), `sbs.spilka.hosait.com`, `dws.spilka.hosait.com`.
Hosait følger `main`. Arbeid pushes til `dev`; Bjørn merger/deployer i Hosait.

## Engangsoppsett i Hosait (eier)

| Hvor | Hva |
|---|---|
| Settings → Variables | `PUBLIC_URL=https://spilka.hosait.com`, `STAGING_HOST=spilka.hosait.com` (SITE_ORIGINS står tom = staging) |
| Settings → Domains → hosait-raden | Slå på *Subdomains of the Hosait address* |
| Settings → Object storage | Public folder = `public/` |
| Settings → API tokens | Token med `read`, `deploy`, `exec`, `maintenance` |

## Fylle testinstallasjonen (anbefalt: knapp i admin)

Repoet inneholder `seed/` (lages med `node scripts/deploy/export-seed.mjs`). Logg inn på `https://spilka.hosait.com/admin` som administrator. Øverst på forsiden står panelet **Testinnhold**:

1. **Legg inn innhold**: erstatter alt innhold med testinnholdet (tar sekunder; brukere berøres ikke).
2. **Hent bilder og dokumenter**: henter fra dagens Craft-nettsteder og legger dem i S3 (ca. 15 min, i bakgrunnen, med fremdrift).

Panelet vises ikke når `SITE_ORIGINS=production`.

Alternativt med `CRON_SECRET`, f.eks. fra en oppgave på tjenesten **web**:

1. Database (sekunder): `wget -qO- --post-data= --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/seed/db`
2. Bilder og dokumenter (~15 min, i bakgrunnen; hentes fra dagens Craft-nettsteder og legges i S3): `wget -qO- --post-data= --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/seed/media`
3. Fremdrift: `wget -qO- --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/seed/status`

Ruten er sperret når `SITE_ORIGINS=production`. Brukerne i CMS-et berøres ikke.

## Alternativ: innhold fra lokal maskin til Hosait (krever S3-nøkler og token)

1. `node scripts/deploy/export-db.mjs` lager `import-data/export/content.sql.gz`. Den inneholder bare innhold; brukerne på Hosait berøres ikke.
2. Med S3-variablene fra prosjektet satt, kjør `node scripts/deploy/upload-s3.mjs`:
   - Bilder går til `public/media` og dokumenter til `public/documents`.
   - Databasedumpen går til `private/db`.
   - En tidsbegrenset lenke (1 time) skrives til `import-data/export/restore-url.txt`.
3. Via Hosait-MCP, gjør dette i rekkefølge:
   - Slå på vedlikehold: `set_maintenance(true)`.
   - Kjør `run_task({service: "postgres", command: "wget -qO- '<lenke>' | gunzip | psql -v ON_ERROR_STOP=1 -q -U spilkawww -d spilkawww"})`.
   - Slå av vedlikehold: `set_maintenance(false)`.
4. Tøm cachen: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://spilka.hosait.com/next/revalidate`. Alternativt `restart()`.
5. Verifiser:
   - `pnpm qa:urls https://spilka.hosait.com`: skal gi 364/364.
   - `BASE_URL=https://spilka.hosait.com pnpm test:e2e`
   - `pnpm qa:axe https://spilka.hosait.com`

Testet lokalt i en ny produksjonsstack: migreringene kjører, gjenopprettingen virker, alle 364 URL-er svarer, varm TTFB er under 10 ms og minnebruken er 307 MB (web) og 108 MB (postgres).

## Søk

Søket (`/no/sok`, `/en/search` og knappen i headeren) søker i sider, artikler, dokumenter (også teksten i PDF-ene) og personer på alle tre nettsteder. Det bruker Postgres-fulltekst på tabellen `search_index`.

- Indeksen oppdateres automatisk når innhold publiseres, endres eller slettes. Personer merket «Har sluttet» og sider med noindex tas ikke med.
- Import som går utenom CMS-et (SQL-gjenoppretting, `export-db`) oppdaterer ikke indeksen. Bygg den på nytt med **Bygg søkeindeks** på forsiden i admin, eller med `wget -qO- --post-data= --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/search/reindex`. Testinnhold-knappene gjør dette selv.
- Etter første deploy med søket: trykk **Bygg søkeindeks** én gang (tar under ett minutt).

## Besøksanalyse, cookie-banner og kontaktskjema

Rapportene ligger i admin under **Besøksanalyse** (`/admin/analytics`). Menyen vises bare for administratorer og for brukere som har krysset av for «Tilgang til besøksanalyse» under Brukere.

- **Innsamling:** et lite skript sender hendelser til `/next/a`, og de lagres i tabellen `analytics_events` i Postgres. Det er ingen ekstern tjeneste og ingen IP-adresser. Land slås opp i `data/geo-country.mmdb` (CC0), som kopieres inn i imaget i Dockerfile.
- **Samtykke:**
  - Cookie-banneret (`src/components/analytics/ConsentBanner.tsx`) setter `spilka-consent` og, med samtykke, `spilka-vid`.
  - Valgene logges i Samtykkelogg.
  - Statistikk uten samtykke kan slås av under Innstillinger og cookies.
  - Øk `CONSENT_VERSION` i `src/lib/analytics/consent.ts` for å spørre alle på nytt.
- **Lagringstid:** hendelser slettes etter 395 dager, daglige summer etter 760 dager (25 måneder) og samtykkelogg etter 3 år. Alt kan endres i innstillingene.
- **Daglige summer** (`analytics_daily`, bare tall) lages automatisk høyst én gang i timen, for hele dager. De gir «Utvikling per måned» i Oversikt og sammenligning med samme måned i fjor også etter at rådataene er slettet.
- **Månedsrapport:** Rapporter → velg måned. Viser nøkkeltall mot forrige måned og samme måned i fjor, kanaler, produktgrupper, sider, land, konverteringer og søk uten treff. «Skriv ut / lagre som PDF» skriver ut uten admin-menyen. CSV for hver liste.
- **Ytelse** (målt 8. okt.):
  - Sporingsskriptet er 1,5 kB og banneret 1,9 kB, minifisert og komprimert.
  - Hendelsene sendes med `sendBeacon` etter at siden er lastet, og ingen lange oppgaver ble målt i nettleseren.
  - Lastetid og LCP på Hosait var uendret innenfor måleusikkerheten.
  - Mottaket bruker median 17 ms per hendelse (lokalt, dev).
- **Spilka360:** forslag i [spilka360-integrasjon.md](spilka360-integrasjon.md), ikke bygget.
- **Produktgrupper:** feltet «Produktgruppe» på sider og dokumenter bruker koder fra Spilka360, og arves av undersider. Migrasjonen `20261008_131300_analytics_setup` setter dem på produktsidene og dokumentene. Lokalt gjøres det samme med `pnpm tsx scripts/analytics-setup.ts`.
- **Kontaktskjema:**
  - Skjemaene «Kontaktskjema» og «Contact form» legges nederst på kontaktsidene av migrasjonen og av «Legg inn innhold».
  - Innsendinger ligger under Skjema → Innsendinger, med nettsted, side og produktgruppe.
  - **E-postvarsel krever SMTP:** sett `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` og `SMTP_FROM` i Hosait, og legg til mottakere under Skjema → (skjemaet) → E-poster. Uten SMTP skrives e-posten bare til loggen.
- **Personverntekster:** se utkastet i [personvern-utkast.md](personvern-utkast.md). Punkter merket ⚖️ krever juridisk vurdering.

## Lansering på ekte domener (senere)

Krever at Hosait viser tre domener fra samme prosjekt uten 308 til ett hoveddomene.

1. Innholdsfrys i Craft.
2. Kjør `npx tsx scripts/scrape/run.ts --refresh`, deretter `pnpm import:all`, og gjenta stegene for innhold over.
3. Legg inn DNS: TXT `_hosait.<domene>` og A-post `213.184.208.76`. MX og SPF røres ikke.
4. Sett `SITE_ORIGINS=production` og redeploy.
5. Sjekk Search Console for alle tre domener. Behold Craft i lesemodus i 30 dager.
