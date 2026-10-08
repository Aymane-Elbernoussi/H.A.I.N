"""InnSight BAND agents — run one per process.

Setup (per band-sdk-python quickstart):
    pip install "band-sdk[langgraph]"
    # Sign in at https://app.band.ai, create 4 remote agents
    # (Triage, Comms, Ledger, Policy), export each UUID + API key:
    export TRIAGE_AGENT_ID=... TRIAGE_API_KEY=...
    export COMMS_AGENT_ID=...  COMMS_API_KEY=...
    export LEDGER_AGENT_ID=... LEDGER_API_KEY=...
    export POLICY_AGENT_ID=... POLICY_API_KEY=...
    export OPENAI_API_KEY=...

    python agents/triage_agent.py   # each file runs its own agent

Agents collaborate in a BAND room: Triage opens a case and @mentions Comms,
Comms drafts and @mentions Policy, Policy approves/rejects, Ledger attaches
dollar amounts. The human manager joins the room for critical/high-value
approvals. The room is the audit trail.
"""
from __future__ import annotations

import asyncio
import os

from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver

from band import Agent, configure_logging
from band.adapters import LangGraphAdapter

configure_logging()

SYSTEM_PROMPTS = {
    "triage": (
        "You are the Triage agent for InnSight, an AI-native ops platform for "
        "franchised hotels. When a guest message arrives in the room, classify it "
        "and post a case as JSON: guest, room, category "
        "(maintenance/billing/noise/service/safety/other), urgency "
        "(low/medium/high/critical), summary (one line). Health/safety issues "
        "(pests, mold, alarms, lock failures) are ALWAYS critical. Then @mention "
        "the Comms agent with the case."
    ),
    "comms": (
        "You are the Comms agent for InnSight. When the Triage agent @mentions you "
        "with a case, draft the guest reply: warm and direct, no corporate jargon, "
        "no emojis. Acknowledge the specific issue, state the action being taken. "
        "NEVER promise a compensation amount. Post the draft and @mention the "
        "Policy agent for review."
    ),
    "ledger": (
        "You are the Ledger agent for InnSight. When a case resolves with a "
        "refund, comp, or loss, record it: case_id, type (refund/comp/loss), "
        "amount, reason, approved_by. Every entry must attach to a case with a "
        "reason — no orphans. Flag anomalies: single entries over $200, category "
        "totals 2x the 7-day average, entries missing a reason."
    ),
    "policy": (
        "You are the Policy gate for InnSight. When the Comms agent @mentions you "
        "with a draft reply, check it against hotel policy: (1) professional, "
        "empathetic, specific to the issue; (2) no compensation amounts promised; "
        "(3) health/safety issues escalate to a human immediately; (4) no "
        "internal operations details; (5) warm direct tone, no emojis. Reply "
        "APPROVED or REJECTED with the violated rule numbers and a corrected "
        "draft. Comps $50-$200 and anything above need a human in the room."
    ),
}


def make_agent(role: str) -> Agent:
    prefix = role.upper()
    adapter = LangGraphAdapter(
        llm=ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            system_prompt=SYSTEM_PROMPTS[role],
        ),
        checkpointer=InMemorySaver(),
    )
    return Agent.create(
        adapter=adapter,
        agent_id=os.environ[f"{prefix}_AGENT_ID"],
        api_key=os.environ[f"{prefix}_API_KEY"],
    )


async def main() -> None:
    role = os.environ.get("INNSIGHT_ROLE", "triage")
    agent = make_agent(role)
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
