import { Injectable } from '@nestjs/common';
import { ClaudeProvider } from './claude.provider';
import { buildOpsCoachGraph, initialOpsCoachState } from './opscoach.graph';

export interface OpsCoachChatRequest {
  userId: string;
  message: string;
  context: Record<string, unknown>;
}

@Injectable()
export class OpsCoachAgentOrchestrator {
  private readonly app;

  constructor(private readonly claude: ClaudeProvider) {
    const llm = this.claude.getChatModel();
    this.app = buildOpsCoachGraph(llm);
  }

  async runConversation(req: OpsCoachChatRequest): Promise<string> {
    const state = initialOpsCoachState(req.message);

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
