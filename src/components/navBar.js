/**
 * NEON COACH - شريط التنقل السفلي الثابت (Bottom Navigation Bar)
 * الترتيب الصارم من اليمين لليسار: اليوم، التغذية، التدريب، التقدم، حسابي
 */

export function renderBottomNav(currentRoute) {
  const tabs = [
    { id: 'today', hash: '#today', label: 'اليوم', icon: 'home' },
    { id: 'nutrition', hash: '#nutrition', label: 'التغذية', icon: 'nutrition' },
    { id: 'workout', hash: '#workout', label: 'التدريب', icon: 'dumbbell' },
    { id: 'progress', hash: '#progress', label: 'التقدم', icon: 'chart' },
    { id: 'profile', hash: '#profile', label: 'حسابي', icon: 'user' }
  ];

  return `
    <nav class="app-bottom-nav" aria-label="التنقل الرئيسي">
      <div class="nav-container">
        ${tabs.map(tab => {
          const isActive = currentRoute === tab.id || (tab.id === 'today' && (!currentRoute || currentRoute === ''));
          return `
            <a href="${tab.hash}" class="nav-item ${isActive ? 'active' : ''}" data-nav="${tab.id}">
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
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><path d="M10 2c1 .5 2 2 2 5"></path></svg>`;
    case 'dumbbell':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14M18 5v14M2 8v8M22 8v8M6 12h12M2 12h4M18 12h4"></path></svg>`;
    case 'chart':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
    case 'user':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    default:
      return '';
  }
}
