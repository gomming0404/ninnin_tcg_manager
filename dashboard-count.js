(() => {
  breakdown = function(sel, cards, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    const counts = {};
    cards.forEach(c => {
      const label = c[key] || '미지정';
      counts[label] = (counts[label] || 0) + 1;
    });
    const total = cards.length || 1;
    el.innerHTML = Object.entries(counts).map(([k, v]) => {
      const pct = Math.round(v / total * 100);
      return `<div class="breakdown-row"><span>${k}</span><div class="bar"><i style="width:${pct}%"></i></div><strong>${pct}% (${v}EA)</strong></div>`;
    }).join('') || '<span class="empty">데이터 없음</span>';
  };

  const style = document.createElement('style');
  style.textContent = '.breakdown-row{grid-template-columns:110px 1fr minmax(90px,auto)}.breakdown-row strong{white-space:nowrap;text-align:right}@media(max-width:520px){.breakdown-row{grid-template-columns:80px 1fr minmax(82px,auto);gap:8px;font-size:12px}}';
  document.head.appendChild(style);

  setTimeout(() => {
    if (typeof renderAll === 'function') renderAll();
  }, 0);
})();
