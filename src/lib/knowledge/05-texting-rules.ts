import type { KnowledgeDoc } from './index'

export const textingRulesDoc: KnowledgeDoc = {
  id: '05-texting-rules',
  title: 'House of Power — GHL SMS Rules & Texting Playbook',
  sections: [
    {
      heading: 'TCPA Compliance Rules',
      content: `These are non-negotiable. Violating TCPA can result in fines up to $1,500 per message.

1. Only text leads who have explicitly opted in — through a form, ad, chat widget, or in-person signup that includes an SMS consent disclosure.
2. Every outbound message sequence must include an easy opt-out: "Reply STOP to unsubscribe." Include this on the first message or within the first 24 hours.
3. Never text purchased lists or scraped numbers.
4. If someone replies STOP, remove from all SMS sequences immediately — GHL handles this automatically if configured correctly.
5. Keep records of consent: GHL stores form submission timestamps. Do not manually add contacts to SMS sequences without documented consent.`,
    },
    {
      heading: 'Timing Windows — When You Can Text',
      content: `Safe texting hours: 8:00 AM to 8:00 PM in the recipient's local timezone.
Do not text before 8:00 AM — even if it's a "good morning" message.
Do not text after 8:00 PM.
Sunday rule: No texts before 12:00 PM on Sundays. Respect family and rest time.

Best send times (fitness industry data):
- Tuesday–Thursday between 10 AM–12 PM and 5 PM–7 PM get the highest open and response rates.

Avoid: Monday mornings (people are buried in their week), Friday afternoons (mentally checked out), holiday weekends.`,
    },
    {
      heading: 'Tone Rules for SMS',
      content: `1. Sound like a human, not a business. First person. Contractions. Casual but not sloppy.
2. One message = one ask. Don't stack multiple questions or CTAs.
3. Keep messages under 160 characters when possible (one SMS segment). Two segments max.
4. Never use ALL CAPS. Even for emphasis — it reads as shouting.
5. No excessive punctuation (!!!, ???). One exclamation point max per message, used sparingly.
6. No emojis in initial outreach. Once rapport is established and the contact has responded warmly, a single relevant emoji is acceptable.
7. Never send a wall of text over SMS. If the message needs more than 3 sentences, it belongs in an email or a call.
8. Personalize always: use their first name on the first message at minimum.`,
    },
    {
      heading: 'First-Message Template',
      content: `This is the template for the very first SMS after a new GHL lead comes in.

Template:
"Hey [First Name]! This is [Agent Name] from House of Power. Saw you were interested — what kind of training are you looking to get into?"

Variants by lead source:
- Ad lead: "Hey [First Name]! Saw you checked out our [ad/offer]. I'm [Agent Name] at House of Power. What's got you interested?"
- Walk-in / referral: "Hey [First Name], [Agent Name] from House of Power. Great meeting you [today / the other day]. Wanted to follow up — any questions I can answer?"

Do not include in the first message: gym address, full service menu, pricing, or any promotional language. That kills the conversation before it starts.`,
    },
    {
      heading: 'Follow-Up Cadence',
      content: `If there is no reply to the first message, follow this cadence. Stop immediately if they respond at any point.

Day 1 (same day, 3–4 hours after first message if no reply):
"Just making sure this got through — sometimes these go to spam. Happy to answer any questions, or I can tell you a bit more about what we have. What's on your mind?"

Day 3:
"Still here if the timing wasn't right. We've got [relevant thing — new availability, equipment, open spots] if that helps. Worth a 10-minute chat?"

Day 7:
"One more check-in — I know life gets busy. If you're still thinking about it, the door's open. If the timing isn't right, totally understand. Just say the word either way."

Day 14 (final follow-up before marking cold):
"[First Name] — last check-in, I promise. If anything changes or you're ready to come see the gym, reach out anytime. We're not going anywhere. — [Agent Name], House of Power"

After day 14: Move to cold lead in GHL. Do not text again until a re-engagement campaign is appropriate (30+ days with a new angle).`,
    },
    {
      heading: 'Response Templates — Common Scenarios',
      content: `"What are your prices?" — Never answer price over text.
Response: "Good question — pricing varies by what you're looking for. Can I ask what kind of training you're interested in? That'll help me point you to the right option."

"I'm not interested anymore." — Graceful exit.
Response: "No worries at all. If anything changes, you know where to find us. Take care, [First Name]."

"I need to think about it." — Soft nudge, no pressure.
Response: "Makes sense. What's the main thing you're still figuring out? Happy to help if I can."

"How do I sign up?" — Move fast.
Response: "Love to hear it. Easiest thing is to come in for a quick 20-minute tour so we can get you set up properly. What day works for you this week?"

"Do you have [specific equipment]?" — Specific answer.
Response: "Yes / we have [specific equipment]. Want to come see it? I can show you the whole setup."`,
    },
    {
      heading: 'What Never to Text',
      content: `Absolute prohibitions over SMS:
1. No pricing lists or menus — pricing conversations happen in person or on the phone.
2. No contract details or legal terms.
3. No health or medical questions ("Do you have any injuries?") — these belong in an assessment form, not SMS.
4. No negative language about competitors. Ever. In any channel.
5. No multi-paragraph sales pitches.
6. No automated birthday/holiday messages unless they explicitly opted into that.
7. Never text while rushed — rushed messages read wrong and lead to mistakes.`,
    },
    {
      heading: 'Escalation Triggers',
      content: `Escalate from SMS to phone call or in-person when:
1. The lead is highly engaged (multiple back-and-forth replies, asking detailed questions) — this is a buying signal. Stop texting, call them.
2. The lead expresses confusion, frustration, or gives a complex objection — text is not the right channel for nuance.
3. The lead mentions injury, health conditions, or anything that needs real context.
4. The lead is ready to buy and you're still texting — pick up the phone and close it.
5. More than 6 exchanges have happened over text without a clear next step — call to convert.

Escalation script (text to prompt call):
"This is a lot easier over the phone than text — do you have 5 minutes? I can call you at your number or you can reach us at [gym number]."`,
    },
  ],
}
