import { syncService } from './syncService.js';
export function setupSyncStatus() {
  const banner = document.createElement('aside');
  banner.className = 'sync-status'; banner.hidden = true; banner.setAttribute('role', 'status');
  document.body.append(banner);
  const render = status => {
    banner.replaceChildren();
    banner.hidden = !['error', 'conflict', 'pending', 'saving'].includes(status);
    if (banner.hidden) return;
    banner.append(document.createTextNode(status === 'conflict' ? 'تغيرت بياناتك على جهاز آخر. احتفظ بنسخة من تعديلاتك ثم حمّل النسخة الأحدث.' : status === 'error' ? 'تعذر الحفظ السحابي. أبقِ الصفحة مفتوحة وأعد المحاولة.' : 'جاري حفظ التعديلات…'));
    if (status === 'error' || status === 'conflict') {
      const backup = document.createElement('button'); backup.textContent = 'تنزيل نسخة من تعديلاتي';
      backup.onclick = () => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(syncService.snapshot(), null, 2)], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = 'neon-account-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }; banner.append(backup);
      const action = document.createElement('button'); action.textContent = status === 'conflict' ? 'تحميل بيانات الجهاز الآخر' : 'إعادة المحاولة';
      action.onclick = () => status === 'conflict' ? confirm('سيتم استبدال التعديلات غير المحفوظة. هل احتفظت بنسخة منها؟') && syncService.reloadRemote() : syncService.flush();
      banner.append(action);
    }
  };
  syncService.subscribe(render); render(syncService.status);
  window.addEventListener('online', () => syncService.flush());
  window.addEventListener('beforeunload', event => {
    if (syncService.dirty || syncService.inflight) { event.preventDefault(); event.returnValue = ''; }
  });
  document.addEventListener('click', async event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.target === '_blank' || anchor.hash && anchor.pathname === location.pathname) return;
    if (syncService.dirty || syncService.inflight) {
      event.preventDefault();
      if ((await syncService.flush()).success) location.href = anchor.href;
    }
  });
}
