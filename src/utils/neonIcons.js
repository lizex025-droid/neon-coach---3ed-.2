// One generated image atlas shared by all app screens and standalone tools.
const groups = [
  ['🔥⚡🌡️☀️', 'طاقة'], ['🏋️💪🏃🚴🤸🦵🏆🥇', 'تدريب'], ['📅📆🗓️📋🗒️📚📖📄📑📝', 'سجل'], ['🔔📣📢', 'تنبيه'],
  ['✏️🖊️🖋️🔧⚙️🛠️', 'تعديل'], ['✅✔️☑️💚👍🎉🎊🙌', 'تم'], ['💧💦🌊🚰🥤', 'ماء'], ['🍽️🍴🍗🍖🥩🥚🍳🐟🍣🍤🥦🥬🥕🥗🍎🍏🍌🍓🍞🥖🥐🧀🥛☕🍵🥜🌰🥑🫒🍚🍝🍕🍔🛒🧂🍯', 'تغذية'],
  ['📊📈📉⚖️📏🔢🔬🧬', 'قياسات'], ['🎯🚀🏁', 'هدف'], ['⏱️⏰⌚🕒⏳⌛🛌😴🌙', 'وقت'], ['💡✨⭐🌟🤖🧠💬🗨️💭🔍🔎🌐', 'معلومة'],
  ['🛡️🔒🔐🔑💊🩺❤️🫀🦴🩹💉🏥', 'صحة وحماية'], ['📸📷🖼️🎥📹👁️', 'صورة'], ['👤👥🧑👨👩👦👧👋🙂😊😎🐈🐱🏠🏡', 'حساب'], ['⚠️❌❗‼️🚫🛑❓❔', 'تنبيه']
];
const emojiPattern = /(?:\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*)/gu;
const clean = text => text.replace(emojiPattern, '').trim();
function replaceNode(node) {
  const parent = node.parentElement;
  if (!parent || parent.closest('script,style,textarea,svg,code,pre,[contenteditable],.neon-image-icon')) return;
  const matches = [...node.textContent.matchAll(emojiPattern)];
  if (!matches.length) return;
  if (parent.closest('option,title')) { node.textContent = clean(node.textContent); return; }
  const fragment = document.createDocumentFragment();
  let offset = 0;
  for (const match of matches) {
    fragment.append(document.createTextNode(node.textContent.slice(offset, match.index)));
    const index = Math.max(0, groups.findIndex(([symbols]) => symbols.includes([...match[0]][0])));
    const icon = document.createElement('span');
    icon.className = 'neon-image-icon';
    icon.style.backgroundPosition = `${(index % 4) * 100 / 3}% ${Math.floor(index / 4) * 100 / 3}%`;
    icon.setAttribute('aria-hidden', 'true');
    const button = parent.closest('button,a');
    if (button && !clean(button.textContent) && !button.getAttribute('aria-label')) button.setAttribute('aria-label', groups[index][1]);
    fragment.append(icon);
    offset = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(node.textContent.slice(offset)));
  node.replaceWith(fragment);
}
export function installNeonIcons() {
  if (document.documentElement.dataset.neonIcons) return;
  document.documentElement.dataset.neonIcons = 'true';
  const scan = root => {
    if (root.nodeType === Node.TEXT_NODE) { replaceNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceNode);
    root.querySelectorAll('[placeholder]').forEach(el => el.placeholder = clean(el.placeholder));
  };
  scan(document.body);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') scan(record.target);
      else record.addedNodes.forEach(scan);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}
