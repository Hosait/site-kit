'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/** Grafer i Besøksanalyse (Recharts, samme som Spilka360). Farger fra Spilkas palett. */
export const PALETTE = ['#008cd2', '#00567e', '#00cfb4', '#ffc658', '#c40050', '#63223d', '#7fb8d6', '#5d6469']

const axis = { stroke: 'var(--theme-elevation-500)', fontSize: 12 }
const tooltipStyle = {
  background: 'var(--theme-elevation-0)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 4,
  color: 'var(--theme-text)',
}
const shortDay = (d: string) => `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}`

export function TrendChart({ data }: { data: { day: string; visitors: number; pageviews: number }[] }) {
  return (
    <div style={{ width: '100%', height: 280 }} role="img" aria-label="Besøkende og sidevisninger per dag">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--theme-elevation-100)" vertical={false} />
          <XAxis dataKey="day" tickFormatter={shortDay} {...axis} minTickGap={24} />
          <YAxis {...axis} allowDecimals={false} width={40} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(d) => String(d)} />
          <Legend />
          <Line type="monotone" dataKey="visitors" name="Besøkende" stroke={PALETTE[0]} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="pageviews" name="Sidevisninger" stroke={PALETTE[2]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Donut({ data, label }: { data: { key: string; label: string; value: number }[]; label: string }) {
  return (
    <div style={{ width: '100%', height: 220 }} role="img" aria-label={label}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((d, i) => (
              <Cell key={d.key} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Produktinteresse per uke, én linje per produktgruppe. */
export function GroupTrend({ data, groups }: { data: Record<string, string | number>[]; groups: { key: string; label: string }[] }) {
  return (
    <div style={{ width: '100%', height: 300 }} role="img" aria-label="Sidevisninger per produktgruppe per uke">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--theme-elevation-100)" vertical={false} />
          <XAxis dataKey="week" tickFormatter={shortDay} {...axis} minTickGap={24} />
          <YAxis {...axis} allowDecimals={false} width={40} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(d) => `Uke fra ${d}`} />
          <Legend />
          {groups.map((g, i) => (
            <Area
              key={g.key}
              type="monotone"
              dataKey={g.key}
              name={g.label}
              stackId="1"
              stroke={PALETTE[i % PALETTE.length]}
              fill={PALETTE[i % PALETTE.length]}
              fillOpacity={0.35}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`

/** Utvikling per måned fra de daglige summene (inntil 25 måneder). */
export function MonthlyChart({ data }: { data: { month: string; visitors: number; pageviews: number }[] }) {
  return (
    <div style={{ width: '100%', height: 260 }} role="img" aria-label="Besøkende og sidevisninger per måned">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--theme-elevation-100)" vertical={false} />
          <XAxis dataKey="month" tickFormatter={monthLabel} {...axis} />
          <YAxis {...axis} allowDecimals={false} width={48} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(m) => monthLabel(String(m))} />
          <Legend />
          <Bar dataKey="visitors" name="Besøkende" fill={PALETTE[0]} radius={[3, 3, 0, 0]} />
          <Bar dataKey="pageviews" name="Sidevisninger" fill={PALETTE[2]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** «Skriv ut / lagre som PDF» for månedsrapporten. */
export function PrintButton() {
  return (
    <button type="button" className="btn btn--style-secondary btn--size-medium" style={{ margin: 0 }} onClick={() => window.print()}>
      Skriv ut / lagre som PDF
    </button>
  )
}
