/**
 * Semantic version for the assistant system prompt (and tool definitions in
 * `system_prompt_tools.ts` when they change behavior users see).
 *
 * Bump:
 * - PATCH: wording, tone, examples (same behavior)
 * - MINOR: new rules/sections, new tool exposed to the model
 * - MAJOR: breaking policy (e.g. what the assistant must never do)
 */
export const ASSISTANT_PROMPT_VERSION = '1.2.0' as const

export type AssistantPromptVersion = typeof ASSISTANT_PROMPT_VERSION
