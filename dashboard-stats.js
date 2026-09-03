(() => {
  function txNet(x) {
    const expenses = num(x.fee) + num(x.shipping) + num(x.otherCost);
    return x.type === '매도' ? num(x.amount) - expenses : -(num(x.amount) + expenses);
  }

  function stats(values, total, count) {
    if (!count) return { avg: 0, min: 0, max: 0 };
    return {
      avg: total / count,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0
    };
  }

  function setStats(metricId, values, total, count) {
    const valueEl = document.querySelector(metricId);
    const card = valueEl?.closest('.metric-card');
    if (!card) return;
    let el = card.querySelector('.metric-stats');
    if (!el) {
      el = document.createElement('div');
      el.className = 'metric-stats';
      card.appendChild(el);
    }
    const s = stats(values, total, count);
    el.innerHTML = `<span>평균 <b>${money(Math.round(s.avg))}</b></span><span>최소 <b>${money(s.min)}</b></span><span>최대 <b>${money(s.max)}</b></span>`;
  }

  async function updateDashboardStats() {
    if (!db) return;
    const cards = await all('cards');
    const tx = await all('transactions');
    const count = cards.length;

    const values = cards.map(c => num(c.marketPrice));
    const costs = cards.map(c => cardCost(c));
    const pls = cards.map(c => num(c.marketPrice) - cardCost(c));

    const cashByCard = new Map(cards.map(c => [c.id, 0]));
    let totalCash = 0;
    tx.forEach(x => {
      const net = txNet(x);
      totalCash += net;
      if (cashByCard.has(x.cardId)) cashByCard.set(x.cardId, cashByCard.get(x.cardId) + net);
    });
    const cashValues = cards.map(c => cashByCard.get(c.id) || 0);

    const totalValue = values.reduce((a, v) => a + v, 0);
    const totalCost = costs.reduce((a, v) => a + v, 0);
    const totalPl = pls.reduce((a, v) => a + v, 0);

    setStats('#m-value', values, totalValue, count);
    setStats('#m-cost', costs, totalCost, count);
    setStats('#m-pl', pls, totalPl, count);
    setStats('#m-cash', cashValues, totalCash, count);
  }

  const style = document.createElement('style');
  style.id = 'dashboard-stats-style';
  style.textContent = `
    .metric-stats{margin-top:12px;padding-top:10px;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr;gap:4px;font-size:11px;color:var(--muted)}
    .metric-stats span{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .metric-stats b{font-weight:700;color:var(--text);white-space:nowrap}
    @media(max-width:520px){.metric-stats{font-size:10px;gap:3px}.metric-stats b{font-size:10px}}
  `;
  document.head.appendChild(style);

  const originalRenderAll = renderAll;
  renderAll = async function(...args) {
    const result = await originalRenderAll.apply(this, args);
    await updateDashboardStats();
    return result;
  };

  setTimeout(() => updateDashboardStats().catch(console.error), 0);
})();
