'use client'

import { useId, useMemo, useState } from 'react'

import { calculateFrameWeight, GLASS, SYSTEMS, WIDTH, type HingeSystem } from '@/lib/frameWeight'
import type { Locale } from '@/lib/sites'
import { cn } from '@/utilities/ui'

const TEXT = {
  no: {
    system: 'Hengselsystem',
    width: 'Bredde (karm)',
    height: 'Høyde (karm)',
    glass: 'Glasstykkelse',
    max: 'Maks',
    result: 'Kalkulert rammevekt',
    suggestion: 'Anbefalt hengsel',
    tooHigh: 'Vinduet er for høyt for dette systemet',
    tooHeavy: 'Dessverre for tungt',
    fill: 'Fyll inn bredde, høyde og glasstykkelse',
    range: (min: number, max: number) => `Mellom ${min} og ${max}`,
    heavy:
      'Denne rammevekten er ansett som høy. Våre maksimale vindusstørrelser er basert på kapasiteten til komponentene. Vindusprodusenter bør vurdere egen rammekonstruksjon og eventuelle ekstra begrensninger i bredde/høyde ut fra rammenes styrke og stivhet.',
    details: 'Vis detaljert utregning',
    frame: 'Ramme',
    handle: 'Vrider/espagnolett',
    glassW: 'Glass',
    area: 'Glassareal',
    total: 'Totalt',
    disclaimer: '* Vekten er veiledende og ikke nøyaktig; den varierer med materialet. Kontakt salg for spesifikke beregninger.',
  },
  en: {
    system: 'Hinge system',
    width: 'Frame width',
    height: 'Frame height',
    glass: 'Glass thickness',
    max: 'Max',
    result: 'Calculated sash weight',
    suggestion: 'Recommended hinge',
    tooHigh: 'The window is too high for this system',
    tooHeavy: 'Unfortunately too heavy',
    fill: 'Enter width, height and glass thickness',
    range: (min: number, max: number) => `Between ${min} and ${max}`,
    heavy:
      'This sash weight is considered high. Our maximum window sizes are based on the capacity of our components. Window manufacturers should assess their own frame construction and set any additional width/height limits based on the strength and stiffness of the frames.',
    details: 'Show detailed calculation',
    frame: 'Frame',
    handle: 'Handle/espagnolette',
    glassW: 'Glass',
    area: 'Glass area',
    total: 'Total',
    disclaimer: '* The weight is indicative, not exact; it varies with the material. Contact sales for specific calculations.',
  },
}

const fmt = (n: number, d: number, locale: Locale) =>
  n.toLocaleString(locale === 'no' ? 'nb-NO' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d })

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  min: number
  max: number
  unit: string
  hint: string
}) {
  const id = useId()
  const n = Number(value)
  const invalid = value !== '' && (n < min || n > max)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          className={cn(
            'h-14 w-full rounded-xl border bg-white px-4 pr-14 text-lg tabular-nums outline-none focus:border-blue focus:ring-2 focus:ring-blue/30',
            invalid ? 'border-pink' : 'border-night/20',
          )}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-night/70">{unit}</span>
      </div>
      <p id={`${id}-hint`} className={cn('mt-1 text-xs', invalid ? 'text-pink' : 'text-night/70')}>
        {hint}
      </p>
    </div>
  )
}

export function FrameWeightCalculator({ systems, locale }: { systems: HingeSystem[]; locale: Locale }) {
  const t = TEXT[locale]
  const [system, setSystem] = useState<HingeSystem>(systems[0] ?? 'Classic')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [glass, setGlass] = useState('')
  const sys = SYSTEMS[system]

  const valid =
    width !== '' &&
    height !== '' &&
    glass !== '' &&
    Number(width) >= WIDTH.min &&
    Number(width) <= WIDTH.max &&
    Number(height) >= sys.minHeight &&
    Number(height) <= sys.maxHeight &&
    Number(glass) >= GLASS.min &&
    Number(glass) <= GLASS.max

  const result = useMemo(
    () => (valid ? calculateFrameWeight(system, Number(width), Number(height), Number(glass)) : null),
    [valid, system, width, height, glass],
  )

  // Forhåndsvisning av vinduets proporsjoner.
  const w = Number(width) || 1200
  const h = Number(height) || 1200
  const scale = 220 / Math.max(w, h)

  return (
    <section className="py-10 md:py-16">
      <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex items-center justify-center rounded-2xl bg-sky/40 p-8" aria-hidden>
          <div
            className="relative rounded-sm border-[10px] border-white bg-gradient-to-br from-white/70 to-sky shadow-xl transition-all duration-300"
            style={{ width: w * scale, height: h * scale }}
          >
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs tabular-nums text-night/70">{width || '—'} mm</span>
            <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs tabular-nums text-night/70">{height || '—'} mm</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} aria-describedby="fw-disclaimer">
          {systems.length > 1 && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">{t.system}</legend>
              <div className="flex gap-3">
                {systems.map((s) => (
                  <label
                    key={s}
                    className={cn(
                      'flex min-h-12 cursor-pointer items-center rounded-full border px-5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue',
                      system === s ? 'border-blue bg-blue text-white' : 'border-night/20 hover:border-blue',
                    )}
                  >
                    <input type="radio" name="system" value={s} checked={system === s} onChange={() => setSystem(s)} className="sr-only" />
                    Spilka {s}™
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label={t.width} value={width} onChange={setWidth} min={WIDTH.min} max={WIDTH.max} unit="mm" hint={t.range(WIDTH.min, WIDTH.max)} />
            <NumberField
              label={t.height}
              value={height}
              onChange={setHeight}
              min={sys.minHeight}
              max={sys.maxHeight}
              unit="mm"
              hint={`${t.max} ${sys.maxHeight} mm`}
            />
            <NumberField label={t.glass} value={glass} onChange={setGlass} min={GLASS.min} max={GLASS.max} unit="mm" hint={t.range(GLASS.min, GLASS.max)} />
          </div>

          <div
            role="status"
            aria-live="polite"
            className={cn(
              'rounded-2xl p-6 transition-colors',
              !result ? 'bg-mist' : result.status === 'ok' ? 'bg-aero' : 'bg-pink/10',
            )}
          >
            {!result ? (
              <p className="text-night/70">{t.fill}</p>
            ) : (
              <>
                <p className="text-sm font-medium uppercase tracking-wide text-night/70">{t.result}</p>
                <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight">
                  {Math.round(result.totalKg)} <span className="text-2xl">kg</span>
                </p>
                <p className={cn('mt-3 text-lg font-bold', result.status === 'ok' ? 'text-sapphire' : 'text-pink')}>
                  {result.status === 'ok' ? `${t.suggestion}: Spilka ${system} ${result.module}` : result.status === 'too-high' ? t.tooHigh : t.tooHeavy}
                </p>
                {result.heavy && <p className="mt-3 text-sm">{t.heavy}</p>}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-blue-text">{t.details}</summary>
                  <table className="mt-3 w-full text-sm tabular-nums">
                    <tbody className="divide-y divide-night/10">
                      <tr>
                        <th scope="row" className="py-1.5 text-left font-normal">{t.frame}</th>
                        <td className="text-right">{fmt(result.frameKg, 1, locale)} kg</td>
                      </tr>
                      <tr>
                        <th scope="row" className="py-1.5 text-left font-normal">{t.handle}</th>
                        <td className="text-right">{fmt(result.handleKg, 1, locale)} kg</td>
                      </tr>
                      <tr>
                        <th scope="row" className="py-1.5 text-left font-normal">
                          {t.glassW} ({fmt(result.glassAreaM2, 2, locale)} m²)
                        </th>
                        <td className="text-right">{fmt(result.glassKg, 0, locale)} kg</td>
                      </tr>
                      <tr className="font-bold">
                        <th scope="row" className="py-1.5 text-left">{t.total}</th>
                        <td className="text-right">{fmt(result.totalKg, 2, locale)} kg</td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              </>
            )}
          </div>
          <p id="fw-disclaimer" className="text-xs text-night/70">
            {t.disclaimer}
          </p>
        </form>
      </div>
    </section>
  )
}
