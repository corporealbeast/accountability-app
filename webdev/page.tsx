"use client";

import Link from "next/link";

const projects = [
  { label: "Apex Peptides", href: "/webdev/apex-peptides", description: "Apex Peptides website project" },
  { label: "Specific Peptides", href: "/webdev/specific-peptides", description: "Specific Peptides website project" },
  { label: "House of Power", href: "/webdev/house-of-power", description: "House of Power gym website" },
];

export default function WebdevPage() {
  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#B0E0E6", marginBottom: "8px" }}>
        Web Dev Projects
      </h1>
      <p style={{ fontSize: "14px", color: "#9aa5b0", marginBottom: "32px" }}>
        Website builds and client projects
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
        {projects.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            style={{
              display: "block",
              padding: "20px",
              background: "#36393F",
              borderRadius: "10px",
              border: "1px solid #3e4147",
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "#B0E0E6")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "#3e4147")}
          >
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#B0E0E6", marginBottom: "6px" }}>
              {p.label}
            </div>
            <div style={{ fontSize: "13px", color: "#9aa5b0" }}>{p.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
