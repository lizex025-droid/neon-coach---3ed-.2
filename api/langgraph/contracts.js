import { z } from 'zod';

export const limits = Object.freeze({ message: 4000, actions: 6, iterations: 24, durationMs: 45000, providerMs: 25000, retries: 0 });
export const commandSchema = z.object({
  requestId: z.uuid(), threadId: z.uuid(), text: z.string().trim().max(limits.message).default(''),
  inputSource: z.enum(['text', 'voice']).default('text'),
  clarificationId: z.uuid().optional(),
  confirmation: z.object({ pendingId: z.uuid(), accept: z.boolean(), mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).optional() }).strict().optional(),
  restore: z.boolean().optional()
}).strict().refine(v => v.text || v.confirmation || v.restore, 'A message is required');

export class AgentError extends Error {
  constructor(code, message, stage = 'validation', httpStatus = 400) { super(message); Object.assign(this, { code, stage, httpStatus }); }
}
export function publicError(err, stage = 'execution') {
  return err instanceof AgentError ? { code: err.code, message: err.message, stage: err.stage } :
    { code: 'REQUEST_FAILED', message: 'تعذر إكمال الطلب. لم يتم تأكيد الحفظ. أعد المحاولة بنفس الطلب.', stage };
}
export function normalizeInput(text) {
  return text.normalize('NFKC').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g, '.').replace(/(\d),(?=\d{1,2}(?:\D|$))/g, '$1.').trim();
}
export function localDate(timezone, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function trace(request, stage) {
  if (process.env.NEON_TRACE === '1' && process.env.NODE_ENV !== 'production')
    console.info(JSON.stringify({ requestId: request.requestId, inputSource: request.inputSource, stage }));
}
