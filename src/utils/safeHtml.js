import DOMPurify from 'dompurify';
// All HTML rendering in this legacy, string-template application uses this sink.
// Event listeners are attached in JS; HTML event attributes and script URLs are removed.
export function installSafeHTML() {
  if (typeof Element === 'undefined' || Element.prototype.__neonSafeHTML) return;
  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const sanitize = value => DOMPurify.sanitize(String(value ?? ''), {
    ADD_TAGS: ['iframe'], ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'meta'],
  });
  DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName === 'IFRAME') {
      try {
        const url = new URL(node.getAttribute('src'), location.origin);
        if (url.origin !== location.origin && !['https://www.youtube.com', 'https://www.youtube-nocookie.com'].includes(url.origin)) node.remove();
        else { node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation'); node.setAttribute('referrerpolicy', 'no-referrer'); }
      } catch { node.remove(); }
    }
    if (node.getAttribute?.('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
  });
  Object.defineProperty(Element.prototype, 'innerHTML', { ...descriptor, set(value) { descriptor.set.call(this, sanitize(value)); } });
  const adjacent = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function(position, value) { return adjacent.call(this, position, sanitize(value)); };
  Object.defineProperty(Element.prototype, '__neonSafeHTML', { value: true });
}
