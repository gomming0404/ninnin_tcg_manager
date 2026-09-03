(() => {
  const PRESETS = ['번개장터', '당근마켓', '직뽑'];
  const originalShowModal = showModal;

  function applyPurchaseSourceField(data = {}) {
    const original = document.querySelector('input[name="purchaseSource"]');
    const field = original?.closest('.field');
    if (!field) return;

    const current = data.purchaseSource || original.value || '';
    const isPreset = PRESETS.includes(current);
    field.innerHTML = `
      <label>구입처 / 플랫폼</label>
      <select id="purchase-source-preset" name="purchaseSourcePreset">
        <option value="번개장터" ${current === '번개장터' ? 'selected' : ''}>번개장터</option>
        <option value="당근마켓" ${current === '당근마켓' ? 'selected' : ''}>당근마켓</option>
        <option value="직뽑" ${current === '직뽑' ? 'selected' : ''}>직뽑</option>
        <option value="직접입력" ${!isPreset && current ? 'selected' : ''}>직접입력</option>
      </select>
      <input id="purchase-source-custom" type="text" placeholder="구입처를 입력하세요" value="${!isPreset ? current : ''}" style="margin-top:8px;display:${!isPreset && current ? 'block' : 'none'}" />
      <input id="purchase-source-value" type="hidden" name="purchaseSource" value="${current || '번개장터'}" />
    `;

    const preset = field.querySelector('#purchase-source-preset');
    const custom = field.querySelector('#purchase-source-custom');
    const hidden = field.querySelector('#purchase-source-value');

    function sync() {
      if (preset.value === '직접입력') {
        custom.style.display = 'block';
        hidden.value = custom.value.trim();
      } else {
        custom.style.display = 'none';
        hidden.value = preset.value;
      }
    }

    preset.addEventListener('change', sync);
    custom.addEventListener('input', sync);
    sync();
  }

  showModal = function(kind, data = {}) {
    originalShowModal(kind, data);
    if (kind === 'card') applyPurchaseSourceField(data);
  };

  document.querySelector('#modal-form')?.addEventListener('submit', () => {
    const preset = document.querySelector('#purchase-source-preset');
    const custom = document.querySelector('#purchase-source-custom');
    const hidden = document.querySelector('#purchase-source-value');
    if (!preset || !hidden) return;
    hidden.value = preset.value === '직접입력' ? (custom?.value.trim() || '') : preset.value;
  }, true);
})();
