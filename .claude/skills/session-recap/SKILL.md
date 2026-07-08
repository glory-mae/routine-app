---
name: session-recap
description: Recaps the current conversation into a short bullet-point chat message when the user types the exact command "/recap". Covers key decisions/conclusions reached, a brief chronological flow of topics discussed, and any action items or next steps. Always trigger this skill immediately when the message is (or starts with) "/recap" — do not ask clarifying questions first, just generate the recap from the current conversation only.
---

# Session Recap

Generates a short, skimmable recap of the current conversation and posts it directly as a chat message. Triggered only by the literal command `/recap`.

## When this triggers

- The user's message is exactly `/recap`, or starts with `/recap` (e.g. `/recap please`).
- Do NOT trigger on casual requests like "can you summarize this chat" — those are ordinary requests Claude can just answer inline. This skill is specifically for the `/recap` command and its file-output behavior.
- If `/recap` is called, don't ask the user any clarifying questions — just generate the recap immediately using the format below.

## What to capture

Review the current conversation only (no past sessions). Pull out:

1. **Decisions & conclusions** — anything settled, agreed on, or concluded.
2. **Topics covered** — a brief chronological list of what was discussed, one line each.
3. **Action items / next steps** — anything the user or Claude still needs to do.

Keep it SHORT. This is a bullet-list recap, not a report:
- Each section is a tight bullet list, not prose paragraphs.
- Omit a section entirely if the conversation had nothing for it (e.g. no action items yet — skip that heading).
- Aim for a recap that's skimmable in under 30 seconds.

## Output format

Use this markdown structure:

```markdown
# Recap: <short topic title>

## Decisions & Conclusions
- ...

## Topics Covered
- ...

## Next Steps
- ...
```

- The `<short topic title>` should be a concise (3-6 word) description of what the conversation was about.
- If the conversation is very early / has no real content yet, still produce a minimal recap rather than refusing (e.g. note that the conversation just started).

## Steps

1. Read back through the current conversation.
2. Draft the recap content following the format above.
3. Post it directly as a normal chat message. Do NOT create a file, use create_file, or call present_files — this skill's output lives entirely in the conversation.
