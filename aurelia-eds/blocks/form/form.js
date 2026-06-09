/**
 * Form block — generic form with ACDL lifecycle tracking.
 *
 * Authoring rows (each row = one field):
 *   Col 0: label text
 *   Col 1: type (text | email | tel | textarea | select | checkbox | radio)
 *   Col 2: required (yes | no)
 *   Col 3: placeholder / options (comma-separated for select/radio)
 *
 * Last row with only one cell = submit button label.
 */

function pushFormEvent(eventName, formName, formType, extra = {}) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({ event: eventName, form: { name: formName, type: formType, ...extra } });
}

function buildField(label, type, required, placeholder) {
  const wrap = document.createElement('div');
  wrap.className = 'field-row';

  const lbl = document.createElement('label');
  lbl.className = 'form-label';
  lbl.textContent = label + (required === 'yes' ? ' *' : '');
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  lbl.setAttribute('for', id);

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.className = 'form-input';
    input.rows = 5;
    input.placeholder = placeholder || '';
  } else if (type === 'select') {
    input = document.createElement('select');
    input.className = 'form-input';
    (placeholder || '').split(',').forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.trim();
      o.textContent = opt.trim();
      input.append(o);
    });
  } else {
    input = document.createElement('input');
    input.type = type || 'text';
    input.className = 'form-input';
    input.placeholder = placeholder || '';
  }

  input.id = id;
  input.name = id;
  if (required === 'yes') input.required = true;

  wrap.append(lbl, input);
  return wrap;
}

export default function decorate(block) {
  const rows = [...block.children];
  const config = {};
  const formRows = [];
  let submitLabel = 'Submit';

  rows.forEach((row) => {
    const cells = [...row.children].map((c) => c.textContent.trim());
    if (cells.length === 2 && ['form-name', 'form-type', 'action'].includes(cells[0].toLowerCase().replace(/\s/g, '-'))) {
      config[cells[0].toLowerCase().replace(/\s/g, '-')] = cells[1];
    } else if (cells.length === 1) {
      submitLabel = cells[0];
    } else {
      formRows.push(cells);
    }
  });

  const formName = config['form-name'] || document.title;
  const formType = config['form-type'] || 'standard';

  const form = document.createElement('form');
  form.className = 'aurelia-form';
  form.noValidate = true;

  formRows.forEach(([label, type, required, placeholder]) => {
    if (label) form.append(buildField(label, type || 'text', required, placeholder));
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-accent form-submit';
  submitBtn.textContent = submitLabel;
  form.append(submitBtn);

  let started = false;
  form.addEventListener('focusin', () => {
    if (!started) { started = true; pushFormEvent('form start', formName, formType); }
  }, { once: true });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    pushFormEvent('form submit', formName, formType);
    const invalids = [...form.elements].filter((el) => el.required && !el.value.trim());
    if (invalids.length) {
      invalids.forEach((el) => el.closest('.field-row')?.classList.add('has-error'));
      pushFormEvent('form error', formName, formType, { reason: 'validation' });
      return;
    }
    pushFormEvent('form success', formName, formType);
    form.innerHTML = '<p class="form-success-msg">Thank you — we\'ll be in touch shortly.</p>';
  });

  pushFormEvent('form view', formName, formType);
  block.innerHTML = '';
  block.append(form);
}
