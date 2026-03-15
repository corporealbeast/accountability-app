export default function Home() {
  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ color: "#B0E0E6" }}
      >
        Dashboard
      </h1>
      <p style={{ color: "#9aa5b0" }}>
        Select a section from the sidebar to get started.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[
          { title: "House of Power", desc: "Goals & accountability tracking", icon: "🏛️" },
          { title: "Strength Collective", desc: "Workouts & progress", icon: "💪" },
          { title: "PowerSource", desc: "Energy, nutrition & recovery", icon: "⚡" },
          { title: "GrayRevenue", desc: "Revenue streams & projections", icon: "💰" },
          { title: "Health Monitor", desc: "Vitals, sleep & metrics", icon: "❤️" },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl p-5 space-y-2"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <div className="text-2xl">{card.icon}</div>
            <h2 className="font-semibold text-sm" style={{ color: "#B0E0E6" }}>
              {card.title}
            </h2>
            <p className="text-xs" style={{ color: "#7a8a95" }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
