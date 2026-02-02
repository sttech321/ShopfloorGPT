import { Injectable } from '@nestjs/common';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { ChatBackend } from './shopfloor.graph';

@Injectable()
export class ClaudeProvider {
  private readonly model: ChatBackend;

  constructor() {
    const provider = process.env.LLM_PROVIDER ?? 'anthropic';

    if (provider === 'ollama') {
      // Local Ollama-backed model: no cloud API key required.
      this.model = new LocalOllamaChat();
      // eslint-disable-next-line no-console
      console.log('Using local Ollama model via LLM_PROVIDER=ollama');
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4.5';

    // If no real key is provided, fall back to a local mock so
    // the app is usable for demos without hitting Anthropic.
    const isPlaceholder = !apiKey || apiKey === 'REPLACE_WITH_REAL_KEY';

    if (isPlaceholder) {
      // eslint-disable-next-line no-console
      console.warn(
        'ANTHROPIC_API_KEY is missing or placeholder; using a local mock Claude model. Set a real key in .env or set LLM_PROVIDER=ollama for a local model.',
      );

      const mockModel: ChatBackend = {
        async invoke(messages: BaseMessage[]) {
          const last = messages[messages.length - 1];
          const content =
            typeof last?.content === 'string'
              ? last.content
              : JSON.stringify(last?.content);
          return new AIMessage(
            `MOCK CLAUDE REPLY (no real API key configured). I received: ${content}`,
          );
        },
      };

      this.model = mockModel;
      return;
    }

    this.model = new ChatAnthropic({
      apiKey,
      model: modelName,
    });
  }

  getChatModel(): ChatBackend {
    return this.model;
  }
}

class LocalOllamaChat implements ChatBackend {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL ?? 'llama3.1';
  }

  async invoke(messages: BaseMessage[]): Promise<BaseMessage> {
    const last = messages[messages.length - 1];
    const content =
      typeof last?.content === 'string'
        ? last.content
        : JSON.stringify(last?.content);

    const prompt = content;

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        // eslint-disable-next-line no-console
        console.error('Ollama HTTP error:', res.status, res.statusText, text);
        return new AIMessage(
          `Ollama returned an error (${res.status} ${res.statusText}). ` +
            'Make sure the Ollama service is running and the model is available.',
        );
      }

      const data = (await res.json()) as { response?: string };
      const reply = data.response ?? '[Ollama returned no response]';
      return new AIMessage(reply);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to reach Ollama:', err);
      return new AIMessage(
        `Could not reach Ollama at ${this.baseUrl}. ` +
          'Ensure Ollama is installed, the service is running, and OLLAMA_BASE_URL is correct.',
      );
    }
  }
}
