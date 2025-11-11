Awesome—here are the PRD add-ons you asked for. No code. Just copy you can slot in now.

---

# 26) Results Page Copy — “Money Slide”

Use one variant by default. Keep the others for A/B tests. Numbers are dynamic from the scoring engine.

## Variant A — Direct ROI (default)

**Headline:**
“Unlock ${{COI_total}}/month hidden in plain sight.”

**Subhead:**
“You’re leaving money on the table through {{top_waster}} and manual work.”

**Impact Row (bullets):**

* **AI Maturity:** Level {{maturity_level}}
* **Top Quick Win:** {{quick_win_name}} ({{quick_win_type}})
* **Projected Payback:** {{payback_months}} months

**Proof line:**
“Cut {{hours_saved_per_week}} hrs/week with today’s off-the-shelf tools.”

**CTA button options (pick one):**

* “Book the Quick Strike Audit”
* “Claim Your Quick Win Session”
* “Start in 30 Days or Less”

**Micro-copy under CTA:**
“$1,500 fixed fee. Money-back if we can’t prove the win.”

---

## Variant B — Ops Efficiency (construction-tilted)

**Headline:**
“Remove {{top_waster}} and keep crews moving.”

**Subhead:**
“Save {{hours_saved_per_week}} hrs/week across office + field.”

**Impact Row:**

* **COI Today:** ${{COI_total}}/mo
* **Quick Win:** {{quick_win_name}} ({{quick_win_type}})
* **Examples:** RFIs, change orders, invoicing, compliance packs

**Proof line:**
“Most teams go live in under 30 days.”

**CTA options:**

* “Fix the Bottleneck”
* “Book Your Quick Strike”
* “See the 30-Day Plan”

**Assurance:**
“Keep your stack. We integrate with {{tool_list_top2}}.”

---

## Variant C — Growth (revenue-tilted)

**Headline:**
“Convert more quotes with the same team.”

**Subhead:**
“Speed up follow-ups and prioritization. No headcount.”

**Impact Row:**

* **AI Maturity:** Level {{maturity_level}}
* **COI (lost revenue):** ${{COI_rev}}/mo
* **Top Quick Win:** {{quick_win_name}} → +{{projected_gain_pct}}% close rate

**Proof line:**
“Typical payback: {{payback_months}} months.”

**CTA options:**

* “Boost Conversion Now”
* “Book the Quick Strike”
* “See Your 30-Day Lift”

**Assurance:**
“Cancel anytime. Your data stays yours.”

---

## Money Slide Layout Notes

* Above the fold: headline, COI, top quick win, one CTA.
* One supporting chart or icon row. No clutter.
* Confidence band if financials were estimated.
* Add trust badges: Stripe, Cal.com, privacy note.

---

# 27) Email Templates (MVP)

Personalize with tokens. Keep subject lines tight. Plain-language tone.

## 27.1 Completion + Summary (sent immediately)

**Subject:** Your AI Quick Wins + next step
**Preview:** Fast path to reclaim ${{COI_total}}/mo

**Body:**
Hi {{first_name}},
Thanks for completing the intake. Here’s your quick snapshot:

* **AI Maturity:** Level {{maturity_level}}
* **Top Quick Win:** {{quick_win_name}} ({{quick_win_type}})
* **Estimated COI:** ${{COI_total}}/month
* **Payback window:** ~{{payback_months}} months

We can turn this into a 30-day plan in a focused **Quick Strike Audit**.

**Button:** Book the Quick Strike Audit
Alt link: {{booking_link}}

Reply if you’d like us to tailor the session to {{industry}} specifics (e.g., RFIs, change orders, invoicing).
— {{agency_name}}

**PS:** Money-back if we can’t prove the win.

---

## 27.2 High-COI Priority Alert (trigger: COI_total >= threshold OR maturity 0–1)

**Subject:** You’re carrying ${{COI_total}}/mo in avoidable work
**Preview:** A 90-min session can remove the bottleneck

**Body:**
Hi {{first_name}},
Your intake shows a meaningful opportunity:

* **Bottleneck:** {{top_waster}}
* **Impact:** ${{COI_total}}/month
* **Fastest win:** {{quick_win_name}} ({{quick_win_type}})

We recommend the **Quick Strike Audit** to finalize the rollout plan and ROI. Most teams go live in <30 days.

**Button:** Book your Quick Strike
Alt link: {{booking_link}}

Want us to share a sample before/after from your segment? Just reply “example.”
— {{agency_name}}

---

## 27.3 Results Viewed, No Booking (send 24–48h later)

**Subject:** Still want the 30-day plan?
**Preview:** Your quick win is still on the table

**Body:**
Hi {{first_name}},
You viewed your results but didn’t book the session.

* **Quick Win:** {{quick_win_name}}
* **COI today:** ${{COI_total}}/mo

If timing is the issue, pick a later slot or reply with “call” for a 15-min fit check.

**Button:** See times
Alt link: {{booking_link}}
— {{agency_name}}

---

## 27.4 Payment Confirmation + Calendar Invite (post-checkout)

**Subject:** You’re booked — Quick Strike Audit
**Preview:** Calendar invite inside

**Body:**
Hi {{first_name}},
Thanks for booking. You’re confirmed for **{{date_time}}**.

**Agenda (90 min):**

1. Current process + constraints
2. Quick win deep dive
3. 30-day plan + ROI
4. Decision + next steps

**What we’ll need (before call):**

* Tool access or sample exports ({{tool_list_top2}})
* 2–3 recent examples of {{top_waster}}
* Rough hours and error rates

Invite attached. Need to reschedule? Use this link: {{reschedule_link}}.
— {{consultant_name}}, {{agency_name}}

---

## 27.5 Pre-Audit Prep Checklist (send 24h before)

**Subject:** Tomorrow’s session — quick prep checklist
**Preview:** 10-minute prep = better outcomes

**Body:**
Hi {{first_name}},
To maximize the session:

* Confirm access to {{tools_needed}}
* Share one recent invoice/report/RFI packet
* Note any seasonal volume swings
* Identify your success measure (time, cost, or revenue)

See you at **{{date_time}}**.
— {{consultant_name}}

---

## 27.6 Post-Audit Summary + Offer (send same day)

**Subject:** Your 30-day plan + ROI
**Preview:** Green-light when ready

**Body:**
Hi {{first_name}},
Thanks for today. Highlights:

* **Quick Win:** {{quick_win_name}}
* **Projected savings:** ${{projected_monthly_savings}}/mo
* **Payback:** ~{{payback_months}} months
* **Plan:** {{three_steps}} (week-by-week)

Two options from here:

1. **Implement now** with our team.
2. Join **Monthly Workshops** for ongoing enablement and templates.

**Buttons:**

* “Kick off implementation”
* “Join the Workshops”

We’ll hold this slot in our schedule for {{hold_days}} days.
— {{agency_name}}

---

## 27.7 Workshop Welcome (MRR, sent on signup)

**Subject:** Welcome to the Monthly Workshops
**Preview:** First session + resources

**Body:**
Hi {{first_name}},
Welcome aboard. You now have:

* Monthly live workshop + Q&A
* Implementation templates and checklists
* Office hours for blockers

**Next session:** {{session_date}}
**Workspace:** {{portal_link}}
Bring your top question and one data sample.
— {{agency_name}}

---

## 27.8 30-Day Re-engagement (no booking)

**Subject:** Want to revisit your AI quick win?
**Preview:** Your estimate: ${{COI_total}}/mo

**Body:**
Hi {{first_name}},
Checking in. Your opportunity remains:

* **Quick Win:** {{quick_win_name}}
* **COI:** ${{COI_total}}/mo

If now’s better timing, grab a slot here: {{booking_link}}.
Prefer a short call? Reply “call” and we’ll coordinate.
— {{agency_name}}

---

## 27.9 Tone and Personalization Notes

* Use “you” and “we.” Short sentences.
* Mirror the user’s goal: time, cost, or revenue.
* Add 1 proof line. No hype.
* For construction, name concrete workflows: RFIs, submittals, change orders, timecards, invoicing, safety docs.
* Avoid jargon. Offer one clear action.

---

### Want me to draft the in-product **empty states** and **error messages** next? Or tailor the Money Slide copy to three construction sub-segments (GC, sub, specialty)?
