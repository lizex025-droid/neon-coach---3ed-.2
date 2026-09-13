import { handleAiRequest } from './ai.js';

// Backward-compatible alias for older clients that still call /api/gemini.
export default function handler(req, res) {
  return handleAiRequest(req, res, { forcedProvider: 'gemini' });
}
