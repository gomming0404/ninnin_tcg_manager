(() => {
  const MAX_IMAGES = 10;
  const MAX_EDGE = 1600;
  const JPEG_QUALITY = 0.84;
  let workingImages = [];

  const originalShowModal = showModal;
  const originalCardHtml = cardHtml;

  function normalizeImages(card = {}) {
    if (Array.isArray(card.images) && card.images.length) {
      return card.images.map((img, i) => ({
        id: img.id || uid(),
        data: img.data || img.src || '',
        name: img.name || `image-${i + 1}`,
        primary: !!img.primary
      })).filter(x => x.data);
    }
    if (card.image) {
      return [{ id: uid(), data: card.image, name: '기존 이미지', primary: true }];
    }
    return [];
  }

  function ensurePrimary(images) {
    if (!images.length) return images;
    if (!images.some(x => x.primary)) images[0].primary = true;
    let found = false;
    images.forEach(x => {
      if (x.primary && !found) found = true;
      else if (x.primary) x.primary = false;
    });
    return images;
  }

  function primaryImage(card) {
    const images = ensurePrimary(normalizeImages(card));
    return images.find(x => x.primary)?.data || images[0]?.data || card.image || '';
  }

  function imageManagerHtml() {
    return `
      <div class="field full multi-image-field">
        <label>카드 이미지 <span class="image-help">최대 ${MAX_IMAGES}장 · 대표 이미지 지정 가능</span></label>
        <label class="image-upload-btn">
          + 이미지 선택
          <input id="multi-card-images" type="file" accept="image/*" multiple hidden />
        </label>
        <div id="image-count" class="image-count"></div>
        <div id="image-preview-grid" class="image-preview-grid"></div>
      </div>`;
  }

  function renderImageManager() {
    ensurePrimary(workingImages);
    const count = document.querySelector('#image-count');
    const grid = document.querySelector('#image-preview-grid');
    if (!count || !grid) return;
    count.textContent = `${workingImages.length} / ${MAX_IMAGES}장`;
    grid.innerHTML = workingImages.map((img, idx) => `
      <div class="image-thumb ${img.primary ? 'is-primary' : ''}" data-image-id="${img.id}">
        <img src="${img.data}" alt="카드 이미지 ${idx + 1}" />
        <div class="image-thumb-meta">
          <button type="button" class="thumb-primary" data-set-primary="${img.id}">${img.primary ? '대표' : '대표로 지정'}</button>
          <button type="button" class="thumb-delete" data-remove-image="${img.id}">삭제</button>
        </div>
      </div>`).join('') || '<div class="image-empty">등록된 이미지가 없습니다.</div>';
  }

  async function compressImage(file) {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name}: 이미지 파일이 아닙니다.`);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`${file.name}: 이미지를 읽을 수 없습니다.`));
        img.src = url;
      });
      const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  showModal = function(kind, data = {}) {
    originalShowModal(kind, data);
    if (kind !== 'card') return;

    workingImages = ensurePrimary(normalizeImages(data));
    const legacyInput = document.querySelector('input[name="image"]');
    const legacyField = legacyInput?.closest('.field');
    if (legacyField) legacyField.outerHTML = imageManagerHtml();
    renderImageManager();

    const input = document.querySelector('#multi-card-images');
    input?.addEventListener('change', async (e) => {
      const files = [...e.target.files];
      const remaining = MAX_IMAGES - workingImages.length;
      if (remaining <= 0) {
        alert(`이미지는 카드당 최대 ${MAX_IMAGES}장까지 저장할 수 있습니다.`);
        e.target.value = '';
        return;
      }
      if (files.length > remaining) alert(`최대 ${MAX_IMAGES}장까지 가능하여 ${remaining}장만 추가합니다.`);
      const selected = files.slice(0, remaining);
      input.disabled = true;
      try {
        for (const file of selected) {
          const dataUrl = await compressImage(file);
          workingImages.push({ id: uid(), data: dataUrl, name: file.name, primary: workingImages.length === 0 });
        }
        ensurePrimary(workingImages);
        renderImageManager();
      } catch (err) {
        alert(err.message || '이미지 처리 중 오류가 발생했습니다.');
      } finally {
        input.disabled = false;
        input.value = '';
      }
    });
  };

  cardHtml = function(c) {
    const cost = +c.purchasePrice + (+c.extraCost || 0);
    const pl = +c.marketPrice - cost;
    const cls = pl >= 0 ? 'positive' : 'negative';
    const images = ensurePrimary(normalizeImages(c));
    const cover = primaryImage(c);
    return `<article class="tcg-card">
      <div class="card-image">
        ${cover ? `<img src="${cover}" alt="">` : 'NO IMAGE'}
        ${images.length > 1 ? `<span class="image-badge">${images.length}장</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-tags"><span class="tag">${c.tcg}</span><span class="tag">${c.language}</span><span class="tag">${c.form}${c.grade ? ' ' + c.grade : ''}</span><span class="tag">${c.purpose}</span></div>
        <h3>${c.name || '이름 없음'}</h3>
        <div class="card-no">${c.cardNo || '-'} · ${c.strategy || '-'}</div>
        <div class="money-row"><span>매입 ${money(cost)}</span><strong>${money(c.marketPrice)}</strong></div>
        <div class="money-row"><span>평가손익</span><strong class="${cls}">${pl >= 0 ? '+' : ''}${money(pl)}</strong></div>
        <div class="card-actions"><button data-edit-card="${c.id}">수정</button><button data-del-card="${c.id}" class="danger">삭제</button></div>
      </div>
    </article>`;
  };

  document.addEventListener('click', (e) => {
    const primary = e.target.closest('[data-set-primary]');
    if (primary) {
      e.preventDefault();
      const id = primary.dataset.setPrimary;
      workingImages.forEach(x => x.primary = x.id === id);
      renderImageManager();
      return;
    }
    const remove = e.target.closest('[data-remove-image]');
    if (remove) {
      e.preventDefault();
      const id = remove.dataset.removeImage;
      const wasPrimary = workingImages.find(x => x.id === id)?.primary;
      workingImages = workingImages.filter(x => x.id !== id);
      if (wasPrimary && workingImages.length) workingImages[0].primary = true;
      ensurePrimary(workingImages);
      renderImageManager();
    }
  });

  const form = document.querySelector('#modal-form');
  form.addEventListener('submit', async (e) => {
    if (currentModal?.kind !== 'card') return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const fd = new FormData(e.target);
    const o = Object.fromEntries(fd.entries());
    const data = currentModal.data || {};
    ['purchasePrice', 'extraCost', 'marketPrice', 'targetPrice'].forEach(k => o[k] = Number(o[k] || 0));
    o.id = data.id || uid();
    o.createdAt = data.createdAt || Date.now();
    o.images = ensurePrimary(workingImages).map(x => ({ ...x }));
    o.image = o.images.find(x => x.primary)?.data || o.images[0]?.data || '';

    await put('cards', o);
    document.querySelector('#modal').close();
    await renderAll();
  }, true);
})();
