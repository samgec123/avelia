/**
 * Cards block — category duo-cards, article cards, store cards.
 *
 * Authoring rows (each row = one card):
 *   Col 1: image / picture
 *   Col 2: heading | description | link
 *
 * Variants:
 *   cards--category  → gradient duo/subcategory cards (no image, gradient bg)
 *   cards--article   → editorial / journal card grid
 *   cards--store     → store listing cards
 */
export default function decorate(block) {
  const isCategory = block.classList.contains('cards--category');
  const ul = document.createElement('ul');
  ul.className = 'cards-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'card';
    const cols = [...row.children];

    if (isCategory) {
      // Category cards: no image, col 0 = gradient class/style, col 1 = text
      const styleSrc = cols[0]?.textContent?.trim();
      if (styleSrc) li.style.background = styleSrc;
      const textCol = cols[1] || cols[0];
      if (textCol) {
        const inner = document.createElement('div');
        inner.className = 'card-inner';
        inner.innerHTML = textCol.innerHTML;
        // Wrap first link as button
        inner.querySelectorAll('p > a').forEach((a) => a.classList.add('btn', 'btn-light'));
        li.append(inner);
      }
    } else {
      // Standard card: image + text
      if (cols[0]) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-image';
        imgWrap.append(...cols[0].childNodes);
        li.append(imgWrap);
      }
      if (cols[1]) {
        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = cols[1].innerHTML;
        body.querySelectorAll('p > a').forEach((a) => a.classList.add('card-link'));
        li.append(body);
      }
    }

    // Wrap card in link if heading has an anchor
    const headLink = li.querySelector('h2 a, h3 a');
    if (headLink) {
      const wrapper = document.createElement('a');
      wrapper.href = headLink.href;
      wrapper.className = 'card-wrap';
      li.querySelectorAll(':scope > *').forEach((c) => wrapper.append(c));
      li.append(wrapper);
    }

    ul.append(li);
  });

  block.innerHTML = '';
  block.append(ul);
}
