import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';

export interface ShopfloorState {
  messages: BaseMessage[];
  route?: 'safety' | 'maintenance' | 'planning' | 'general';
}

// Minimal interface so we can plug in either Anthropic or a local Ollama wrapper.
export interface ChatBackend {
  invoke(messages: BaseMessage[]): Promise<BaseMessage>;
}

export function buildShopfloorGraph(llm: ChatBackend) {
  const memory = new MemorySaver();

  async function routerNode(state: ShopfloorState): Promise<Partial<ShopfloorState>> {
    const last = state.messages[state.messages.length - 1];
    const content = last?.content?.toString().toLowerCase() ?? '';

    let route: ShopfloorState['route'] = 'general';
    if (content.includes('incident') || content.includes('safety')) {
      route = 'safety';
    } else if (content.includes('machine') || content.includes('downtime')) {
      route = 'maintenance';
    } else if (content.includes('schedule') || content.includes('planning')) {
      route = 'planning';
    }

    return { route };
  }

  function makeSpecialistNode(domain: string) {
    return async (state: ShopfloorState): Promise<Partial<ShopfloorState>> => {
      const system = new SystemMessage(
        `You are the ${domain} specialist in a hierarchical ShopfloorGPT team. ` +
          'Coordinate with other agents implicitly, but respond in concise, actionable language for frontline operators.',
      );
      const response = await llm.invoke([system, ...state.messages]);
      return { messages: [response] };
    };
  }

  async function generalAssistant(state: ShopfloorState): Promise<Partial<ShopfloorState>> {
    const system = new SystemMessage(
      'You are ShopfloorGPT, a general factory operations assistant. Answer clearly and safely.',
    );
    const response = await llm.invoke([system, ...state.messages]);
    return { messages: [response] };
  }

  const workflow = new StateGraph<ShopfloorState>({
    channels: {
      messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
        default: () => [],
      },
      route: {
        value: (x: ShopfloorState['route'], _y: ShopfloorState['route']) => x,
        default: () => undefined,
      },
    },
  })
    .addNode('router', routerNode)
    .addNode('safety', makeSpecialistNode('safety and compliance'))
    .addNode('maintenance', makeSpecialistNode('maintenance and reliability'))
    .addNode('planning', makeSpecialistNode('production planning and scheduling'))
    .addNode('general', generalAssistant)
    .addEdge(START, 'router')
    .addEdge('router', 'safety')
    .addEdge('router', 'maintenance')
    .addEdge('router', 'planning')
    .addEdge('router', 'general')
    .addEdge('safety', END)
    .addEdge('maintenance', END)
    .addEdge('planning', END)
    .addEdge('general', END)
    .compile({
      checkpointer: memory,
    });

  return workflow;
}

export function initialShopfloorState(userMessage: string): ShopfloorState {
  const messages: BaseMessage[] = [
    new HumanMessage(userMessage),
  ];
  return { messages };
}
