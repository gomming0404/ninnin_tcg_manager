(() => {
  let overlay = null;
  let img = null;
  let scale = 1;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let startScale = 1;
  let startDistance = 0;
  let moved = false;
  const pointers = new Map();

  function ensureStyles() {
    if (document.querySelector('#image-viewer-style')) return;
    const style = document.createElement('style');
    style.id = 'image-viewer-style';
    style.textContent = `
      dialog.tcg-image-viewer{position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:rgba(0,0,0,.96);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      dialog.tcg-image-viewer::backdrop{background:rgba(0,0,0,.96)}
      .tcg-image-viewer .viewer-stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none}
      .tcg-image-viewer img{max-width:96vw;max-height:94dvh;object-fit:contain;transform-origin:center center;will-change:transform;touch-action:none;-webkit-user-drag:none}
      .tcg-image-viewer .viewer-hint{position:absolute;z-index:2;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:12px;white-space:nowrap;pointer-events:none;transition:opacity .3s}
      .tcg-image-viewer.zoomed .viewer-hint{opacity:0}
    `;
    document.head.appendChild(style);
  }

  function applyTransform() {
    if (!img) return;
    scale = Math.max(1, Math.min(6, scale));
    if (scale === 1) { x = 0; y = 0; }
    img.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    overlay?.classList.toggle('zoomed', scale > 1.02);
  }

  function closeViewer() {
    if (overlay) {
      try { if (overlay.open) overlay.close(); } catch (_) {}
      overlay.remove();
    }
    overlay = null;
    img = null;
    pointers.clear();
    scale = 1; x = 0; y = 0;
  }

  function distance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function openViewer(src, alt = '카드 이미지') {
    if (!src) return;
    closeViewer();
    ensureStyles();

    // A modal <dialog> is used intentionally. The card detail itself is also a
    // modal dialog, and ordinary fixed/z-index elements render below the top layer.
    // Calling showModal() here places the image viewer above the detail dialog.
    overlay = document.createElement('dialog');
    overlay.className = 'tcg-image-viewer';
    overlay.innerHTML = `<div class="viewer-stage"><img src="${src}" alt="${alt}"></div><div class="viewer-hint">한 번 더 누르면 닫기 · 두 손가락으로 확대</div>`;
    document.body.appendChild(overlay);
    overlay.showModal();

    const stage = overlay.querySelector('.viewer-stage');
    img = overlay.querySelector('img');
    scale = 1; x = 0; y = 0; moved = false;
    applyTransform();

    stage.addEventListener('pointerdown', e => {
      e.preventDefault();
      stage.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, e);
      moved = false;
      if (pointers.size === 1) {
        startX = e.clientX - x;
        startY = e.clientY - y;
      } else if (pointers.size === 2) {
        const pts = [...pointers.values()];
        startDistance = distance(pts[0], pts[1]);
        startScale = scale;
      }
    });

    stage.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      if (Math.hypot(e.clientX - prev.clientX, e.clientY - prev.clientY) > 2) moved = true;
      pointers.set(e.pointerId, e);
      if (pointers.size === 2) {
        const pts = [...pointers.values()];
        const d = distance(pts[0], pts[1]);
        if (startDistance > 0) scale = startScale * (d / startDistance);
        applyTransform();
      } else if (pointers.size === 1 && scale > 1) {
        x = e.clientX - startX;
        y = e.clientY - startY;
        applyTransform();
      }
    });

    const finishPointer = e => {
      pointers.delete(e.pointerId);
      if (pointers.size === 1) {
        const p = [...pointers.values()][0];
        startX = p.clientX - x;
        startY = p.clientY - y;
      }
    };
    stage.addEventListener('pointerup', finishPointer);
    stage.addEventListener('pointercancel', finishPointer);

    stage.addEventListener('click', () => {
      if (moved) { moved = false; return; }
      closeViewer();
    });

    stage.addEventListener('wheel', e => {
      e.preventDefault();
      scale *= e.deltaY < 0 ? 1.15 : 0.87;
      applyTransform();
    }, { passive: false });

    overlay.addEventListener('cancel', e => {
      e.preventDefault();
      closeViewer();
    });
  }

  document.addEventListener('click', e => {
    const thumb = e.target.closest('[data-detail-img]');
    if (!thumb) return;
    e.preventDefault();
    e.stopPropagation();
    const image = thumb.querySelector('img');
    if (image?.src) openViewer(image.src, image.alt || '카드 이미지');
  });
})();
