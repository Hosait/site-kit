import fs from 'node:fs'
import path from 'node:path'

import { Reader, type CountryResponse } from 'mmdb-lib'

/**
 * Land fra IP-adresse (bare landkode; IP-adressen lagres aldri).
 * Databasen er @ip-location-db/geo-whois-asn-country (CC0), oppdateres med avhengighetene.
 */
// ip-location-db bruker feltet country_code (ikke MaxMinds country.iso_code).
type CountryRecord = CountryResponse & { country_code?: string }
let reader: Reader<CountryRecord> | null | undefined

function load(): Reader<CountryRecord> | null {
  if (reader !== undefined) return reader
  try {
    // I Docker-imaget: data/geo-country.mmdb (kopieres i Dockerfile). Lokalt: rett fra node_modules.
    const file = [
      path.join(process.cwd(), 'data/geo-country.mmdb'),
      path.join(process.cwd(), 'node_modules/@ip-location-db/geo-whois-asn-country-mmdb/geo-whois-asn-country.mmdb'),
    ].find((f) => fs.existsSync(f))
    if (!file) throw new Error('mangler geo-country.mmdb')
    reader = new Reader<CountryRecord>(fs.readFileSync(file))
  } catch (err) {
    console.warn(`Besøksanalyse: fant ikke landdatabasen (${err instanceof Error ? err.message : err})`)
    reader = null
  }
  return reader
}

export function countryOf(ip: string | null): string | null {
  if (!ip) return null
  const r = load()
  if (!r) return null
  try {
    const code = r.get(ip.replace(/^::ffff:/, ''))?.country_code
    return code && /^[A-Z]{2}$/.test(code) ? code : null
  } catch {
    return null
  }
}
