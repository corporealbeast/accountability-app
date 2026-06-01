// Shared data model, defaults, and localStorage helpers for the coaching business.
// Both /command and /coaching read and write this same key.

export const STORAGE_KEY = "eden-coaching-business-v1";

export type TodayAction = {
  label: string;
  action: string;
  status: "Not Started" | "In Progress" | "Complete";
};

export type Lead = {
  name: string;
  source: string;
  status: string;
  value: string;
  nextFollowUp: string;
};

export type SystemChecklistItem = {
  area: string;
  task: string;
  status: "Not Started" | "In Progress" | "Complete";
  nextAction: string;
};

export type AssetStatus = "Draft" | "Ready" | "Used";

export type AssetItem = {
  title: string;
  category: string;
  relatedRoadmapItem: string;
  content: string;
  link: string;
  status: AssetStatus;
};

export type AgentTaskStatus =
  | "Queued"
  | "Ready to Send"
  | "Waiting on Agent"
  | "Needs Review"
  | "Complete";

export type AgentTask = {
  task: string;
  assignedAgent: string;
  project: string;
  outputNeeded: string;
  status: AgentTaskStatus;
  saveOutputTo: string;
  nextHumanAction: string;
};

export type RoadmapStatus = "Not Started" | "In Progress" | "Complete";

export type RoadmapItem = {
  title: string;
  project: string;
  status: RoadmapStatus;
  priority: "Low" | "Medium" | "High";
  assignedAgent: string;
  nextAction: string;
  tasks: string[];
  notes: string;
  assetLinks: string;
};

export type CoachingBusiness = {
  missionTitle: string;
  currentMRR: string;
  targetMRR: string;
  currentClients: string;
  targetClients: string;
  leadsNeedingFollowUp: string;
  callsBooked: string;
  todayActions: TodayAction[];
  leads: Lead[];
  systemChecklist: SystemChecklistItem[];
  roadmap: RoadmapItem[];
  assets: AssetItem[];
  agentQueue: AgentTask[];
  blockers: { blocker: string; simplifiedAction: string }[];
};

export const defaultData: CoachingBusiness = {
  missionTitle: "Add $3,000/month recurring from private coaching clients.",
  currentMRR: "$0",
  targetMRR: "$3,000",
  currentClients: "0",
  targetClients: "10",
  leadsNeedingFollowUp: "0",
  callsBooked: "0",
  todayActions: [
    {
      label: "Revenue Action",
      action: "Create a list of 20 old clients/leads and message the first 10.",
      status: "Not Started",
    },
    {
      label: "System Action",
      action: "Finish Day 1 only of the MyStrengthBook 3-day strength template.",
      status: "Not Started",
    },
    {
      label: "Visibility Action",
      action: "Post one story: “I’m opening 5 online strength coaching spots.”",
      status: "Not Started",
    },
  ],
  leads: [
    {
      name: "Old Client Reactivation List",
      source: "Previous clients",
      status: "Needs Outreach",
      value: "$250–$300/mo each",
      nextFollowUp: "Today",
    },
  ],
  systemChecklist: [
    {
      area: "Offer",
      task: "Define founding client offer",
      status: "Not Started",
      nextAction: "Set the offer at $250–$300/month with weekly programming, check-ins, and adjustments.",
    },
    {
      area: "Funnel",
      task: "Finish GHL mobile page",
      status: "Not Started",
      nextAction: "Build one page with headline, proof, offer, and form.",
    },
    {
      area: "Programming",
      task: "Finish 3-day MyStrengthBook template",
      status: "In Progress",
      nextAction: "Finish Day 1 first. Do not build the full library yet.",
    },
    {
      area: "Onboarding",
      task: "Create new client onboarding checklist",
      status: "Not Started",
      nextAction: "Map payment → intake → app invite → first program → first check-in.",
    },
  ],
  roadmap: [
    {
      title: "Build Coaching Offer",
      project: "Personal Coaching",
      status: "In Progress",
      priority: "High",
      assignedAgent: "EDEN / Claude Ads Agent",
      nextAction: "Finalize the founding client offer and price.",
      tasks: ["Define offer", "Pick price", "Write sales call outline", "Write reactivation message"],
      notes: "This is the core offer for getting 10 clients at $250–$300/month.",
      assetLinks: "",
    },
    {
      title: "Create First Coaching Ad Campaign",
      project: "Personal Coaching",
      status: "Not Started",
      priority: "High",
      assignedAgent: "Claude Ads Agent",
      nextAction: "Generate 3 ad angles, hooks, captions, and one short video script.",
      tasks: ["Write 3 campaign angles", "Write hooks", "Write boosted post caption", "Write video script", "Choose CTA", "Launch or boost post"],
      notes: "This is where Claude ad copy, hooks, and video scripts should be pasted.",
      assetLinks: "",
    },
    {
      title: "Build GHL Coaching Funnel",
      project: "Personal Coaching",
      status: "Not Started",
      priority: "High",
      assignedAgent: "Claude Funnel/Ops Agent",
      nextAction: "Create one mobile GHL page with headline, proof, offer, and form.",
      tasks: ["Write headline", "Write proof section", "Write offer section", "Add form", "Add calendar or intro call CTA", "Test submission"],
      notes: "This card should hold funnel copy, form links, calendar links, and follow-up sequence ideas.",
      assetLinks: "",
    },
    {
      title: "Build Client Onboarding System",
      project: "Personal Coaching",
      status: "Not Started",
      priority: "High",
      assignedAgent: "Claude Funnel/Ops Agent",
      nextAction: "Map payment → intake → MSB invite → first program → first check-in.",
      tasks: ["Confirm payment link", "Create intake form", "Create welcome message", "Create MSB invite process", "Create first check-in instructions"],
      notes: "This card should hold onboarding scripts, checklists, and automation notes.",
      assetLinks: "",
    },
    {
      title: "Testimonial / Transformation Library",
      project: "Personal Coaching",
      status: "Not Started",
      priority: "High",
      assignedAgent: "EDEN / Claude Funnel-Ops Agent",
      nextAction: "Create a place to store client proof, quotes, screenshots, PRs, and transformation notes.",
      tasks: ["Define testimonial fields", "Collect old client proof", "Add permission status", "Mark testimonials usable for landing page or ads", "Save asset links"],
      notes: "This card will hold client proof, transformation screenshots, quotes, PRs, and permission notes. Eventually this should become a testimonial database that can feed the landing page proof section.",
      assetLinks: "",
    },
    {
      title: "Landing Page Proof Section",
      project: "Personal Coaching",
      status: "Not Started",
      priority: "High",
      assignedAgent: "Claude Funnel/Ops Agent",
      nextAction: "Draft the landing page proof section using testimonials, credibility, and client outcomes.",
      tasks: ["Write proof section headline", "Add personal credibility", "Add testimonials", "Add transformation/result examples", "Add CTA under proof section"],
      notes: "This card should hold the copy for the GHL landing page proof section. It should eventually pull from the Testimonial / Transformation Library.",
      assetLinks: "",
    },
  ],
  assets: [
    {
      title: "First Coaching Ad Copy",
      category: "Ad Copy",
      relatedRoadmapItem: "Create First Coaching Ad Campaign",
      content: "",
      link: "",
      status: "Draft",
    },
    {
      title: "GHL Landing Page Copy",
      category: "Funnel Copy",
      relatedRoadmapItem: "Build GHL Coaching Funnel",
      content: "",
      link: "",
      status: "Draft",
    },
    {
      title: "Testimonial / Proof Notes",
      category: "Proof",
      relatedRoadmapItem: "Testimonial / Transformation Library",
      content: "",
      link: "",
      status: "Draft",
    },
  ],
  agentQueue: [
    {
      task: "Create first coaching ad campaign",
      assignedAgent: "Claude Ads Agent",
      project: "Personal Coaching",
      outputNeeded: "3 ad angles, hooks, captions, and one short video script",
      status: "Queued",
      saveOutputTo: "Asset Library → First Coaching Ad Copy",
      nextHumanAction: "Send the roadmap card brief to Claude and paste output into Asset Library",
    },
    {
      task: "Build GHL coaching funnel copy",
      assignedAgent: "Claude Funnel/Ops Agent",
      project: "Personal Coaching",
      outputNeeded: "Headline, proof section, offer section, CTA, and form instructions",
      status: "Queued",
      saveOutputTo: "Asset Library → GHL Landing Page Copy",
      nextHumanAction: "Send funnel card brief to Claude and paste output into Asset Library",
    },
    {
      task: "Create testimonial collection system",
      assignedAgent: "EDEN / Claude Funnel-Ops Agent",
      project: "Personal Coaching",
      outputNeeded: "Testimonial fields list, permission message template, and asset tagging guide",
      status: "Queued",
      saveOutputTo: "Asset Library → Testimonial / Proof Notes",
      nextHumanAction: "Send testimonial card brief to Claude and paste output into Asset Library",
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
      simplifiedAction: "Use EDEN for routing. Use ChatGPT for code execution.",
    },
  ],
};

export function loadData(): CoachingBusiness {
  if (typeof window === "undefined") return { ...defaultData };

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultData };

  try {
    const parsed = JSON.parse(saved);
    return {
      ...defaultData,
      ...parsed,
      todayActions: parsed.todayActions ?? defaultData.todayActions,
      leads: parsed.leads ?? defaultData.leads,
      systemChecklist: parsed.systemChecklist ?? defaultData.systemChecklist,
      roadmap: parsed.roadmap ?? defaultData.roadmap,
      assets: parsed.assets ?? defaultData.assets,
      agentQueue: parsed.agentQueue ?? defaultData.agentQueue,
      blockers: parsed.blockers ?? defaultData.blockers,
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data: CoachingBusiness): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
