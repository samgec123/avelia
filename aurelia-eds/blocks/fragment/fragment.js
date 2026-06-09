/**
 * Fragment block — fetches an HTML page and inserts its <main> content.
 * Used for shared includes (nav, footer, reusable content sections).
 */
import { decorateMain, loadBlocks } from '../../scripts/aem.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  if (!link) return;

  const path = link.getAttribute('href');
  const resp = await fetch(path);
  if (!resp.ok) return;

  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  if (!main) return;

  decorateMain(main);
  await loadBlocks(main);

  block.innerHTML = '';
  block.append(...main.childNodes);
}
