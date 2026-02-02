import { Module } from '@nestjs/common';
import { ShopfloorAgentOrchestrator } from './shopfloor.orchestrator';
import { ClaudeProvider } from './claude.provider';

@Module({
  providers: [ClaudeProvider, ShopfloorAgentOrchestrator],
  exports: [ShopfloorAgentOrchestrator],
})
export class AgentsModule {}
