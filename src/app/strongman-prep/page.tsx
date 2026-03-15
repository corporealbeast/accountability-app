import { Trophy, AlertTriangle, Target, Calendar } from "lucide-react";

const events = [
  { name: "Log/Frame Carry", status: "ready", notes: "Strong. No limitations." },
  { name: "Atlas Stones", status: "ready", notes: "Technique solid. Hit 400+ in training." },
  { name: "Yoke Walk", status: "caution", notes: "Adductor monitoring — reduce loading this week." },
  { name: "Deadlift", status: "ready", notes: "685 opener planned." },
  { name: "Overhead Press", status: "ready", notes: "Log press — 275 target." },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ready:   { label: "Ready",   color: "#4ade80", bg: "#1e3a2f" },
  caution: { label: "Caution", color: "#e6c87a", bg: "#2e2a1a" },
  hold:    { label: "Hold",    color: "#9aa5b0", bg: "#23262A" },
};

export default function StrongmanPrepPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "12px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
          Competition Prep
        </p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Strongman Prep
        </h1>
        <p style={{ fontSize: "15px", color: "#9aa5b0", margin: 0 }}>
          California&apos;s Strongest Man — March 28, 2026
        </p>
      </div>

      {/* Status card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {[
          { icon: <Calendar size={18} />, label: "Competition", value: "March 28", sub: "13 days out" },
          { icon: <Trophy size={18} />, label: "Target", value: "Top 3", sub: "California's Strongest" },
          { icon: <Target size={18} />, label: "Weight", value: "260–270", sub: "lbs competition weight" },
          { icon: <AlertTriangle size={18} />, label: "Injury Status", value: "Monitoring", sub: "Adductor / Gracilis" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: "#36393F",
              border: "1px solid #2C2F33",
              borderRadius: "10px",
              padding: "18px",
            }}
          >
            <div style={{ color: "#7a8a95", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "11px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#B0E0E6" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#9aa5b0", marginTop: "2px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Injury alert */}
      <div
        style={{
          backgroundColor: "#2e2a1a",
          border: "1px solid #e6c87a",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <AlertTriangle size={18} color="#e6c87a" style={{ marginTop: "2px", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#e6c87a", marginBottom: "4px" }}>
            Adductor / Gracilis Strain — Under Monitoring
          </div>
          <div style={{ fontSize: "13px", color: "#9aa5b0" }}>
            Reduce yoke and lateral loading this week. Prioritize recovery: contrast therapy, stretching, sleep.
            Re-assess Thursday. Competition cleared if no escalation.
          </div>
        </div>
      </div>

      {/* Events */}
      <div style={{ marginBottom: "12px", fontSize: "11px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Competition Events
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {events.map((e) => {
          const sc = statusConfig[e.status];
          return (
            <div
              key={e.name}
              style={{
                backgroundColor: "#36393F",
                border: "1px solid #2C2F33",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6" }}>{e.name}</div>
                <div style={{ fontSize: "13px", color: "#9aa5b0", marginTop: "2px" }}>{e.notes}</div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: sc.bg,
                  color: sc.color,
                  flexShrink: 0,
                }}
              >
                {sc.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Peak week plan */}
      <div style={{ marginTop: "32px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
          Peak Week Plan
        </div>
        <div
          style={{
            backgroundColor: "#36393F",
            border: "1px solid #2C2F33",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {[
            { day: "Mon Mar 23", focus: "Light technique work — events only", load: "50%" },
            { day: "Tue Mar 24", focus: "Rest / contrast therapy", load: "—" },
            { day: "Wed Mar 25", focus: "Activation + openers", load: "70%" },
            { day: "Thu Mar 26", focus: "Full rest — travel prep", load: "—" },
            { day: "Fri Mar 27", focus: "Weigh-in + athlete meeting", load: "—" },
            { day: "Sat Mar 28", focus: "COMPETITION DAY", load: "💯" },
          ].map((d, i) => (
            <div
              key={d.day}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderTop: i === 0 ? "none" : "1px solid #2C2F33",
                backgroundColor: d.day.includes("28") ? "rgba(176,224,230,0.07)" : "transparent",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 500, color: d.day.includes("28") ? "#B0E0E6" : "#9aa5b0", minWidth: "120px" }}>
                {d.day}
              </div>
              <div style={{ flex: 1, fontSize: "13px", color: "#9aa5b0", padding: "0 20px" }}>{d.focus}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#B0E0E6" }}>{d.load}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
