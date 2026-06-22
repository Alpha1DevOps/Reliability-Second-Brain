import { api } from '../../api.js';
import { navigate } from '../../router.js';
import { showToast, showModal } from '../../components/modal.js';
import { OPL_CATEGORIES, NODE_TYPES } from '../../utils/constants.js';
import { icon } from '../../utils/icons.js';

export async function renderOPL() {
  const container = document.getElementById('page-content');
  try {
    const opls = await api.getNodes({ type: 'opl' });
    container.innerHTML = `
      <div class="animate-slideUp">
        <div class="page-header">
          <div><h1>One Point Lessons</h1><p class="text-sm text-secondary">Quick, focused knowledge sharing for the field</p></div>
          <button class="btn btn-primary" id="btn-create">${icon('plus', 15)} Create OPL</button>
        </div>
        <div class="grid-auto">
          ${opls.map(opl => `
            <div class="card interactive" data-id="${opl.id}" style="border-left:3px solid #059669;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
                <span class="badge badge-opl" style="display:flex;align-items:center;gap:3px;">${NODE_TYPES.opl.icon} OPL</span>
                ${opl.properties.category ? `<span class="tag">${opl.properties.category}</span>` : ''}
                ${opl.properties.target_audience ? `<span class="tag" style="background:#ecfeff;color:#0891b2;">${opl.properties.target_audience}</span>` : ''}
              </div>
              <h4 style="font-size:14px;margin-bottom:8px;">${opl.properties.title}</h4>
              ${opl.properties.one_point ? `
                <div style="background:#f0fdf4;border-left:2px solid #059669;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:8px;">
                  <div style="font-size:10px;color:#059669;font-weight:600;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.04em;">Key Point</div>
                  <div style="font-size:13px;color:var(--text-primary);font-weight:500;">${opl.properties.one_point}</div>
                </div>` : ''}
              ${opl.properties.steps ? `<div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:4px;">${icon('check', 12)} ${opl.properties.steps.length} steps</div>` : ''}
            </div>`).join('')}
          ${opls.length === 0 ? '<div class="empty-state" style="grid-column:1/-1;"><p>No OPLs created yet</p></div>' : ''}
        </div>
      </div>`;
    container.querySelectorAll('.card.interactive').forEach(card => { card.addEventListener('click', () => navigate('node-detail', { id: card.dataset.id })); });
    container.querySelector('#btn-create')?.addEventListener('click', async () => {
      const html = `<div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Title *</label><input class="input" id="f-title"/></div>
        <div class="form-group"><label class="form-label">One Point (Key Message) *</label><textarea class="textarea" id="f-point" placeholder="The single most important thing to remember..."></textarea></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Category</label><select class="select" id="f-cat">${OPL_CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Target Audience</label><select class="select" id="f-aud"><option>Operator</option><option>Technician</option><option>Engineer</option></select></div></div>
        <div class="form-group"><label class="form-label">Steps (one per line)</label><textarea class="textarea" id="f-steps" rows="4" placeholder="Step 1\nStep 2\nStep 3"></textarea></div></div>`;
      const r = await showModal('Create OPL', html, [{ label: 'Cancel', action: 'cancel', class: 'btn-secondary' }, { label: 'Create', action: 'create', class: 'btn-primary' }]);
      if (r === 'create') {
        const m = document.querySelector('.modal-content'); const title = m.querySelector('#f-title').value.trim();
        if (!title) { showToast('Title required', 'error'); return; }
        const steps = m.querySelector('#f-steps').value.split('\n').map(s => s.trim()).filter(Boolean);
        const node = await api.createNode({ type: 'opl', title, one_point: m.querySelector('#f-point').value, category: m.querySelector('#f-cat').value, target_audience: m.querySelector('#f-aud').value, steps });
        showToast('OPL created', 'success'); navigate('node-detail', { id: node.id });
      }
    });
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}
