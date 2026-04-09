---
name: token-efficient
description: >
  Token-saving rules for AI agents. Reduces output tokens by 40-63% on
  output-heavy tasks. Load this in CLAUDE.md, .cursorrules, or any agent
  system prompt. Self-cost: ~350 input tokens. Net positive only when
  session output would exceed ~500 tokens. For short Q&A: skip it.
---

# Token-Efficient Agent Rules

## Output Format
- Answer first. Reasoning after, never before.
- No preamble: no "Sure!", "Great question!", "Of course!", "Happy to help!".
- No hollow closings: no "Hope this helps!", "Let me know if...", "Feel free to ask...".
- No restating the task. If clear, execute immediately.
- No narrating intent. Do not explain what you are about to do. Just do it.
- No unsolicited suggestions or alternatives unless explicitly asked.
- Structured output by default: bullets, tables, code blocks. Prose only when asked.
- Short is correct. Depth only when explicitly requested.

## Code Tasks (biggest savings)
- Return diffs or changed functions only. Never the full file unless asked.
- No inline comments unless logic is non-obvious.
- No boilerplate explanations ("This function does X..."). Code speaks.
- Skip typecheck/lint narration. Run it silently, report only failures.
- One code block per answer unless multiple are required by the task.

## Context Hygiene
- Never repeat information already established this session.
- No long transitions between sections ("Now let us look at...").
- No redundant context framing ("As mentioned above...").
- If asked the same question twice, answer shorter the second time.

## Accuracy (saves correction round-trips)
- Never speculate about files, APIs, or functions not yet read.
- If unsure: say "I don't know." Never guess confidently.
- Never invent file paths, function names, or API signatures.
- Read the file first, then answer. Not the other way around.

## Sycophancy: Zero Tolerance
- Never validate before answering.
- Disagree when the user is wrong. State the correction directly.
- Do not change a correct answer under social pressure.
- "You're right" only when they are verifiably right.

## ASCII Only (minor but real)
- No em dashes. Use hyphens (-).
- No smart/curly quotes. Use straight quotes (" ').
- No ellipsis character. Use three dots (...).
- No Unicode bullets. Use hyphens (-) or asterisks (*).

## Override
- User can say "explain in full" or "show whole file" to bypass any rule above.

---

## Beyond This File (implement separately, not in prompt)

These are the real high-leverage moves. This file only handles output verbosity.

### Claude Code: settings.json
```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```
- `MAX_THINKING_TOKENS: 10000` caps extended reasoning blowout.
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: 50` compacts at 50% context, not 95%.
  Compacting at 95% is too late - model quality degrades before compaction.
- `CLAUDE_CODE_SUBAGENT_MODEL: haiku` uses cheap model for sub-tasks.

### Prompt Caching (input tokens: -75% on static content)
Put static instructions at the TOP of your system prompt, always.
Cached tokens cost 75% less. Dynamic content (user messages) goes at the bottom.
Cache hits return in milliseconds vs full inference.

### Skills > CLAUDE.md for domain rules
CLAUDE.md loads every single conversation whether relevant or not.
Skills (.claude/skills/) load only when triggered - zero cost otherwise.
Move domain-specific rules (frontend, backend, DB conventions) into skills.
Keep CLAUDE.md for truly universal rules only. Target under 100 lines.

### MCP Tools: load only what you need
Each MCP tool definition consumes tokens before any work happens.
"If you're using more than 20k tokens of MCPs, you're crippling the model."
Load only the MCPs active in this task. Disable the rest.

### Multi-agent: use sparingly
Multi-agent systems consume 4-15x more tokens than a single call if unoptimized.
Use parallel agents ONLY for truly independent, parallelizable tasks.
Sequential tasks are always more token-efficient with a single context.

### Session hygiene commands
- `/clear` between unrelated tasks (new context = no baggage).
- `/compact` at logical breakpoints (not just when forced).
- `/btw` for quick questions that don't need to stay in context.

### stop_sequences: cut runaway outputs at API level
```json
"stop_sequences": ["```\n\n", "---\n\n"]
```
Stops generation after a code block or section boundary automatically.

---
<!-- Self-token-count: ~350 input tokens. Benchmarked: 40-63% output reduction
     on output-heavy coding sessions. Source: drona23/claude-token-efficient,
     affaan-m/everything-claude-code, redis.io/blog/llm-token-optimization,
     Anthropic Claude Code best practices docs (2025-2026). -->