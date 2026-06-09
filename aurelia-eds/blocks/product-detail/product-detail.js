/**
 * Product Detail block — PDP layout.
 * Resolves product from ?id= URL param, fetches /products.json.
 * Builds gallery + info panel with swatches, sizes, expandable details.
 */

const SIZE_MAP = {
  tops: ['XS', 'S', 'M', 'L', 'XL'],
  bottoms: ['28', '30', '32', '34', '36'],
  dresses: ['XS', 'S', 'M', 'L'],
  outerwear: ['XS', 'S', 'M', 'L', 'XL'],
  shoes: ['36', '37', '38', '39', '40', '41'],
  accessories: [],
};

function pushProductView(p) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: 'product view',
    ecommerce: {
      detail: {
        products: [{ id: p.id, name: p.name, price: p.price, category: p.category }],
      },
    },
  });
}

function buildGallery(p) {
  const gallery = document.createElement('div');
  gallery.className = 'pdp-gallery';
  gallery.innerHTML = `
    <div class="pdp-main ${p.gradient || 'pg-2'}"></div>
    <div class="pdp-thumbs">
      ${[1, 2, 3, 4].map((n) => `<div class="${p.gradient || 'pg-2'}" style="opacity:${1 - n * 0.15}"></div>`).join('')}
    </div>`;
  return gallery;
}

function buildInfo(p) {
  const info = document.createElement('div');
  info.className = 'pdp-info';

  const priceHTML = p.listPrice && p.listPrice > p.price
    ? `<span class="old">$${p.listPrice}</span> <span class="new">$${p.price}</span>`
    : `$${p.price}`;

  const sizes = SIZE_MAP[p.subcategory] || [];
  const sizePills = sizes.map((s, i) => `<button class="size-pill${i === 1 ? ' selected' : ''}">${s}</button>`).join('');

  info.innerHTML = `
    <p class="eyebrow">${capitalize(p.category)} · ${capitalize(p.subcategory)}</p>
    <h1>${p.name}</h1>
    <div class="pdp-price">${priceHTML}</div>
    <p class="pdp-desc">Crafted from premium ${p.material}. A considered essential, designed in Milan and made to last beyond the season.</p>
    ${sizes.length ? `
    <div class="pdp-option">
      <div class="pdp-option-label">Size</div>
      <div class="size-row">${sizePills}</div>
    </div>` : ''}
    <div class="pdp-option">
      <div class="pdp-option-label">Colour — <em>${capitalize(p.color)}</em></div>
      <div class="swatch-row">
        <span class="swatch selected" style="background:#${swatchColor(p.color)}" title="${p.color}"></span>
      </div>
    </div>
    <div class="pdp-actions">
      <button class="btn btn-accent" id="pdp-add-bag">Add to Bag</button>
      <button class="btn btn-ghost" id="pdp-wishlist">♡ Save</button>
    </div>
    <div class="pdp-details">
      <details open>
        <summary>Description</summary>
        <p>A refined piece from the AURELIA collection. Made from ${p.material} for lasting comfort and elevated style.</p>
      </details>
      <details>
        <summary>Fit & Sizing</summary>
        <p>True to size. Model is 178 cm and wears size ${sizes[1] || 'M'}.</p>
      </details>
      <details>
        <summary>Materials & Care</summary>
        <p>${capitalize(p.material)}. Dry clean or hand wash cold. Do not tumble dry.</p>
      </details>
      <details>
        <summary>Shipping & Returns</summary>
        <p>Complimentary shipping on orders over $150. Free returns within 30 days.</p>
      </details>
    </div>`;

  // Size selection
  info.querySelectorAll('.size-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      info.querySelectorAll('.size-pill').forEach((p2) => p2.classList.remove('selected'));
      pill.classList.add('selected');
    });
  });

  // Add to bag
  info.querySelector('#pdp-add-bag')?.addEventListener('click', () => {
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({ event: 'cart add', product: { id: p.id, name: p.name, price: p.price } });
    showToast(`${p.name} added to bag`);
  });

  return info;
}

function swatchColor(color) {
  const map = { white: 'FFFFF0', black: '1A1A1A', navy: '1B2A4A', cream: 'F5ECD5', ivory: 'FFFFF0', camel: 'C19A6B', cognac: '9A4B1F', stone: 'D9CAAA', sage: '8F9E7E', rust: 'B94A25', olive: '6B6C3A', grey: '8A8A8A', blue: '3B6EA5', chocolate: '4A2510', burgundy: '7C1D2C', gold: 'B89A5C', tan: 'D2B48C', brown: '8B5E3C', silver: 'A9A9A9', tortoise: '8B5E2C', natural: 'F5ECD5', khaki: 'C3B091', indigo: '4B5C78', white: 'FAFAFA' };
  return map[color] || 'CCCCCC';
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.append(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    block.innerHTML = '<p>Product not found.</p>';
    return;
  }

  block.innerHTML = '<div class="pdp-loading">Loading…</div>';

  let product;
  try {
    const resp = await fetch('/products.json');
    if (resp.ok) {
      const json = await resp.json();
      const all = json.data || json;
      product = all.find((p) => p.id === id);
    }
  } catch (e) { /* ignore */ }

  if (!product) {
    block.innerHTML = '<p>Product not found.</p>';
    return;
  }

  pushProductView(product);

  const pdp = document.createElement('div');
  pdp.className = 'pdp';
  pdp.append(buildGallery(product), buildInfo(product));

  block.innerHTML = '';
  block.append(pdp);
}
