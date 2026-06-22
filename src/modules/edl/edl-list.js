import { api } from '../../api.js';
import { navigate } from '../../router.js';
import { showToast, showModal } from '../../components/modal.js';
import { EDL_CATEGORIES, EDL_DOC_TYPES, NODE_TYPES } from '../../utils/constants.js';
import { icon } from '../../utils/icons.js';

export async function renderEDL() {
  const container = document.getElementById('page-content');
  try {
    const docs = await api.getNodes({ type: 'edl' });
    container.innerHTML = `
      <div class="animate-slideUp">
        <div class="page-header">
          <div><h1>Engineering Digital Library</h1><p class="text-sm text-secondary">Engineering documents & standards registry</p></div>
          <button class="btn btn-primary" id="btn-create">${icon('plus', 15)} Register Document</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <select class="select" id="filter-cat" style="width:auto;min-width:150px;"><option value="">All Categories</option>${EDL_CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
        </div>
        <div class="card" style="padding:0;overflow:hidden;">
          <table class="data-table"><thead><tr><th>Document</th><th>Type</th><th>Number</th><th>Version</th><th>Category</th><th>Equipment</th><th>Link</th></tr></thead>
          <tbody id="edl-tbody">${docs.map(d => `
            <tr class="edl-row" data-id="${d.id}">
              <td style="max-width:280px;" class="truncate">${d.properties.title}</td>
              <td><span class="tag">${d.properties.doc_type || '-'}</span></td>
              <td style="font-family:var(--font-mono);font-size:12px;">${d.properties.doc_number || '-'}</td>
              <td>${d.properties.version || '-'}</td>
              <td><span class="badge badge-edl">${d.properties.category || '-'}</span></td>
              <td style="font-size:12px;">
                ${d.properties.equipment ? `<a href="#" class="equipment-link" data-eqid="${d.properties.equipment_id}" style="color:var(--brand-600);text-decoration:none;font-weight:500;">${d.properties.equipment}</a>` : '-'}
              </td>
              <td>${d.properties.external_url ? `<a href="${d.properties.external_url}" target="_blank" style="display:flex;align-items:center;gap:3px;font-size:12px;">${icon('externalLink', 12)} Open</a>` : '-'}</td>
            </tr>`).join('')}</tbody></table>
          ${docs.length === 0 ? '<div class="empty-state" style="padding:40px;"><p>No documents registered</p></div>' : ''}
        </div>
      </div>`;
    container.querySelectorAll('.edl-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.equipment-link')) {
          e.preventDefault();
          e.stopPropagation();
          navigate('node-detail', { id: e.target.closest('.equipment-link').dataset.eqid });
        } else if (!e.target.closest('a')) {
          navigate('node-detail', { id: row.dataset.id });
        }
      });
    });
    container.querySelector('#btn-create')?.addEventListener('click', async () => {
      const html = `<div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Title *</label><input class="input" id="f-title"/></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Doc Type</label><select class="select" id="f-type">${EDL_DOC_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Doc Number</label><input class="input" id="f-num" placeholder="ES-MECH-001"/></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Version</label><input class="input" id="f-ver" value="1.0"/></div>
          <div class="form-group"><label class="form-label">Category</label><select class="select" id="f-cat">${EDL_CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select></div></div>
        <div class="form-group"><label class="form-label">External URL</label><input class="input" id="f-url" placeholder="https://..."/></div></div>`;
      const r = await showModal('Register Engineering Document', html, [{ label: 'Cancel', action: 'cancel', class: 'btn-secondary' }, { label: 'Register', action: 'create', class: 'btn-primary' }]);
      if (r === 'create') {
        const m = document.querySelector('.modal-content'); const title = m.querySelector('#f-title').value.trim();
        if (!title) { showToast('Title required', 'error'); return; }
        const node = await api.createNode({ type: 'edl', title, doc_type: m.querySelector('#f-type').value, doc_number: m.querySelector('#f-num').value, version: m.querySelector('#f-ver').value, category: m.querySelector('#f-cat').value, external_url: m.querySelector('#f-url').value });
        showToast('Document registered', 'success'); navigate('node-detail', { id: node.id });
      }
    });
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}
