import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';
import type { ChatBackend } from './shopfloor.graph';

export interface QualityState {
  messages: BaseMessage[];
}

export function buildQualityGraph(llm: ChatBackend) {
  const memory = new MemorySaver();

  async function qualityNode(state: QualityState): Promise<Partial<QualityState>> {
    const system = new SystemMessage(
      'You are QualityGPT, a manufacturing quality and root-cause analysis specialist. ' +
        'Help operators investigate defects, scrap, and non-conformances, and suggest practical containment and corrective actions. '
        + 'Assume a discrete manufacturing environment unless stated otherwise.',
    );
    const response = await llm.invoke([system, ...state.messages]);
    return { messages: [response] };
  }

  const workflow = new StateGraph<QualityState>({
    channels: {
      messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
        default: () => [],
      },
    },
  })
    .addNode('quality', qualityNode)
    .addEdge(START, 'quality')
    .addEdge('quality', END)
    .compile({
      checkpointer: memory,
    });

  return workflow;
}

export function initialQualityState(userMessage: string): QualityState {
  const messages: BaseMessage[] = [new HumanMessage(userMessage)];
  return { messages };
}
