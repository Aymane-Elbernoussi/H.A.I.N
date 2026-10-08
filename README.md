# H.A.I.N.

All-in-one AI-native ops platform for franchised hotels — one data layer and
a team of AI agents running guest-issue triage, policy-checked replies, and
loss/refund tracking. Built for the Crewbase Collective "Zero Human startup"
hackathon (SF Tech Week 2026).

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design and
[POLICY.md](POLICY.md) for the hotel policy spec the agents enforce.

## Stack

- **BAND** — agent communication & collaboration. 4 agents (Triage, Comms, Ledger, Policy) live in one room, routing work via @mentions.
- **Gemini 3.8 Flash** — the LLM behind all four agents and the RocketRide pipelines.
- **RocketRide** — agentic workflow automation. `pipelines/guest-intake.pipe` and `pipelines/loss-report.pipe` run on RocketRide Cloud.
- **Kylon** — team workspace. CLI authenticated; `hain-hotel-ops` room is mission control for the human crew.
- **AdaL** — build & execute. Built the web dashboard (`dashboard/`).
- **Prelint** — decision layer. Connected to this repo; reviews PRs against the spec files.

## How it works

1. Guest message lands in the BAND room.
2. **Triage** classifies it (category + urgency), opens a case, @mentions Comms.
3. **Comms** drafts the guest reply (warm, direct, never promises comp), @mentions Policy.
4. **Policy** checks the draft against POLICY.md — APPROVED or REJECTED with corrections. Critical issues and comps over $50 escalate to the human.
5. **Ledger** attaches every dollar (refund/comp/loss) to the case and flags anomalies.

The room is the audit trail. A poll worker (`agents/poll_worker.py`) keeps the agents running via BAND's REST API.

## Setup

1. Copy `.env.example` to `.env` and fill in keys (BAND agent UUIDs + API keys, `GEMINI_API_KEY`).
2. Register the four BAND agents via the Human API and add them to a room (see ARCHITECTURE.md).
3. `pip install "band-sdk[gemini]"` and run `python agents/poll_worker.py` (one process runs all four agents).
4. Import `pipelines/*.pipe` into RocketRide; set `ROCKETRIDE_GEMINI_KEY` on your account.
5. Install the Kylon CLI (`curl -fsSL https://api.kylon.io/install.sh | sh`) and authorize it.
6. Install Prelint on this repo at https://prelint.com.

## Demo

34 guest cases have been processed through the live BAND room — triage → draft → policy check → approval. Open `dashboard/index.html` for the ops view. Feed a new message from `demo/messages.json` through the intake pipeline and watch the room.
