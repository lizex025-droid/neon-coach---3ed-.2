import { defaultCheckpointer } from '../checkpointer.js';

export async function authenticateNode(state, config) {
  const cp = config?.configurable?.checkpointer || defaultCheckpointer;
  const userId = state.userId || 'local_user';
  const threadId = state.threadId || 'default_thread';
  const requestId = state.requestId;

  // 1. Check idempotency first
  if (requestId) {
    const cached = cp.getIdempotentResponse(requestId);
    if (cached) {
      return {
        isIdempotentReplay: true,
        finalResponse: cached
      };
    }
  }

  // 2. Check thread ownership (multi-tenant security)
  const isOwner = cp.verifyThreadOwnership(threadId, userId);
  if (!isOwner) {
    const err = `غير مصرح: هذه المحادثة تابعة لمستخدم آخر.`;
    return {
      errors: [err],
      finalResponse: {
        requestId,
        threadId,
        status: 'error',
        error: err,
        reply: err,
        actions: [],
        results: [],
        cards: []
      }
    };
  }

  // 3. Register thread ownership
  cp.registerThread(threadId, userId);

  return {
    userId,
    threadId,
    finalResponse: null,
    toolResults: [],
    plannedActions: [],
    errors: [],
    intent: 'unknown',
    isIdempotentReplay: false
  };
}
