import { LogoMark } from '@/components/shared/Logo'

/**
 * A coded replica of the Jobs board for the landing page hero. It mirrors
 * the real UI (components/jobs/JobBoard.tsx) rather than a screenshot, so it
 * stays sharp at any size. Purely illustrative: hidden from assistive tech.
 */

const shortDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

const crew = {
  marco: { name: 'Marco R.', color: '#3B82F6' },
  dana: { name: 'Dana W.', color: '#10B981' },
  sam: { name: 'Sam O.', color: '#F59E0B' },
  priya: { name: 'Priya N.', color: '#8B5CF6' },
}

interface PreviewJob {
  id: string
  title: string
  client: string
  crew?: { name: string; color: string }
  due?: number
}

const columns: { label: string; dot: string; jobs: PreviewJob[] }[] = [
  {
    label: 'Draft',
    dot: 'bg-zinc-600',
    jobs: [{ id: 'JOB-3RY7F5UC', title: 'Deck stain and seal', client: 'Hartley Residence' }],
  },
  {
    label: 'Quoted',
    dot: 'bg-zinc-400',
    jobs: [
      { id: 'JOB-4FQ8T2LP', title: 'Three-story exterior repaint', client: 'Lakeside HOA', crew: crew.priya, due: 16 },
      { id: 'JOB-6VJ2S9HK', title: 'Garage subpanel', client: 'M. Alvarez', crew: crew.dana },
    ],
  },
  {
    label: 'Scheduled',
    dot: 'bg-cyan-400',
    jobs: [
      { id: 'JOB-9XC3V6NB', title: 'Panel upgrade + 6 circuits', client: 'Okafor Dental', crew: crew.dana, due: 4 },
      { id: 'JOB-2HW5R8YD', title: '1,200 sq ft LVP install', client: 'M. Alvarez', crew: crew.sam, due: 6 },
    ],
  },
  {
    label: 'In Progress',
    dot: 'bg-amber-400',
    jobs: [
      { id: 'JOB-K7M2Q9XA', title: 'Kitchen remodel rough-in', client: 'Hartley Residence', crew: crew.marco, due: 2 },
    ],
  },
  {
    label: 'Completed',
    dot: 'bg-emerald-400',
    jobs: [
      { id: 'JOB-5TG9M3QE', title: 'Bathroom fan replacement', client: 'Birchwood Cafe', crew: crew.dana, due: -6 },
    ],
  },
]

// The card being dragged from In Progress to Completed
const dragged: PreviewJob = {
  id: 'JOB-7BN1K4ZS',
  title: 'Water heater swap, 50 gal',
  client: 'R. Castellanos',
  crew: crew.marco,
  due: 0,
}

const nav = [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Jobs', active: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Quotes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Invoices', badge: 1, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Inventory', badge: 2, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
]

function JobCard({ job, lifted = false }: { job: PreviewJob; lifted?: boolean }) {
  return (
    <div
      className={`rounded-lg border bg-zinc-900 p-2.5 text-left ${
        lifted
          ? 'border-cyan-400/50 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)] ring-1 ring-cyan-400/20'
          : 'border-zinc-800'
      }`}
    >
      <p className="font-mono text-[10px] leading-none text-zinc-500">{job.id}</p>
      <p className="mt-1.5 text-[13px] font-medium leading-snug text-white">{job.title}</p>
      <p className="mt-1 text-xs text-zinc-400">{job.client}</p>
      {(job.crew || job.due !== undefined) && (
        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800 pt-2 text-[11px] text-zinc-500">
          {job.crew ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: job.crew.color }} />
              {job.crew.name}
            </span>
          ) : (
            <span />
          )}
          {job.due !== undefined && <span className="tabular-nums">{shortDate(job.due)}</span>}
        </div>
      )}
    </div>
  )
}

export default function BoardPreview() {
  return (
    <div aria-hidden="true" className="relative select-none">
      {/* Glow behind the window */}
      <div
        className="pointer-events-none absolute -inset-x-6 -top-10 bottom-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 30%, rgba(34,211,238,0.14) 0%, transparent 70%)',
        }}
      />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_50px_120px_-30px_rgba(0,0,0,1)]">
        {/* Window bar */}
        <div className="flex h-10 items-center gap-3 border-b border-zinc-800 px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-zinc-800 bg-black px-3 py-1 font-mono text-[11px] text-zinc-500">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            get-fieldkit.com/jobs
          </div>
          <div className="w-[42px]" />
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-52 shrink-0 border-r border-zinc-800 lg:block">
            <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800 px-4">
              <LogoMark className="h-7 w-7" />
              <span className="font-display text-sm font-bold tracking-[0.04em] text-white">FIELDKIT</span>
            </div>
            <div className="space-y-0.5 p-2.5">
              {nav.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium ${
                    item.active ? 'bg-zinc-900 text-white' : 'text-zinc-400'
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${item.active ? 'text-cyan-400' : 'text-zinc-600'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                  </svg>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1 bg-black p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="font-display text-lg font-bold leading-tight tracking-tight text-white">Jobs</p>
                <p className="truncate text-xs text-zinc-500">Track work orders from creation to completion</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden rounded-lg border border-zinc-800 p-0.5 text-xs font-medium sm:flex">
                  <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-white">Board</span>
                  <span className="px-2.5 py-1 text-zinc-500">List</span>
                </div>
                <span className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M12 5v14m7-7H5" />
                  </svg>
                  New Job
                </span>
              </div>
            </div>

            {/* Board: clipped with a fade on small screens so it reads as "more to the right" */}
            <div className="relative -mr-4 overflow-hidden sm:-mr-5 xl:mr-0 mask-fade-r xl:[mask-image:none] xl:[-webkit-mask-image:none]">
              <div className="flex gap-3">
                {columns.map((column) => {
                  const isSource = column.label === 'In Progress'
                  const isTarget = column.label === 'Completed'
                  return (
                    <div
                      key={column.label}
                      className={`h-[300px] w-[212px] shrink-0 flex-col rounded-xl border p-2.5 sm:h-[340px] xl:w-0 xl:flex-1 ${
                        // On phones, start on a column with something in it
                        column.label === 'Draft' ? 'hidden sm:flex' : 'flex'
                      } ${isTarget ? 'border-cyan-400/40 bg-cyan-400/[0.04]' : 'border-zinc-900 bg-zinc-950'}`}
                    >
                      <div className="mb-2.5 flex items-center justify-between px-0.5">
                        <span className="flex items-center gap-2 text-xs font-medium text-white">
                          <span className={`h-1.5 w-1.5 rounded-full ${column.dot}`} />
                          {column.label}
                        </span>
                        <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
                          {column.jobs.length + (isSource ? 1 : 0)}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        {column.jobs.map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                        {/* Where the dragged card came from */}
                        {isSource && <div className="h-[110px] rounded-lg border border-dashed border-zinc-800" />}
                        {/* Where it's about to land, with the card in mid-air above it */}
                        {isTarget && (
                          <div className="relative h-[110px] rounded-lg border border-dashed border-cyan-400/40">
                            <div className="absolute -left-9 -top-3 w-full rotate-[-3deg]">
                              <JobCard job={dragged} lifted />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
