import { Injectable } from '@nestjs/common';
import { ShopfloorAgentOrchestrator } from '../agents/shopfloor.orchestrator';
import { OpsCoachAgentOrchestrator } from '../agents/opscoach.orchestrator';
import { QualityAgentOrchestrator } from '../agents/quality.orchestrator';

export interface ChatRequest {
  userId: string;
  message: string;
  agent?: string;
  context: Record<string, unknown>;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly shopfloorOrchestrator: ShopfloorAgentOrchestrator,
    private readonly opsCoachOrchestrator: OpsCoachAgentOrchestrator,
    private readonly qualityOrchestrator: QualityAgentOrchestrator,
  ) {}

  async handleUserMessage(req: ChatRequest): Promise<string> {
    const agent = req.agent ?? 'shopfloor';

    if (agent === 'opscoach') {
      return this.opsCoachOrchestrator.runConversation({
        userId: req.userId,
        message: req.message,
        context: req.context,
      });
    }

    if (agent === 'quality') {
      return this.qualityOrchestrator.runConversation({
        userId: req.userId,
        message: req.message,
        context: req.context,
      });
    }

    return this.shopfloorOrchestrator.runShopfloorConversation(req);
  }
}
