"use client";

import { useState, useEffect } from "react";

// ── OSRS palette ───────────────────────────────────────────────────────────────
const C = {
  pageBg:      "#1a1209",
  panelBg:     "#2c2317",
  panelBorder: "#8b7355",
  cardBg:      "#1f1a0e",
  cardHover:   "#2a2314",
  cardBorder:  "#614e33",
  cardBorderBright: "#a07840",
  gold:        "#c8a140",
  goldBright:  "#f0d000",
  text:        "#ede8d0",
  textMuted:   "#9e8c6a",
  barBg:       "#0d1a0d",
  barFill:     "#dcc000",
  tooltipBg:   "#100d06",
  tooltipBorder:"#a07840",
  cyan:        "#6bbfbf",
};

// ── XP curve (simplified OSRS) ────────────────────────────────────────────────
function levelToXP(level: number): number {
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(xp / 4);
}

function progressToLevel(p: number): number {
  return Math.max(1, Math.min(99, Math.floor(p * 98) + 1));
}

function xpAtLevel(level: number) { return levelToXP(level); }
function xpAtNextLevel(level: number) { return levelToXP(Math.min(level + 1, 99)); }

// ── Skill type ────────────────────────────────────────────────────────────────
interface Skill {
  id: string;
  name: string;
  icon: string;
  level: number;         // 1–99
  progress: number;      // 0–1 within current level
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;       // xp for 99
  metricLabel: string;   // e.g. "81 / 90 days"
  xpRemainingLabel: string;
  detailLabel: string;
  accentColor: string;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ skill }: { skill: Skill }) {
  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 50,
      width: "200px",
      backgroundColor: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      borderRadius: "4px",
      padding: "10px 12px",
      pointerEvents: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
    }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: C.goldBright, margin: "0 0 6px", fontWeight: 700 }}>
        {skill.name}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <Row label="Level"      value={`${skill.level} / 99`} />
        <Row label="Current XP" value={skill.currentXP.toLocaleString()} />
        <Row label="Next level" value={skill.nextLevelXP.toLocaleString()} />
        <Row label="XP remaining" value={`${(skill.nextLevelXP - skill.currentXP).toLocaleString()}`} highlight />
        <Row label="Metric"     value={skill.metricLabel} />
      </div>
      <div style={{ marginTop: "8px", fontSize: "10px", color: C.textMuted, fontStyle: "italic" }}>
        {skill.xpRemainingLabel}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "11px", color: C.textMuted }}>{label}</span>
      <span style={{ fontSize: "11px", color: highlight ? C.goldBright : C.text, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function OsrsBar({ progress, color = C.barFill }: { progress: number; color?: string }) {
  return (
    <div style={{
      width: "100%",
      height: "10px",
      backgroundColor: C.barBg,
      border: `1px solid #3d2e1e`,
      borderRadius: "2px",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{
        width: `${Math.min(progress * 100, 100)}%`,
        height: "100%",
        backgroundColor: color,
        transition: "width 0.4s ease",
        boxShadow: `0 0 6px ${color}60`,
      }} />
    </div>
  );
}

// ── Skill card ────────────────────────────────────────────────────────────────
function SkillCard({ skill, children }: { skill: Skill; children?: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        backgroundColor: hovered ? C.cardHover : C.cardBg,
        border: `2px solid ${hovered ? C.cardBorderBright : C.cardBorder}`,
        borderRadius: "4px",
        padding: "12px 10px 10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        cursor: "default",
        transition: "background-color 0.1s, border-color 0.1s",
        userSelect: "none",
      }}
    >
      {/* Icon + level row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "26px", lineHeight: 1, imageRendering: "pixelated" }}>{skill.icon}</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: C.textMuted, lineHeight: 1 }}>Lv</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.goldBright, lineHeight: 1, fontFamily: "monospace" }}>
            {skill.level}
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{ fontSize: "11px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {skill.name}
      </div>

      {/* Progress bar */}
      <OsrsBar progress={skill.progress} color={skill.accentColor} />

      {/* Detail */}
      <div style={{ fontSize: "10px", color: C.textMuted, textAlign: "center" }}>{skill.detailLabel}</div>

      {/* Children (interactive zone) */}
      {children}

      {/* Tooltip */}
      {hovered && <Tooltip skill={skill} />}
    </div>
  );
}

// ── Fuel interactive card ─────────────────────────────────────────────────────
const CALORIE_GOAL = 4500;
const CALORIE_KEY  = () => `odin_fuel_${new Date().toISOString().split("T")[0]}`;

function FuelCard({ skill }: { skill: Skill }) {
  const [hovered, setHovered]   = useState(false);
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CALORIE_KEY());
      if (stored) setCalories(Number(stored));
    } catch {}
  }, []);

  const addCals = (amount: number) => {
    setCalories((prev) => {
      const next = Math.min(prev + amount, 6000);
      try { localStorage.setItem(CALORIE_KEY(), String(next)); } catch {}
      return next;
    });
  };

  const reset = () => {
    setCalories(0);
    try { localStorage.removeItem(CALORIE_KEY()); } catch {}
  };

  const progress     = Math.min(calories / CALORIE_GOAL, 1);
  const level        = progressToLevel(progress);
  const currentXP    = xpAtLevel(level);
  const nextLevelXP  = xpAtNextLevel(level);
  const xpProgress   = (currentXP / levelToXP(99));
  const liveSkill: Skill = {
    ...skill,
    level,
    progress: xpProgress,
    currentXP,
    nextLevelXP,
    metricLabel: `${calories.toLocaleString()} / ${CALORIE_GOAL.toLocaleString()} kcal`,
    xpRemainingLabel: `${(CALORIE_GOAL - calories).toLocaleString()} kcal to daily goal`,
    detailLabel: `${calories.toLocaleString()} / ${CALORIE_GOAL.toLocaleString()} kcal`,
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        backgroundColor: hovered ? C.cardHover : C.cardBg,
        border: `2px solid ${hovered ? C.cardBorderBright : C.cardBorder}`,
        borderRadius: "4px",
        padding: "12px 10px 10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        transition: "background-color 0.1s, border-color 0.1s",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "26px", lineHeight: 1 }}>{skill.icon}</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: C.textMuted, lineHeight: 1 }}>Lv</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.goldBright, lineHeight: 1, fontFamily: "monospace" }}>{level}</div>
        </div>
      </div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>Fuel</div>
      <OsrsBar progress={progress} color={calories >= CALORIE_GOAL ? "#4ade80" : C.barFill} />
      <div style={{ fontSize: "10px", color: C.textMuted, textAlign: "center" }}>{calories.toLocaleString()} / {CALORIE_GOAL.toLocaleString()} kcal</div>

      {/* Quick-add buttons */}
      <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
        {[500, 1000].map((amt) => (
          <button key={amt}
            onClick={() => addCals(amt)}
            style={{ flex: 1, padding: "3px 0", fontSize: "10px", fontWeight: 700, backgroundColor: "#2e2518", border: `1px solid ${C.cardBorder}`, borderRadius: "3px", color: C.gold, cursor: "pointer" }}>
            +{amt}
          </button>
        ))}
        <button onClick={reset} style={{ padding: "3px 6px", fontSize: "10px", backgroundColor: "transparent", border: `1px solid #3d2e1e`, borderRadius: "3px", color: C.textMuted, cursor: "pointer" }}>↺</button>
      </div>

      {hovered && <Tooltip skill={liveSkill} />}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DavisLegacyPage() {
  const [ghlContacts, setGhlContacts] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ghl")
      .then((r) => r.json())
      .then((d) => {
        const count = d?.contacts?.contacts?.length ?? d?.contacts?.total ?? null;
        setGhlContacts(count);
      })
      .catch(() => {});
  }, []);

  // ── Dynamic skill calculations ─────────────────────────────────────────────
  const CSM_DATE   = new Date("2026-03-28T00:00:00");
  const PREP_START = new Date("2025-12-28T00:00:00");
  const now        = new Date();
  const totalPrepMs   = CSM_DATE.getTime() - PREP_START.getTime();
  const elapsedMs     = now.getTime()      - PREP_START.getTime();
  const daysRemaining = Math.max(0, Math.ceil((CSM_DATE.getTime() - now.getTime()) / 86400000));
  const powerProgress = Math.min(Math.max(elapsedMs / totalPrepMs, 0), 1);
  const powerLevel    = progressToLevel(powerProgress);

  // Revenue toward $75k
  const revenueYTD    = 19880;
  const revenueGoal   = 75000;
  const legacyProgress = revenueYTD / revenueGoal;
  const legacyLevel    = progressToLevel(legacyProgress);

  // GHL outreach
  const outreachGoal    = 500;
  const outreachCount   = ghlContacts ?? 47;
  const outreachProgress = Math.min(outreachCount / outreachGoal, 1);
  const outreachLevel   = progressToLevel(outreachProgress);

  // Streak
  const streak         = 14;
  const streakGoal     = 99;
  const disciplineProgress = streak / streakGoal;
  const disciplineLevel = progressToLevel(disciplineProgress);

  // Recovery (HRV sample)
  const hrv            = 72;
  const recoveryProgress = hrv / 100;
  const recoveryLevel  = progressToLevel(recoveryProgress);

  // Wisdom (notes — sample)
  const notesCount     = 14;
  const wisdomProgress = notesCount / 100;
  const wisdomLevel    = progressToLevel(wisdomProgress);

  // Firefighter
  const ffHours        = 1200;
  const ffGoal         = 2000;
  const fireProgress   = ffHours / ffGoal;
  const fireLevel      = progressToLevel(fireProgress);

  // MRR
  const mrr            = 7240;
  const mrrGoal        = 10000;
  const wealthProgress = mrr / mrrGoal;
  const wealthLevel    = progressToLevel(wealthProgress);

  function makeSkill(
    id: string, name: string, icon: string, level: number, progress: number,
    metricLabel: string, xpRemainingLabel: string, detailLabel: string, accentColor = C.barFill
  ): Skill {
    const currentXP   = xpAtLevel(level);
    const nextLevelXP = xpAtNextLevel(level);
    const intraProgress = nextLevelXP > currentXP
      ? (currentXP - xpAtLevel(level)) / (nextLevelXP - xpAtLevel(level))
      : 0;
    return { id, name, icon, level, progress: intraProgress, currentXP, nextLevelXP, totalXP: levelToXP(99), metricLabel, xpRemainingLabel, detailLabel, accentColor };
  }

  const skills: Skill[] = [
    makeSkill("power",      "Power",      "💪", powerLevel,      powerProgress,      `${Math.floor(elapsedMs / 86400000)} / 91 days`, `${daysRemaining} days until CSM`, `${daysRemaining}d to CSM`, "#ff6600"),
    makeSkill("legacy",     "Legacy",     "👑", legacyLevel,     legacyProgress,     `$${revenueYTD.toLocaleString()} / $${revenueGoal.toLocaleString()}`, `$${(revenueGoal - revenueYTD).toLocaleString()} to $75k goal`, `$${revenueYTD.toLocaleString()} YTD`, C.goldBright),
    makeSkill("outreach",   "Outreach",   "📡", outreachLevel,   outreachProgress,   `${outreachCount} / ${outreachGoal} contacts`, `${outreachGoal - outreachCount} contacts to goal`, ghlContacts !== null ? `${outreachCount} GHL contacts` : "Loading…", "#6bbfbf"),
    makeSkill("discipline", "Discipline", "⚔️", disciplineLevel, disciplineProgress, `${streak} / ${streakGoal} day streak`, `${streakGoal - streak} days to 99-day streak`, `${streak}-day streak`, "#e05252"),
    makeSkill("recovery",   "Recovery",   "🛡️", recoveryLevel,   recoveryProgress,   `${hrv} HRV / 100`, `${100 - hrv} points to peak`, `HRV ${hrv}`, "#4ade80"),
    makeSkill("wisdom",     "Wisdom",     "📚", wisdomLevel,     wisdomProgress,     `${notesCount} / 100 notes`, `${100 - notesCount} notes to next tier`, `${notesCount} Vald notes`, "#c084fc"),
    makeSkill("fire",       "Fire",       "🔥", fireLevel,       fireProgress,       `${ffHours} / ${ffGoal} FF hours`, `${ffGoal - ffHours} hours remaining`, `${ffHours} FF hours`, "#fb923c"),
    makeSkill("wealth",     "Wealth",     "💰", wealthLevel,     wealthProgress,     `$${mrr.toLocaleString()} / $${mrrGoal.toLocaleString()} MRR`, `$${(mrrGoal - mrr).toLocaleString()} to $10k MRR`, `$${mrr.toLocaleString()} MRR`, "#e6c87a"),
  ];

  const totalLevel = skills.reduce((s, k) => s + k.level, 0);

  return (
    <>
      {/* Google font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap" rel="stylesheet" />

      <div style={{ backgroundColor: C.pageBg, borderRadius: "8px", border: `2px solid ${C.panelBorder}`, padding: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: `1px solid ${C.panelBorder}`, paddingBottom: "16px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: C.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>
            Adventurer&#39;s Log
          </div>
          <h1 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: "28px", fontWeight: 900, color: C.goldBright, margin: "0 0 4px", textShadow: `0 0 20px ${C.goldBright}60, 0 2px 4px rgba(0,0,0,0.8)`, letterSpacing: "0.05em" }}>
            DAVIS HISCORES
          </h1>
          <div style={{ fontSize: "12px", color: C.textMuted }}>
            Total Level: <span style={{ color: C.goldBright, fontWeight: 700, fontFamily: "monospace" }}>{totalLevel}</span>
            <span style={{ margin: "0 8px", color: C.cardBorder }}>·</span>
            Max: <span style={{ color: C.textMuted, fontFamily: "monospace" }}>792</span>
          </div>
        </div>

        {/* 3×3 skill grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {skills.slice(0, 3).map((s) => <SkillCard key={s.id} skill={s} />)}
          {/* Fuel is row 2, col 1 — interactive */}
          <FuelCard skill={makeSkill("fuel", "Fuel", "🍖", 1, 0, "", "", "", "#f97316")} />
          {skills.slice(3, 5).map((s) => <SkillCard key={s.id} skill={s} />)}
          {skills.slice(5).map((s) => <SkillCard key={s.id} skill={s} />)}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${C.panelBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: C.textMuted }}>corporealbeast</span>
          <span style={{ fontSize: "11px", color: C.textMuted }}>
            CSM in <span style={{ color: daysRemaining <= 3 ? "#e05252" : C.goldBright, fontWeight: 700 }}>{daysRemaining}</span> days
          </span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: C.textMuted }}>Season I</span>
        </div>
      </div>
    </>
  );
}
