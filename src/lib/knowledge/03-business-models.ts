import type { KnowledgeDoc } from './index'

export const businessModelsDoc: KnowledgeDoc = {
  id: '03-business-models',
  title: 'House of Power — Business Model & Pipeline',
  sections: [
    {
      heading: 'Revenue Streams',
      content: `1. Monthly Memberships (24/7 access) — recurring, highest volume, anchor revenue.
2. Semi-Private Training Packages — recurring or block-purchased, highest margin per head.
3. Hybrid Coaching Subscriptions — recurring monthly, mid-tier margin.
4. Sports Performance Programs — block or competition-cycle based, premium pricing.
5. Youth Training Programs — recurring, family-retention flywheel.
6. Coaching Assessments — one-time entry point fee; most coached members start here.
7. MMA/Boxing Classes — drop-in or bundle pricing.

Revenue hierarchy: Memberships are the foundation. Coaching upgrades are the profit layer. Assessments are the door.`,
    },
    {
      heading: 'GHL Pipeline Stages',
      content: `Stage 1 — New Lead: Contact enters from ad, referral, walk-in, or organic search. Eden follows up within 60 minutes during business hours.
Stage 2 — Contacted: First contact made via SMS or call. Goal is to qualify and book a tour or assessment.
Stage 3 — Tour Booked: Prospect has a tour or assessment scheduled.
Stage 4 — Tour Completed: They came in. The close happens same day or within 24 hours.
Stage 5 — Trial / Assessment Active: They're in a trial or assessment period. Nurture heavily here — this is the highest-conversion window.
Stage 6 — Membership Sold: Active member. Hand off to retention and upsell tracks.
Stage 7 — Churned: Member cancelled. Enter re-engagement sequence after 30 days.`,
    },
    {
      heading: 'Lead-to-Member Journey',
      content: `Entry points: Facebook/Instagram ad, Google search, word of mouth, walk-in, local event.
First touch: GHL SMS follow-up within 60 minutes of lead creation.
Qualification: Eden asks 2–3 key questions — What are you training for? Where are you training now? What's been missing?
Booking: Tour or assessment booked directly via SMS or call. Two-option close always.
Close: Tour leads to Assessment leads to Membership offer. Decision ideally within 24–48 hours of the tour.
Retention trigger: Monthly check-in outreach at 30/60/90 day marks for new members.`,
    },
    {
      heading: 'Upsell Paths',
      content: `Membership → Semi-Private Training: Offer after 30 days. Trigger: member trains consistently but progress is slow or they ask for guidance.
Membership → Hybrid Coaching: Offer to members who compete or mention a specific goal event.
Semi-Private → Sports Performance: Offer when member expresses interest in competing.
Any → Youth Training: Offer when member mentions kids. Family referral is the highest-LTV acquisition.
Assessment → Immediate Membership: If rapport is strong and they're clearly ready, offer same day. Never push — position as the obvious next step.`,
    },
    {
      heading: 'Key Business Metrics to Track',
      content: `Lead response time: Target under 60 minutes for first contact.
Tour show rate: % of booked tours that actually show up. Industry benchmark is ~60%; anything above 70% is strong.
Tour-to-sale rate: % of tours that result in a membership or coaching sale. Target 50%+.
Member retention: Monthly churn rate. Track who's coming in and who's going quiet.
Coaching upgrade rate: % of base members who add a coaching product within 90 days.
GymMaster expiry alerts: Members expiring within 14 days are re-engagement opportunities, not losses.`,
    },
  ],
}
