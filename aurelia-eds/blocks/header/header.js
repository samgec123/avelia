/**
 * Header block — fetches /nav fragment, builds utility bar + site header.
 * Auth-aware: reads body[data-auth] to toggle Sign In ↔ Account.
 */
import { loadCSS, decorateActiveLinks } from '../../scripts/aem.js';

async function fetchNav() {
  const resp = await fetch('/nav.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('body');
}

function buildUtilityBar(text) {
  const bar = document.createElement('div');
  bar.className = 'utility-bar';
  bar.textContent = text || 'Complimentary shipping on orders over $150 · Free returns within 30 days';
  return bar;
}

function buildHeader(navData) {
  const header = document.createElement('div');
  header.className = 'header-inner';

  // Primary nav (left)
  const navPrimary = document.createElement('nav');
  navPrimary.className = 'nav-primary';
  navPrimary.setAttribute('aria-label', 'Primary');
  const links = navData
    ? [...navData.querySelectorAll('.nav-primary a')]
    : [
        { href: '/men', text: 'Men' },
        { href: '/women', text: 'Women' },
        { href: '/new-arrivals', text: 'New In' },
        { href: '/sale', text: 'Sale' },
        { href: '/journal', text: 'Journal' },
      ];

  links.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.href || link.getAttribute('href');
    a.textContent = link.text || link.textContent;
    navPrimary.append(a);
  });

  // Brand (centre)
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = '/';
  brand.setAttribute('aria-label', 'AURELIA — Home');
  brand.innerHTML = 'AUR<span>EL</span>IA';

  // Utility nav (right)
  const navUtility = document.createElement('div');
  navUtility.className = 'nav-utility';

  const searchBtn = document.createElement('a');
  searchBtn.href = '/search-results';
  searchBtn.className = 'nav-search';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = '<span class="icon icon-search"></span>';

  const isAuthed = document.body.dataset.auth === 'true';
  const accountLink = document.createElement('a');
  accountLink.href = '/account';
  accountLink.className = 'nav-account';
  accountLink.setAttribute('aria-label', isAuthed ? 'My Account' : 'Sign In');
  accountLink.innerHTML = isAuthed
    ? '<span class="icon icon-account"></span><span class="user-chip logged-in">●</span>'
    : '<span class="icon icon-account"></span> Sign In';

  const cartLink = document.createElement('a');
  cartLink.href = '/cart';
  cartLink.className = 'cart-link';
  cartLink.setAttribute('aria-label', 'Shopping bag');
  cartLink.dataset.count = '0';
  cartLink.innerHTML = '<span class="icon icon-cart"></span> Bag';

  navUtility.append(searchBtn, accountLink, cartLink);

  header.append(navPrimary, brand, navUtility);
  return header;
}

export default async function decorate(block) {
  const navData = await fetchNav();

  const utilityText = navData?.querySelector('.utility-bar')?.textContent?.trim();
  const utilityBar = buildUtilityBar(utilityText);
  const headerInner = buildHeader(navData);

  block.innerHTML = '';
  block.append(utilityBar, headerInner);

  decorateActiveLinks(block);
}
