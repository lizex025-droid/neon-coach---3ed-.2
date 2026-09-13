import { defaultCheckpointer } from '../checkpointer.js';

export async function persistConversationNode(state, config) {
  const cp = config?.configurable?.checkpointer || defaultCheckpointer;
  const requestId = state.requestId;
  const finalResponse = state.finalResponse;

  if (requestId && finalResponse && finalResponse.status === 'success') {
    cp.saveIdempotentResponse(requestId, finalResponse);
  }

  return {
    messages: [
      ...(state.messages || []),
      { role: 'user', content: state.originalText },
      { role: 'assistant', content: finalResponse?.reply || '' }
    ]
  };
}
