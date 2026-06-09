/**
 * Universal Editor — block/section overlay support.
 * Highlights selected blocks and enables add/remove/move controls in the UE UI.
 */

function handleEditorEvents() {
  document.addEventListener('aue:content-patch', (event) => {
    const { detail } = event;
    if (!detail) return;
    // Re-decorate patched blocks after UE edits
    const block = document.querySelector(`[data-aue-resource="${detail.resource}"]`);
    if (block) {
      block.dataset.blockStatus = 'initialized';
      import('./aem.js').then(({ loadBlock }) => loadBlock(block));
    }
  });
}

// Only activate inside Universal Editor iframe
if (window.location !== window.parent.location || window.navigator.userAgent.includes('UniversalEditor')) {
  handleEditorEvents();
}
