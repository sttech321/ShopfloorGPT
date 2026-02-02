import { Injectable } from '@nestjs/common';
import { ClaudeProvider } from './claude.provider';
import { buildShopfloorGraph, initialShopfloorState } from './shopfloor.graph';

export interface ShopfloorChatRequest {
  userId: string;
  message: string;
  context: Record<string, unknown>;
}

@Injectable()
export class ShopfloorAgentOrchestrator {
  private readonly app;

  constructor(private readonly claude: ClaudeProvider) {
    const llm = this.claude.getChatModel();
    this.app = buildShopfloorGraph(llm);
  }

  async runShopfloorConversation(req: ShopfloorChatRequest): Promise<string> {
    const state = initialShopfloorState(req.message);

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
