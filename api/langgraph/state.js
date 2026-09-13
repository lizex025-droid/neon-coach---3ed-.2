import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
  requestId: Annotation({ reducer: (_, b) => b, default: () => '' }),
  threadId: Annotation({ reducer: (_, b) => b, default: () => '' }),
  userId: Annotation({ reducer: (_, b) => b, default: () => 'local_user' }),
  messages: Annotation({ reducer: (a, b) => (Array.isArray(b) ? b : [...(a || []), b]), default: () => [] }),
  originalText: Annotation({ reducer: (_, b) => b, default: () => '' }),
  normalizedText: Annotation({ reducer: (_, b) => b, default: () => '' }),
  language: Annotation({ reducer: (_, b) => b, default: () => 'ar-JO' }),
  timezone: Annotation({ reducer: (_, b) => b, default: () => 'Asia/Amman' }),
  intent: Annotation({ reducer: (_, b) => b, default: () => 'unknown' }),
  entities: Annotation({ reducer: (a, b) => ({ ...(a || {}), ...(b || {}) }), default: () => ({}) }),
  plannedActions: Annotation({ reducer: (_, b) => b, default: () => [] }),
  pendingClarification: Annotation({ reducer: (_, b) => b, default: () => null }),
  toolResults: Annotation({ reducer: (_, b) => b, default: () => [] }),
  changedResources: Annotation({ reducer: (a, b) => Array.from(new Set([...(a || []), ...(b || [])])), default: () => [] }),
  clientState: Annotation({ reducer: (_, b) => b, default: () => ({}) }),
  finalResponse: Annotation({ reducer: (_, b) => b, default: () => null }),
  errors: Annotation({ reducer: (a, b) => (Array.isArray(b) ? b : [...(a || []), b]), default: () => [] }),
  iterationCount: Annotation({ reducer: (a, b) => (b != null ? b : (a || 0) + 1), default: () => 0 }),
  isIdempotentReplay: Annotation({ reducer: (_, b) => b, default: () => false })
});
