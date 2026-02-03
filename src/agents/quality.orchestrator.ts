import { Injectable } from '@nestjs/common';
import { ClaudeProvider } from './claude.provider';
import { buildQualityGraph, initialQualityState } from './quality.graph';

export interface QualityChatRequest {
  userId: string;
  message: string;
  context: Record<string, unknown>;
}

@Injectable()
export class QualityAgentOrchestrator {
  private readonly app;

  constructor(private readonly claude: ClaudeProvider) {
    const llm = this.claude.getChatModel();
    this.app = buildQualityGraph(llm);
  }

  async runConversation(req: QualityChatRequest): Promise<string> {
    const state = initialQualityState(req.message);

    const config = {
      configurable: {
        thread_id: req.userId,
      },
    } as const;

    const result = await this.app.invoke(state, config);
    const last = result.messages[result.messages.length - 1];
    const content = typeof last.content === 'string' ? last.content : JSON.stringify(last.content);
    return content;
  }
}
