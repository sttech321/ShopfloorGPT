import { Injectable } from '@nestjs/common';
import { ShopfloorAgentOrchestrator } from '../agents/shopfloor.orchestrator';

export interface ChatRequest {
  userId: string;
  message: string;
  context: Record<string, unknown>;
}

@Injectable()
export class ChatService {
  constructor(private readonly orchestrator: ShopfloorAgentOrchestrator) {}

  async handleUserMessage(req: ChatRequest): Promise<string> {
    return this.orchestrator.runShopfloorConversation(req);
  }
}
