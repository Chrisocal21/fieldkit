const steps = [
  {
    title: 'Add the job',
    body: 'Client calls. Put in the job, the client, and the site address before you forget any of it.',
  },
  {
    title: 'Send the quote',
    body: 'Build it from line items and send a link or a PDF. Need an Option A and an Option B? One job can hold both.',
  },
  {
    title: 'Do the work',
    body: 'Schedule it, assign it, and log time, materials, and expenses as you go.',
  },
  {
    title: 'Get paid',
    body: "Turn the quote into an invoice, record payments, and see what's still outstanding.",
  },
]

export default function HowItWorks() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title} className="reveal relative bg-zinc-950 p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 font-mono text-xs font-medium text-cyan-300">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-transparent" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-white">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}
