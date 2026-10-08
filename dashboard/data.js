/* H.A.I.N. dashboard seed data.
 * Mirrors the data model in ARCHITECTURE.md (cases / messages / ledger) and the
 * thresholds in POLICY.md. Timestamps are "minutes ago" so the demo always looks live.
 * To wire real data: replace window.HAIN_DATA with a fetch() to your API, same shape. */
window.HAIN_DATA = {
  hotel: "Harborview Inn · Franchise #0412",

  cases: [
    { id: "C-1042", guest: "Quigley", room: "109", channel: "guest-log", category: "maintenance", urgency: "critical", status: "escalated", ago: 6,
      summary: "Worms in the bathroom, guest requests immediate help",
      messages: [
        { author: "guest", ago: 6, body: "There are worms in the bathroom. This is disgusting, we need someone here now." },
        { author: "agent:triage", ago: 6, body: "Health/safety issue (pests). Classified maintenance / critical per POLICY rule 3. Case opened, @Comms." },
        { author: "agent:comms", ago: 5, body: "Draft: \"Mr. Quigley, I am sorry. Facilities is on the way to room 109 now and we are arranging a different room for you. A manager will follow up personally.\"" },
        { author: "agent:policy", ago: 5, body: "APPROVED. No amount promised (rule 2), specific to the issue (rule 1). Escalating to human manager (rule 3)." },
        { author: "agent:ledger", ago: 4, body: "Proposed comp $150 and room-out-of-service loss $310. Both above $50, waiting for manager." }
      ] },
    { id: "C-1041", guest: "Rivera", room: "214", channel: "guest-log", category: "maintenance", urgency: "medium", status: "in_progress", ago: 38,
      summary: "AC rattling all night, requests a look tomorrow",
      messages: [
        { author: "guest", ago: 38, body: "The AC has been making a loud rattling noise all night. Could someone take a look tomorrow?" },
        { author: "agent:triage", ago: 38, body: "Standard maintenance request, medium. @Comms." },
        { author: "agent:comms", ago: 37, body: "Draft: \"Thank you for letting us know, Ms. Rivera. Maintenance will inspect the AC in room 214 tomorrow morning.\"" },
        { author: "agent:policy", ago: 36, body: "APPROVED. Rules 1, 2, 4, 9 satisfied." }
      ] },
    { id: "C-1040", guest: "Chen", room: "305", channel: "guest-log", category: "billing", urgency: "medium", status: "resolved", ago: 92,
      summary: "Minibar charged twice, $18 duplicate",
      messages: [
        { author: "guest", ago: 92, body: "We were charged twice for the minibar. Please refund the duplicate charge of $18." },
        { author: "agent:triage", ago: 92, body: "Billing dispute, medium. @Comms and @Ledger." },
        { author: "agent:comms", ago: 91, body: "Draft: \"Mr. Chen, you are right, we see the duplicate minibar charge and are reversing it.\"" },
        { author: "agent:policy", ago: 90, body: "APPROVED. Refund is under $50, Policy gate may approve (rule 5)." },
        { author: "agent:ledger", ago: 89, body: "Recorded L-301: refund $18, reason \"duplicate minibar charge\"." }
      ] },
    { id: "C-1039", guest: "Okafor", room: "412", channel: "front-desk", category: "safety", urgency: "critical", status: "awaiting_approval", ago: 14,
      summary: "Door lock failing, guest could not secure the room overnight",
      messages: [
        { author: "guest", ago: 15, body: "My door does not latch properly and I could not lock it last night. I am not comfortable." },
        { author: "agent:triage", ago: 14, body: "Lock failure is a safety issue, always critical (rule 3). @Comms." },
        { author: "agent:comms", ago: 13, body: "Draft: \"Ms. Okafor, I am very sorry. Security and maintenance are heading to 412 now. A manager will contact you about next steps.\"" },
        { author: "agent:policy", ago: 12, body: "APPROVED with human escalation. Comp $120 falls in the $50 to $200 band, manager must approve (rule 6)." },
        { author: "agent:ledger", ago: 11, body: "Pending L-305: comp $120, reason \"lock failure, unsecured room\"." }
      ] },
    { id: "C-1038", guest: "Haddad", room: "118", channel: "guest-log", category: "noise", urgency: "high", status: "in_progress", ago: 52,
      summary: "Loud party in the next room after midnight",
      messages: [
        { author: "guest", ago: 53, body: "Loud party next door, it is past midnight and we have kids trying to sleep." },
        { author: "agent:triage", ago: 52, body: "Noise complaint, high. @Comms." },
        { author: "agent:comms", ago: 51, body: "Draft: \"Mr. Haddad, thank you for telling us. Security is speaking with the neighbouring room right now.\"" },
        { author: "agent:policy", ago: 50, body: "APPROVED. No internal staffing detail disclosed (rule 4)." },
        { author: "agent:ledger", ago: 48, body: "Recorded L-308: comp $40, reason \"noise disruption\"." }
      ] },
    { id: "C-1037", guest: "Lindqvist", room: "601", channel: "email", category: "service", urgency: "low", status: "resolved", ago: 140,
      summary: "Late checkout request, flexible until 2 pm",
      messages: [
        { author: "guest", ago: 141, body: "Is a 2 pm checkout possible? Our flight is in the evening." },
        { author: "agent:triage", ago: 140, body: "Service request, low. @Comms." },
        { author: "agent:comms", ago: 139, body: "Draft: \"Happy to help, Ms. Lindqvist. 2 pm checkout is confirmed for room 601.\"" },
        { author: "agent:policy", ago: 138, body: "APPROVED." }
      ] },
    { id: "C-1036", guest: "Brooks", room: "227", channel: "email", category: "billing", urgency: "high", status: "awaiting_approval", ago: 71,
      summary: "Disputes resort fee, asks for $240 cash refund",
      messages: [
        { author: "guest", ago: 72, body: "I was charged a resort fee for 4 nights but the pool was closed the entire stay. I want $240 back." },
        { author: "agent:triage", ago: 71, body: "Billing dispute, high. Cash refund requested. @Comms and @Ledger." },
        { author: "agent:comms", ago: 70, body: "Draft: \"Mr. Brooks, I understand the frustration. A manager is reviewing the resort fee on your folio and will follow up.\"" },
        { author: "agent:policy", ago: 69, body: "APPROVED reply. Cash refund over $200 needs human approval and a ledger reason (rule 7)." },
        { author: "agent:ledger", ago: 67, body: "Pending L-306: refund $240, reason \"resort fee, amenity unavailable\". Anomaly: single entry over $200." }
      ] },
    { id: "C-1035", guest: "Tanaka", room: "330", channel: "guest-log", category: "maintenance", urgency: "medium", status: "resolved", ago: 190,
      summary: "No hot water in the morning",
      messages: [
        { author: "guest", ago: 191, body: "No hot water this morning in 330." },
        { author: "agent:triage", ago: 190, body: "Maintenance, medium. @Comms." },
        { author: "agent:comms", ago: 189, body: "Draft: \"Mr. Tanaka, sorry about that. Maintenance has restored hot water to your room.\"" },
        { author: "agent:policy", ago: 188, body: "APPROVED." },
        { author: "agent:ledger", ago: 186, body: "Recorded L-302: comp $35, reason \"no hot water\"." }
      ] },
    { id: "C-1034", guest: "Moreau", room: "502", channel: "front-desk", category: "service", urgency: "medium", status: "resolved", ago: 260,
      summary: "Breakfast order never arrived",
      messages: [
        { author: "guest", ago: 261, body: "Our breakfast order from 8 am never arrived." },
        { author: "agent:triage", ago: 260, body: "Service failure, medium. @Comms." },
        { author: "agent:comms", ago: 259, body: "Draft: \"Ms. Moreau, I apologise. We are sending a fresh breakfast to room 502 right away.\"" },
        { author: "agent:policy", ago: 258, body: "APPROVED." },
        { author: "agent:ledger", ago: 256, body: "Recorded L-303: comp $25, reason \"missed room service order\"." }
      ] },
    { id: "C-1033", guest: "Patel", room: "215", channel: "guest-log", category: "safety", urgency: "critical", status: "resolved", ago: 420,
      summary: "Smoke alarm chirping, room relocated",
      messages: [
        { author: "guest", ago: 421, body: "The smoke alarm keeps chirping and will not stop." },
        { author: "agent:triage", ago: 420, body: "Alarm issue is a safety case, critical (rule 3). @Comms." },
        { author: "agent:comms", ago: 419, body: "Draft: \"Mr. Patel, we are moving you to a new room now and facilities will replace the alarm.\"" },
        { author: "agent:policy", ago: 418, body: "APPROVED, escalated to human." },
        { author: "agent:ledger", ago: 415, body: "Recorded L-304: loss $85, reason \"relocation, room out of service\"." }
      ] },
    { id: "C-1032", guest: "Novak", room: "144", channel: "guest-log", category: "noise", urgency: "low", status: "open", ago: 9,
      summary: "Hallway ice machine is loud",
      messages: [
        { author: "guest", ago: 9, body: "The ice machine outside 144 is very loud. Not urgent, just wanted you to know." },
        { author: "agent:triage", ago: 8, body: "Noise, low. @Comms." }
      ] },
    { id: "C-1031", guest: "Silva", room: "410", channel: "email", category: "other", urgency: "low", status: "resolved", ago: 520,
      summary: "Left a phone charger behind",
      messages: [
        { author: "guest", ago: 521, body: "I think I left my charger in room 410." },
        { author: "agent:triage", ago: 520, body: "Lost item, low. @Comms." },
        { author: "agent:comms", ago: 519, body: "Draft: \"Mr. Silva, housekeeping found it. We will post it to you today.\"" },
        { author: "agent:policy", ago: 518, body: "APPROVED." }
      ] }
  ],

  /* status: approved | pending. approved_by: policy-gate (<= $50) or manager. */
  ledger: [
    { id: "L-309", case: "C-1042", type: "loss",   amount: 310, reason: "Room 109 out of service (pest treatment)", approved_by: null,      status: "pending",  ago: 3, flag: "Single entry over $200" },
    { id: "L-307", case: "C-1042", type: "comp",   amount: 150, reason: "Guest relocation and goodwill",           approved_by: null,      status: "pending",  ago: 4 },
    { id: "L-306", case: "C-1036", type: "refund", amount: 240, reason: "Resort fee, amenity unavailable",         approved_by: null,      status: "pending",  ago: 67, flag: "Single entry over $200" },
    { id: "L-305", case: "C-1039", type: "comp",   amount: 120, reason: "Lock failure, unsecured room",            approved_by: null,      status: "pending",  ago: 11 },
    { id: "L-308", case: "C-1038", type: "comp",   amount: 40,  reason: "Noise disruption",                        approved_by: "policy-gate", status: "approved", ago: 48 },
    { id: "L-301", case: "C-1040", type: "refund", amount: 18,  reason: "Duplicate minibar charge",                approved_by: "policy-gate", status: "approved", ago: 89 },
    { id: "L-302", case: "C-1035", type: "comp",   amount: 35,  reason: "No hot water",                            approved_by: "policy-gate", status: "approved", ago: 186 },
    { id: "L-303", case: "C-1034", type: "comp",   amount: 25,  reason: "Missed room service order",               approved_by: "policy-gate", status: "approved", ago: 256 },
    { id: "L-304", case: "C-1033", type: "loss",   amount: 85,  reason: "Relocation, room out of service",         approved_by: "manager", status: "approved", ago: 415 }
  ],

  /* Last 7 days of approved dollars by type, oldest first (today is the last bar). */
  daily: [
    { label: "Thu", refund: 40,  comp: 90,  loss: 0 },
    { label: "Fri", refund: 0,   comp: 130, loss: 120 },
    { label: "Sat", refund: 95,  comp: 60,  loss: 0 },
    { label: "Sun", refund: 30,  comp: 175, loss: 210 },
    { label: "Mon", refund: 0,   comp: 45,  loss: 0 },
    { label: "Tue", refund: 60,  comp: 80,  loss: 55 },
    { label: "Wed", refund: 18,  comp: 100, loss: 85 }
  ],

  agents: [
    { id: "triage", name: "Triage", role: "Classifies urgency and category, opens the case",
      status: "active", task: "Reading C-1032, ice machine noise", model: "gemini-2.5-flash",
      handled: 38, latency: "2.1s", accuracy: 96 },
    { id: "comms", name: "Comms", role: "Drafts replies in the hotel's voice",
      status: "active", task: "Drafting reply for C-1032", model: "gemini-2.5-flash",
      handled: 36, latency: "4.8s", accuracy: 91 },
    { id: "ledger", name: "Ledger", role: "Attaches refunds, comps and losses, flags anomalies",
      status: "waiting", task: "Waiting on manager for L-305, L-306, L-307, L-309", model: "gemini-2.5-flash",
      handled: 14, latency: "3.2s", accuracy: 98 },
    { id: "policy", name: "Policy", role: "Checks every reply and comp against POLICY.md",
      status: "idle", task: "No drafts in queue", model: "gemini-2.5-flash",
      handled: 36, latency: "1.9s", accuracy: 99 }
  ],

  activity: [
    { agent: "triage", case: "C-1032", ago: 8,  text: "Classified as noise / low", kind: "classify" },
    { agent: "ledger", case: "C-1042", ago: 3,  text: "Pending L-309 loss $310, flagged: over $200", kind: "flag" },
    { agent: "ledger", case: "C-1042", ago: 4,  text: "Proposed comp $150 (L-307), needs manager", kind: "escalate" },
    { agent: "policy", case: "C-1042", ago: 5,  text: "APPROVED reply, escalated to human under rule 3", kind: "approve" },
    { agent: "comms",  case: "C-1042", ago: 5,  text: "Drafted reply to Quigley, no amount promised", kind: "draft" },
    { agent: "triage", case: "C-1042", ago: 6,  text: "Classified as maintenance / critical (pests)", kind: "classify" },
    { agent: "ledger", case: "C-1039", ago: 11, text: "Pending L-305 comp $120, rule 6 manager approval", kind: "escalate" },
    { agent: "policy", case: "C-1039", ago: 12, text: "APPROVED reply, comp $120 needs a human", kind: "approve" },
    { agent: "triage", case: "C-1039", ago: 14, text: "Classified as safety / critical (lock failure)", kind: "classify" },
    { agent: "policy", case: "C-1041", ago: 36, text: "APPROVED reply, rules 1, 2, 4, 9 satisfied", kind: "approve" },
    { agent: "ledger", case: "C-1038", ago: 48, text: "Recorded L-308 comp $40", kind: "record" },
    { agent: "policy", case: "C-1038", ago: 69, text: "REJECTED first draft (rule 2: amount mentioned), corrected and approved", kind: "reject" },
    { agent: "ledger", case: "C-1036", ago: 67, text: "Pending L-306 refund $240, flagged: over $200", kind: "flag" },
    { agent: "ledger", case: "C-1040", ago: 89, text: "Recorded L-301 refund $18", kind: "record" }
  ]
};
