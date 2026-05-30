const todayActions = [
  {
    label: "Revenue Action",
    action: "Message 10 old clients with the private coaching reactivation offer.",
    status: "Not Started",
  },
  {
    label: "System Action",
    action: "Finish one MyStrengthBook 3-day strength template.",
    status: "In Progress",
  },
  {
    label: "Visibility Action",
    action: "Post one 30-second coaching availability video or story.",
    status: "Not Started",
  },
];

const moneyProgress = [
  { label: "Current Private Clients", value: "0" },
  { label: "Target Private Clients", value: "10" },
  { label: "Current MRR", value: "$0" },
  { label: "Target MRR", value: "$3,000" },
  { label: "Leads Needing Follow-Up", value: "0" },
];

const activeProjects = [
  {
    name: "Personal Coaching",
    priority: "Highest Priority",
    description:
      "Build the private coaching machine: offer, templates, onboarding, content, ads, sales calls.",
  },
  {
    name: "House of Power",
    priority: "High Priority",
    description:
      "Keep ads, content, memberships, and client acquisition moving without taking over the whole system.",
  },
  {
    name: "EDEN Build",
    priority: "Support Priority",
    description:
      "Improve the operating system only when it helps execution, revenue, or reduced overwhelm.",
  },
];

const blockers = [
  "MyStrengthBook setup",
  "GHL mobile funnel",
  "Ads hesitation",
  "Claude setup time sink",
];

export default function CommandPage() {
  return (
    <main className="min-h-screen bg-[#24292f] text-[#d8faff] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">
            EDEN Command Center
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Private Coaching Mission
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            This focused dashboard keeps the urgent money mission visible
            without deleting or replacing the broader EDEN operating system.
          </p>
        </section>

        <section className="rounded-2xl border border-cyan-200/40 bg-[#1f252b] p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
            Primary Mission
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Add $3,000/month recurring from private coaching clients.
          </h2>

          <p className="mt-3 text-slate-300">
            Target: 10 clients paying an average of $250–$300/month through a
            simple system: content/ads → GHL form → intro call →
            Stripe/ForActive payment → MyStrengthBook onboarding → weekly
            check-ins.
          </p>
        </section>

        <section className="rounded-2xl bg-[#30363d] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
                Execution
              </p>
              <h2 className="mt-2 text-2xl font-bold">Today’s 3 Actions</h2>
            </div>

            <p className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
              Revenue · System · Visibility
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {todayActions.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-600/60 bg-[#24292f] p-5"
              >
                <p className="text-sm font-semibold text-cyan-300">
                  {item.label}
                </p>

                <p className="mt-3 text-lg leading-snug">{item.action}</p>

                <p className="mt-5 text-sm text-slate-400">
                  Status: {item.status}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
            Money Progress
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-5">
            {moneyProgress.map((metric) => (
              <div key={metric.label} className="rounded-xl bg-[#30363d] p-5">
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
            Active Projects
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {activeProjects.map((project) => (
              <div key={project.name} className="rounded-xl bg-[#30363d] p-5">
                <h3 className="text-xl font-bold">{project.name}</h3>

                <p className="mt-2 text-sm font-semibold text-cyan-300">
                  {project.priority}
                </p>

                <p className="mt-4 text-slate-300">{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/30 bg-red-950/20 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-red-200/80">
            Blocked / Overthinking
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {blockers.map((blocker) => (
              <div
                key={blocker}
                className="rounded-xl border border-red-200/20 bg-[#24292f] p-4 text-sm text-red-100"
              >
                {blocker}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-cyan-200/20 bg-cyan-300/5 p-5">
            <h3 className="font-bold text-cyan-200">EDEN Rule</h3>

            <p className="mt-2 text-slate-300">
              If a task has been planned twice and still not executed, reduce it
              to the smallest sellable, publishable, or testable version.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
