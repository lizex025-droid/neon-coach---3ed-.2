// Auxiliary feature data is kept in memory until a verified account is selected.
// Supabase persists its own session separately; passwords are never stored here.
let owner = null;
let values = {};
let onChange = () => {};
export const accountStorage = {
  get length() { return Object.keys(values).length; },
  key(index) { return Object.keys(values)[index] ?? null; },
  getItem(key) { return values[key] ?? null; },
  setItem(key, value) {
    if (!owner || /api[_-]?key|token|password|^sb-/i.test(key)) return;
    values[key] = String(value);
    onChange();
  },
  removeItem(key) { delete values[key]; onChange(); },
  clear() { values = {}; onChange(); },
};
export function selectStorageAccount(id, data = {}) {
  owner = id;
  values = Object.fromEntries(Object.entries(data).filter(([key, value]) =>
    typeof value === 'string' && !/api[_-]?key|token|password|^sb-|__proto__|constructor|prototype/i.test(key)));
}
export function exportAccountStorage() { return { ...values }; }
export function onAccountStorageChange(callback) { onChange = callback; }
