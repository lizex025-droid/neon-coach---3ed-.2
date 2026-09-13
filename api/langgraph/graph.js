import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { defaultCheckpointer } from './checkpointer.js';

import { authenticateNode } from './nodes/authenticate.js';
import { normalizeInputNode } from './nodes/normalizeInput.js';
import { loadContextNode } from './nodes/loadContext.js';
import { understandRequestNode } from './nodes/understandRequest.js';
import { resolveEntitiesNode } from './nodes/resolveEntities.js';
import { validateActionNode } from './nodes/validateAction.js';
import { executeToolsNode } from './nodes/executeTools.js';
import { readResultsNode } from './nodes/readResults.js';
import { composeResponseNode } from './nodes/composeResponse.js';
import { persistConversationNode } from './nodes/persistConversation.js';

export function buildNeonGraph(checkpointer = defaultCheckpointer) {
  const workflow = new StateGraph(AgentState)
    .addNode('authenticate', authenticateNode)
    .addNode('normalizeInput', normalizeInputNode)
    .addNode('loadContext', loadContextNode)
    .addNode('understandRequest', understandRequestNode)
    .addNode('resolveEntities', resolveEntitiesNode)
    .addNode('validateAction', validateActionNode)
    .addNode('executeTools', executeToolsNode)
    .addNode('readResults', readResultsNode)
    .addNode('composeResponse', composeResponseNode)
    .addNode('persistConversation', persistConversationNode)

    .addEdge(START, 'authenticate')
    .addEdge('authenticate', 'normalizeInput')
    .addEdge('normalizeInput', 'loadContext')
    .addEdge('loadContext', 'understandRequest')

    .addConditionalEdges('understandRequest', (state) => {
      if (state.isIdempotentReplay || (state.errors && state.errors.length > 0)) {
        return 'composeResponse';
      }
      if (state.finalResponse || state.pendingClarification) {
        return 'composeResponse';
      }
      if (state.intent === 'query') {
        if (state.plannedActions && state.plannedActions.length > 0) {
          return 'executeTools';
        }
        return 'readResults';
      }
      if (state.plannedActions && state.plannedActions.length > 0) {
        return 'resolveEntities';
      }
      return 'composeResponse';
    })

    .addEdge('resolveEntities', 'validateAction')

    .addConditionalEdges('validateAction', (state) => {
      if (state.errors && state.errors.length > 0) {
        return 'composeResponse';
      }
      return 'executeTools';
    })

    .addEdge('executeTools', 'readResults')
    .addEdge('readResults', 'composeResponse')
    .addEdge('composeResponse', 'persistConversation')
    .addEdge('persistConversation', END);

  return workflow.compile({ checkpointer });
}

export const neonGraph = buildNeonGraph();

export async function executeLangGraphAgent({
  requestId,
  threadId = 'default_thread',
  userId = 'local_user',
  message = '',
  context = {},
  timezone = 'Asia/Amman'
} = {}, checkpointer = defaultCheckpointer) {
  const activeGraph = checkpointer === defaultCheckpointer ? neonGraph : buildNeonGraph(checkpointer);
  const config = {
    configurable: {
      thread_id: threadId,
      checkpointer
    },
    recursionLimit: 25
  };

  const initialInput = {
    requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    threadId,
    userId,
    originalText: message,
    clientState: context || {},
    timezone,
    finalResponse: null,
    toolResults: [],
    plannedActions: [],
    errors: [],
    intent: 'unknown',
    isIdempotentReplay: false
  };

  const outputState = await activeGraph.invoke(initialInput, config);
  return outputState.finalResponse;
}
