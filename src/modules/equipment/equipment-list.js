import { api } from '../../api.js';
import { navigate } from '../../router.js';
import { NODE_TYPES } from '../../utils/constants.js';
import { icon } from '../../utils/icons.js';

export async function renderEquipment() {
  const container = document.getElementById('page-content');
  try {
    const equipment = await api.getNodes({ type: 'equipment' });
    container.innerHTML = `
      <div class="animate-slideUp">
        <div class="page-header"><div><h1>Equipment Registry</h1><p class="text-sm text-secondary">Critical asset overview with knowledge links</p></div></div>
        <div class="card" style="padding:0;overflow:hidden;">
          <table class="data-table"><thead><tr><th>Tag</th><th>Name</th><th>Type</th><th>System</th><th>Criticality</th><th>Location</th><th></th></tr></thead>
          <tbody>${equipment.map(eq => `
            <tr class="eq-row" data-id="${eq.id}" style="cursor:pointer;">
              <td style="font-family:var(--font-mono);font-size:12px;font-weight:600;">${eq.properties.tag_number || '-'}</td>
              <td>${eq.properties.name || '-'}</td>
              <td><span class="tag">${eq.properties.type || '-'}</span></td>
              <td style="font-size:12px;">${eq.properties.system || '-'}</td>
              <td><span class="badge badge-severity-${(eq.properties.criticality || '').toLowerCase()}">${eq.properties.criticality || '-'}</span></td>
              <td style="font-size:12px;">${eq.properties.location || '-'}</td>
              <td style="text-align:center;color:var(--text-muted);">${icon('arrowRight', 14)}</td>
            </tr>`).join('')}</tbody></table>
          ${equipment.length === 0 ? '<div class="empty-state" style="padding:40px;"><p>No equipment registered</p></div>' : ''}
        </div>
      </div>`;
    container.querySelectorAll('.eq-row').forEach(row => { row.addEventListener('click', () => navigate('node-detail', { id: row.dataset.id })); });
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}
