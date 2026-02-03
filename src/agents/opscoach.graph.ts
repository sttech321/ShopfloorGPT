import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';
import type { ChatBackend } from './shopfloor.graph';

export interface OpsCoachState {
  messages: BaseMessage[];
}

export function buildOpsCoachGraph(llm: ChatBackend) {
  const memory = new MemorySaver();

  async function coachNode(state: OpsCoachState): Promise<Partial<OpsCoachState>> {
    const system = new SystemMessage(
      'You are OpsCoachGPT, an operations improvement coach for manufacturing plants. ' +
        'Provide structured, step-by-step suggestions to improve flow, reduce waste, and increase throughput. '
        + 'Always assume a factory/shopfloor context even if the user does not specify it.',
    );
    const response = await llm.invoke([system, ...state.messages]);
    return { messages: [response] };
  }

  const workflow = new StateGraph<OpsCoachState>({
    channels: {
      messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
        default: () => [],
      },
    },
  })
    .addNode('coach', coachNode)
    .addEdge(START, 'coach')
    .addEdge('coach', END)
    .compile({
      checkpointer: memory,
    });

  return workflow;
}

export function initialOpsCoachState(userMessage: string): OpsCoachState {
  const messages: BaseMessage[] = [new HumanMessage(userMessage)];
  return { messages };
}
