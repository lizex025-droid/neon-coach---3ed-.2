export function renderMeasurementPicker(id, label, unit, value, min, max, step = 1) {
  const initial = Math.max(min, Math.min(max, Number(value)));
  const count = Math.round((max - min) / step);
  return `<section class="measurement-picker">
    <label for="${id}">${label}</label>
    <div class="measurement-value"><input id="${id}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" value="${initial}" aria-label="${label}"><span>${unit}</span></div>
    <div class="measurement-ruler"><div class="ruler-track" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${initial}" data-input="${id}" data-min="${min}" data-step="${step}">
      ${Array.from({ length: count + 1 }, (_, i) => `<span class="ruler-tick ${i % 10 === 0 ? 'major' : ''}" aria-hidden="true">${i % 10 === 0 ? `<b>${Number((min + i * step).toFixed(1))}</b>` : ''}</span>`).join('')}
    </div><span class="ruler-marker" aria-hidden="true"></span></div>
    <p class="ruler-hint">اسحب يميناً أو يساراً، أو اكتب القيمة</p>
  </section>`;
}

export function bindMeasurementPickers(root = document) {
  root.querySelectorAll('.ruler-track').forEach(track => {
    const input = document.getElementById(track.dataset.input);
    const min = Number(input.min), max = Number(input.max), step = Number(input.step);
    const normalize = value => Math.max(min, Math.min(max, Math.round((value - min) / step) * step + min));
    const scrollToValue = () => {
      if (input.value === '' || !Number.isFinite(input.valueAsNumber)) return;
      const value = normalize(input.valueAsNumber);
      track.scrollLeft = ((value - min) / step) * 16;
      track.setAttribute('aria-valuenow', value);
    };
    track.addEventListener('scroll', () => {
      const value = Number(normalize(min + (track.scrollLeft / 16) * step).toFixed(1));
      input.value = value;
      track.setAttribute('aria-valuenow', value);
    }, { passive: true });
    input.addEventListener('change', scrollToValue);
    track.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      input.value = event.key === 'Home' ? min : event.key === 'End' ? max : normalize(Number(input.value) + (event.key === 'ArrowRight' ? step : -step));
      scrollToValue();
    });
    let drag;
    track.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse') return;
      drag = { x: event.clientX, offset: track.scrollLeft };
      track.setPointerCapture(event.pointerId);
      track.style.scrollSnapType = 'none';
    });
    track.addEventListener('pointermove', event => { if (drag) track.scrollLeft = drag.offset + drag.x - event.clientX; });
    const endDrag = () => { drag = null; track.style.scrollSnapType = ''; };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    requestAnimationFrame(() => { if (track.isConnected) scrollToValue(); });
  });
}
