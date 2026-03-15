"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navSections: { section: string; items: NavItem[] }[] = [
  {
    section: "House of Power",
    items: [
      { label: "Overview", href: "/house-of-power", icon: "🏛️" },
      { label: "Goals", href: "/house-of-power/goals", icon: "🎯" },
      { label: "Accountability", href: "/house-of-power/accountability", icon: "📋" },
    ],
  },
  {
    section: "Strength Collective",
    items: [
      { label: "Dashboard", href: "/strength-collective", icon: "💪" },
      { label: "Workouts", href: "/strength-collective/workouts", icon: "🏋️" },
      { label: "Progress", href: "/strength-collective/progress", icon: "📈" },
    ],
  },
  {
    section: "PowerSource",
    items: [
      { label: "Energy", href: "/powersource", icon: "⚡" },
      { label: "Nutrition", href: "/powersource/nutrition", icon: "🥗" },
      { label: "Recovery", href: "/powersource/recovery", icon: "🔄" },
    ],
  },
  {
    section: "GrayRevenue",
    items: [
      { label: "Revenue", href: "/gray-revenue", icon: "💰" },
      { label: "Streams", href: "/gray-revenue/streams", icon: "📊" },
      { label: "Projections", href: "/gray-revenue/projections", icon: "🔮" },
    ],
  },
  {
    section: "Health Monitor",
    items: [
      { label: "Vitals", href: "/health-monitor", icon: "❤️" },
      { label: "Sleep", href: "/health-monitor/sleep", icon: "😴" },
      { label: "Metrics", href: "/health-monitor/metrics", icon: "📉" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside
      className="flex flex-col h-screen w-64 shrink-0"
      style={{ backgroundColor: "#23262A", borderRight: "1px solid #36393F" }}
    >
      {/* Logo / Brand */}
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
        <span className="font-semibold text-base tracking-wide" style={{ color: "#B0E0E6" }}>
          Accountability
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navSections.map(({ section, items }) => {
          const isOpen = !collapsed[section];
          const sectionActive = items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

          return (
            <div key={section}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors"
                style={{
                  color: sectionActive ? "#B0E0E6" : "#7a8a95",
                  backgroundColor: sectionActive ? "#36393F" : "transparent",
                }}
              >
                <span>{section}</span>
                <span
                  className="transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  ›
                </span>
              </button>

              {/* Items */}
              {isOpen && (
                <ul className="mt-1 ml-2 space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                          style={{
                            backgroundColor: active ? "#2C2F33" : "transparent",
                            color: active ? "#B0E0E6" : "#9aa5b0",
                            borderLeft: active ? "2px solid #B0E0E6" : "2px solid transparent",
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
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 text-xs border-t"
        style={{ borderColor: "#36393F", color: "#7a8a95" }}
      >
        Dark Wolf Gray · Powder Blue
      </div>
    </aside>
  );
}
