/**
 * Rammevektskalkulator for Spilka Classic™ og Opus™ – samme tabeller og formler som
 * kalkulatoren på spilka-dws.com (Craft, 2022). Resultatet er veiledende.
 */

export type HingeSystem = 'Classic' | 'Opus'

type Module = { name: string; maxHeight: number; maxWeight: number; hd?: { name: string; maxWeight: number } }

export const SYSTEMS: Record<HingeSystem, { modules: Module[]; minHeight: number; maxHeight: number }> = {
  Opus: {
    minHeight: 420,
    maxHeight: 1588,
    modules: [
      { name: 'A1', maxHeight: 530, maxWeight: 40 },
      { name: 'A2', maxHeight: 680, maxWeight: 40 },
      { name: 'A3', maxHeight: 860, maxWeight: 50 },
      { name: 'A4', maxHeight: 1090, maxWeight: 50 },
      { name: 'A5', maxHeight: 1330, maxWeight: 55, hd: { name: 'A5HD', maxWeight: 80 } },
      { name: 'A6', maxHeight: 1588, maxWeight: 55, hd: { name: 'A6HD', maxWeight: 80 } },
    ],
  },
  Classic: {
    minHeight: 388,
    maxHeight: 1788,
    modules: [
      { name: 'S1', maxHeight: 460, maxWeight: 35 },
      { name: 'S2', maxHeight: 606, maxWeight: 35 },
      { name: 'S3', maxHeight: 754, maxWeight: 40 },
      { name: 'S4', maxHeight: 970, maxWeight: 45 },
      { name: 'S5', maxHeight: 1200, maxWeight: 80 },
      { name: 'S6', maxHeight: 1430, maxWeight: 80 },
      { name: 'S7', maxHeight: 1588, maxWeight: 80 },
      { name: 'S8', maxHeight: 1788, maxWeight: 80 },
    ],
  },
}

export const WIDTH = { min: 188, max: 2488 }
export const GLASS = { min: 1, max: 100 }
const MAX_SYSTEM_WEIGHT = 80
const FRAME_KG_PER_M = 1.5
const HANDLE_KG = 0.3
const GLASS_KG_PER_M2_MM = 2.6
/** Over denne vekten varsles det om at rammekonstruksjonen må vurderes. */
export const HEAVY_WARNING_KG = 60

export type FrameWeightResult = {
  status: 'ok' | 'too-high' | 'too-heavy'
  module: string | null
  frameKg: number
  handleKg: number
  glassKg: number
  glassAreaM2: number
  totalKg: number
  heavy: boolean
}

/** Minste modul som er høy nok for karmhøyden. */
function findModule(system: HingeSystem, height: number): Module | null {
  return SYSTEMS[system].modules.find((m) => m.maxHeight >= height) ?? null
}

export function calculateFrameWeight(system: HingeSystem, widthMm: number, heightMm: number, glassMm: number): FrameWeightResult {
  const perimeterM = ((widthMm - 80 + (heightMm - 160)) * 2) / 1000
  const frameKg = FRAME_KG_PER_M * perimeterM
  const espagnoletteKg = (widthMm * 0.3) / 1000
  const glassAreaM2 = ((widthMm - 176) * (heightMm - 176)) / 1_000_000
  const glassKg = glassAreaM2 * glassMm * GLASS_KG_PER_M2_MM
  const totalKg = glassKg + espagnoletteKg + HANDLE_KG + frameKg

  const mod = findModule(system, heightMm)
  let status: FrameWeightResult['status'] = 'ok'
  let moduleName: string | null = null
  if (!mod) {
    status = 'too-high'
  } else if (mod.maxWeight <= totalKg) {
    // Tyngre enn standardmodulen tåler: HD-variant hvis den finnes og vekten er under systemets maks.
    if (totalKg < MAX_SYSTEM_WEIGHT && mod.hd) moduleName = mod.hd.name
    else status = 'too-heavy'
  } else {
    moduleName = mod.name
  }

  return {
    status,
    module: moduleName,
    frameKg,
    handleKg: espagnoletteKg + HANDLE_KG,
    glassKg,
    glassAreaM2,
    totalKg,
    heavy: status === 'ok' && Math.round(totalKg) > HEAVY_WARNING_KG,
  }
}
