import type { KnowledgeDoc } from './index'

export const salesScriptsDoc: KnowledgeDoc = {
  id: '04-sales-scripts',
  title: 'House of Power — Sales Scripts & Conversation Playbooks',
  sections: [
    {
      heading: 'First Contact — Inbound GHL Lead (SMS)',
      content: `Goal: Make contact within 60 minutes of the lead coming in. Sound human, not automated.

Template:
"Hey [Name]! This is [Christian / Eden] from House of Power. Saw you reached out — stoked you did. What kind of training are you looking to get into?"

If no response in 2–3 hours:
"Just wanted to make sure this got to you. We've got a pretty unique setup here — 24/7 access, specialty strength equipment, real coaching. Happy to answer questions or show you around. What works for you?"

Key rules: Use their first name. Keep it under 2 sentences. Ask one question only. Do not sell features in the first message.`,
    },
    {
      heading: 'Qualification Questions',
      content: `Ask these in natural conversation — not as a list. Pick 2–3 based on what they've already said.

1. "What are you training for right now — any specific sport, goal, or event?"
2. "Where are you training currently?"
3. "What's been missing from your current situation?" (if they're leaving somewhere)
4. "How long have you been training seriously?"
5. "What would make this year different from last year for you in the gym?"

What you're listening for:
- Do they have a real goal or just vague interest? (Real goal = higher intent)
- Are they already serious lifters or new? (Sets coaching recommendation)
- What made them reach out NOW? (Urgency signal)
- Do they have a budget objection hiding? (If they ask price first, that's a signal)`,
    },
    {
      heading: 'Tour Booking Script',
      content: `Goal: Get them in the building. Seeing the gym closes more than any script.

"Based on what you're telling me, I think you'd be blown away by what we have here. We've got [relevant equipment or program for their goal]. The best thing I can do is get you in for a quick tour — takes about 20 minutes. We've got time [Day 1] or [Day 2] — which works better for you?"

Two-option close: Never ask "When are you free?" — always give two specific options.

If they hesitate:
"Totally no pressure. Even if you're just curious, it's worth seeing. There's nothing else like it in OC. What's one day this week that's not totally slammed for you?"

Confirmation text (send after booking):
"Locked in for [Day] at [Time]. House of Power is at [address]. Text me if anything changes. See you then, [Name]."`,
    },
    {
      heading: 'Trial Close (After Tour)',
      content: `Used during or immediately after the tour — before the membership pitch.

"Before we talk about getting you started — be honest with me: is this the kind of place you could see yourself training? Like, does it feel right?"

Let them answer. If yes:
"Good. Then let's talk about what makes the most sense for you specifically."

If uncertain:
"What's your gut telling you is missing?" — listen, address directly, do not oversell.

This step is non-optional. Skipping it and going straight to price kills deals.`,
    },
    {
      heading: 'Membership Close',
      content: `After the tour and trial close, make the offer clean and direct.

"Here's what I'd recommend for you based on what you told me: [specific program]. That's [price] per month. It gets you [specific benefits relevant to their goal]. What questions do you have?"

Key mechanics:
- State the price confidently. Don't apologize for it.
- Don't offer a discount first — only if pressed after objection handling.
- After stating price, stop talking. Silence is not rejection — it's thinking.
- If they say "that sounds good" — move immediately to paperwork/payment. Don't keep selling.

"To get you started, I just need [name, email, payment method]. We can do it right here — takes 3 minutes."`,
    },
    {
      heading: 'Objection — Price / Too Expensive',
      content: `Never fight the objection. Acknowledge, reframe, close.

"I get it — it's a real number. Can I ask — what's your current situation costing you? Not just money, but time, frustration, lack of results?" [Pause. Let them answer.]

"The way I look at it: [price] per month breaks down to about [daily cost]. If it's the right fit and you're actually getting results, is that a fair trade?"

If still stuck:
"What would make this feel like a no-brainer for you? I want to figure out if there's a way to make this work."

Last resort — payment plan (only if available):
"We can break the first payment into two — [offer structure]. That gets you in with less friction upfront. Want to try it that way?"`,
    },
    {
      heading: 'Objection — Not Enough Time',
      content: `"I hear you — everyone's slammed. Can I ask: how many days a week realistically could you commit, even if it's not ideal?"

Let them answer.

"Okay so [X days]. That's honestly enough. [Program] is designed for exactly that. You don't need 6 days a week to get real results here — you need the right 3. That's what we build for you."

If they're truly unsure about time:
"What if we started with one month and see how it fits into your schedule? If it doesn't work, we'll figure something out. But you won't know until you try — and the equipment and coaching aren't going to magically appear somewhere else."`,
    },
    {
      heading: 'Objection — Thinking About It / Not Ready',
      content: `"Totally fair. What would help you feel ready?"

[Listen carefully. They'll tell you the real objection.]

Common underlying objection A — fear of commitment:
"You're not signing a 2-year lease. This is month-to-month. The worst case is you try it for a month and decide it's not for you. Best case, you found your gym."

Common underlying objection B — comparing options:
"What else are you looking at?" [Let them tell you. Then:] "What's making this one feel like a maybe instead of a yes?"

Common underlying objection C — the unknown:
"What's the thing you're not sure about yet? Let's just talk through it."`,
    },
    {
      heading: 'Objection — Comparing to Another Gym',
      content: `Never badmouth competitors. Differentiate on specifics.

"[Competitor] is a solid gym for what they do. What we do differently is [specific differentiator relevant to their goal]. If you're serious about [their stated goal], you're going to hit a ceiling there that you won't hit here."

If it's a big-box gym (Planet Fitness, LA Fitness, 24 Hour, etc.):
"I'm not going to knock them — they serve a need. But if you're training for [their goal], you know as well as I do that you need [specific equipment or coaching]. That's not what those places are built for. We are."

If it's a serious competitor gym:
"Go tour them — I want you to make the right choice. What I'll say is: come back and tell me if they have [differentiator 1] and [differentiator 2]. We can talk after."`,
    },
    {
      heading: 'Re-Engagement — Cold Leads (30+ Days Silent)',
      content: `For leads who went quiet after initial contact. No guilt, no pressure, just genuine re-entry.

Template 1 (30 days):
"Hey [Name] — [Christian] from House of Power. Know it's been a minute. We just [opened a new program / got new equipment / have a few spots open in semi-private]. Thought of you. Still thinking about it?"

Template 2 (60 days, final attempt):
"Last time I'll bug you — promise. Just wanted to leave the door open. If the timing ever gets right, we're here. — [Christian], House of Power."

Rules: Keep it short. No apology for reaching out. One question max. Don't rehash the full pitch. Be human.`,
    },
  ],
}
