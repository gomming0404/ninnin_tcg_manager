(() => {
  function findLinkedCardFromRow(row) {
    if (!row || !Array.isArray(window._cards)) return null;
    const cardCell = row.querySelector('td:nth-child(2)');
    const label = (cardCell?.textContent || '').trim();
    return window._cards.find(c => {
      const ownLabel = `${c.name || '이름 없음'}${c.cardNo ? ' · ' + c.cardNo : ''}`;
      return ownLabel === label;
    }) || null;
  }

  document.addEventListener('click', async (e) => {
    const link = e.target.closest('.auto-label');
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();

    const card = findLinkedCardFromRow(link.closest('tr'));
    if (!card) {
      alert('연결된 카드 정보를 찾을 수 없습니다.');
      return;
    }
    if (typeof showCardDetail === 'function') {
      await showCardDetail(card.id);
    }
  }, true);

  const style = document.createElement('style');
  style.textContent = `.auto-label{cursor:pointer;user-select:none}.auto-label:hover{filter:brightness(.96)}.auto-label:active{transform:translateY(1px)}`;
  document.head.appendChild(style);
})();
