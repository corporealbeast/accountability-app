"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Map,
  FileText,
  GitBranch,
  Code2,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "sitemap" | "pages" | "funnels" | "forms" | "assets";
type PageStatus = "not-started" | "in-progress" | "ready";
type FormStatus = "built" | "pending" | "tbd";
type AssetStatus = "ready" | "needed" | "tbd";
type PageTrack = "general" | "open-gym" | "performance";

interface SiteInfo {
  gymName: string;
  tagline: string;
  address: string;
  phone: string;
  hours: string;
  brandColors: string;
  ghlSubdomain: string;
}

interface SiteMapPage {
  id: string;
  path: string;
  title: string;
  status: PageStatus;
  track: PageTrack;
  notes: string;
}

interface PageSection {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
  assetNotes: string;
}

interface FunnelStep {
  id: string;
  label: string;
  path: string;
  action: string;
}

interface Funnel {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  steps: FunnelStep[];
}

interface FormItem {
  id: string;
  name: string;
  pages: string;
  fields: string;
  status: FormStatus;
  embedCode: string;
  notes: string;
}

interface AssetItem {
  id: string;
  name: string;
  type: "video" | "photo" | "logo" | "other";
  pages: string;
  status: AssetStatus;
  notes: string;
}

interface PlanData {
  siteInfo: SiteInfo;
  sitePages: SiteMapPage[];
  pageSections: Record<string, PageSection[]>;
  funnels: Funnel[];
  forms: FormItem[];
  assets: AssetItem[];
}

// ── Default Data ───────────────────────────────────────────────────────────────

const PLAN_VERSION = "5";

const DEFAULT_PLAN: PlanData = {
  siteInfo: {
    gymName: "",
    tagline: "",
    address: "",
    phone: "",
    hours: "",
    brandColors: "",
    ghlSubdomain: "",
  },
  sitePages: [
    { id: "homepage", path: "/", title: "Homepage", status: "not-started", track: "general", notes: "" },
    { id: "free-trial", path: "/free-trial", title: "Free Day/Week Pass", status: "not-started", track: "open-gym", notes: "Primary open gym lead capture" },
    { id: "ty-free-trial", path: "/thank-you-free-trial", title: "Thank You — Free Trial", status: "not-started", track: "open-gym", notes: "" },
    { id: "post-trial-offer", path: "/join-now", title: "Post-Trial Offer", status: "not-started", track: "open-gym", notes: "72hr urgency window — 50% off first month" },
    { id: "memberships", path: "/memberships", title: "Memberships", status: "not-started", track: "open-gym", notes: "" },
    { id: "assessment", path: "/assessment", title: "Athletic Assessment", status: "not-started", track: "performance", notes: "Primary coaching/performance lead capture" },
    { id: "ty-assessment", path: "/thank-you-assessment", title: "Thank You — Assessment", status: "not-started", track: "performance", notes: "" },
    { id: "sports-performance", path: "/sports-performance", title: "Sports Performance", status: "not-started", track: "performance", notes: "" },
    { id: "coaching", path: "/coaching", title: "Personal Training / Coaching", status: "not-started", track: "performance", notes: "" },
    { id: "about", path: "/about", title: "About Us", status: "not-started", track: "general", notes: "" },
    { id: "gallery", path: "/gallery", title: "Gallery", status: "not-started", track: "general", notes: "" },
    { id: "events", path: "/events", title: "Events", status: "not-started", track: "general", notes: "" },
    { id: "contact", path: "/contact", title: "Contact", status: "not-started", track: "general", notes: "" },
    { id: "careers", path: "/careers", title: "Careers", status: "not-started", track: "general", notes: "" },
  ],
  pageSections: {
    homepage: [
      { id: "hero", name: "Hero", headline: "", subheadline: "", body: "", cta: "Claim Free Pass | Book Athletic Assessment", assetNotes: "VIDEO BACKGROUND — gym floor / lifting footage (READY)" },
      { id: "brand-statement", name: "Brand Statement", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "two-tracks", name: "Two Tracks", headline: "Two Ways In", subheadline: "", body: "", cta: "Claim Free Pass | Book Assessment", assetNotes: "" },
      { id: "facility", name: "Facility Highlights", headline: "", subheadline: "", body: "", cta: "", assetNotes: "3–4 facility photos (READY)" },
      { id: "social-proof", name: "Social Proof / Testimonials", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Member photos or headshots — source from user" },
      { id: "final-cta", name: "Final CTA Strip", headline: "", subheadline: "", body: "", cta: "Claim Free Pass | Book Assessment", assetNotes: "" },
    ],
    "free-trial": [
      { id: "hero", name: "Hero", headline: "", subheadline: "", body: "", cta: "Claim My Free Pass", assetNotes: "" },
      { id: "features", name: "Feature List", headline: "Here's What You'll Get", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "form", name: "GHL Form", headline: "", subheadline: "", body: "", cta: "", assetNotes: "GHL Free Trial form embed — BUILT. Paste code in Forms tab." },
      { id: "social-proof", name: "Social Proof", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
    ],
    "ty-free-trial": [
      { id: "confirmation", name: "Confirmation", headline: "Your Pass Is Confirmed!", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "next-steps", name: "Next Steps", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Show up in person OR schedule — add GHL calendar embed" },
      { id: "scheduling", name: "Scheduling Embed", headline: "", subheadline: "", body: "", cta: "", assetNotes: "GHL calendar widget — confirm calendar ID" },
    ],
    "post-trial-offer": [
      { id: "urgency", name: "Urgency Headline", headline: "This Offer Expires In 72 Hours", subheadline: "Join today at half price + $0 enrollment fee", body: "", cta: "Join At Half Price", assetNotes: "" },
      { id: "features", name: "Feature Recap", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "checkout", name: "Checkout CTA", headline: "", subheadline: "", body: "", cta: "", assetNotes: "GHL checkout link — confirm per membership tier" },
    ],
    memberships: [
      { id: "header", name: "Page Header", headline: "Choose Your Membership", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "trust-badges", name: "Trust Badges", headline: "", subheadline: "", body: "No Contracts · 24/7 Access · Cancel Any Time", cta: "", assetNotes: "" },
      { id: "tiers", name: "Membership Tiers", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Tier cards — Standard Monthly, Discounted, Annual. Pricing TBD." },
      { id: "promos", name: "Special / Promos", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
    ],
    assessment: [
      { id: "hero", name: "Hero", headline: "Book Your Complimentary Athletic Assessment", subheadline: "", body: "", cta: "Book My Assessment", assetNotes: "" },
      { id: "what-included", name: "What's Included", headline: "Here's What Happens", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "who-its-for", name: "Who It's For", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "form", name: "GHL Form", headline: "", subheadline: "", body: "", cta: "", assetNotes: "GHL Sports Performance / Assessment form embed — BUILT. Paste code in Forms tab." },
      { id: "coach-preview", name: "Coach Preview", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Coach headshot needed" },
    ],
    "ty-assessment": [
      { id: "confirmation", name: "Confirmation", headline: "You're Booked!", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "next-steps", name: "Next Steps", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
    ],
    "sports-performance": [
      { id: "hero", name: "Hero", headline: "", subheadline: "", body: "", cta: "Book Your Assessment", assetNotes: "" },
      { id: "programs", name: "Programs", headline: "Our Programs", subheadline: "", body: "", cta: "", assetNotes: "List all programs / disciplines" },
      { id: "coaches", name: "Coach Profiles", headline: "Meet Your Coaches", subheadline: "", body: "", cta: "", assetNotes: "Coach headshots needed" },
      { id: "process", name: "The Process", headline: "Assessment → Program → Results", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "testimonials", name: "Athlete Results", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Before/after or athlete testimonials needed" },
      { id: "cta", name: "Final CTA", headline: "", subheadline: "", body: "", cta: "Book Your Free Assessment", assetNotes: "" },
    ],
    coaching: [
      { id: "hero", name: "Hero", headline: "", subheadline: "", body: "", cta: "Book Your Assessment", assetNotes: "" },
      { id: "options", name: "Training Options", headline: "1-on-1 vs. Small Group", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "pricing", name: "Pricing", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "coaches", name: "Coach Bios", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Coach headshots needed" },
      { id: "cta", name: "Final CTA", headline: "", subheadline: "", body: "", cta: "Book Your Free Assessment", assetNotes: "" },
    ],
    about: [
      { id: "founder", name: "Founder Story", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Founder headshot needed" },
      { id: "mission", name: "Mission / Core Values", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "pillars", name: "3 Brand Pillars", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "community", name: "Community", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
    ],
    gallery: [
      { id: "grid", name: "Photo Grid", headline: "", subheadline: "", body: "", cta: "", assetNotes: "Facility + event photos — READY" },
      { id: "cta", name: "CTA", headline: "", subheadline: "", body: "", cta: "Claim Your Free Pass", assetNotes: "" },
    ],
    events: [
      { id: "upcoming", name: "Upcoming Events", headline: "Events at HOP", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "past", name: "Past Events", headline: "", subheadline: "", body: "", cta: "", assetNotes: "" },
    ],
    contact: [
      { id: "info", name: "Location Info", headline: "Get In Touch", subheadline: "", body: "", cta: "", assetNotes: "Address, phone, hours, Google Maps embed" },
      { id: "form", name: "Contact Form", headline: "", subheadline: "", body: "", cta: "", assetNotes: "GHL Contact form embed — BUILT. Paste code in Forms tab." },
    ],
    careers: [
      { id: "info", name: "Careers Info", headline: "Join The Team", subheadline: "", body: "", cta: "", assetNotes: "" },
      { id: "form", name: "Application", headline: "", subheadline: "", body: "", cta: "", assetNotes: "GHL or Google Form link" },
    ],
  },
  funnels: [
    {
      id: "free-trial",
      name: "Funnel 1 — Open Gym Free Trial",
      description: "Captures open gym prospects via a free pass offer, runs them through a trial, then converts with a 72hr discounted membership offer.",
      accentColor: "#B0E0E6",
      steps: [
        { id: "1", label: "Homepage / Paid Ad", path: "/ or ad", action: '"Claim Free Pass" CTA click' },
        { id: "2", label: "Free Trial Form", path: "/free-trial", action: "GHL form — First, Last, Email, Phone, consents" },
        { id: "3", label: "Thank You Page", path: "/thank-you-free-trial", action: "Schedule visit or walk in + GHL calendar" },
        { id: "4", label: "In-Gym Experience", path: "(physical)", action: "Free day / week trial" },
        { id: "5", label: "Post-Trial Offer", path: "/join-now", action: "72hr urgency — 50% off first month + $0 enrollment" },
        { id: "6", label: "GHL Checkout", path: "GHL portal", action: "Membership payment — BUILT" },
      ],
    },
    {
      id: "assessment",
      name: "Funnel 2 — Sports Performance / Coaching",
      description: "Captures athletes and training prospects via a complimentary athletic assessment, then converts to a paid coaching or performance program.",
      accentColor: "#8ACDD4",
      steps: [
        { id: "1", label: "Homepage / Ad", path: "/ or ad", action: '"Book Athletic Assessment" CTA click' },
        { id: "2", label: "Assessment Form", path: "/assessment", action: "GHL Sports Performance form — BUILT" },
        { id: "3", label: "Thank You Page", path: "/thank-you-assessment", action: "Confirmation + GHL email automation fires" },
        { id: "4", label: "In-Person Assessment", path: "(physical)", action: "Assessment meeting at gym" },
        { id: "5", label: "Program Enrollment", path: "GHL checkout", action: "Coaching or performance program payment" },
      ],
    },
    {
      id: "direct-membership",
      name: "Funnel 3 — Direct Membership",
      description: "For returning visitors or warm traffic that skips the trial and goes straight to membership pricing.",
      accentColor: "#7a8a95",
      steps: [
        { id: "1", label: "Nav / Returning Visitor", path: "/memberships", action: 'Click "Memberships" in nav' },
        { id: "2", label: "Membership Hub", path: "/memberships", action: "Browse tier cards" },
        { id: "3", label: "Individual Tier Page", path: "/memberships/[plan]", action: "Review features + price" },
        { id: "4", label: "GHL Checkout", path: "GHL portal", action: "Membership payment — BUILT" },
      ],
    },
    {
      id: "promo",
      name: "Funnel 4 — Special Promo / Seasonal",
      description: "Campaign-specific landing pages with urgency/scarcity for limited-time offers (Black Friday, presale, summer special, etc.).",
      accentColor: "#e6c87a",
      steps: [
        { id: "1", label: "Ad / Email Campaign", path: "ad traffic", action: "Click from paid ad or email" },
        { id: "2", label: "Promo Landing Page", path: "/promo/[name]", action: "Urgency headline + scarcity copy + features" },
        { id: "3", label: "GHL Checkout", path: "GHL portal", action: "Locked-in rate payment" },
      ],
    },
  ],
  forms: [
    { id: "free-trial", name: "Free Trial / Day Pass Form", pages: "/free-trial", fields: "First, Last, Email, Phone, SMS consent, Age 18+, Local residency", status: "built", embedCode: "", notes: "" },
    { id: "assessment", name: "Athletic Assessment (Sports Performance)", pages: "/assessment", fields: "TBD — from GHL form", status: "built", embedCode: "", notes: "" },
    { id: "contact", name: "Contact / General Inquiry", pages: "/contact", fields: "First, Last, Email (req), Phone, Message (req)", status: "built", embedCode: "", notes: "" },
    { id: "membership", name: "Membership Checkout", pages: "/memberships/[plan], /join-now", fields: "Handled by GHL portal", status: "built", embedCode: "", notes: "Provide GHL portal link per membership tier" },
    { id: "calendar", name: "GHL Calendar / Booking Widget", pages: "/thank-you-free-trial, /thank-you-assessment", fields: "GHL calendar embed", status: "tbd", embedCode: "", notes: "Confirm GHL calendar ID" },
    { id: "newsletter", name: "Newsletter / Footer Signup", pages: "Footer (all pages)", fields: "First, Last, Email, Phone", status: "pending", embedCode: "", notes: "Build in GHL or reuse trial form" },
  ],
  assets: [
    { id: "hero-video", name: "Hero Video (homepage background)", type: "video", pages: "Homepage hero", status: "ready", notes: "" },
    { id: "facility-photos", name: "Facility Photos (equipment, space, atmosphere)", type: "photo", pages: "Homepage highlights, Gallery, About", status: "ready", notes: "" },
    { id: "logo", name: "Logo + Brand Kit (SVG/PNG + colors/fonts)", type: "logo", pages: "All pages — nav, footer, favicon", status: "ready", notes: "Provide exact hex codes for brand colors when uploading" },
    { id: "founder-headshot", name: "Founder / Owner Headshot", type: "photo", pages: "About Us", status: "needed", notes: "" },
    { id: "coach-headshots", name: "Coach / Trainer Headshots", type: "photo", pages: "Sports Performance, Coaching, Assessment", status: "needed", notes: "" },
    { id: "testimonials-photos", name: "Athlete Results / Before-After Photos", type: "photo", pages: "Homepage, Sports Performance", status: "needed", notes: "" },
    { id: "amenities-photos", name: "Amenities / Recovery Photos", type: "photo", pages: "Memberships — if recovery lounge or amenities exist", status: "tbd", notes: "" },
    { id: "event-photos", name: "Event / Competition Photos", type: "photo", pages: "Gallery, Events", status: "tbd", notes: "" },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const PAGE_STATUS_CYCLE: PageStatus[] = ["not-started", "in-progress", "ready"];
const FORM_STATUS_CYCLE: FormStatus[] = ["tbd", "pending", "built"];
const ASSET_STATUS_CYCLE: AssetStatus[] = ["tbd", "needed", "ready"];

function cyclePageStatus(s: PageStatus): PageStatus {
  const i = PAGE_STATUS_CYCLE.indexOf(s);
  return PAGE_STATUS_CYCLE[(i + 1) % PAGE_STATUS_CYCLE.length];
}
function cycleFormStatus(s: FormStatus): FormStatus {
  const i = FORM_STATUS_CYCLE.indexOf(s);
  return FORM_STATUS_CYCLE[(i + 1) % FORM_STATUS_CYCLE.length];
}
function cycleAssetStatus(s: AssetStatus): AssetStatus {
  const i = ASSET_STATUS_CYCLE.indexOf(s);
  return ASSET_STATUS_CYCLE[(i + 1) % ASSET_STATUS_CYCLE.length];
}

const PAGE_STATUS_CONFIG: Record<PageStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  "not-started": { label: "Not Started", color: "#7a8a95", bg: "rgba(122,138,149,0.12)", icon: <Circle size={11} /> },
  "in-progress": { label: "In Progress", color: "#B0E0E6", bg: "rgba(176,224,230,0.12)", icon: <Clock size={11} /> },
  ready: { label: "Ready", color: "#4ade80", bg: "rgba(74,222,128,0.12)", icon: <CheckCircle2 size={11} /> },
};

const FORM_STATUS_CONFIG: Record<FormStatus, { label: string; color: string; bg: string }> = {
  built: { label: "Built ✓", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  pending: { label: "Pending", color: "#e6c87a", bg: "rgba(230,200,122,0.12)" },
  tbd: { label: "TBD", color: "#7a8a95", bg: "rgba(122,138,149,0.12)" },
};

const ASSET_STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; bg: string }> = {
  ready: { label: "Ready ✓", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  needed: { label: "Needed", color: "#e05252", bg: "rgba(224,82,82,0.12)" },
  tbd: { label: "TBD", color: "#7a8a95", bg: "rgba(122,138,149,0.12)" },
};

const TRACK_CONFIG: Record<PageTrack, { label: string; color: string }> = {
  general: { label: "General", color: "#7a8a95" },
  "open-gym": { label: "Open Gym Track", color: "#B0E0E6" },
  performance: { label: "Performance Track", color: "#8ACDD4" },
};

const ASSET_TYPE_ICON: Record<string, string> = {
  video: "▶",
  photo: "📷",
  logo: "◈",
  other: "○",
};

// ── Shared input styles ────────────────────────────────────────────────────────

const fieldBase: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "none",
  borderBottom: "1px solid #3e4147",
  color: "#9aa5b0",
  fontSize: "13px",
  fontFamily: "inherit",
  width: "100%",
  outline: "none",
  padding: "4px 0",
  resize: "none",
  lineHeight: 1.5,
};

const headlineFieldStyle: React.CSSProperties = {
  ...fieldBase,
  color: "#B0E0E6",
  fontSize: "14px",
  fontWeight: 500,
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  highlight = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  highlight?: boolean;
}) {
  const style = highlight ? headlineFieldStyle : fieldBase;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>
        {label}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}…`}
          rows={2}
          style={style}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}…`}
          style={style}
        />
      )}
    </div>
  );
}

function StatusPill({
  label,
  color,
  bg,
  onClick,
}: {
  label: string;
  color: string;
  bg: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        color,
        backgroundColor: bg,
        border: `1px solid ${color}30`,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ── Tab: Site Map ──────────────────────────────────────────────────────────────

function SiteMapTab({
  plan,
  update,
}: {
  plan: PlanData;
  update: (fn: (p: PlanData) => PlanData) => void;
}) {
  const updateInfo = (key: keyof SiteInfo, val: string) =>
    update((p) => ({ ...p, siteInfo: { ...p.siteInfo, [key]: val } }));

  const updatePageStatus = (id: string) =>
    update((p) => ({
      ...p,
      sitePages: p.sitePages.map((pg) =>
        pg.id === id ? { ...pg, status: cyclePageStatus(pg.status) } : pg
      ),
    }));

  const updatePageNotes = (id: string, notes: string) =>
    update((p) => ({
      ...p,
      sitePages: p.sitePages.map((pg) => (pg.id === id ? { ...pg, notes } : pg)),
    }));

  const tracks: PageTrack[] = ["general", "open-gym", "performance"];
  const readyCount = plan.sitePages.filter((p) => p.status === "ready").length;

  return (
    <div>
      {/* Site Info */}
      <div style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#B0E0E6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
          Site Info
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <Field label="Gym Name" value={plan.siteInfo.gymName} onChange={(v) => updateInfo("gymName", v)} highlight />
          <Field label="Tagline" value={plan.siteInfo.tagline} onChange={(v) => updateInfo("tagline", v)} placeholder="e.g. Where strength is built." />
          <Field label="Address" value={plan.siteInfo.address} onChange={(v) => updateInfo("address", v)} />
          <Field label="Phone" value={plan.siteInfo.phone} onChange={(v) => updateInfo("phone", v)} />
          <Field label="Hours" value={plan.siteInfo.hours} onChange={(v) => updateInfo("hours", v)} placeholder="e.g. M–F 5AM–10PM · Sat–Sun 7AM–8PM · 24/7 member access" />
          <Field label="Brand Colors (hex)" value={plan.siteInfo.brandColors} onChange={(v) => updateInfo("brandColors", v)} placeholder="e.g. #1A1A1A, #E8C84A, #FFFFFF" />
          <Field label="GHL Subdomain" value={plan.siteInfo.ghlSubdomain} onChange={(v) => updateInfo("ghlSubdomain", v)} placeholder="e.g. houseofpower.myclickfunnels.com" />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "#7a8a95" }}>Pages ready</span>
          <span style={{ fontSize: "12px", color: "#9aa5b0" }}>{readyCount} / {plan.sitePages.length}</span>
        </div>
        <div style={{ height: "4px", backgroundColor: "#2C2F33", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(readyCount / plan.sitePages.length) * 100}%`, backgroundColor: "#4ade80", borderRadius: "999px", transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Pages by track */}
      {tracks.map((track) => {
        const pages = plan.sitePages.filter((p) => p.track === track);
        const tc = TRACK_CONFIG[track];
        return (
          <div key={track} style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: tc.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              {tc.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pages.map((pg) => {
                const sc = PAGE_STATUS_CONFIG[pg.status];
                return (
                  <div key={pg.id} style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderRadius: "8px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: pg.notes !== undefined ? "8px" : 0 }}>
                      <code style={{ fontSize: "12px", color: "#7a8a95", backgroundColor: "#2C2F33", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>
                        {pg.path}
                      </code>
                      <span style={{ fontSize: "13px", color: "#B0E0E6", fontWeight: 500, flex: 1 }}>{pg.title}</span>
                      <StatusPill label={sc.label} color={sc.color} bg={sc.bg} onClick={() => updatePageStatus(pg.id)} />
                    </div>
                    <input
                      type="text"
                      value={pg.notes}
                      onChange={(e) => updatePageNotes(pg.id, e.target.value)}
                      placeholder="Notes…"
                      style={{ ...fieldBase, fontSize: "12px" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Pages ─────────────────────────────────────────────────────────────────

function PagesTab({
  plan,
  update,
}: {
  plan: PlanData;
  update: (fn: (p: PlanData) => PlanData) => void;
}) {
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const togglePage = (id: string) =>
    setExpandedPages((p) => ({ ...p, [id]: !p[id] }));

  const toggleSection = (key: string) =>
    setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  const updateSection = (pageId: string, sectionId: string, field: keyof PageSection, val: string) =>
    update((p) => ({
      ...p,
      pageSections: {
        ...p.pageSections,
        [pageId]: (p.pageSections[pageId] ?? []).map((s) =>
          s.id === sectionId ? { ...s, [field]: val } : s
        ),
      },
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {plan.sitePages.map((pg) => {
        const expanded = expandedPages[pg.id];
        const sections = plan.pageSections[pg.id] ?? [];
        const sc = PAGE_STATUS_CONFIG[pg.status];
        const tc = TRACK_CONFIG[pg.track];
        const filledSections = sections.filter((s) => s.headline || s.body || s.cta).length;

        return (
          <div key={pg.id} style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderRadius: "10px", overflow: "hidden" }}>
            {/* Page header row */}
            <button
              onClick={() => togglePage(pg.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: "11px", color: tc.color, fontWeight: 700, backgroundColor: `${tc.color}18`, padding: "1px 6px", borderRadius: "4px", flexShrink: 0 }}>
                {tc.label.split(" ")[0]}
              </span>
              <code style={{ fontSize: "11px", color: "#7a8a95", flexShrink: 0 }}>{pg.path}</code>
              <span style={{ fontSize: "14px", color: "#B0E0E6", fontWeight: 600, flex: 1 }}>{pg.title}</span>
              <span style={{ fontSize: "11px", color: "#7a8a95" }}>{filledSections}/{sections.length} sections</span>
              <StatusPill label={sc.label} color={sc.color} bg={sc.bg} />
              <span style={{ color: "#7a8a95", flexShrink: 0 }}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
            </button>

            {expanded && (
              <div style={{ borderTop: "1px solid #3e4147", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {sections.map((section) => {
                  const sKey = `${pg.id}__${section.id}`;
                  const sExpanded = expandedSections[sKey];
                  const hasContent = section.headline || section.subheadline || section.body || section.cta;

                  return (
                    <div key={section.id} style={{ backgroundColor: "#2C2F33", border: "1px solid #3e4147", borderRadius: "8px", overflow: "hidden" }}>
                      <button
                        onClick={() => toggleSection(sKey)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        <span style={{ fontSize: "12px", fontWeight: 600, color: hasContent ? "#B0E0E6" : "#7a8a95", flex: 1 }}>
                          {section.name}
                        </span>
                        {section.headline && (
                          <span style={{ fontSize: "11px", color: "#9aa5b0", flex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {section.headline}
                          </span>
                        )}
                        {hasContent && (
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ade80", flexShrink: 0 }} />
                        )}
                        <span style={{ color: "#7a8a95", flexShrink: 0 }}>{sExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
                      </button>

                      {sExpanded && (
                        <div style={{ borderTop: "1px solid #3e4147", padding: "12px" }}>
                          <Field
                            label="Headline"
                            value={section.headline}
                            onChange={(v) => updateSection(pg.id, section.id, "headline", v)}
                            highlight
                            placeholder="Main headline for this section"
                          />
                          <Field
                            label="Subheadline"
                            value={section.subheadline}
                            onChange={(v) => updateSection(pg.id, section.id, "subheadline", v)}
                            placeholder="Supporting headline or tagline"
                          />
                          <Field
                            label="Body Copy / Notes"
                            value={section.body}
                            onChange={(v) => updateSection(pg.id, section.id, "body", v)}
                            multiline
                            placeholder="Body copy, bullet points, or planning notes…"
                          />
                          <Field
                            label="CTA Text"
                            value={section.cta}
                            onChange={(v) => updateSection(pg.id, section.id, "cta", v)}
                            placeholder="Button label e.g. Claim Your Free Pass"
                          />
                          <Field
                            label="Asset / Visual Notes"
                            value={section.assetNotes}
                            onChange={(v) => updateSection(pg.id, section.id, "assetNotes", v)}
                            placeholder="Photo needed, video background, etc."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Funnels ───────────────────────────────────────────────────────────────

function FunnelsTab({
  plan,
  update,
}: {
  plan: PlanData;
  update: (fn: (p: PlanData) => PlanData) => void;
}) {
  const updateFunnel = (id: string, field: keyof Funnel, val: string) =>
    update((p) => ({
      ...p,
      funnels: p.funnels.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    }));

  const updateStep = (funnelId: string, stepId: string, field: keyof FunnelStep, val: string) =>
    update((p) => ({
      ...p,
      funnels: p.funnels.map((f) =>
        f.id !== funnelId
          ? f
          : { ...f, steps: f.steps.map((s) => (s.id === stepId ? { ...s, [field]: val } : s)) }
      ),
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {plan.funnels.map((funnel) => (
        <div key={funnel.id} style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderLeft: `3px solid ${funnel.accentColor}`, borderRadius: "10px", padding: "20px" }}>
          <input
            type="text"
            value={funnel.name}
            onChange={(e) => updateFunnel(funnel.id, "name", e.target.value)}
            style={{ ...headlineFieldStyle, fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}
          />
          <textarea
            value={funnel.description}
            onChange={(e) => updateFunnel(funnel.id, "description", e.target.value)}
            rows={2}
            style={{ ...fieldBase, marginBottom: "16px" }}
          />

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {funnel.steps.map((step, i) => (
              <div key={step.id}>
                {/* Step card */}
                <div style={{ backgroundColor: "#2C2F33", border: "1px solid #3e4147", borderRadius: "8px", padding: "12px 14px", display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: "10px", alignItems: "start" }}>
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: funnel.accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#2C2F33", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Label</div>
                    <input type="text" value={step.label} onChange={(e) => updateStep(funnel.id, step.id, "label", e.target.value)} style={{ ...headlineFieldStyle, fontSize: "13px" }} />
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "8px", marginBottom: "2px" }}>Path / URL</div>
                    <input type="text" value={step.path} onChange={(e) => updateStep(funnel.id, step.id, "path", e.target.value)} style={{ ...fieldBase, fontSize: "12px", fontFamily: "monospace" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Action / Notes</div>
                    <textarea value={step.action} onChange={(e) => updateStep(funnel.id, step.id, "action", e.target.value)} rows={3} style={fieldBase} />
                  </div>
                </div>
                {/* Arrow */}
                {i < funnel.steps.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", color: funnel.accentColor, fontSize: "14px" }}>↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Forms ─────────────────────────────────────────────────────────────────

function FormsTab({
  plan,
  update,
}: {
  plan: PlanData;
  update: (fn: (p: PlanData) => PlanData) => void;
}) {
  const updateForm = (id: string, field: keyof FormItem, val: string) =>
    update((p) => ({
      ...p,
      forms: p.forms.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    }));

  const cycleStatus = (id: string) =>
    update((p) => ({
      ...p,
      forms: p.forms.map((f) => (f.id === id ? { ...f, status: cycleFormStatus(f.status) } : f)),
    }));

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 8px" }}>
        Paste your GHL embed codes here when ready. All 4 primary forms are already built in GHL.
      </p>
      {plan.forms.map((form) => {
        const sc = FORM_STATUS_CONFIG[form.status];
        const isExpanded = expanded[form.id];
        return (
          <div key={form.id} style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderRadius: "10px", overflow: "hidden" }}>
            <button
              onClick={() => toggle(form.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: "14px", color: "#B0E0E6", fontWeight: 600, flex: 1 }}>{form.name}</span>
              <code style={{ fontSize: "11px", color: "#7a8a95" }}>{form.pages}</code>
              <StatusPill label={sc.label} color={sc.color} bg={sc.bg} onClick={(e) => { e.stopPropagation(); cycleStatus(form.id); }} />
              <span style={{ color: "#7a8a95" }}>{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
            </button>
            {isExpanded && (
              <div style={{ borderTop: "1px solid #3e4147", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <Field label="Fields" value={form.fields} onChange={(v) => updateForm(form.id, "fields", v)} placeholder="List form fields" />
                <Field label="Notes" value={form.notes} onChange={(v) => updateForm(form.id, "notes", v)} placeholder="Any notes, instructions, or reminders" multiline />
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                    GHL Embed Code
                  </div>
                  <textarea
                    value={form.embedCode}
                    onChange={(e) => updateForm(form.id, "embedCode", e.target.value)}
                    placeholder="Paste GHL embed code or portal link here…"
                    rows={4}
                    style={{ ...fieldBase, fontFamily: "monospace", fontSize: "12px", borderBottom: "1px solid #3e4147" }}
                  />
                  {form.embedCode && (
                    <div style={{ fontSize: "11px", color: "#4ade80", marginTop: "4px" }}>✓ Embed code saved</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Assets ────────────────────────────────────────────────────────────────

function AssetsTab({
  plan,
  update,
}: {
  plan: PlanData;
  update: (fn: (p: PlanData) => PlanData) => void;
}) {
  const cycleStatus = (id: string) =>
    update((p) => ({
      ...p,
      assets: p.assets.map((a) => (a.id === id ? { ...a, status: cycleAssetStatus(a.status) } : a)),
    }));

  const updateAsset = (id: string, field: keyof AssetItem, val: string) =>
    update((p) => ({
      ...p,
      assets: p.assets.map((a) => (a.id === id ? { ...a, [field]: val } : a)),
    }));

  const readyCount = plan.assets.filter((a) => a.status === "ready").length;
  const neededCount = plan.assets.filter((a) => a.status === "needed").length;

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <div style={{ backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "8px", padding: "10px 16px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#4ade80" }}>{readyCount}</div>
          <div style={{ fontSize: "11px", color: "#7a8a95" }}>Ready</div>
        </div>
        <div style={{ backgroundColor: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.2)", borderRadius: "8px", padding: "10px 16px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#e05252" }}>{neededCount}</div>
          <div style={{ fontSize: "11px", color: "#7a8a95" }}>Needed</div>
        </div>
        <div style={{ backgroundColor: "rgba(122,138,149,0.1)", border: "1px solid rgba(122,138,149,0.2)", borderRadius: "8px", padding: "10px 16px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#7a8a95" }}>{plan.assets.length - readyCount - neededCount}</div>
          <div style={{ fontSize: "11px", color: "#7a8a95" }}>TBD</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {plan.assets.map((asset) => {
          const sc = ASSET_STATUS_CONFIG[asset.status];
          return (
            <div key={asset.id} style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{ASSET_TYPE_ICON[asset.type]}</span>
                <span style={{ fontSize: "13px", color: "#B0E0E6", fontWeight: 600, flex: 1 }}>{asset.name}</span>
                <StatusPill label={sc.label} color={sc.color} bg={sc.bg} onClick={() => cycleStatus(asset.id)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <Field label="Pages" value={asset.pages} onChange={(v) => updateAsset(asset.id, "pages", v)} placeholder="Which pages use this asset" />
                <Field label="Notes" value={asset.notes} onChange={(v) => updateAsset(asset.id, "notes", v)} placeholder="Format, specs, or shoot notes" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "sitemap", label: "Site Map", icon: <Map size={14} /> },
  { id: "pages", label: "Pages", icon: <FileText size={14} /> },
  { id: "funnels", label: "Funnels", icon: <GitBranch size={14} /> },
  { id: "forms", label: "Forms", icon: <Code2 size={14} /> },
  { id: "assets", label: "Assets", icon: <ImageIcon size={14} /> },
];

export default function HOPWebsitePlanner() {
  const [tab, setTab] = useState<Tab>("sitemap");
  const [plan, setPlan] = useState<PlanData>(DEFAULT_PLAN);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem("hop-website-plan-version");
      const saved = localStorage.getItem("hop-website-plan");
      if (saved && savedVersion === PLAN_VERSION) {
        setPlan(JSON.parse(saved));
      } else {
        // New version — reset to updated defaults
        localStorage.setItem("hop-website-plan", JSON.stringify(DEFAULT_PLAN));
        localStorage.setItem("hop-website-plan-version", PLAN_VERSION);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("hop-website-plan", JSON.stringify(plan));
        localStorage.setItem("hop-website-plan-version", PLAN_VERSION);
      } catch {}
    }
  }, [plan, hydrated]);

  const update = (fn: (p: PlanData) => PlanData) => setPlan(fn);

  const readyPages = plan.sitePages.filter((p) => p.status === "ready").length;
  const builtForms = plan.forms.filter((f) => f.status === "built").length;
  const readyAssets = plan.assets.filter((a) => a.status === "ready").length;
  const gymName = plan.siteInfo.gymName || "House of Power";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#2C2F33", padding: "32px", maxWidth: "960px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <Globe size={20} style={{ color: "#B0E0E6" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#B0E0E6", margin: 0 }}>{gymName} — Website Planning</h1>
        </div>
        <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 16px" }}>
          Map out every page, section, funnel, form, and asset before a single line of website code is written. Click status badges to cycle them.
        </p>

        {/* Preview Site button */}
        <a
          href="/webdev/house-of-power/site"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "7px",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: "#E84A10",
            color: "#fff",
            textDecoration: "none",
            marginBottom: "16px",
          }}
        >
          <ExternalLink size={13} />
          Preview Site Template
        </a>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Pages ready", value: `${readyPages}/${plan.sitePages.length}`, color: "#4ade80" },
            { label: "Forms built", value: `${builtForms}/${plan.forms.length}`, color: "#B0E0E6" },
            { label: "Assets ready", value: `${readyAssets}/${plan.assets.length}`, color: "#8ACDD4" },
            { label: "Funnels mapped", value: `${plan.funnels.length}`, color: "#e6c87a" },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "#36393F", border: "1px solid #3e4147", borderRadius: "8px", padding: "8px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: stat.color }}>{stat.value}</span>
              <span style={{ fontSize: "11px", color: "#7a8a95" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid #3e4147", paddingBottom: "1px" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #B0E0E6" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "#B0E0E6" : "#7a8a95",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "sitemap" && <SiteMapTab plan={plan} update={update} />}
      {tab === "pages" && <PagesTab plan={plan} update={update} />}
      {tab === "funnels" && <FunnelsTab plan={plan} update={update} />}
      {tab === "forms" && <FormsTab plan={plan} update={update} />}
      {tab === "assets" && <AssetsTab plan={plan} update={update} />}

      {/* Footer note */}
      <div style={{ marginTop: "32px", borderTop: "1px solid #3e4147", paddingTop: "16px" }}>
        <p style={{ fontSize: "11px", color: "#7a8a95", margin: 0 }}>
          All changes auto-save to localStorage. Once pages, funnels, and assets are mapped, share GHL embed codes and we begin building the website.
        </p>
      </div>
    </div>
  );
}
