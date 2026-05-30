const commandCenter = {
  mission: {
    eyebrow: "Primary Mission",
    title: "Add $3,000/month recurring from private coaching clients.",
    status: "Active",
    target: "$3,000 MRR",
    current: "$0 MRR",
    description:
      "Target: 10 clients paying an average of $250–$300/month through a simple system: content/ads → GHL form → intro call → Stripe/ForActive payment → MyStrengthBook onboarding → weekly check-ins.",
  },

  todayActions: [
    {
      label: "Revenue Action",
      action: "Message 10 old clients with the private coaching reactivation offer.",
      status: "Not Started",
      whyItMatters: "Direct path to booked calls and fast cash flow.",
    },
    {
      label: "System Action",
      action: "Finish one MyStrengthBook 3-day strength template.",
      status: "In Progress",
      whyItMatters: "Removes the biggest delivery bottleneck.",
    },
    {
      label: "Visibility Action",
      action: "Post one 30-second coaching availability video or story.",
      status: "Not Started",
      whyItMatters: "Creates demand without needing the perfect funnel first.",
    },
  ],

  moneyProgress: [
    { label: "Current Private Clients", value: "0" },
    { label: "Target Private Clients", value: "10" },
    { label: "Current MRR", value: "$0" },
    { label: "Target MRR", value: "$3,000" },
    { label: "Leads Needing Follow-Up", value: "0" },
    { label: "Calls Booked", value: "0" },
  ],

  coachingMachine: [
    {
      area: "Offer",
      status: "Needs Finalization",
      nextAction: "Define the founding client offer at $250–$300/month.",
    },
    {
      area: "Funnel",
      status: "Needs Build",
      nextAction: "Create one mobile GHL page with headline, proof, offer, and form.",
    },
    {
      area: "Payment",
      status: "Partially Ready",
      nextAction: "Confirm Stripe/ForActive package link for coaching.",
    },
    {
      area: "Programming",
      status: "In Progress",
      nextAction: "Finish General Strength 3-Day template in MyStrengthBook.",
    },
    {
      area: "Onboarding",
      status: "Needs Checklist",
      nextAction: "Create payment → app invite → intake → first check-in flow.",
    },
    {
      area: "Check-ins",
      status: "Needs System",
      nextAction: "Create simple weekly client check-in format.",
    },
  ],

  activeProjects: [
    {
      name: "Personal Coaching",
      priority: "Highest Priority",
      goal: "Get 10 private coaching clients at $250–$300/month.",
      nextAction: "Finish the bare-minimum coaching offer and message old clients.",
      moneyImpact: "High",
    },
    {
      name: "House of Power",
      priority: "High Priority",
      goal: "Keep ads, content, memberships, and client acquisition moving.",
      nextAction: "Create one simple HOP ad/content push this week.",
      moneyImpact: "High",
    },
    {
      name: "EDEN Build",
      priority: "Support Priority",
      goal: "Build the operating system without letting software become the main project.",
      nextAction: "Make this page data-driven before adding complexity.",
      moneyImpact: "Medium",
    },
  ],

  leads: [
    {
      name: "Old Client Reactivation List",
      source: "Previous clients",
      status: "Needs Outreach",
      nextFollowUp: "Today",
      value: "$250–$300/mo each",
    },
    {
      name: "Instagram Warm Audience",
      source: "IG/content",
      status: "Needs CTA",
      nextFollowUp: "After coaching availability post",
      value: "$250–$300/mo each",
    },
    {
      name: "House of Power Members",
      source: "In-person gym network",
      status: "Potential",
      nextFollowUp: "Identify 5 good fits",
      value: "$250–$300/mo each",
    },
  ],

  contentQueue: [
    {
      hook: "I’m taking 5 online strength clients.",
      format: "Story/Reel",
      cta: "DM COACHING",
      status: "Ready",
    },
    {
      hook: "If your training has stalled, you probably do not need a new program. You need adjustments.",
      format: "Reel",
      cta: "Apply for coaching",
      status: "Draft",
    },
    {
      hook: "How I would structure training for someone trying to get strong without overthinking.",
      format: "Carousel/Reel",
      cta: "Free intro call",
      status: "Idea",
    },
  ],

  blockers: [
    {
      blocker: "MyStrengthBook setup",
      simplifiedAction: "Build one 3-day template only. Do not build the whole library yet.",
    },
    {
      blocker: "GHL mobile funnel",
      simplifiedAction: "Create one page: headline, proof, offer, form.",
    },
    {
      blocker: "Ads hesitation",
      simplifiedAction: "Boost one simple coaching post for $5/day with a DM CTA.",
    },
    {
      blocker: "Claude setup time sink",
      simplifiedAction: "Use EDEN for routing. Use ChatGPT for code execution. Stop rebuilding Claude endlessly.",
    },
  ],
};

function StatusPill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-3xl text-slate-300">{description}</p>
      ) : null}
    </div>
  );
}

export default function CommandPage() {
  return (
    <main className="min-h-screen bg-[#24292f] text-[#d8faff] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">
            EDEN Command Center
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Private Coaching Mission
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            This dashboard is the focused execution layer inside EDEN. It keeps
            the urgent money mission visible while the broader operating system
            continues to house House of Power, training, business systems, and
            future AI tools.
          </p>
        </section>

        <section className="rounded-2xl border border-cyan-200/40 bg-[#1f252b] p-6 shadow-lg">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
                {commandCenter.mission.eyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {commandCenter.mission.title}
              </h2>

              <p className="mt-3 max-w-4xl text-slate-300">
                {commandCenter.mission.description}
              </p>
            </div>

            <div className="flex gap-2">
              <StatusPill>{commandCenter.mission.status}</StatusPill>
              <StatusPill>{commandCenter.mission.target}</StatusPill>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#30363d] p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <SectionHeader
              eyebrow="Execution"
              title="Today’s 3 Actions"
              description="One revenue action, one system action, and one visibility action. No giant task list."
            />

            <p className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
              Revenue · System · Visibility
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {commandCenter.todayActions.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-600/60 bg-[#24292f] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-cyan-300">
                    {item.label}
                  </p>
                  <span className="rounded-full bg-slate-700/70 px-3 py-1 text-xs text-slate-200">
                    {item.status}
                  </span>
                </div>

                <p className="mt-3 text-lg leading-snug">{item.action}</p>

                <p className="mt-4 text-sm text-slate-400">
                  {item.whyItMatters}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Money Progress" title="Revenue Snapshot" />

          <div className="mt-4 grid gap-4 md:grid-cols-6">
            {commandCenter.moneyProgress.map((metric) => (
              <div key={metric.label} className="rounded-xl bg-[#30363d] p-5">
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-[#30363d] p-6">
          <SectionHeader
            eyebrow="Coaching Client Machine"
            title="Offer → Funnel → Payment → Onboarding → Programming → Check-ins"
            description="This is the simple system that has to work before scaling ads harder."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {commandCenter.coachingMachine.map((item) => (
              <div
                key={item.area}
                className="rounded-xl border border-slate-600/60 bg-[#24292f] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">{item.area}</h3>
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                    {item.status}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-300">
                  Next: {item.nextAction}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Active Projects" title="Project Priorities" />

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {commandCenter.activeProjects.map((project) => (
              <div key={project.name} className="rounded-xl bg-[#30363d] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <span className="rounded-full bg-slate-700/70 px-3 py-1 text-xs text-slate-200">
                    {project.moneyImpact}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-cyan-300">
                  {project.priority}
                </p>

                <p className="mt-4 text-slate-300">{project.goal}</p>

                <p className="mt-4 text-sm text-slate-400">
                  Next: {project.nextAction}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#30363d] p-6">
            <SectionHeader
              eyebrow="Active Leads"
              title="Follow-Up Queue"
              description="Start manual first. Later this can connect to GHL, Sheets, or Supabase."
            />

            <div className="mt-5 space-y-3">
              {commandCenter.leads.map((lead) => (
                <div
                  key={lead.name}
                  className="rounded-xl border border-slate-600/60 bg-[#24292f] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">{lead.name}</h3>
                    <span className="text-sm text-cyan-300">{lead.value}</span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Source: {lead.source} · Status: {lead.status}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    Next follow-up: {lead.nextFollowUp}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#30363d] p-6">
            <SectionHeader
              eyebrow="Content / Ads"
              title="Visibility Queue"
              description="Good enough to post beats perfect and unpublished."
            />

            <div className="mt-5 space-y-3">
              {commandCenter.contentQueue.map((content) => (
                <div
                  key={content.hook}
                  className="rounded-xl border border-slate-600/60 bg-[#24292f] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold">{content.format}</h3>
                    <span className="rounded-full bg-slate-700/70 px-3 py-1 text-xs text-slate-200">
                      {content.status}
                    </span>
                  </div>

                  <p className="mt-3 text-slate-300">{content.hook}</p>

                  <p className="mt-2 text-sm text-cyan-300">
                    CTA: {content.cta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-red-300/30 bg-red-950/20 p-6">
          <SectionHeader
            eyebrow="Blocked / Overthinking"
            title="Simplify the Bottleneck"
            description="Every blocker needs a smaller next action. No vague stuck points."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {commandCenter.blockers.map((item) => (
              <div
                key={item.blocker}
                className="rounded-xl border border-red-200/20 bg-[#24292f] p-5"
              >
                <p className="font-semibold text-red-100">{item.blocker}</p>

                <p className="mt-3 text-sm text-slate-300">
                  Simplified action: {item.simplifiedAction}
                </p>
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