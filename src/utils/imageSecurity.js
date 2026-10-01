/**
 * NEON COACH - حماية الصور من النقر بالزر الأيمن (Right-Click) والسحب
 */

export function initImageProtectionGuard(rootElement = document) {
  if (!rootElement) return;

  // منع فتح القائمة السياقية (كليك يمين) على أي صورة أو حاوية وصفة
  const handleContextMenu = (e) => {
    if (
      e.target.tagName === 'IMG' ||
      e.target.closest('.recipe-dish-preview') ||
      e.target.closest('.recipe-modal-poster-wrap') ||
      e.target.closest('.recipe-card') ||
      e.target.closest('#recipe-detail-modal')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // منع سحب وإفلات الصور
  const handleDragStart = (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  };

  rootElement.addEventListener('contextmenu', handleContextMenu, true);
  rootElement.addEventListener('dragstart', handleDragStart, true);
  if (rootElement !== document) {
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);
  }
}

