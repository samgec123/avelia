/**
 * Columns block — generic N-column layout.
 * Each row in the authoring table = one row; each cell = one column.
 */
export default function decorate(block) {
  const cols = [...block.firstElementChild?.children || []].length || 2;
  block.style.setProperty('--columns', cols);
  block.classList.add(`columns-${cols}-cols`);

  [...block.children].forEach((row) => {
    row.className = 'columns-row';
    [...row.children].forEach((col) => { col.className = 'columns-col'; });
  });
}
