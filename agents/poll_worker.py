"""H.A.I.N. polling worker — runs all 4 BAND agents via REST polling.

The VM's egress proxy blocks WebSocket upgrades, so the BAND SDK's realtime
mode can't connect. This worker polls GET /messages/next per agent instead,
runs each turn through Gemini, and posts replies with @mentions via REST.
Same room, same routing, same audit trail — just poll-based delivery.

Usage:
    set -a; source .env; set +a
    python agents/poll_worker.py
"""
from __future__ import annotations

import json
import os
import time
import urllib.request
import urllib.error

BASE = "https://app.band.ai/api/v1/agent"
ROOM = os.environ["BAND_ROOM_ID"]
GEMINI_KEY = os.environ["GEMINI_API_KEY"]
GEMINI_MODEL = os.getenv("HAIN_GEMINI_MODEL", "gemini-3.8-flash")

AGENTS = {
    "triage": {
        "id": os.environ["TRIAGE_AGENT_ID"],
        "key": os.environ["TRIAGE_API_KEY"],
        "handle": "aymane.elber/h-a-i-n-triage",
        "name": "H.A.I.N. Triage",
    },
    "comms": {
        "id": os.environ["COMMS_AGENT_ID"],
        "key": os.environ["COMMS_API_KEY"],
        "handle": "aymane.elber/h-a-i-n-comms",
        "name": "H.A.I.N. Comms",
    },
    "ledger": {
        "id": os.environ["LEDGER_AGENT_ID"],
        "key": os.environ["LEDGER_API_KEY"],
        "handle": "aymane.elber/h-a-i-n-ledger",
        "name": "H.A.I.N. Ledger",
    },
    "policy": {
        "id": os.environ["POLICY_AGENT_ID"],
        "key": os.environ["POLICY_API_KEY"],
        "handle": "aymane.elber/h-a-i-n-policy",
        "name": "H.A.I.N. Policy",
    },
    "human": {
        "id": "911232ac-9321-4a27-9fc3-68b7970a94e4",
        "key": os.environ["BAND_USER_KEY"],
        "handle": "aymane.elber",
        "name": "Aymane El Bernoussi",
    },
}

# Who each agent @mentions next in the workflow
NEXT = {
    "triage": ["comms"],
    "comms": ["policy"],
    "policy": ["human"],  # policy escalates to the human manager for approval
    "ledger": ["human"],
}

SYSTEM_PROMPTS = {
    "triage": (
        "You are the Triage agent for H.A.I.N., an AI-native hotel ops platform. "
        "A guest message just arrived. Classify it and reply with a case summary. "
        "Format: CASE: guest=<name>, room=<room>, category=<maintenance|billing|noise|service|safety|other>, "
        "urgency=<low|medium|high|critical>, summary=<one line>. "
        "Health/safety issues (pests, mold, alarms, lock failures) are ALWAYS critical. "
        "Keep it short — the room sees your message."
    ),
    "comms": (
        "You are the Comms agent for H.A.I.N.. The Triage agent sent you a case. "
        "Draft the guest reply: warm and direct, no corporate jargon, no emojis. "
        "Acknowledge the specific issue, state the action being taken. "
        "NEVER promise a compensation amount. Reply with just the draft, prefixed with DRAFT:."
    ),
    "ledger": (
        "You are the Ledger agent for H.A.I.N.. A case resolved with a financial impact. "
        "Record it as: LEDGER: case=<id>, type=<refund|comp|loss>, amount=<$>, reason=<text>. "
        "Flag anomalies: single entries over $200, entries missing a reason."
    ),
    "policy": (
        "You are the Policy gate for H.A.I.N.. The Comms agent sent a draft reply. "
        "Check it: (1) professional, empathetic, specific; (2) no compensation amounts promised; "
        "(3) health/safety escalates to human; (4) no internal ops details; (5) warm direct tone, no emojis. "
        "Reply APPROVED or REJECTED: <rule numbers> + corrected draft if rejected."
    ),
}


UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def api(agent_key: str, method: str, path: str, body: dict | None = None) -> dict | None:
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode() if body else None,
        method=method,
        headers={"X-API-Key": agent_key, "Content-Type": "application/json", **UA},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            if r.status == 204:
                return None
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 204:
            return None
        print(f"  API {method} {path} -> HTTP {e.code}: {e.read()[:200]}")
        return None


def gemini(prompt: str, system: str) -> str:
    body = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 500, "temperature": 0.4},
    }
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.load(r)
    return d["candidates"][0]["content"]["parts"][0]["text"].strip()


def next_message(agent: dict) -> dict | None:
    d = api(agent["key"], "GET", f"/chats/{ROOM}/messages/next")
    if not d:
        return None
    return d.get("data")


def mentions_me(msg: dict, agent: dict) -> bool:
    mentions = msg.get("mentions") or msg.get("metadata", {}).get("mentions") or []
    return any(m.get("id") == agent["id"] for m in mentions)


def send(agent: dict, content: str, mention_roles: list[str]) -> None:
    mentions = [
        {"id": AGENTS[r]["id"], "name": AGENTS[r]["name"], "handle": AGENTS[r]["handle"]}
        for r in mention_roles
    ]
    api(agent["key"], "POST", f"/chats/{ROOM}/messages",
        {"message": {"content": content, "mentions": mentions}})


def process(role: str, msg: dict) -> None:
    agent = AGENTS[role]
    msg_id = msg["id"]
    content = msg.get("content", "")
    print(f"[{role}] got message: {content[:80]}...")
    api(agent["key"], "POST", f"/chats/{ROOM}/messages/{msg_id}/processing")
    try:
        reply = gemini(f"Incoming message:\n{content}", SYSTEM_PROMPTS[role])
        mention_roles = NEXT[role]
        mention_text = " ".join(f"@{AGENTS[r]['handle']}" for r in mention_roles)
        full = f"{reply}\n{mention_text}" if mention_text else reply
        send(agent, full, mention_roles)
        print(f"[{role}] replied ({len(reply)} chars)")
        api(agent["key"], "POST", f"/chats/{ROOM}/messages/{msg_id}/processed")
    except Exception as e:
        print(f"[{role}] FAILED: {e}")
        api(agent["key"], "POST", f"/chats/{ROOM}/messages/{msg_id}/failed",
            {"error": str(e)[:200]})


def main() -> None:
    print(f"Poll worker up — room {ROOM[:8]}..., 4 agents, model {GEMINI_MODEL}")
    poll_roles = [r for r in AGENTS if r != "human"]
    while True:
        for role in poll_roles:
            agent = AGENTS[role]
            try:
                msg = next_message(agent)
                if msg and mentions_me(msg, agent):
                    process(role, msg)
                elif msg:
                    # Not for us; leave it for the mentioned agent
                    pass
            except Exception as e:
                print(f"[{role}] poll error: {e}")
        time.sleep(5)


if __name__ == "__main__":
    main()
