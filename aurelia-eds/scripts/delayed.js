/**
 * Deferred scripts — loaded ~3 s after page load.
 * Analytics, third-party tags, dev helpers.
 */

// Adobe Launch / Tags embed
// Replace the src with your property's embed code from:
// Adobe Experience Platform Data Collection → Tags → [Property] → Environments → Install
(function () {
  const script = document.createElement('script');
  script.src = '//assets.adobedtm.com/fc67bd15c36b/f978a23a3be6/launch-e0c93abaf192-development.min.js';
  script.async = true;
  document.head.append(script);
}());

// Dev-only: ACDL inspector widget
if (window.location.hostname === 'localhost' || window.location.hostname.includes('hlx.page')) {
  (function () {
    const btn = document.createElement('button');
    btn.className = 'dl-inspector';
    btn.textContent = '⬡ ACDL';
    const panel = document.createElement('pre');
    panel.className = 'dl-panel';
    document.body.append(btn, panel);
    btn.addEventListener('click', () => {
      panel.textContent = JSON.stringify(window.adobeDataLayer || [], null, 2);
      panel.classList.toggle('show');
    });
  }());
}
