import { Module } from '@nestjs/common';
import { ShopfloorAgentOrchestrator } from './shopfloor.orchestrator';
import { ClaudeProvider } from './claude.provider';
import { OpsCoachAgentOrchestrator } from './opscoach.orchestrator';
import { QualityAgentOrchestrator } from './quality.orchestrator';

@Module({
  providers: [ClaudeProvider, ShopfloorAgentOrchestrator, OpsCoachAgentOrchestrator, QualityAgentOrchestrator],
  exports: [ShopfloorAgentOrchestrator, OpsCoachAgentOrchestrator, QualityAgentOrchestrator],
})
export class AgentsModule {}
