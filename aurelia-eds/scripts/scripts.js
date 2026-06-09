/**
 * AURELIA EDS — Site initialisation
 * Loads header/footer, sets up ACDL, initialises auth state, drives LCP.
 */
import {
  buildBlock,
  loadBlock,
  loadCSS,
  decorateMain,
  loadBlocks,
  waitForFirstImage,
  getMetadata,
  sampleRUM,
} from './aem.js';

window.adobeDataLayer = window.adobeDataLayer || [];

/**
 * Restores auth state from localStorage and sets body attribute.
 * Header CSS uses [data-auth="true"] to toggle Sign In ↔ Account.
 */
function initAuth() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('aurelia_user')); } catch { return null; }
  })();
  if (user) document.body.dataset.auth = 'true';
}

/**
 * Auto-loads header block into <header> element.
 */
async function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  decorateBlock(headerBlock);
  return loadBlock(headerBlock);
}

/**
 * Auto-loads footer block into <footer> element.
 */
async function loadFooter(footer) {
  const footerBlock = buildBlock('footer', '');
  footer.append(footerBlock);
  decorateBlock(footerBlock);
  return loadBlock(footerBlock);
}

// Re-export decorateBlock for header/footer loaders
function decorateBlock(block) {
  block.classList.add('block');
  const name = block.classList[0];
  block.dataset.blockName = name;
  block.dataset.blockStatus = 'initialized';
}

/**
 * Loads fonts lazily (after LCP).
 */
function loadFonts() {
  loadCSS('/styles/fonts.css');
  loadCSS('/styles/lazy-styles.css');
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', true);
    }
  } catch (e) { /* ignore */ }
}

/**
 * Pushes a page-view event to ACDL.
 */
export function pushPageView(data) {
  window.adobeDataLayer.push({
    event: 'page view',
    web: {
      webPageDetails: {
        name: data.pageName,
        URL: window.location.href,
        pageViews: { value: 1 },
      },
    },
    page: data,
  });
}

/**
 * Main entry — phases match EDS convention:
 *  1. eager  — LCP block + above-fold content
 *  2. lazy   — header, footer, remaining blocks, fonts
 *  3. delayed — analytics, third-party scripts
 */
async function loadPage() {
  initAuth();
  sampleRUM('top');

  const main = document.querySelector('main');
  if (main) {
    decorateMain(main);

    // Eager phase: load first section immediately
    const firstSection = main.querySelector(':scope > .section');
    if (firstSection) {
      firstSection.style.display = null;
      const firstBlock = firstSection.querySelector('.block');
      if (firstBlock) await loadBlock(firstBlock);
      await waitForFirstImage(firstSection);
    }

    document.body.classList.add('appear');
    sampleRUM('lcp');

    // Lazy phase: remaining blocks, header, footer, fonts
    await loadBlocks(main);
  }

  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  await Promise.all([
    header ? loadHeader(header) : Promise.resolve(),
    footer ? loadFooter(footer) : Promise.resolve(),
  ]);

  loadFonts();

  // Delayed phase (non-blocking)
  window.setTimeout(() => import('./delayed.js'), 3000);
}

loadPage();
