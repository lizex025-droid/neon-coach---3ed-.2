/**
 * NEON COACH - محرك النقاط والجسيمات النيونية الطائرة (Floating Cyber Particles)
 * يرسم نقاطاً وجسيمات نيونية خضراء متوهجة تطير بسلاسة في خلفية كافة الشاشات
 */

export function initNeonParticles(canvasId = 'neon-particles-canvas') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0.92;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // كثافة الجسيمات حسب مساحة الشاشة
  const particleCount = Math.max(40, Math.min(85, Math.floor(width / 16)));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const baseRadius = Math.random() * 2.2 + 0.9;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: baseRadius,
      baseAlpha: Math.random() * 0.45 + 0.35,
      alpha: 0.5,
      pulseSpeed: Math.random() * 0.025 + 0.012,
      pulseVal: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(Math.random() * 0.65 + 0.3), // تصاعد للأعلى بلطف
      glow: Math.random() * 10 + 5
    });
  }

  let animId = null;
  let isRunning = true;

  function render() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // تحريك الجسيم للأعلى وتمايل جانبي خفيف
      p.y += p.vy;
      p.x += p.vx;
      p.pulseVal += p.pulseSpeed;

      // وميض نيون ناعم
      p.alpha = p.baseAlpha + Math.sin(p.pulseVal) * 0.28;
      const currentAlpha = Math.max(0.12, Math.min(0.95, p.alpha));

      // التدوير عند الخروج من حدود الشاشة
      if (p.y < -15) {
        p.y = height + 15;
        p.x = Math.random() * width;
      }
      if (p.x < -15) p.x = width + 15;
      if (p.x > width + 15) p.x = -15;

      // رسم النقطة النيونية الخضراء المشعة
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.shadowBlur = p.glow;
      ctx.shadowColor = '#55F7A5';
      ctx.fillStyle = `rgba(85, 247, 165, ${currentAlpha.toFixed(3)})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(render);
  }

  render();

  // إيقاف واستئناف الأنيميشن لتوفير الطاقة عند عدم تركيز التاب
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
    } else {
      if (!isRunning) {
        isRunning = true;
        render();
      }
    }
  });

  return {
    destroy: () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
