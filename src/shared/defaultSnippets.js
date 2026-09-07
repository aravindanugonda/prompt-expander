const now = new Date().toISOString();

// A small, deliberately teachable starter set: every dynamic token and the
// typed-input form show up at least once, plus a few combinations. Each body
// ends with ${cursor} so the caret always lands in one obvious place, and
// fill-ins are ${input:...} (collected in a single form) rather than
// bracketed text buried in the body.
//
// The original 70+ snippets now live in packs/prompt-library.json and can be
// installed from the Help tab.
export const DEFAULT_SNIPPETS = [
  {
    id: "starter-ask",
    title: "Ask (high-signal answer)",
    trigger: ">_ask",
    description: "Everyday answer with assumptions + a recommendation. Shows ${input:...}.",
    body:
      "Give your best, most rigorous answer to the following. State the key assumptions, call out the important trade-offs, and end with a clear recommendation. No filler.\n\nQuestion:\n${input:question}\n\n${cursor}",
    inputs: [
      { name: "question", label: "Your question", type: "textarea", options: [], default: "" }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-tldr",
    title: "TL;DR",
    trigger: ">_tldr",
    description: "Simplest possible snippet — plain text, no tokens.",
    body: "Give me the TL;DR: 3 bullets, no preamble, no restating the question.\n\n${cursor}",
    inputs: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-review-code",
    title: "Review Code",
    trigger: ">_review-code",
    description: "Dropdown + text + multi-line inputs, collected in one form.",
    body:
      "Review the following ${input:language} code for ${input:focus}.\n\nCode:\n${input:code}\n\nReturn findings ranked Critical / High / Medium / Low, each with a concrete fix.\n\n${cursor}",
    inputs: [
      {
        name: "language",
        label: "Language",
        type: "select",
        options: ["Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "SQL", "Other"],
        default: "Python"
      },
      {
        name: "focus",
        label: "What to focus on",
        type: "text",
        options: [],
        default: "correctness, edge cases, and error handling"
      },
      {
        name: "code",
        label: "Code to review",
        type: "textarea",
        options: [],
        default: ""
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-summarize",
    title: "Summarize Clipboard",
    trigger: ">_summarize",
    description: "Copy the text first. Shows ${clipboard} plus a dropdown for output length.",
    body:
      "Summarize the text below as ${input:length}. Stay factual, drop the fluff.\n\n${clipboard}\n\n${cursor}",
    inputs: [
      {
        name: "length",
        label: "Length",
        type: "select",
        options: ["3 bullet points", "one short paragraph", "one sentence"],
        default: "3 bullet points"
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-rewrite-for",
    title: "Rewrite Selection For…",
    trigger: ">_rewrite-for",
    description: "Combo: ${page:selection} + two dropdowns. Highlight text on the page first.",
    body:
      "Rewrite the selected text for ${input:audience}, in a ${input:tone} tone. Keep the meaning; cut the fluff.\n\nSelected text:\n${page:selection}\n\n${cursor}",
    inputs: [
      {
        name: "audience",
        label: "Audience",
        type: "select",
        options: ["a senior engineer", "an executive", "a new teammate", "a customer"],
        default: "a senior engineer"
      },
      {
        name: "tone",
        label: "Tone",
        type: "select",
        options: ["plain", "formal", "friendly", "direct"],
        default: "plain"
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-explain-selection",
    title: "Explain This Selection",
    trigger: ">_explain-selection",
    description: "Shows ${page:selection} + ${page:url}. Highlight text, then trigger in a chat box.",
    body:
      "Explain this, tied to its context: what it is, how it works, and why it matters here. Skip beginner framing unless it's needed.\n\nFrom: ${page:url}\n\n${page:selection}\n\n${cursor}",
    inputs: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-explain-pr",
    title: "Explain This PR / Page",
    trigger: ">_explain-pr",
    description: "Combo of page tokens for review pages: ${page:title}, ${page:url}, ${page:selection}.",
    body:
      "Explain this to a senior engineer: what changed, why, the risk, and what a reviewer should check first.\n\n${page:title}\n${page:url}\n\nSelected context:\n${page:selection}\n\n${cursor}",
    inputs: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-cite-page",
    title: "Cite This Page",
    trigger: ">_cite",
    description: "Shows ${page:title}, ${page:url}, and ${date}.",
    body: "Source: ${page:title}\nURL: ${page:url}\nAccessed: ${date}\n\nKey point:\n${cursor}",
    inputs: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-debug",
    title: "Troubleshoot Systematically",
    trigger: ">_debug",
    description: "Structured debugging. Shows a multi-line ${input:...}.",
    body:
      "Troubleshoot this systematically, not by guessing. Rank the likely causes by probability, give the fastest check for each, separate symptoms from root cause, then recommend a fix.\n\nProblem:\n${input:problem}\n\n${cursor}",
    inputs: [
      { name: "problem", label: "What's happening", type: "textarea", options: [], default: "" }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-plan",
    title: "Turn Into Action Plan",
    trigger: ">_plan",
    description: "Shows ${date} + ${input:...}.",
    body:
      "Today is ${date}. Turn the notes below into an ordered action plan: clarify the goal, sequence the steps, call out dependencies and blockers, and state what to do first.\n\nGoal or notes:\n${input:notes}\n\n${cursor}",
    inputs: [
      { name: "notes", label: "Goal or messy notes", type: "textarea", options: [], default: "" }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-compare",
    title: "Compare Options",
    trigger: ">_compare",
    description: "Decision-grade comparison. Shows a multi-line ${input:...}.",
    body:
      "Compare these options rigorously. Use consistent criteria (capability, effort, risk, cost, reversibility, long-term maintenance). Give a decision matrix, then recommend one for my context with explicit rationale.\n\nOptions and context:\n${input:options}\n\n${cursor}",
    inputs: [
      { name: "options", label: "Options + context", type: "textarea", options: [], default: "" }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-email",
    title: "Draft Email",
    trigger: ">_email",
    description: "Shows ${input:...} and ${cursor} placed mid-body.",
    body:
      "Draft a short, professional email.\n\nTo: ${input:recipient}\nGoal: ${input:goal}\n\nDraft:\n${cursor}\n\nThen give one subject line.",
    inputs: [
      { name: "recipient", label: "Recipient", type: "text", options: [], default: "" },
      { name: "goal", label: "What you want to happen", type: "textarea", options: [], default: "" }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "starter-house",
    title: "House Style / Working Preferences",
    trigger: ">_house",
    description: "Prepend standing preferences. Plain text, no tokens.",
    body:
      "Before answering, apply my working preferences:\n- Lead with the answer or recommendation, then the reasoning. Be concise; cut filler and restating the question.\n- Separate established fact from inference or assumption. Call out what still needs validation.\n- State assumptions explicitly; if more than one reading is reasonable, present them instead of silently picking one.\n- If scope turns out much larger than expected mid-task, stop and flag it before continuing.\n- Be honest over reassuring. If this is a rabbit hole or not worth doing, say so plainly.\n- Don't gold-plate. Solve what I asked; if the proper fix is much larger, give me the trade-off and let me choose.\n- Prefer verifying by running it over reasoning about it.\n\n${cursor}",
    inputs: [],
    createdAt: now,
    updatedAt: now
  }
];
