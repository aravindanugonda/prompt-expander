const now = new Date().toISOString();

export const DEFAULT_SNIPPETS = [
  {
    id: "snippet-analyzer-prompt",
    title: "Analyzer Prompt",
    trigger: "?use-analyzer-prompt",
    description: "Turns a quick trigger into a deeper analysis prompt for chat tools.",
    body:
      "Analyze the request before answering. Call out assumptions, risks, constraints, and a short implementation plan. If code changes are needed, explain the approach first and then produce the final solution.\n\n${cursor}",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "snippet-follow-up",
    title: "Follow Up Email",
    trigger: "?follow-up-email",
    description: "Template for a simple follow-up note.",
    body:
      "Hi ${input:name},\n\nFollowing up on our earlier conversation. Please let me know if you need anything else from me.\n\nBest,\n${input:your name}${cursor}",
    createdAt: now,
    updatedAt: now
  }
];
