/**
 * Footer block — fetches /footer fragment, renders 3-column footer + social strip.
 */

async function fetchFooterData() {
  const resp = await fetch('/footer.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('body');
}

function buildFooter(data) {
  if (data) {
    return data.querySelector('.footer-inner') || data.firstElementChild;
  }

  // Fallback hardcoded footer
  const inner = document.createElement('div');
  inner.className = 'footer-inner';

  const brand = document.createElement('div');
  brand.innerHTML = `
    <div class="footer-brand">Aurelia</div>
    <p class="footer-tagline">Considered essentials, designed in Milan.<br>Made to last beyond the season.</p>`;

  const cols = [
    {
      heading: 'Shop',
      links: [
        ['/women', 'Women'],
        ['/men', 'Men'],
        ['/new-arrivals', 'New Arrivals'],
        ['/sale', 'Sale'],
        ['/journal', 'Journal'],
      ],
    },
    {
      heading: 'House',
      links: [
        ['/about', 'About Us'],
        ['/sustainability', 'Sustainability'],
        ['/materials', 'Materials'],
        ['/stores', 'Stores'],
        ['/press', 'Press'],
      ],
    },
    {
      heading: 'Service',
      links: [
        ['/help', 'Help'],
        ['/returns', 'Returns'],
        ['/size-guide', 'Size Guide'],
        ['/contact', 'Contact'],
        ['/account', 'My Account'],
      ],
    },
  ].map(({ heading, links }) => {
    const col = document.createElement('div');
    col.className = 'footer-col';
    col.innerHTML = `<h4>${heading}</h4>${links.map(([href, text]) => `<a href="${href}">${text}</a>`).join('')}`;
    return col;
  });

  inner.append(brand, ...cols);
  return inner;
}

export default async function decorate(block) {
  const data = await fetchFooterData();
  const inner = buildFooter(data);

  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  bottom.innerHTML = `
    <span>© ${new Date().getFullYear()} Aurelia. All rights reserved.</span>
    <span>
      <a href="/privacy">Privacy</a> &nbsp;·&nbsp;
      <a href="/terms-and-conditions">Terms</a> &nbsp;·&nbsp;
      <a href="/cookie-policy">Cookies</a>
    </span>`;

  block.innerHTML = '';
  block.append(inner, bottom);
}
