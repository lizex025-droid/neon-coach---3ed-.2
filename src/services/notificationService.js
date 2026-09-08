/**
 * NEON COACH - خدمة التنبيهات والإشعارات
 */

export const notificationService = {
  isSupported() {
    return 'Notification' in window;
  },

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    return await Notification.requestPermission();
  },

  showNotification(title, body) {
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: './icons/icon-192.svg',
          badge: './icons/icon-192.svg',
          dir: 'rtl',
          lang: 'ar'
        });
        return;
      } catch (e) {
        // إذا كان التنفيذ على الموبايل يحتاج ServiceWorkerRegistration
        navigator.serviceWorker?.ready?.then(reg => {
          reg.showNotification(title, {
            body,
            icon: './icons/icon-192.svg',
            badge: './icons/icon-192.svg',
            dir: 'rtl',
            lang: 'ar'
          });
        });
      }
    }

    // بديل داخل التطبيق عبر Toast
    this.showToast(body || title);
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✨'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};
