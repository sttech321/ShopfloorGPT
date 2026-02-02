# Agent Chat Nest + LangGraph Sample

This is a minimal NestJS + TypeScript sample that exposes an agent-based chat API powered by LangGraph/LangChain and Anthropic Claude Sonnet (configured as `CLAUDE_MODEL`, e.g. `claude-sonnet-4.5`).

## Tech Stack

- NestJS (HTTP API, dependency injection)
- TypeScript
- LangChain JS / LangGraph
- Anthropic Claude (via `@langchain/anthropic` and `@anthropic-ai/sdk`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file:

   ```bash
  # Choose backend: "anthropic" (Claude) or "ollama" (local model)
  LLM_PROVIDER=ollama

  # If using Anthropic (cloud Claude)
  ANTHROPIC_API_KEY=your_api_key_here
  CLAUDE_MODEL=claude-sonnet-4.5

  # If using Ollama (local open-source model)
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=llama3.1

  PORT=3000
   ```

3. Build and run in dev mode:

   ```bash
   npm run start:dev
   ```

The server listens on `http://localhost:3000/api`.

## Chat Endpoint

- **URL**: `POST /api/chat`
- **Body**:

  ```json
  {
    "userId": "operator-123",
    "message": "Machine 12 has an unexpected downtime incident",
    "context": {}
  }
  ```

- **Response**:

  ```json
  {
    "reply": "...agent response from ShopfloorGPT..."
  }
  ```

All clients are effectively "enabled" for Claude Sonnet by configuring `CLAUDE_MODEL` globally and using the shared `ClaudeProvider` everywhere in the app.

## Screenshot

Save your UI screenshot into the repository (for example at `docs/shopfloorgpt-ui.png`), then this Markdown will render it on GitHub:

```markdown
![ShopfloorGPT Chat UI](docs/shopfloorgpt-ui.png)
```
