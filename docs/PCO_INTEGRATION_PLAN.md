# Planning Center Online (PCO) Integration Plan

**The Good Life × Planning Center**
*Prepared for Movement Church Leadership*

---

## What Is This?

The Good Life is a spiritual growth app built around the Five Capitals framework (Spiritual, Relational, Physical, Intellectual, Financial). It helps people track daily investments, reflect on growth, and stay accountable through partners.

This document outlines how we can connect The Good Life to **Planning Center Online** — the platform Movement Church already uses — to unlock deeper community features and reduce friction for members.

---

## Why Integrate?

Right now, The Good Life works standalone. Users sign up individually and can only find accountability partners who have already created an account. By connecting to PCO, we can:

- Let members **find anyone in the church directory** as a potential accountability partner — no separate sign-up required
- **Auto-invite** people using contact info already in PCO
- Pull **small group rosters** so life groups can use the app together from day one
- Optionally reflect **real church engagement** (attendance, giving) as capital investments — automatically

The goal: **lower the barrier from "download the app and hope your friend did too" to "open the app and find your whole small group ready to go."**

---

## Integration Tiers

### Tier 1 — People Search (Recommended Starting Point)

**What it does:** When a user searches for an accountability partner, results include people from the PCO church directory — not just existing app users.

**User experience:**
1. User goes to Settings → Accountability Partners → Search
2. Types a name (e.g., "Sarah")
3. Sees results from both the app's user base AND the PCO directory
4. Taps "Invite" on a PCO contact → that person receives an email/text invitation to join The Good Life

**What PCO provides:**
- Name, email, phone, profile photo from the People module
- We only read data — we never write to or modify PCO records

**Effort:** 1–2 weeks of development
**PCO Module Required:** People (✅ included in all PCO plans)

---

### Tier 2 — Small Group Sync

**What it does:** Import life group / small group rosters from PCO Groups so members can see their group in the app automatically.

**User experience:**
1. User signs in with their church email
2. App recognizes they're in the "Tuesday Night Men's Group"
3. Their group members appear as suggested accountability partners
4. Optional: group leader sees an aggregated view of the group's engagement (anonymous ratings, no individual data unless shared)

**What PCO provides:**
- Group names, membership rosters, leader assignments
- Group types and tags for filtering

**Effort:** 2–3 weeks of development
**PCO Module Required:** Groups

---

### Tier 3 — Attendance as Investment

**What it does:** When a member checks in at a Sunday service or midweek event via PCO Check-ins, it automatically logs as a Spiritual Capital or Relational Capital investment in The Good Life.

**User experience:**
1. Member checks in at church (via PCO as usual)
2. Opens The Good Life later → sees "Sunday Worship" already logged under Spiritual Capital
3. No double-entry — it just shows up

**What PCO provides:**
- Check-in events and attendance records
- Event types (Sunday service, small group, volunteer, etc.)

**Privacy:** Only the user's own check-in data; requires their explicit opt-in.

**Effort:** 2–3 weeks of development
**PCO Module Required:** Check-ins

---

### Tier 4 — Giving Reflection (Optional / Sensitive)

**What it does:** With explicit user opt-in, reflects giving activity as Financial Capital engagement. Never shows dollar amounts — only that the user gave that week.

**User experience:**
1. User opts in via Settings → "Connect Giving"
2. App shows a simple "✓ Gave this week" badge under Financial Capital
3. No amounts, no history — just yes/no engagement signal

**Privacy:** This is the most sensitive integration. We'd recommend requiring double opt-in and never storing amounts.

**Effort:** 1–2 weeks of development
**PCO Module Required:** Giving

---

## Technical Summary (For the Tech-Curious)

| Question | Answer |
|---|---|
| **Is there a cost for the PCO API?** | No. API access is free with your existing PCO subscription. |
| **Do we need PCO's permission?** | No special approval. Any PCO admin can generate API credentials at planningcenter.com/developers. |
| **Is member data safe?** | We only read from PCO — never write. Data stays within your church's control. We use HTTPS encryption and only pull what's needed for each search. |
| **What authentication method?** | OAuth 2.0 — each user authorizes their own access. The app never stores PCO passwords. |
| **Where does the data live?** | The Good Life runs on encrypted cloud servers (Railway + Vercel). No PCO data is permanently stored — it's fetched in real-time when needed. |
| **Can we control who has access?** | Yes. We can restrict PCO integration to specific user roles, groups, or require admin approval. |

---

## Recommended Rollout

| Phase | What | When |
|---|---|---|
| **Now** | Launch The Good Life as a PWA to the congregation (no PCO needed) | Ready today |
| **Phase 1** | Add PCO People Search for accountability partner discovery | After beta feedback, ~2 weeks of dev |
| **Phase 2** | Add Small Group Sync for automatic group connections | After Phase 1 is stable |
| **Phase 3** | Attendance integration (if congregation finds it valuable) | Based on feedback |
| **Phase 4** | Giving reflection (only if leadership decides it's appropriate) | Optional |

---

## What We Need From Church Leadership

1. **A PCO admin** willing to generate API credentials (5-minute task)
2. **Decision on scope** — which tiers feel right for Movement Church?
3. **Privacy posture** — how much PCO data should the app be able to see? (We can restrict to specific campuses, groups, or tags)
4. **Feedback from beta** — let's get the app in people's hands first, then build integrations based on what they actually ask for

---

## Questions?

This integration is designed to meet the congregation where they already are — in Planning Center. It's not about adding complexity; it's about removing the friction between wanting to grow and actually doing it together.

*"Invest / Grow / Align — together."*
