import { CheckIcon } from './icons'

/**
 * The six things FieldKit does, each with a small coded vignette of the real
 * UI it describes. The vignettes are illustrative and hidden from assistive tech.
 */

function Card({
  index,
  label,
  title,
  children,
  body,
  className = '',
}: {
  index: string
  label: string
  title: string
  body: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`reveal group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-colors duration-300 hover:border-zinc-700 ${className}`}
    >
      <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
        <span className="font-mono tracking-normal text-zinc-600">{index}</span>
        {label}
      </p>
      <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{body}</p>
      <div aria-hidden="true" className="mt-6 flex flex-1 select-none flex-col justify-end">
        {children}
      </div>
    </article>
  )
}

/* ---------- vignettes ---------- */

function JobVignette() {
  const tabs = [
    { label: 'Details', active: true },
    { label: 'Quotes', count: 1 },
    { label: 'Invoices' },
    { label: 'Materials', count: 1 },
    { label: 'Expenses', count: 1 },
    { label: 'Time' },
    { label: 'Notes' },
  ]
  const details = [
    ['Client', 'Hartley Residence'],
    ['Site address', '418 Alder St'],
    ['Assigned to', 'Marco Reyes'],
    ['Quote', '$6,296.40, accepted'],
  ]
  const flow = ['Draft', 'Quoted', 'Scheduled', 'In Progress', 'Completed']
  const current = 3
  return (
    <div className="rounded-xl border border-zinc-800 bg-black">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-zinc-500">JOB-K7M2Q9XA</p>
          <p className="truncate text-sm font-medium text-white">Kitchen remodel rough-in</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
          In Progress
        </span>
      </div>
      <div className="mt-3 flex gap-4 overflow-hidden border-b border-zinc-800 px-4 text-xs font-medium mask-fade-r sm:[mask-image:none] sm:[-webkit-mask-image:none]">
        {tabs.map((tab) => (
          <span
            key={tab.label}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-2.5 ${
              tab.active ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-zinc-500'
            }`}
          >
            {tab.label}
            {tab.count && (
              <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] tabular-nums text-zinc-300">{tab.count}</span>
            )}
          </span>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-zinc-900 px-4 py-4 text-xs sm:grid-cols-4">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="mt-0.5 truncate text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center px-4 py-4">
        {flow.map((step, i) => (
          <div key={step} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                  i < current
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                    : i === current
                      ? 'border-cyan-400 bg-cyan-400 text-black'
                      : 'border-zinc-800 text-zinc-600'
                }`}
              >
                {i < current ? <CheckIcon className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={`hidden whitespace-nowrap text-[10px] sm:block ${
                  i === current ? 'font-medium text-white' : 'text-zinc-500'
                }`}
              >
                {step}
              </span>
            </div>
            {i < flow.length - 1 && (
              <span className={`mx-2 mb-0 h-px flex-1 sm:mb-5 ${i < current ? 'bg-cyan-400/40' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function QuoteVignette() {
  const lines = [
    ['Supply lines and fittings', '1,280.00'],
    ['Drain, waste, and vent', '1,650.00'],
    ['Labor, 28 hrs', '2,660.00'],
    ['Permit and inspection', '240.00'],
  ]
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-white">Quote #1001</p>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
          Accepted
        </span>
      </div>
      <dl className="space-y-1.5 text-xs">
        {lines.map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="truncate text-zinc-400">{label}</dt>
            <dd className="font-mono tabular-nums text-zinc-300">{amount}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 text-zinc-500">
          <dt>Tax (8%)</dt>
          <dd className="font-mono tabular-nums">466.40</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-zinc-800 pt-3">
        <span className="text-xs text-zinc-400">Total</span>
        <span className="font-mono text-base font-semibold tabular-nums text-white">$6,296.40</span>
      </div>
      <div className="mt-3 flex gap-2 text-[11px] font-medium">
        <span className="rounded-md border border-zinc-800 px-2 py-1 text-zinc-300">Share link</span>
        <span className="rounded-md border border-zinc-800 px-2 py-1 text-zinc-300">PDF</span>
      </div>
    </div>
  )
}

function ScheduleVignette() {
  const days = [
    ['Mon', '12'],
    ['Tue', '13'],
    ['Wed', '14'],
    ['Thu', '15'],
    ['Fri', '16'],
  ]
  const today = 1
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
      <div className="grid grid-cols-5 border-b border-zinc-900 text-center">
        {days.map(([name, date], i) => (
          <div key={name} className="border-r border-zinc-900 py-2 last:border-0">
            <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">{name}</p>
            <p
              className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                i === today ? 'bg-cyan-400 text-black' : 'text-zinc-300'
              }`}
            >
              {date}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 p-2 text-[10px] font-medium leading-tight">
        <span className="col-span-3 truncate rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1.5 text-amber-200">
          Kitchen remodel
        </span>
        <span className="col-span-2 truncate rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-1.5 text-cyan-200">
          Panel upgrade
        </span>
        <span className="col-start-2 truncate rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1.5 text-amber-200">
          Heater
        </span>
        {/* A job mid-drag to a new day */}
        <span className="col-span-2 col-start-4 truncate rounded-md border border-dashed border-cyan-400/50 px-2 py-1.5 text-cyan-300">
          LVP install
        </span>
        <span className="col-span-2 col-start-1 truncate rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-300">
          Repaint estimate
        </span>
        <span className="col-start-5 truncate rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1.5 text-emerald-200">
          Fan
        </span>
      </div>
    </div>
  )
}

function TeamVignette() {
  const rows = [
    { initial: 'M', name: 'Marco', role: 'Lead Plumber', hours: '19.0', cost: '1,292', color: '#3B82F6' },
    { initial: 'D', name: 'Dana', role: 'Electrician', hours: '9.0', cost: '648', color: '#10B981' },
    { initial: 'S', name: 'Sam', role: 'Apprentice', hours: '7.5', cost: '210', color: '#F59E0B' },
  ]
  return (
    <div className="rounded-xl border border-zinc-800 bg-black">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3 border-b border-zinc-900 px-3 py-2.5 last:border-0">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: `${row.color}33`, boxShadow: `inset 0 0 0 1px ${row.color}66` }}
          >
            {row.initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-white">{row.name}</span>
            <span className="block truncate text-[10px] text-zinc-500">{row.role}</span>
          </span>
          <span className="text-right font-mono text-[11px] tabular-nums">
            <span className="block text-zinc-300">{row.hours} h</span>
            <span className="block text-zinc-500">${row.cost}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function InventoryVignette() {
  const rows = [
    { name: '3/4" PVC pipe', stock: '4 lengths', pct: 22, low: true },
    { name: '12/2 Romex', stock: '7 rolls', pct: 78 },
    { name: 'Exterior primer', stock: '2 gallons', pct: 16, low: true },
    { name: 'LVP, Driftwood Oak', stock: '52 boxes', pct: 92 },
  ]
  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-black p-4">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-zinc-300">{row.name}</span>
            <span className="flex shrink-0 items-center gap-2">
              {row.low && (
                <span className="rounded bg-orange-400/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-orange-300">
                  LOW
                </span>
              )}
              <span className="font-mono text-[11px] tabular-nums text-zinc-500">{row.stock}</span>
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-900">
            <div
              className={`h-full rounded-full ${row.low ? 'bg-orange-400' : 'bg-cyan-400/70'}`}
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function MoneyVignette() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white">Net Profit</span>
        <span className="text-zinc-500">Completed jobs</span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-emerald-400">$1,395</p>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-900 pt-3">
        {[
          ['Revenue', '$3,192'],
          ['Labor', '$988'],
          ['Costs', '$809'],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-white">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">43.7% margin</p>
    </div>
  )
}

const extras = [
  'Invoices and payments',
  'Clients with multiple properties',
  'Expenses per job',
  'Branding Studio for your documents',
  'PDF export',
  'Global search',
  'Dark mode',
  'Installs like an app',
  'Syncs across devices',
  'Works offline',
]

export default function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <Card
        className="md:col-span-2 lg:col-span-4"
        index="01"
        label="Jobs"
        title="One board for every job"
        body="From first call to final payment. Drag a card to move it along, or open it and find the quotes, invoices, materials, expenses, time, and notes in one place."
      >
        <JobVignette />
      </Card>

      <Card
        className="lg:col-span-2"
        index="02"
        label="Quotes"
        title="Quotes in minutes"
        body="Line items, labor, tax, discounts, and deposits. Send a share link or a PDF. Mark it accepted and the job moves to Scheduled on its own."
      >
        <QuoteVignette />
      </Card>

      <Card
        className="lg:col-span-2"
        index="03"
        label="Schedule"
        title="A calendar that keeps up"
        body="Day, week, and month views, filtered by who's on the job. When the plan changes, drag the job to a new day."
      >
        <ScheduleVignette />
      </Card>

      <Card
        className="lg:col-span-2"
        index="04"
        label="Team"
        title="Know what the labor cost"
        body="Assign jobs, log hours, and set hourly rates. Labor cost lands on the job automatically."
      >
        <TeamVignette />
      </Card>

      <Card
        className="lg:col-span-2"
        index="05"
        label="Inventory"
        title="Stock you can trust"
        body="Track what's in the shop and on the truck. Low-stock flags show up before you run out, and materials used on a job come off the count."
      >
        <InventoryVignette />
      </Card>

      <Card
        className="lg:col-span-3"
        index="06"
        label="Money"
        title="The numbers, minus the spreadsheet"
        body="Pipeline, outstanding invoices, revenue this month, and net profit after labor, materials, and expenses. One dashboard."
      >
        <MoneyVignette />
      </Card>

      <article className="reveal flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Also in the box</p>
        <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-white">The rest of the kit</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          The smaller things that add up to not needing five other apps.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {extras.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200"
            >
              {item}
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}
