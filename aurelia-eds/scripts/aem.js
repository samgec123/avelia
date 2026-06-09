/**
 * AEM EDS Core Runtime
 * Handles block loading, section decoration, icon replacement, lazy loading.
 */

const PRODUCTION_DOMAINS = ['www.aurelia.com'];

/**
 * log RUM if part of the sample
 */
export function sampleRUM(checkpoint, data = {}) {
  // stub – wire up real RUM telemetry when deploying to production
  if (window.hlx && window.hlx.rum) {
    window.hlx.rum.queue = window.hlx.rum.queue || [];
    window.hlx.rum.queue.push({ checkpoint, data });
  }
}

/**
 * Loads a CSS file.
 */
export function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.addEventListener('load', resolve);
      link.addEventListener('error', reject);
      document.head.append(link);
    } else {
      resolve();
    }
  });
}

/**
 * Loads a JS module.
 */
export function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    document.head.append(script);
  });
}

/**
 * Retrieves the content of metadata tags.
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return meta && meta.content;
}

/**
 * Sanitizes a string for use as class name.
 */
function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

/**
 * Builds a block element from a name and content rows.
 */
export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    (Array.isArray(row) ? row : [row]).forEach((col) => {
      const colEl = document.createElement('div');
      colEl.append(...(col instanceof Element ? [col] : [document.createTextNode(col)]));
      rowEl.append(colEl);
    });
    blockEl.append(rowEl);
  });
  return blockEl;
}

/**
 * Returns the true origin for a given URL (handles localhost).
 */
function getOrigin() {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

/**
 * Loads a block's CSS and JS, then calls decorate(block).
 */
export async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const blockName = block.dataset.blockName;
    const cssPath = `/blocks/${blockName}/${blockName}.css`;
    const jsPath = `/blocks/${blockName}/${blockName}.js`;

    await Promise.all([
      loadCSS(cssPath).catch(() => { /* optional CSS */ }),
      import(jsPath)
        .then(({ default: decorate }) => decorate(block))
        .catch((err) => window.console.error(`Failed to load block: ${blockName}`, err)),
    ]);
    block.dataset.blockStatus = 'loaded';
  }
  return block;
}

/**
 * Decorates a block element: normalises class names and sets data attributes.
 */
export function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    block.dataset.blockName = shortBlockName;
    block.dataset.blockStatus = 'initialized';
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
  }
}

/**
 * Decorates all blocks in a container.
 */
export function decorateBlocks(main) {
  main.querySelectorAll('div.section > div > div').forEach(decorateBlock);
}

/**
 * Loads all blocks in a container.
 */
export async function loadBlocks(main) {
  updateSectionsStatus(main);
  const blocks = [...main.querySelectorAll('div[data-block-status="initialized"]')];
  for (let i = 0; i < blocks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(blocks[i]);
    updateSectionsStatus(main);
  }
}

function updateSectionsStatus(main) {
  const sections = [...main.querySelectorAll(':scope > .section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const loadingBlocks = section.querySelectorAll('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
    if (loadingBlocks.length === 0) {
      section.dataset.sectionStatus = 'loaded';
      section.style.display = null;
    } else {
      break;
    }
  }
}

/**
 * Replaces :icon-name: spans with inline SVGs from /icons/.
 */
export async function decorateIcons(element) {
  const icons = [...element.querySelectorAll('span.icon')];
  await Promise.all(icons.map(async (span) => {
    const match = span.className.match(/icon-([^\s]+)/);
    if (!match) return;
    const iconName = match[1];
    const resp = await fetch(`${getOrigin()}/icons/${iconName}.svg`);
    if (!resp.ok) return;
    const svg = await resp.text();
    span.innerHTML = svg;
    span.setAttribute('aria-hidden', 'true');
  }));
}

/**
 * Wraps bare content in section divs and adds .section class.
 */
export function decorateSections(main) {
  [...main.children].forEach((child) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'section';
    child.replaceWith(wrapper);
    wrapper.append(child);
    wrapper.dataset.sectionStatus = 'initialized';
    wrapper.style.display = 'none';

    // read section metadata from last child if it's a section-metadata block
    const sectionMeta = wrapper.querySelector('.section-metadata');
    if (sectionMeta) {
      const meta = readBlockData(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta[key].split(',').map((s) => toClassName(s.trim()));
          styles.forEach((s) => wrapper.classList.add(s));
        } else {
          wrapper.dataset[toClassName(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

function readBlockData(block) {
  const data = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cols = row.querySelectorAll('div');
    if (cols.length >= 2) {
      data[toClassName(cols[0].textContent.trim())] = cols[1].textContent.trim();
    }
  });
  return data;
}

/**
 * Decorates images: wraps in <picture> if needed, adds lazy loading.
 */
export function decorateImages(main) {
  main.querySelectorAll('img').forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
  });
}

/**
 * Adds .active class to nav links matching current URL.
 */
export function decorateActiveLinks(nav) {
  const path = window.location.pathname;
  nav.querySelectorAll('a').forEach((a) => {
    try {
      const url = new URL(a.href);
      if (url.pathname === path || (url.pathname !== '/' && path.startsWith(url.pathname))) {
        a.classList.add('active');
      }
    } catch (e) { /* ignore */ }
  });
}

/**
 * Waits for the first image in a section to load (LCP helper).
 */
export function waitForFirstImage(section) {
  const lcpCandidate = section.querySelector('img');
  return new Promise((resolve) => {
    if (lcpCandidate) {
      if (lcpCandidate.complete) resolve();
      else lcpCandidate.addEventListener('load', resolve, { once: true });
    } else {
      resolve();
    }
  });
}

/**
 * Decorates the main element: sections + blocks + icons.
 */
export function decorateMain(main) {
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateImages(main);
}
