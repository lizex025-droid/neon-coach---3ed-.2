/**
 * NEON COACH - شريط التنقل السفلي الثابت (Bottom Navigation Bar)
 * الترتيب الصارم من اليمين لليسار: اليوم، التغذية، التدريب، التقدم، حسابي
 */

export function renderBottomNav(currentRoute) {
  const tabs = [
    { id: 'today', hash: '#today', label: 'اليوم', icon: 'home' },
    { id: 'nutrition', hash: '#nutrition', label: 'التغذية', icon: 'nutrition' },
    { id: 'neon-ai', hash: '#neon-ai', label: 'neon ai', icon: 'ai' },
    { id: 'workout', hash: './40-days-workout.html?book=fortyDay', label: 'التدريب', icon: 'dumbbell' },
    { id: 'progress', hash: '#progress', label: 'التقدم', icon: 'chart' },
    { id: 'profile', hash: '#profile', label: 'حسابي', icon: 'user' }
  ];

  return `
    <nav class="app-bottom-nav" aria-label="التنقل الرئيسي">
      <div class="nav-container">
        ${tabs.map(tab => {
          const isActive = currentRoute === tab.id || (tab.id === 'today' && (!currentRoute || currentRoute === ''));
          return `
            <a href="${tab.hash}" class="nav-item ${isActive ? 'active' : ''} ${tab.id === 'neon-ai' ? 'nav-item-ai' : ''}" data-nav="${tab.id}">
              ${getNavIconSvg(tab.icon)}
              <span>${tab.label}</span>
            </a>
          `;
        }).join('')}
      </div>
    </nav>
  `;
}

function getNavIconSvg(iconName) {
  switch (iconName) {
    case 'home':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    case 'nutrition':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
    case 'ai':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path><circle cx="12" cy="12" r="2" fill="currentColor"></circle></svg>`;
    case 'dumbbell':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1a2 2 0 0 0-2.83 0l-2.5 2.5a2 2 0 0 1-2.83 0l-.17-.17a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 0 0-2.83l-1-1"></path><path d="m3 3 1 1a2 2 0 0 0 2.83 0l2.5-2.5a2 2 0 0 1 2.83 0l.17.17a2 2 0 0 1 0 2.83L9.83 7a2 2 0 0 0 0 2.83l1 1"></path></svg>`;
    case 'chart':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
    case 'user':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    default:
      return '';
  }
}
