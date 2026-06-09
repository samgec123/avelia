/**
 * Hero block — supports full-viewport and split (cat-hero) layouts.
 *
 * Authoring table structure:
 *   Row 1: image / picture
 *   Row 2: eyebrow text | heading | body | CTA links
 *
 * Variants (add as extra class on block):
 *   hero--full   → full-bleed landing hero
 *   hero--split  → image left, text right (category hero)
 *   hero--cat    → centred category hero (no image)
 *   hero--error  → 404 variant
 */
export default function decorate(block) {
  const rows = [...block.children];
  let imageEl = null;
  let textEl = null;

  if (rows.length === 1) {
    // Single-row: text-only cat hero
    textEl = rows[0].firstElementChild;
  } else {
    imageEl = rows[0]?.firstElementChild;
    textEl = rows[1]?.firstElementChild;
  }

  // Rebuild block DOM
  block.innerHTML = '';

  if (imageEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'hero-image';
    imgWrap.append(imageEl);
    block.append(imgWrap);
  }

  if (textEl) {
    const inner = document.createElement('div');
    inner.className = 'hero-inner';

    // Convert first <p> without block-level content to eyebrow
    const firstP = textEl.querySelector('p');
    if (firstP && !firstP.querySelector('a, strong')) {
      firstP.className = 'hero-eyebrow';
    }

    // Wrap CTA links as buttons
    textEl.querySelectorAll('p > a').forEach((a, i) => {
      a.classList.add('btn');
      if (i === 0) a.classList.add('btn-light');
      if (i === 1) a.classList.add('btn-ghost');
    });

    inner.append(textEl);
    block.append(inner);
  }
}
