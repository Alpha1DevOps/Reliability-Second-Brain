import { api } from '../../api.js';
import { navigate } from '../../router.js';
import { showToast, showModal } from '../../components/modal.js';
import { NODE_TYPES } from '../../utils/constants.js';
import { icon } from '../../utils/icons.js';

export async function renderLessons() {
  const container = document.getElementById('page-content');
  try {
    const lessons = await api.getNodes({ type: 'lesson' });
    container.innerHTML = `
      <div class="animate-slideUp">
        <div class="page-header">
          <div><h1>Lessons Learned</h1><p class="text-sm text-secondary">Capture and share engineering knowledge</p></div>
          <button class="btn btn-primary" id="btn-create">${icon('plus', 15)} New Lesson</button>
        </div>
        <div class="grid-auto">
          ${lessons.map(l => `
            <div class="card interactive" data-id="${l.id}">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <span class="badge badge-lesson" style="display:flex;align-items:center;gap:3px;">${NODE_TYPES.lesson.icon} Lesson</span>
                ${l.properties.category ? `<span class="tag">${l.properties.category}</span>` : ''}
              </div>
              <h4 style="font-size:14px;margin-bottom:6px;">${l.properties.title}</h4>
              <p class="text-sm text-secondary" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${l.properties.description || ''}</p>
              ${l.properties.impact ? `<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border-light);font-size:11px;color:var(--text-muted);">Impact: ${l.properties.impact}</div>` : ''}
            </div>`).join('')}
          ${lessons.length === 0 ? '<div class="empty-state" style="grid-column:1/-1;"><p>No lessons learned yet.</p></div>' : ''}
        </div>
      </div>`;
    container.querySelectorAll('.card.interactive').forEach(card => { card.addEventListener('click', () => navigate('node-detail', { id: card.dataset.id })); });
    container.querySelector('#btn-create')?.addEventListener('click', async () => {
      const html = `<div style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Title *</label><input class="input" id="f-title"/></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="textarea" id="f-desc"></textarea></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Category</label><input class="input" id="f-cat" placeholder="e.g. Mechanical"/></div>
          <div class="form-group"><label class="form-label">Impact</label><input class="input" id="f-impact"/></div></div></div>`;
      const r = await showModal('New Lesson Learned', html, [{ label: 'Cancel', action: 'cancel', class: 'btn-secondary' }, { label: 'Create', action: 'create', class: 'btn-primary' }]);
      if (r === 'create') {
        const m = document.querySelector('.modal-content'); const title = m.querySelector('#f-title').value.trim();
        if (!title) { showToast('Title required', 'error'); return; }
        const node = await api.createNode({ type: 'lesson', title, description: m.querySelector('#f-desc').value, category: m.querySelector('#f-cat').value, impact: m.querySelector('#f-impact').value, date: new Date().toISOString().split('T')[0] });
        showToast('Lesson created', 'success'); navigate('node-detail', { id: node.id });
      }
    });
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}
