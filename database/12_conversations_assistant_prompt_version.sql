-- Track which SYSTEM_PROMPT semver produced each assistant message (see src/lib/ai/prompts/version.ts)
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS assistant_prompt_version VARCHAR(32);

COMMENT ON COLUMN public.conversations.assistant_prompt_version IS 'Semver of SYSTEM_PROMPT when the row was inserted (typically assistant replies).';
