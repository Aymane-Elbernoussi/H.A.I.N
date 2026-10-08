# H.A.I.N. — All-in-one AI-native ops platform for franchised hotels

## The problem

Hilton, Marriott and other top Hotels are starting to run unified, all in one platforms for their front line employees.Smaller hotels don't have this luxury: PMS data, guest logs, and payment/refund records live in
separate silos. Nobody can answer "how much did we lose this week, on what,
and why?" Refunds, comp decisions are inconsistent, guest issues get
lost between channels.

## The product

One data layer + a team of AI agents that run daily hotel ops:

- **Unified case ledger** — every guest issue becomes a case: messages,
  category, urgency, status, plus every dollar attached (refund, comp, loss).
- **Agent triage & response** — guest messages classified, replies drafted in
  brand voice, policy-checked before anything goes out.
- **Loss tracking** — the ledger aggregates refunds/comps/losses per case,
  per day, per category. Anomalies get flagged.

## The agent team (4 agents, live)

| Agent | Role | BAND handle |
|---|---|---|
| Triage | Ingests guest messages, classifies urgency + category, opens a case | `aymane.elber/h-a-i-n-triage` |
| Comms | Drafts the guest reply in the hotel's voice, using case context | `aymane.elber/h-a-i-n-comms` |
| Ledger | Attaches dollar amounts (refund/comp/loss) to cases, flags anomalies | `aymane.elber/h-a-i-n-ledger` |
| Policy gate | Every outbound reply checked against POLICY.md before it ships | `aymane.elber/h-a-i-n-policy` |

All four run on **Gemini 3.8 Flash**. A human (the manager) approves
critical-urgency and above-threshold comp decisions. Everything else runs
autonomously.

## How the tools fit (as built)

- **BAND** — the collaboration layer. All four agents registered via the
  Human API, sharing one room with the human owner. Agents @mention each
  other (Triage → Comms → Policy → human). A poll worker
  (`agents/poll_worker.py`) drives the agents through BAND's REST API
  (the sandbox network blocks BAND's WebSocket, so REST polling with
  exponential backoff instead). The room is the audit trail.
- **Gemini** — the brains. Every agent turn and every RocketRide LLM node
  runs on Gemini. One key powers the whole system.
- **RocketRide** — the pipelines, as portable `.pipe` JSON:
  `pipelines/guest-intake.pipe` (ingest → classify → draft → policy-check →
  approve → post) and `pipelines/loss-report.pipe` (aggregate → flag
  anomalies → report). LLM nodes use the `llm_gemini` provider; both validate
  and run on RocketRide Cloud.
- **Kylon** — the team workspace. CLI authenticated to the workspace;
  `hain-hotel-ops` room is mission control. BAND is where agents collaborate,
  Kylon is where the human team coordinates.
- **AdaL** — build & execute. Built the web dashboard (`dashboard/`:
  cases feed, ledger, agent activity).
- **Prelint** — the decision layer. Connected to this repo with docs tracked.
  Reviews every PR against the spec files (`ARCHITECTURE.md`, `POLICY.md`,
  `README.md`). The Policy agent gates guest replies; Prelint gates code.

## Data model

- `cases`: id, guest, room, channel, category, urgency, status, created_at
- `messages`: case_id, author (guest/agent/human), body, ts
- `ledger`: case_id, type (refund/comp/loss), amount, reason, approved_by, ts
- `POLICY.md`: versioned hotel policy spec (Prelint reads this)

## Demo script (judges)

1. Guest message arrives in the BAND room (fictional demo cases in `demo/`).
2. Triage classifies: category + urgency → case opened, @mentions Comms.
3. Comms drafts the reply; Policy gate checks it against POLICY.md.
4. Ledger attaches any comp/refund; above threshold → pings the human.
5. Human approves → reply posts, ledger updates.

34 cases processed live through this loop. Show the BAND room: agents
@mentioning each other, Policy rejecting a bad draft, the audit trail.
That is the whole pitch in 90 seconds.

## Repo layout

```
README.md            pitch + setup
ARCHITECTURE.md      this file
POLICY.md            hotel policy spec (Prelint reads this)
.env.example         required keys
agents/              poll_worker.py (runs all 4 agents), band_agents.py
pipelines/           RocketRide .pipe JSON (guest-intake, loss-report)
dashboard/           AdaL-built web dashboard (cases, ledger, agents)
demo/                fictional sample guest messages
```

## Phase 2 direction

Real PMS/payment integrations, more agents (Research, GTM, Sales), user
testing with a franchised location, investor pitch.
