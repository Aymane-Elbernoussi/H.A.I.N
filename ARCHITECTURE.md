# InnSight — All-in-one AI-native ops platform for franchised hotels

Working name. Changeable.

## The problem

Hilton and Marriott run unified, data-rich operating stacks. Franchised
locations don't: PMS data, guest logs, and payment/refund records live in
separate silos. Nobody can answer "how much did we lose this week, on what,
and why?" Refunds leak, comp decisions are inconsistent, guest issues get
lost between channels.

## The product

One data layer + a team of AI agents that run daily hotel ops:

- **Unified case ledger** — every guest issue becomes a case: messages,
  category, urgency, status, plus every dollar attached (refund, comp, loss).
- **Agent triage & response** — guest messages classified, replies drafted in
  brand voice, policy-checked before anything goes out.
- **Loss tracking** — the ledger aggregates refunds/comps/losses per case,
  per day, per category. Anomalies get flagged.

## The agent team (Phase 1: 4 agents)

| Agent | Role |
|---|---|
| Triage | Ingests guest messages, classifies urgency (low/med/high/critical) + category (maintenance, billing, noise, service...), opens a case |
| Comms | Drafts the guest reply in the hotel's voice, using case context |
| Ledger | Attaches dollar amounts (refund/comp/loss) to cases, flags anomalies, builds the daily loss report |
| Policy gate | Every outbound reply and every comp decision checked against POLICY.md before it ships |

A human (the manager) approves critical-urgency and above-threshold comp
decisions. Everything else runs autonomously.

## How the five sponsor tools fit

- **BAND** — the collaboration layer. One BAND room per case. Agents
  @mention each other (Triage → Comms → Policy gate), post structured
  context, and the human joins the room to approve or override. Python SDK
  (`band-sdk`), one UUID + API key per agent.
- **Kylon** — the workspace. Rooms hold the unified records (guest log,
  loss ledger). Workflows trigger on new cases; 3,000+ integrations available
  for real PMS/payment data in Phase 2.
- **Rocket Ride** — the pipelines, as portable `.pipe` JSON:
  `pipelines/guest-intake.pipe` (ingest → classify → draft → policy-check →
  approve → post) and `pipelines/loss-report.pipe` (aggregate → flag
  anomalies → report). Submitted to Discord #showcase with the GitHub link.
- **AdaL** — build & execute. The CLI harness scaffolds the agents, runs the
  code, and carries changes from direction to tested PR.
- **Prelint** — the decision layer. `POLICY.md` is the product spec. Prelint
  reviews every PR and every agent-proposed guest reply against it:
  "should this go out?" Approve / correct / replace.

## Data model

- `cases`: id, guest, room, channel, category, urgency, status, created_at
- `messages`: case_id, author (guest/agent/human), body, ts
- `ledger`: case_id, type (refund/comp/loss), amount, reason, approved_by, ts
- `POLICY.md`: versioned hotel policy spec (Prelint reads this)

## Demo script (judges)

1. Guest message arrives: "worms in room 109" (real log example).
2. Triage classifies: maintenance / critical → case opened in BAND room.
3. Comms drafts the reply; Policy gate checks it against POLICY.md.
4. Ledger attaches a comp; above threshold → pings the human in the room.
5. Human approves → reply posts, ledger updates, loss report reflects it.

Show the BAND room live: agents @mentioning each other, the audit trail,
the human approval. That is the whole pitch in 90 seconds.

## Repo layout

```
README.md            pitch + setup
ARCHITECTURE.md      this file
POLICY.md            hotel policy spec (Prelint reads it)
.env.example         required keys
agents/              BAND agent configs (triage, comms, ledger, policy)
pipelines/           RocketRide .pipe JSON (guest-intake, loss-report)
demo/                sample guest messages + expected flows
```

## Phase 2 direction

Real PMS/payment integrations via Kylon, more than 5 agents (add Research,
GTM, Sales per the brief), user testing with a franchised location, investor
pitch.
