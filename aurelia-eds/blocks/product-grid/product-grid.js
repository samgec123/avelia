/**
 * Product Grid block — fetches /products.json and renders a responsive grid.
 *
 * Variants: product-grid--sale, product-grid--new, product-grid--category
 * Block metadata row (optional last row):
 *   category: m-tops | w-dresses | etc.
 *   max: 8
 */
import { getMetadata } from '../../scripts/aem.js';

function pushProductClick(product, position, listName) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: 'product click',
    ecommerce: {
      click: {
        actionField: { list: listName },
        products: [{
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          position,
        }],
      },
    },
  });
}

function renderCard(p, index, listName) {
  const tagClass = p.tag ? `tag-${p.tag}` : '';
  const priceHTML = p.listPrice && p.listPrice > p.price
    ? `<span class="old">$${p.listPrice}</span><span class="new">$${p.price}</span>`
    : `$${p.price}`;

  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.pid = p.id;
  card.dataset.index = index;
  card.innerHTML = `
    <div class="product-image ${p.gradient || 'pg-2'} ${tagClass}" data-label="${p.color || ''}"></div>
    <div class="product-name">${p.name}</div>
    <div class="product-meta">${capitalize(p.subcategory)} · ${capitalize(p.color)}</div>
    <div class="product-price">${priceHTML}</div>`;

  card.addEventListener('click', () => {
    pushProductClick(p, index + 1, listName);
    window.location.href = `/product?id=${p.id}&cat=${p.category || ''}`;
  });
  return card;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function readConfig(block) {
  const config = {};
  const lastRow = block.lastElementChild;
  if (lastRow?.children.length === 2 && lastRow.children[0].textContent?.trim().toLowerCase() === 'config') {
    lastRow.querySelectorAll(':scope > div').forEach((cell, i) => {
      if (i === 1) {
        cell.textContent.split('\n').forEach((line) => {
          const [k, v] = line.split(':').map((s) => s.trim());
          if (k && v) config[k] = v;
        });
      }
    });
    lastRow.remove();
  }
  return config;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const categoryFilter = config.category || getMetadata('product-category') || '';
  const max = parseInt(config.max || '12', 10);
  const isSale = block.classList.contains('product-grid--sale');
  const isNew = block.classList.contains('product-grid--new');

  block.innerHTML = '<div class="product-grid-loading">Loading products…</div>';

  let products = [];
  try {
    const resp = await fetch('/products.json');
    if (resp.ok) {
      const json = await resp.json();
      products = json.data || json;
    }
  } catch (e) {
    block.innerHTML = '<p>Products unavailable.</p>';
    return;
  }

  if (categoryFilter) {
    products = products.filter((p) => p.category === categoryFilter || p.subcategory === categoryFilter);
  }
  if (isSale) products = products.filter((p) => p.tag === 'sale');
  if (isNew) products = products.filter((p) => p.tag === 'new');
  products = products.slice(0, max);

  const listName = categoryFilter || (isSale ? 'sale' : 'all-products');
  const grid = document.createElement('div');
  grid.className = 'product-grid';
  products.forEach((p, i) => grid.append(renderCard(p, i, listName)));

  block.innerHTML = '';
  block.append(grid);
}
