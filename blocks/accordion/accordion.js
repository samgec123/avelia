/**
 * Accordion block — expandable FAQ / details.
 * Each row: Col 0 = question/title, Col 1 = answer content.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [questionCol, answerCol] = [...row.children];
    if (!questionCol) return;

    const item = document.createElement('div');
    item.className = 'accordion-item';

    const btn = document.createElement('button');
    btn.className = 'accordion-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span>${questionCol.textContent.trim()}</span><span class="accordion-icon" aria-hidden="true"></span>`;

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.hidden = true;
    if (answerCol) panel.innerHTML = answerCol.innerHTML;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      panel.hidden = expanded;
    });

    item.append(btn, panel);
    row.replaceWith(item);
  });
}
