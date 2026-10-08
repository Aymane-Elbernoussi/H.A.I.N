# H.A.I.N.

All-in-one AI-native ops platform for franchised hotels — one data layer and
a team of AI agents running guest-issue triage, policy-checked replies, and
loss/refund tracking. Built for the Crewbase Collective "Zero Human startup"
hackathon (SF Tech Week 2026).

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design and
[POLICY.md](POLICY.md) for the hotel policy spec the agents enforce.

## Stack

- **AdaL** — build & execute (agent harness / CLI)
- **Kylon** — AI agent team workspace
- **BAND** — agent communication & collaboration (rooms, @mentions)
- **Rocket Ride** — agentic workflow automation (`.pipe` pipelines)
- **Prelint** — decision layer (spec checks on PRs and agent outputs)

## Setup

1. Copy `.env.example` to `.env` and fill in keys.
2. Create the four BAND agents at https://app.band.ai (Triage, Comms,
   Ledger, Policy) and paste each UUID + API key into `.env`.
3. Install Prelint on this repo at https://prelint.com.
4. Import `pipelines/*.pipe` into Rocket Ride.

## Demo

Feed a message from `demo/messages.json` through the intake pipeline and
watch the BAND room: triage → draft → policy check → approval → post.
