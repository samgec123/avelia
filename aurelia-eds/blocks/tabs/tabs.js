/**
 * Tabs block — accessible tabbed content.
 * Row 0: tab labels (each cell = one tab label).
 * Rows 1-N: one row per tab panel content.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const labelRow = rows[0];
  const labels = [...labelRow.children].map((c) => c.textContent.trim());
  labelRow.remove();

  const tabList = document.createElement('div');
  tabList.className = 'tabs-list';
  tabList.setAttribute('role', 'tablist');

  const panels = [];

  rows.forEach((row, i) => {
    // Button
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-controls', `tab-panel-${i}`);
    btn.id = `tab-btn-${i}`;
    btn.textContent = labels[i] || `Tab ${i + 1}`;
    if (i === 0) btn.classList.add('active');
    tabList.append(btn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('id', `tab-panel-${i}`);
    panel.setAttribute('aria-labelledby', `tab-btn-${i}`);
    panel.hidden = i !== 0;
    panel.innerHTML = row.innerHTML;
    panels.push(panel);
  });

  // Keyboard navigation
  tabList.addEventListener('keydown', (e) => {
    const btns = [...tabList.querySelectorAll('.tab-btn')];
    const current = btns.indexOf(document.activeElement);
    if (e.key === 'ArrowRight') btns[(current + 1) % btns.length].focus();
    if (e.key === 'ArrowLeft') btns[(current - 1 + btns.length) % btns.length].focus();
  });

  tabList.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const idx = [...tabList.children].indexOf(btn);
    [...tabList.querySelectorAll('.tab-btn')].forEach((b, i) => {
      b.classList.toggle('active', i === idx);
      b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      panels[i].hidden = i !== idx;
    });
  });

  const container = document.createElement('div');
  container.className = 'tabs-container';
  container.append(tabList, ...panels);

  block.innerHTML = '';
  block.append(container);
}
