"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarSection {
  section: string;
  items: NavItem[];
  group: "gym" | "other";
}

const navSections: SidebarSection[] = [
  {
    section: "House of Power",
    group: "gym",
    items: [
      { label: "Overview", href: "/house-of-power", icon: "🏛️" },
      { label: "Goals", href: "/house-of-power/goals", icon: "🎯" },
      { label: "Accountability", href: "/house-of-power/accountability", icon: "📋" },
    ],
  },
  {
    section: "Strength Collective",
    group: "gym",
    items: [
      { label: "Dashboard", href: "/strength-collective", icon: "💪" },
      { label: "Workouts", href: "/strength-collective/workouts", icon: "🏋️" },
      { label: "Progress", href: "/strength-collective/progress", icon: "📈" },
    ],
  },
  {
    section: "PowerSource",
    group: "gym",
    items: [
      { label: "Energy", href: "/powersource", icon: "⚡" },
      { label: "Nutrition", href: "/powersource/nutrition", icon: "🥗" },
      { label: "Recovery", href: "/powersource/recovery", icon: "🔄" },
    ],
  },
  {
    section: "GrayRevenue",
    group: "other",
    items: [
      { label: "Revenue", href: "/gray-revenue", icon: "💰" },
      { label: "Streams", href: "/gray-revenue/streams", icon: "📊" },
      { label: "Projections", href: "/gray-revenue/projections", icon: "🔮" },
    ],
  },
  {
    section: "Health Monitor",
    group: "other",
    items: [
      { label: "Vitals", href: "/health-monitor", icon: "❤️" },
      { label: "Sleep", href: "/health-monitor/sleep", icon: "😴" },
      { label: "Metrics", href: "/health-monitor/metrics", icon: "📉" },
    ],
  },
];

const gymSections = navSections.filter((s) => s.group === "gym");
const otherSections = navSections.filter((s) => s.group === "other");

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  const renderSection = (s: SidebarSection) => {
    const isOpen = !collapsed[s.section];
    const sectionActive = s.items.some(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/")
    );
    const isGym = s.group === "gym";

    return (
      <div key={s.section}>
        <button
          onClick={() => toggleSection(s.section)}
          className="w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: sectionActive
              ? isGym ? "rgba(176,224,230,0.12)" : "#36393F"
              : "transparent",
            color: sectionActive ? "#B0E0E6" : isGym ? "#9aa5b0" : "#7a8a95",
            borderLeft: isGym
              ? sectionActive ? "2px solid #B0E0E6" : "2px solid #36393F"
              : "2px solid transparent",
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest"
          >
            {s.section}
          </span>
          <span
            className="text-sm transition-transform duration-200"
            style={{
              display: "inline-block",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ›
          </span>
        </button>

        {isOpen && (
          <ul className="mt-1 ml-2 space-y-0.5">
            {s.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                    style={{
                      backgroundColor: active ? "#2C2F33" : "transparent",
                      color: active ? "#B0E0E6" : "#9aa5b0",
                      borderLeft: active
                        ? "2px solid #B0E0E6"
                        : "2px solid transparent",
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <aside
      className="flex flex-col h-screen w-64 shrink-0"
      style={{ backgroundColor: "#23262A", borderRight: "1px solid #36393F" }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "#36393F" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          A
        </div>
        <div>
          <span className="font-bold text-sm tracking-wide block" style={{ color: "#B0E0E6" }}>
            Accountability
          </span>
          <span className="text-xs" style={{ color: "#7a8a95" }}>
            Dark Wolf Gray
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* GYM GROUP */}
        <div>
          <p
            className="px-2 mb-2 text-xs font-black uppercase tracking-widest"
            style={{ color: "#B0E0E6", letterSpacing: "0.15em" }}
          >
            ⚡ The Gyms
          </p>
          <div
            className="rounded-lg p-1 space-y-0.5"
            style={{ backgroundColor: "rgba(176,224,230,0.05)", border: "1px solid rgba(176,224,230,0.1)" }}
          >
            {gymSections.map(renderSection)}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height: "1px", backgroundColor: "#36393F" }} />

        {/* OTHER SECTIONS */}
        <div className="space-y-0.5">
          {otherSections.map(renderSection)}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-3 border-t flex items-center gap-2"
        style={{ borderColor: "#36393F" }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#B0E0E6" }} />
        <span className="text-xs" style={{ color: "#7a8a95" }}>Wolf Gray · Powder Blue</span>
      </div>
    </aside>
  );
}
