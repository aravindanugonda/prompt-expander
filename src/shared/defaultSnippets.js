const now = new Date().toISOString();

export const DEFAULT_SNIPPETS = [
  {
    id: "everyday-action-plan",
    title: "Turn Into Action Plan",
    trigger: "?action-plan",
    description: "Convert a goal or messy notes into concrete next steps.",
    body: "Turn this into an actionable plan.\n\nGoal or notes:\n[PASTE HERE]\n\nRequirements:\n- Clarify the goal first if needed\n- Break the work into practical steps\n- Put the steps in the right order\n- Call out blockers or dependencies\n- Keep it execution-focused\n\nOutput Format:\n1. Goal\n2. Ordered steps\n3. Dependencies or blockers\n4. What to do first",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-addon-actionability",
    title: "Add-On: More Actionability",
    trigger: "?addon-actionability",
    description: "Add-on line for clearer next steps.",
    body: "End with concrete next steps that can be acted on immediately.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-addon-comparison",
    title: "Add-On: Comparison",
    trigger: "?addon-compare-options",
    description: "Add-on line for direct option comparison.",
    body: "If there are multiple viable approaches, compare them directly and recommend the strongest option.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-addon-depth",
    title: "Add-On: More Depth",
    trigger: "?addon-depth",
    description: "Add-on line for deeper analysis.",
    body: "Do not stop at the obvious answer. Push to the most useful and defensible conclusion.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-addon-less-fluff",
    title: "Add-On: Less Fluff",
    trigger: "?addon-less-fluff",
    description: "Add-on line for concise, high-signal answers.",
    body: "Keep the answer concise, information-dense, and free of generic advice.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-addon-realism",
    title: "Add-On: Realism",
    trigger: "?addon-realism",
    description: "Add-on line for production realism.",
    body: "Distinguish what is theoretically possible from what is realistic in production.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-addon-rigor",
    title: "Add-On: More Rigor",
    trigger: "?addon-rigor",
    description: "Add-on line for stronger rigor.",
    body: "Do not default to agreement. Challenge weak assumptions and surface what could fail in execution.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-decision-record",
    title: "Architecture Decision",
    trigger: "?adr",
    description: "Creates a decision-quality ADR suitable for architecture governance.",
    body: "Convert this into a concise Architecture Decision Record. Include: Context, Problem/Decision Drivers, Options Considered, Decision, Detailed Rationale, Trade-offs, Consequences, Risks, Assumptions, and Validation/Follow-up Actions. Make the decision defensible to both engineers and senior stakeholders. Avoid vague language and explicitly state why the rejected alternatives were not selected.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-architecture-review",
    title: "Architecture Review",
    trigger: "?arch",
    description: "Structured architecture assessment for design reviews and technical decision-making.",
    body: "Review this architecture like a principal solutions architect. Evaluate functional fit, scalability, availability, resilience, security, observability, operability, performance, cost, maintainability, and migration complexity. Identify architectural smells and single points of failure. Distinguish critical issues from improvements. Provide: 1) executive assessment, 2) findings ranked Critical/High/Medium/Low, 3) recommended target architecture or changes, 4) trade-offs, 5) risks and mitigations, and 6) concrete next steps.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-architecture-design",
    title: "Architecture Design Prompt",
    trigger: "?architecture-design",
    description: "Production-grade architecture recommendation prompt.",
    body: "You are a senior enterprise architect.\n\nObjective:\nDesign a production-grade architecture that is realistic, supportable, and aligned to constraints.\n\nContext:\n[Describe the platform, workloads, constraints, compliance needs, scale, and operating model]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Avoid generic architecture diagrams in prose form\n- Be explicit about components and their roles\n- Explain why each major choice is being made\n- Cover scalability, availability, observability, and operations\n- Highlight cost and complexity trade-offs\n- Call out what will be difficult in implementation\n\nOutput Format:\n1. Architecture overview\n2. Component-by-component design\n3. Operational model\n4. Availability and failure handling\n5. Risks and trade-offs\n6. Recommended architecture",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-assumption-check",
    title: "Assumption-Check Prompt",
    trigger: "?assumption-check",
    description: "Challenge the question's assumptions before answering.",
    body: "Before answering, challenge the assumptions behind this request.\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Identify explicit assumptions\n- Identify hidden assumptions\n- Separate what is likely true from what may be misleading\n- Explain how the answer changes if the assumptions are wrong\n- Then provide the best answer under the most realistic interpretation\n\nOutput Format:\n1. Explicit assumptions\n2. Hidden assumptions\n3. Which assumptions are weak\n4. Reframed problem statement\n5. Best answer under the corrected framing",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-aws-solutions-architect-professional",
    title: "AWS Solutions Architect Professional",
    trigger: "?aws-architect-pro",
    description: "Production-minded AWS architecture, trade-off, and migration guidance.",
    body: "Act as an AWS Solutions Architect Professional.\n\nObjective:\nProvide production-grade AWS architecture guidance that is realistic, supportable, secure, and cost-aware.\n\nContext:\n[Describe the workloads, scale, constraints, compliance needs, availability targets, current state, and business goals]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Think like a senior architect, not a product brochure\n- Be explicit about AWS services and why each is being chosen\n- Cover security, networking, availability, scalability, observability, and cost\n- Identify trade-offs and what becomes operationally difficult\n- Call out migration complexity, hidden dependencies, and failure modes\n- Distinguish quick wins from long-term architecture choices\n- Recommend a practical target architecture and rollout path\n\nOutput Format:\n1. Problem framing\n2. Assumptions and constraints\n3. Recommended AWS architecture\n4. Service-by-service rationale\n5. Security and operational considerations\n6. Trade-offs and alternatives\n7. Risks and failure modes\n8. Recommended rollout plan",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-best-possible-answer",
    title: "Best-Possible Answer Prompt",
    trigger: "?best-possible-answer",
    description: "Optimize for answer quality over speed.",
    body: "I want your best possible answer, not your fastest answer.\n\nApproach this carefully and at expert level.\n\nRequirements:\n- Fully understand the request before answering\n- Surface hidden assumptions\n- Consider alternatives and edge cases\n- Prefer depth where it matters and brevity where it does not\n- Be explicit about uncertainty\n- Give a final answer that is well-reasoned, practical, and defensible\n- If a better structure would improve the answer, use it\n\nTask:\n[INSERT YOUR QUESTION HERE]",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-blast-radius",
    title: "Blast Radius First",
    trigger: "?blast",
    description: "Scope and reversibility of a change before doing it: rebuilds, restarts, dropped traffic, state loss.",
    body: "Before I do this, tell me the blast radius. What does the change actually touch - which files, which images need rebuilding, which pods restart, which services drop briefly, what state could be lost? Is it reversible, and how? What is the safe order of operations, and can it be staged so less is at risk at once? If it is genuinely low-risk, say so plainly.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-brainstorming",
    title: "Brainstorming Prompt",
    trigger: "?brainstorm-ideas",
    description: "Generate strong, grounded ideas instead of filler.",
    body: "Brainstorm strong, non-generic ideas for this goal:\n[INSERT GOAL]\n\nContext:\n[Constraints, audience, budget, timeline, environment]\n\nRequirements:\n- Prioritize originality and usefulness\n- Avoid obvious filler ideas\n- Include a mix of safe, ambitious, and unconventional options\n- Keep the ideas grounded in the stated constraints\n- For the best ideas, explain why they stand out\n\nOutput Format:\n1. Top ideas\n2. Why each is promising\n3. Best ideas to test first\n4. Recommended next step",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-brutal-risk-assessment",
    title: "Brutal Risk Assessment Prompt",
    trigger: "?brutal-risk-check",
    description: "Brutally honest assessment before major commitments.",
    body: "You are a senior advisor brought in to identify why this plan could fail.\n\nObjective:\nPerform a brutally honest assessment focused on execution reality, not theory.\n\nContext:\n[Describe the initiative, architecture, project, migration, or plan]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Do NOT soften risks\n- Focus on real-world failure points\n- Include technical, operational, organizational, and skill-related risks\n- Call out hidden dependencies most teams miss\n- Identify where timelines and estimates are likely to fail\n- Recommend practical mitigations\n\nOutput Format:\n1. Top technical risks\n2. Hidden dependencies\n3. Operational and organizational risks\n4. Timeline and estimation risks\n5. What is likely to go wrong in production\n6. Mitigation strategies",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-capture",
    title: "Capture It Durably",
    trigger: "?capture",
    description: "Persist a fact/decision/command into the right doc or runbook so I won't forget it.",
    body: "Record this so I don't have to hold it in my head. Update the right runbook, doc, or CHANGELOG, or tell me exactly where it belongs and add it. Keep it concise and findable. If the reasoning currently only exists in commit messages or chat, call that out.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-simplify",
    title: "Make It Clear",
    trigger: "?clarify",
    description: "Improves clarity and precision while retaining technical depth.",
    body: "Rewrite this so it is clearer, sharper, and more precise without losing technical substance. Remove repetition, vague wording, and unnecessary jargon. Preserve important qualifications and caveats. Prefer short paragraphs, meaningful headings, and direct statements. If a sentence contains multiple ideas, split them where useful.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-cloud-architecture",
    title: "Cloud Architecture",
    trigger: "?cloud",
    description: "Produces cloud-neutral reasoning first, followed by practical AWS/Azure/GCP mappings.",
    body: "Evaluate this solution for cloud deployment. Assess identity and access, networking, compute, storage, data, integration, observability, resilience, disaster recovery, scalability, automation, security controls, and cost. Consider AWS, Azure, and GCP patterns where useful, but avoid service-name-driven architecture. Start from requirements and architectural principles, then map to appropriate managed services. Include major trade-offs, failure modes, operational implications, and a recommended reference architecture.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-coding",
    title: "Coding Prompt",
    trigger: "?coding-prompt",
    description: "Implementation and code review prompt for maintainable solutions.",
    body: "Act as a senior software engineer.\n\nObjective:\nProvide a correct, maintainable, production-minded solution.\n\nContext:\n[Language, framework, environment, constraints, codebase expectations]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Clarify the goal and assumptions\n- Prefer simple and robust solutions over clever ones\n- Call out edge cases and failure modes\n- Explain trade-offs in maintainability, complexity, and performance\n- If writing code, make it readable and production-minded\n- Suggest tests or validation steps where relevant\n\nOutput Format:\n1. Recommended approach\n2. Trade-offs\n3. Code or pseudocode\n4. Validation strategy\n5. Risks or caveats",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-compare-options",
    title: "Compare Options",
    trigger: "?compare",
    description: "Rigorous, criteria-based comparison and recommendation - also covers open-ended technical analysis, not just named options.",
    body: "Compare the options rigorously. Start by naming the objective, assumptions, constraints, risks, dependencies, and key decision points if they aren't already explicit. Use consistent evaluation criteria such as capability, complexity, migration effort, risk, performance, scalability, security, operability, vendor dependency, cost, reversibility, and long-term maintainability. Provide a decision matrix, explain the important differences, identify where the comparison is sensitive to assumptions, and recommend the strongest option for the stated context with explicit rationale, plus a concise implementation plan.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-compare-options",
    title: "Compare Two Or Three Options",
    trigger: "?compare-options",
    description: "Quick side-by-side option comparison with a recommendation.",
    body: "Compare these options and recommend the strongest one.\n\nOptions:\n- [Option A]\n- [Option B]\n- [Option C if needed]\n\nContext:\n[Constraints, priorities, budget, timeline, or other factors]\n\nRequirements:\n- Use the same criteria for each option\n- Highlight practical trade-offs\n- Identify hidden costs or risks\n- Recommend the best fit for the stated context\n\nOutput Format:\n1. Comparison criteria\n2. Evaluation of each option\n3. Trade-offs\n4. Recommended option",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-critique-review",
    title: "Critique And Review Prompt",
    trigger: "?critique-review",
    description: "Stress-test a plan, argument, draft, or idea.",
    body: "Critique this rigorously.\n\nObjective:\nIdentify weaknesses, hidden assumptions, risks, and stronger alternatives.\n\nTask:\n[INSERT THE IDEA, PLAN, OR DRAFT]\n\nRequirements:\n- Do not default to agreement\n- Look for logical gaps, weak assumptions, and missing constraints\n- Identify likely objections and practical risks\n- Point out what sounds good in theory but may fail in execution\n- Recommend stronger alternatives where appropriate\n\nOutput Format:\n1. Strongest parts\n2. Weakest parts\n3. What is missing\n4. Key risks or failure modes\n5. Most important improvements\n6. Revised recommendation",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-troubleshoot",
    title: "Troubleshoot Systematically",
    trigger: "?debug",
    description: "Hypothesis-driven troubleshooting, with live-system caution folded in: read-only first, minimal/disclosed interventions, restore state.",
    body: "Troubleshoot this systematically rather than guessing. Establish the most likely hypotheses, rank them by probability and impact, identify the evidence that would confirm or eliminate each hypothesis, and propose the fastest low-risk diagnostic steps first. Separate symptoms from root causes.\n\nIf this is on a live/running system: start with read-only diagnostics, minimize state-changing actions, and tell me before each one and why. If earlier interventions (mine or a previous session's) may have contaminated the state, say so and flag which conclusions are now unreliable - prefer a clean reproduction. Restore anything you change and confirm the system is back to a known-good state at the end.\n\nFinish with the likely root cause, remediation, and prevention actions.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-debugging",
    title: "Debugging Prompt",
    trigger: "?debug-rigorously",
    description: "Troubleshooting prompt for technical issues and regressions.",
    body: "Act as a rigorous debugger.\n\nObjective:\nIdentify the most likely root cause and the fastest path to isolate and fix the problem.\n\nContext:\n[System details, errors, symptoms, environment, recent changes]\n\nTask:\n[INSERT THE ISSUE]\n\nRequirements:\n- Rank likely causes by probability\n- Avoid scattered generic suggestions\n- Explain how to validate or eliminate each likely cause\n- Prioritize the fastest high-signal debugging path\n- Recommend a fix once the most likely cause is clear\n- Call out misleading symptoms if applicable\n\nOutput Format:\n1. Most likely causes ranked\n2. Why each is plausible\n3. Fastest validation steps\n4. Recommended fix path\n5. Residual risks or follow-up checks",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-decision-making",
    title: "Decision-Making Prompt",
    trigger: "?decision-making",
    description: "Decision-grade comparison across competing options.",
    body: "You are an expert advisor helping evaluate competing options.\n\nDecision to make:\n[Describe the decision]\n\nOptions:\n- [Option A]\n- [Option B]\n- [Option C]\n\nContext:\n[Describe your constraints, priorities, and operating environment]\n\nRequirements:\n- Define the decision criteria first\n- Compare each option against the same criteria\n- Highlight short-term vs long-term trade-offs\n- Identify hidden costs and second-order effects\n- Recommend the best option based on the stated context\n- If priorities are unclear, infer likely priorities and state the assumptions\n\nOutput Format:\n1. Decision criteria\n2. Evaluation of each option\n3. Trade-offs\n4. What is likely to go wrong with each option\n5. Recommended decision\n6. Why this is the best fit",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-deep-technical-analysis",
    title: "Deep Technical Analysis Prompt",
    trigger: "?deep-tech-analysis",
    description: "Rigorous engineering and architecture analysis.",
    body: "You are a senior technical architect and systems engineer.\n\nObjective:\nCritically evaluate the issue from a production-grade engineering perspective.\n\nContext:\n[Describe the system, platform, architecture, or implementation details]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Do NOT agree by default\n- Break the problem into distinct technical dimensions\n- Identify where the idea is partially valid and where it breaks down\n- Call out hidden implementation complexity\n- Distinguish theoretical feasibility from operational viability\n- Explicitly identify edge cases, failure modes, and performance implications\n- Recommend realistic alternatives where appropriate\n\nOutput Format:\n1. What is valid\n2. Where the approach breaks down\n3. Hidden complexities\n4. Real-world failure scenarios\n5. Alternative strategies\n6. Recommended path based on risk, effort, and maintainability",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-email-draft",
    title: "Draft Professional Email",
    trigger: "?draft-email",
    description: "Write a clear professional email from rough context.",
    body: "Draft a professional email.\n\nContext:\n[Who it is to, what it is about, and what outcome you want]\n\nRequirements:\n- Keep it clear and natural\n- Match a professional but human tone\n- Avoid unnecessary length\n- Include a clear ask or next step if relevant\n\nThen provide:\n1. Subject line\n2. Email draft\n3. Shorter version if useful",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-stakeholder-email",
    title: "Stakeholder Email",
    trigger: "?email",
    description: "Produces crisp enterprise stakeholder communication.",
    body: "Draft a concise, professional stakeholder email based on the context below. State the purpose early, summarize only the facts needed by the recipient, clearly identify decisions/actions required, owners if known, and dates or dependencies if provided. Be direct and confident without sounding overly formal. Do not invent commitments or facts.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-estimate",
    title: "Estimate Complexity",
    trigger: "?estimate",
    description: "Creates a defensible early complexity and effort assessment.",
    body: "Assess the complexity of this initiative without pretending to have precision that the available information does not support. Identify major workstreams, drivers of effort, technical unknowns, dependencies, risks, and likely critical-path items. Provide a relative sizing model and explain what additional evidence would be required for a reliable estimate. Distinguish effort from elapsed duration.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-high-signal-answer",
    title: "Everyday High-Signal Answer",
    trigger: "?everyday-answer",
    description: "Compact everyday prompt for practical, high-quality answers.",
    body: "Give a practical, high-signal answer. State the key assumptions, avoid generic filler, highlight any important trade-offs, and end with a clear recommendation.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-executive-summary",
    title: "Executive Summary",
    trigger: "?exec",
    description: "Turns technical material into concise executive-level decision support.",
    body: "Rewrite this for senior executives and decision-makers. Lead with the business outcome, current situation, key risks, decision required, recommendation, expected benefits, major costs or constraints, and next steps. Remove implementation noise unless it materially affects the decision. Preserve technical accuracy while making the message concise, direct, and outcome-oriented.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-planning",
    title: "Planning Prompt",
    trigger: "?execution-plan",
    description: "Execution planning prompt with phases, blockers, and risks.",
    body: "Create a practical execution plan for this objective:\n[INSERT OBJECTIVE]\n\nContext:\n[Environment, constraints, deadline, dependencies]\n\nRequirements:\n- State the goal clearly\n- Break the work into major phases\n- Sequence the steps in realistic order\n- Identify dependencies and blockers\n- Include risks and mitigations\n- Be practical, not idealized\n\nOutput Format:\n1. Goal\n2. Major phases\n3. Ordered steps\n4. Dependencies and blockers\n5. Risks and mitigations\n6. What to do first",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-executive-brief",
    title: "Executive Brief Prompt",
    trigger: "?executive-brief",
    description: "Concise, decision-grade brief for leadership or stakeholders.",
    body: "Prepare an executive-grade brief.\n\nObjective:\nProduce a concise summary with enough substance to support decision-making.\n\nContext:\n[Describe the topic, decision, initiative, or problem]\n\nTask:\n[INSERT YOUR REQUEST HERE]\n\nRequirements:\n- Be concise but substantive\n- Focus on what matters for decisions\n- Include key trade-offs, major risks, and a recommendation\n- Avoid unnecessary technical detail unless it changes the decision\n\nOutput Format:\n1. Situation summary\n2. What matters most\n3. Options or scenarios\n4. Risks\n5. Recommendation\n6. Immediate next step",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-explain-here",
    title: "Explain, Tied to My Context",
    trigger: "?explain",
    description: "Expert-level concept explanation grounded in my actual system, mechanics and edge cases included, no beginner framing.",
    body: "Explain this concept: what it is, the mechanics of how it works, important edge cases and failure modes, and specifically why it matters (or doesn't) for what I'm building right now. Tie it to my actual system and the decision in front of me. Distinguish established behavior from inference. Use concrete examples over generalities, and structured tables when helpful. Skip beginner framing unless a piece of it is genuinely needed for context. End with practical recommendations and validation steps. Expect follow-up questions that go a layer deeper - answer those the same way.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-explain-simply",
    title: "Explain Simply",
    trigger: "?explain-simply",
    description: "Explain a topic clearly without dumbing it down too much.",
    body: "Explain this clearly and simply.\n\nTopic:\n[INSERT TOPIC HERE]\n\nRequirements:\n- Start with intuition\n- Use plain language first\n- Add technical detail only where it helps understanding\n- Include one concrete example\n- End with a short summary I can remember",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-minimal-fix",
    title: "Minimal Correct Fix",
    trigger: "?fix",
    description: "Smallest correct change only - no refactor, no gold-plating; flag if it's not even broken.",
    body: "Solve this with the smallest change that is actually correct. Don't refactor adjacent code, rename things, or add abstraction I didn't ask for. If it isn't really broken, tell me. If the minimal fix is a hack and the real fix is much bigger, state the trade-off and let me pick.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-user-guide",
    title: "End-User Guide",
    trigger: "?guide",
    description: "Task-oriented, screenshot-ready how-to guide for actual end users, not engineers.",
    body: "Write a step-by-step user guide for this tool or feature, aimed at someone who will actually use it day-to-day and has no context on how it was built. Use plain task-oriented language ('To do X, click Y'), number the steps, and call out what a successful result looks like at each stage plus common mistakes or gotchas. Group related steps into short sections with clear headings. Leave placeholders for screenshots where a picture would help more than text. Avoid architecture or implementation detail unless it changes what the user should click or expect.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-claude-md",
    title: "Coding Guidelines File",
    trigger: "?guidelines",
    description: "Generates or updates a CLAUDE.md-style guidelines file: think first, simplicity, surgical edits, verify, communicate.",
    body: "Produce or update a CLAUDE.md-style coding guidelines file for this repo. Cover: thinking before coding (state assumptions, surface multiple interpretations instead of picking silently, flag confusion instead of guessing), simplicity first (minimum code for the stated problem, no speculative abstraction), surgical changes (touch only what's necessary, match existing style, don't refactor unrelated code, clean up only your own orphaned imports/variables), goal-driven execution (explicit success criteria, verify with tests or an equivalent check, state a short plan for multi-step work), and communication (summarize what changed and why, flag blockers and scope growth immediately rather than at the end). Adapt the specifics to this project's actual stack and conventions rather than using generic wording.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-hedge-language",
    title: "Hedge Appropriately",
    trigger: "?hedge",
    description: "Removes overconfident/definite phrasing from early-stage estimates and recommendations, replacing it with properly hedged, validation-pending language.",
    body: "Rewrite this so no claim is stated as more certain than the evidence supports, especially for early-stage estimates, recommendations, or baseline sizing decisions that haven't been validated yet. Replace definite language ('will', 'is the right choice', 'ensures') with appropriately conditional language ('is expected to', 'should provide', 'is intended to'), and note explicitly what will be confirmed by testing or observation before it's treated as final. Preserve the substance and the recommendation - only the certainty of the phrasing should change.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-house-style",
    title: "House Style / Working Preferences",
    trigger: "?house",
    description: "Prepend my standing preferences: concise, honest, verify-by-running, minimal-change, multi-session aware, no icons, commit hygiene, state assumptions, flag scope growth early.",
    body: "Before answering, apply my working preferences:\n- Lead with the answer or recommendation, then the reasoning. Be concise; cut filler and restating the question.\n- Separate established fact from inference or assumption. Call out what still needs validation.\n- State assumptions explicitly; if more than one interpretation is reasonable, present them instead of silently picking one.\n- If scope turns out to be much larger than expected mid-task, stop and flag it before continuing - don't surface it only at the end.\n- Be honest over reassuring. If this is turning into a rabbit hole, if my earlier steps may have contaminated the system state, or if the work isn't worth doing, say so plainly.\n- Don't gold-plate. Solve what I asked. If the 'proper' fix is much larger, give me the trade-off and let me choose.\n- Prefer verifying by running it over reasoning about it: read-only checks first, then show the real before/after.\n- I work across several agent sessions and change things by hand or on the cluster in between. When in doubt, re-check current state before acting on earlier analysis.\n- Before a change that rebuilds images, restarts pods, or could lose state, tell me the blast radius first.\n- No emoji or decorative icons in code, scripts, config, terminal output, or the docs and diagrams you build me. Prefer plain HTML/CSS or inline SVG over fragile rendering libraries; single light theme for web pages.\n- Prefer separate logical commits with clear messages (imperative subject, the 'why' in the body).\n- Keep runbooks and docs current; if the reasoning only lives in commit messages or chat, tell me.\n- When I say 'wait' or 'stop', stop and report what you have so far.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-writing-improvement",
    title: "Writing Improvement Prompt",
    trigger: "?improve-writing",
    description: "Sharpen writing without changing the intended meaning.",
    body: "Improve the writing below.\n\nObjective:\nMake it clearer, sharper, more persuasive, and easier to follow without changing the intended meaning.\n\nContext:\n- Audience: [audience]\n- Tone: [tone]\n- Purpose: [purpose]\n\nRequirements:\n- Keep the original meaning intact\n- Remove unnecessary words\n- Improve structure and flow\n- Make the wording more precise\n- Preserve the intended tone\n\nThen provide:\n1. Improved version\n2. Biggest changes made\n3. Optional stronger alternative if the message should be more direct",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-interpret-output",
    title: "Interpret Output",
    trigger: "?interpret",
    description: "Reads a log/status/output/screen and tells me what's healthy, expected, a problem, or leftover - grounded in my actual system.",
    body: "Here is command output, a log, a status dump, a console view, or a list. For each meaningful line or distinct kind of item shown: explain what it is generically, and what specific role it plays in my system. Tell me whether it's expected and healthy or a problem, which items are normal and which need attention, and how to tell look-alikes apart (current vs leftover). Ground every point in this deployment, not the generic example from the docs. Say what, if anything, I should do now, and what to check next. Don't default to 'looks fine' or 'that's broken' - reason from the actual content.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-linux-kernel-engineer",
    title: "Linux Kernel Engineer",
    trigger: "?linux-kernel-engineer",
    description: "Deep systems-level prompt for kernel internals, debugging, and performance analysis.",
    body: "Act as a senior Linux Kernel Engineer.\n\nObjective:\nProvide a rigorous systems-level answer grounded in kernel behavior, debugging reality, and production impact.\n\nContext:\n[Describe the Linux distribution, kernel version, hardware, workload, logs, symptoms, subsystems involved, and recent changes]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Reason from first principles where needed\n- Separate user-space symptoms from kernel-space causes\n- Call out relevant subsystems such as scheduling, memory management, filesystems, networking, drivers, interrupts, locking, or tracing when applicable\n- Identify likely root causes, edge cases, and failure modes\n- Recommend concrete debugging steps using the right Linux tools and observability techniques\n- Distinguish what is a hypothesis versus what is strongly supported by the evidence\n- Prefer practical, reproducible guidance over vague theory\n\nOutput Format:\n1. Problem framing\n2. Most likely causes or mechanisms\n3. Relevant kernel subsystems\n4. Fastest high-signal debugging steps\n5. Recommended fix or mitigation path\n6. Risks, caveats, and follow-up validation",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-locate",
    title: "Locate / Trace",
    trigger: "?locate",
    description: "Find where something lives, what reads it, and what's authoritative vs derived.",
    body: "Where in this codebase or system is the following configured, set, or handled? Point me to the exact file and line, or the mechanism. Tell me what reads it, which copy is authoritative versus derived, when it takes effect (build time / pod boot / runtime), and where a change to it would go.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-mainframe-migration",
    title: "Mainframe & Enterprise Server Lens",
    trigger: "?mainframe",
    description: "Mainframe modernization lens, with an Enterprise Server-specific compatibility and deployment branch when ES is the target runtime.",
    body: "Analyze this migration through a mainframe-to-distributed/cloud modernization lens. Consider COBOL, JCL, CICS, IMS, DB2, VSAM, batch scheduling, online transaction processing, file layouts, encoding, sort/utility behavior, security, operational procedures, external integrations, and non-functional requirements where applicable. Assess compatibility versus transformation choices, identify hidden dependencies, and propose a phased migration approach with validation, reconciliation, parallel run, cutover, and rollback considerations. Do not assume a technology replacement is automatically equivalent to behavioral equivalence.\n\nIf the target runtime is Micro Focus/Rocket Enterprise Server specifically, also consider: runtime compatibility and COBOL behavior differences, CICS/JES/IMS integration, JCL and batch execution under ES, datasets and VSAM handling, the transaction and security model, configuration and deployment topology, scale-out (PAC, SOR, PSOR), diagnostics, monitoring, and operational procedures. Separate runtime-preservation concerns from opportunities for modernization, and flag configuration or compatibility assumptions that must be validated in the target environment.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-mainframe-modernization-expert",
    title: "Mainframe Modernization Expert",
    trigger: "?mainframe-modernization-expert",
    description: "Legacy mainframe to commodity and cloud modernization with Rocket or Micro Focus Enterprise Server expertise.",
    body: "You are a Mainframe Modernization Expert with decades of experience helping customers migrate legacy mainframe systems to distributed and cloud environments.\n\nExpertise:\n- Mainframe modernization into commodity platforms and cloud platforms\n- AWS services and cloud architecture\n- Python, PowerShell, Windows Command, and Shell scripting on Linux\n- Rocket Software and Micro Focus Enterprise Server products and related tooling\n\nOperating expectations:\n- Be comprehensive and detailed\n- Be thoughtful and deliberate before answering\n- Prioritize accuracy, reliability, and actionability\n- Avoid superficial or rushed replies\n- Fully address the question so follow-up clarification is minimized\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nContext:\n[Describe the current mainframe environment, application stack, migration goals, constraints, timelines, and target platform]\n\nRequirements:\n- Identify assumptions explicitly\n- Separate application, data, batch, integration, operations, and platform concerns\n- Distinguish what is technically possible from what is practical in production\n- Call out migration risks, blockers, dependencies, and likely failure modes\n- Be specific about Rocket or Micro Focus Enterprise Server considerations where relevant\n- Be specific about AWS service choices where relevant\n- Include concrete implementation guidance, not just conceptual advice\n- Recommend the strongest path based on realism, maintainability, and migration risk\n\nOutput Format:\n1. Situation assessment\n2. Key assumptions and dependencies\n3. Modernization options\n4. Detailed technical analysis\n5. Rocket or Micro Focus Enterprise Server considerations\n6. AWS or target platform design guidance\n7. Risks and failure modes\n8. Recommended approach\n9. Ordered next steps",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-master-prompt",
    title: "Master Prompt",
    trigger: "?master-prompt",
    description: "Default starting point for serious, high-quality interactions.",
    body: "You are a senior domain expert and strategic problem solver.\n\nObjective:\nProvide a rigorous, practical, decision-grade response that can be used in real-world implementation, planning, or analysis.\n\nContext:\n[Describe the environment, business situation, technical landscape, or background]\n\nConstraints:\n- Avoid generic advice\n- Prioritize realism over theory\n- Challenge weak assumptions instead of agreeing by default\n- Prefer actionable guidance over high-level commentary\n- Minimize unnecessary complexity\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Explicitly identify assumptions, including hidden ones\n- Surface non-obvious dependencies and constraints\n- Compare multiple viable approaches where applicable\n- Highlight trade-offs clearly\n- Call out what is likely to fail in real-world execution\n- Recommend a practical path, not just possible paths\n\nOutput Format:\n1. Key assumptions\n2. Problem framing\n3. Viable approaches\n4. Detailed analysis\n5. Trade-offs and decision criteria\n6. Risks and failure modes\n7. Recommended approach\n8. Practical next steps",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-meeting-prep",
    title: "Prepare For Meeting",
    trigger: "?meeting-prep",
    description: "Prepare talking points, risks, and questions before a meeting.",
    body: "Help me prepare for this meeting.\n\nContext:\n[Who is involved, what the meeting is about, what outcome you want]\n\nRequirements:\n- Identify the likely goals of the meeting\n- Suggest the most important talking points\n- Include smart questions to ask\n- Highlight risks, objections, or pushback to be ready for\n- Keep it practical and concise\n\nOutput Format:\n1. Meeting objective\n2. Key talking points\n3. Questions to ask\n4. Risks or objections to expect\n5. Best opening approach",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-modernization-strategy",
    title: "Modernization Strategy & Plan",
    trigger: "?modernize",
    description: "Combines modernization strategy (patterns, target state) with an executable, phased migration plan.",
    body: "Assess this legacy modernization scenario end-to-end. Start with business and technical drivers, current-state constraints, application dependencies, data dependencies, integration points, operational requirements, and migration risks. Compare modernization patterns such as rehost, replatform, refactor, rewrite, strangler, and incremental coexistence where relevant. Recommend a pragmatic target state.\n\nThen turn it into an executable plan: define phases, workstreams, dependencies, entry/exit criteria, environments, tooling, testing strategy, data migration, integration validation, performance validation, security validation, operational readiness, cutover, rollback, and post-migration stabilization. Highlight critical-path activities and likely failure points, and explicitly identify where preserving behavior is more important than changing technology.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-performance-reality-check",
    title: "Performance Reality Check Prompt",
    trigger: "?performance-reality",
    description: "Challenge performance assumptions and design validation steps.",
    body: "You are a performance engineering expert.\n\nObjective:\nIdentify where performance assumptions are likely to break down and how to validate them.\n\nContext:\n[System, workload, architecture, scale assumptions, performance goals]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Identify the key performance assumptions\n- Distinguish between theoretical and observed behavior\n- Separate batch, online, interactive, or concurrent workloads if relevant\n- Identify likely bottlenecks\n- Recommend a realistic testing and tuning strategy\n- Highlight failure areas under scale\n\nOutput Format:\n1. Key performance assumptions\n2. Where they break down\n3. Bottleneck analysis\n4. Validation and testing strategy\n5. Tuning recommendations\n6. Risk areas under scale",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-polish-message",
    title: "Polish Slack Or Chat Message",
    trigger: "?polish-message",
    description: "Refine a Slack, Teams, or chat message while keeping it natural.",
    body: "Improve this message so it is clear, natural, and appropriate for work chat.\n\nTone target:\n[professional / friendly / direct / diplomatic]\n\nMessage:\n[PASTE MESSAGE HERE]\n\nRequirements:\n- Keep it human and concise\n- Remove awkward phrasing\n- Preserve the intended meaning\n- If useful, provide a slightly stronger version too\n\nThen provide:\n1. Improved version\n2. Optional stronger version",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-quick-brief",
    title: "Quick Brief",
    trigger: "?quick-brief",
    description: "Short, decision-useful brief on a topic or problem.",
    body: "Prepare a short, decision-useful brief on this topic.\n\nTopic:\n[INSERT TOPIC HERE]\n\nRequirements:\n- Be concise but substantive\n- Focus on what matters most\n- Include key risks, trade-offs, and a recommendation if relevant\n- Avoid fluff\n\nOutput Format:\n1. Situation summary\n2. What matters most\n3. Key risks or trade-offs\n4. Recommendation",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-rag-eval",
    title: "RAG Pipeline Review",
    trigger: "?rag",
    description: "Diagnoses and prioritizes fixes for a RAG/retrieval pipeline, with an evaluation approach to prove improvement.",
    body: "Review this RAG or retrieval pipeline end-to-end: ingestion and chunking strategy, embedding model choice, hybrid/vector search configuration, reranking, prompt construction, and generation. Identify what's likely limiting answer quality - recall, precision, faithfulness, or hallucination - and why. Recommend concrete improvements in priority order, each with expected effort and expected impact, and suggest an evaluation approach (test cases and metrics) to confirm the improvements actually helped rather than assuming they did.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-recommend-one",
    title: "Recommend One Path",
    trigger: "?recommend",
    description: "One decisive recommendation with reasoning - not a comparison matrix.",
    body: "I do not want a menu of options. Given what you know about my setup, constraints, and scale, tell me the single best way forward and why. Mention the runner-up in one line only if it is genuinely close. Give me the concrete steps, the one or two real risks, and any cheap way to de-risk it. If you honestly cannot recommend without more input, ask exactly one blocking question instead of listing alternatives.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-research-synthesis",
    title: "Research And Synthesis Prompt",
    trigger: "?research-synthesis",
    description: "Synthesize notes, documents, and ideas into insight.",
    body: "Synthesize the material I provide into a clear, high-value output.\n\nObjective:\nExtract what matters, remove noise, and produce a concise but insightful synthesis.\n\nTask:\n[INSERT YOUR REQUEST HERE]\n\nRequirements:\n- Extract the most important ideas\n- Remove repetition and low-signal detail\n- Distinguish facts, interpretations, and open questions\n- Identify patterns, contradictions, and implications\n- Produce insight, not just compression\n\nOutput Format:\n1. Core takeaway\n2. Key insights\n3. Important patterns or contradictions\n4. What matters most\n5. Open questions\n6. Practical implications",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-resync",
    title: "Re-Sync State First",
    trigger: "?resync",
    description: "I worked in parallel or on the cluster - re-check current state and redo earlier analysis against it.",
    body: "I have made changes from another session, by hand, or directly on the cluster since we last synced. Before continuing, re-check the current state - git status and recent commits, the live objects, whatever is relevant - and tell me what moved. Redo any earlier analysis or plan against the current state, not the state it assumed. Flag anything of mine that now conflicts with what we were doing.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-code-review",
    title: "Principal Code Review",
    trigger: "?review",
    description: "Performs a production-minded code review focused on correctness and operability.",
    body: "Review this code as a principal engineer. Check correctness, edge cases, error handling, concurrency, performance, security, maintainability, testability, observability, portability, and operational behavior. Prioritize findings by severity and explain the impact. Where changes are needed, explain the reasoning first and then provide the improved code. Preserve intended behavior unless there is a clear reason to change it.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-rewrite-concise",
    title: "Rewrite More Clearly",
    trigger: "?rewrite-clearly",
    description: "Rewrite text to be clearer and more concise.",
    body: "Rewrite the text below to make it clearer, tighter, and easier to follow.\n\nRequirements:\n- Keep the meaning intact\n- Remove unnecessary words\n- Improve structure and flow\n- Preserve the intended tone unless I ask otherwise\n\nText:\n[PASTE TEXT HERE]\n\nThen provide:\n1. Improved version\n2. Biggest changes made",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-runbook",
    title: "Operator Runbook",
    trigger: "?runbook",
    description: "Turn this into a runbook a different operator could follow without the backstory.",
    body: "Produce an operator runbook for this. Include: the happy-path commands in order, what 'healthy' looks like (the checks and their expected output), the known failure modes with their specific fixes, and an honest note on what would need an expert or vendor support. Write it so someone who isn't me, and wasn't in this conversation, can follow it.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-sanity-check",
    title: "Sanity-Check a Change",
    trigger: "?sanity",
    description: "Verify a change I already made is correct, minimal, and composes with the rest.",
    body: "I made the change below (in code, by hand, or in a separate session). Confirm whether it's correct: does it do what it's meant to, does it compose with the surrounding code and config, and what edge cases or failure modes might it miss? Tell me if it over-reaches or if there's a smaller correct version. If it's wrong, say so directly and show the fix. If it's right, say that too, with the one or two caveats worth keeping in mind.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-scriptify",
    title: "Scriptify a One-Off",
    trigger: "?script",
    description: "Turn a manual procedure we just did into a reusable, guarded, dry-run-able operator script.",
    body: "Turn the procedure we just did into a script I can re-run safely whenever this recurs. It must be idempotent, have a --dry-run mode, and refuse to run on unexpected state (and say why). Plain-text output, no icons. Print what it changed and any before/after numbers. Put it where this project's other operator scripts live and match their style and flags. Do not touch anything outside the stated scope.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-simple-reusable-starter",
    title: "Simple Reusable Starter",
    trigger: "?simple-high-signal",
    description: "Compact prompt for everyday high-quality responses.",
    body: "Give a rigorous, practical, high-signal answer. State assumptions, challenge weak reasoning, compare viable options where relevant, highlight trade-offs, and end with a clear recommendation.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-problem-solving",
    title: "Problem-Solving Prompt",
    trigger: "?solve-problem",
    description: "Practical solution path focused on execution.",
    body: "Help me solve this problem efficiently and correctly.\n\nProblem:\n[INSERT THE PROBLEM]\n\nContext:\n[Relevant constraints, systems, deadlines, or dependencies]\n\nRequirements:\n- Define the problem clearly\n- Identify likely root causes or underlying blockers\n- Recommend the most effective solution\n- Mention 1-2 viable alternatives\n- Explain why the recommended path is strongest\n- Give concrete next steps in order\n- Optimize for execution, not theoretical completeness\n\nOutput Format:\n1. Problem definition\n2. Root cause analysis\n3. Recommended solution\n4. Alternatives considered\n5. Risks and trade-offs\n6. Ordered next steps",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-structured-analysis",
    title: "Structured Analysis Prompt",
    trigger: "?structured-analysis",
    description: "Disciplined, practical analysis instead of a casual answer.",
    body: "Analyze this systematically and practically.\n\nContext:\n[Provide the relevant background]\n\nTask:\n[INSERT YOUR QUESTION HERE]\n\nRequirements:\n- Be explicit, not vague\n- Separate facts, assumptions, risks, and recommendations\n- Do not skip trade-offs\n- Do not give generic \"best practices\" unless directly justified\n\nOutput Format:\n1. Objective summary\n2. Key variables and dependencies\n3. Constraints and risks\n4. Likely scenarios or interpretations\n5. Recommended action\n6. Why this recommendation is strongest",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-summarization",
    title: "Summarization Prompt",
    trigger: "?summarize-material",
    description: "High-signal summaries for documents, meetings, and notes.",
    body: "Summarize the material below for maximum usefulness and minimum fluff.\n\nRequirements:\n- Keep it concise and information-dense\n- Preserve important nuance\n- Remove repetition\n- Extract decisions, action items, unresolved issues, and key facts\n- Preserve technical terms where relevant\n\nOutput Format:\n1. Executive summary\n2. Key points\n3. Decisions made\n4. Action items\n5. Open issues or unresolved questions",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "everyday-summarize-thread",
    title: "Summarize Thread",
    trigger: "?summarize-thread",
    description: "Summarize an email thread, chat, or notes into what matters.",
    body: "Summarize this for usefulness, not fluff.\n\nRequirements:\n- Keep it concise and information-dense\n- Capture the main point, decisions, action items, and unresolved questions\n- Remove repetition and low-value detail\n\nMaterial:\n[PASTE MATERIAL HERE]\n\nOutput Format:\n1. Executive summary\n2. Key points\n3. Action items\n4. Open issues",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-team-explainer",
    title: "Team Explainer",
    trigger: "?teach",
    description: "Concepts-first team explainer: generic first, a mapping section at the end, plain HTML/CSS diagrams, no icons, light theme.",
    body: "Produce a presentation-ready explainer that someone outside this project could learn from. Lead with the concepts, generically and plainly, and define each term on first use. Keep my specific names, scripts, and IDs out of the main flow - collect them into one 'how this maps here' section near the end. Diagrams must show the real mechanism and be built in plain HTML/CSS or inline SVG, not a rendering library. No emoji or decorative icons. If it is a web page: a single light theme, self-contained, one wide readable column. Structure it so it reads top to bottom and also skims by section.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prompt-learning",
    title: "Learning Prompt",
    trigger: "?teach-topic",
    description: "Learn a topic for understanding rather than memorization.",
    body: "Teach me this in a way that maximizes understanding, not memorization.\n\nTopic:\n[INSERT TOPIC]\n\nMy level:\n[beginner / intermediate / advanced]\n\nRequirements:\n- Start with intuition\n- Explain the core concepts clearly\n- Build toward deeper technical detail\n- Use a practical example\n- Point out common misconceptions\n- End with a short mental model I can remember\n\nOutput Format:\n1. Intuition\n2. Core explanation\n3. Example\n4. Common mistakes\n5. Mental model",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-verify-claim",
    title: "Verify Against Reality",
    trigger: "?verify",
    description: "Checks a claim, analysis, or plan against the real system by actually running it, not just reasoning about it.",
    body: "The analysis, plan, or claim below may come from another session, a document, or a colleague - or it may be my own conclusion that I want checked. Do not take it at face value or just reason about whether it's still true - check it against the actual codebase and running system wherever possible. Prefer running it over reasoning about it: read-only checks first, then capture the real before and after (counts, sizes, status, output) and reconcile any difference against what was expected. For each significant claim: confirm it, correct it, or mark it unverifiable and say why. If a step can't be run from here, say so and give me the exact command to run myself. Finish with a bottom line: does the conclusion still hold?\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-vscode-ext",
    title: "VS Code Extension Lens",
    trigger: "?vscode",
    description: "Applies host/webview architecture, messaging, persistence, and packaging considerations for VS Code extension work.",
    body: "Analyze or implement this through a VS Code extension architecture lens. Consider the extension host vs webview boundary and the postMessage protocol between them, activation events and lifecycle, workspaceState/globalState/secrets persistence, panel/view registration, CSP restrictions inside webviews, packaging (.vsix) and marketplace or private distribution, and versioning across upgrades. Be explicit about which side (host or webview) each piece of state and each capability belongs to, and flag any timing or race conditions in the message-passing - such as the webview not being ready when the host tries to restore state.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-worth-it",
    title: "Effort vs Value",
    trigger: "?worth",
    description: "Pragmatic 'is this necessary / would X make it materially better' assessment for my scale.",
    body: "Give me a realistic, honest read on effort versus value for this. Is it actually necessary? What concretely breaks or degrades if I don't do it? If I'm weighing an alternative (a rewrite, a framework, an operator, a tool), would it make things materially better for my specific situation and scale, or is it over-engineering? Recommend do-now / defer / skip, with the reasoning and any cheap partial measure that captures most of the benefit.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
];
