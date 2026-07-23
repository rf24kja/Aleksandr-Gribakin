# Telegram Bot for OpenCode Management

## Purpose
Telegram bot (`@opencode7777bot`) for two-agent management of OpenCode: user sends a task → supervisor
agent delegates to executor → checks result → responds.

## Architecture

User → Telegram Bot → `opencode run --agent supervisor --format json --dir <project> <msg>`
  → supervisor agent improves spec → delegates @executor → executor executes
  → supervisor checks (git diff, console) → if ok: respond / if not: cycle back
  → bot parses JSON output → sends response to Telegram

## Commands

| Command | Action |
|---------|--------|
| Any text | Sent to OpenCode supervisor (two-agent pipeline) |
| `/run <text>` | Explicit send to OpenCode |
| `/status` | Project, agent, model, tokens, uptime, git |
| `/project` | Show current project directory |
| `/project <path>` | Switch project |
| `/agent` | Show current agent (executor/supervisor) |
| `/agent <name>` | Switch agent |
| `/session` | Session ID, uptime, message count |
| `/stats` | Token usage and cost |
| `/exec <cmd>` | Run shell command in current project |
| `/git` | Git status |
| `/restart` | Restart bot |
| `/help` | This menu |
| `/projects – /contact` | Existing portfolio commands (retained) |

## State
- `currentProject` — working directory (default: C:\Code\PORTFOLIO)
- `currentAgent` — supervisor/executor (default: supervisor)

## Technical
- Polling: sequential `while(true)`, GET-based API, offset persisted
- Encoding: TextDecoder('utf-8') for Cyrillic
- Process: start-bot.ps1 (orphaned background)
- Error handling: ECONNRESET → 3s backoff retry, 409 → 10s backoff
