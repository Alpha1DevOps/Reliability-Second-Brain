import { api } from '../../api.js';
import { SEVERITY_LEVELS, INCIDENT_STATUSES } from '../../utils/constants.js';
import { navigate } from '../../router.js';
import { showToast, showModal } from '../../components/modal.js';
import { icon } from '../../utils/icons.js';

export async function renderIncidents() {
  const container = document.getElementById('page-content');
  try {
    const incidents = await api.getNodes({ type: 'incident' });
    container.innerHTML = `
      <div class="animate-slideUp">
        <div class="page-header">
          <div><h1>Incident Management</h1><p class="text-sm text-secondary">Track and analyze engineering incidents</p></div>
          <button class="btn btn-primary" id="btn-create-incident">${icon('plus', 15)} New Incident</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          <select class="select" id="filter-severity" style="width:auto;min-width:120px;"><option value="">All Severity</option>${SEVERITY_LEVELS.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
          <select class="select" id="filter-status" style="width:auto;min-width:120px;"><option value="">All Status</option>${INCIDENT_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
          <input class="input" id="filter-search" placeholder="Search incidents..." style="width:auto;flex:1;max-width:280px;" />
        </div>
        <div class="card" style="padding:0;overflow:hidden;">
          <table class="data-table"><thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>Date</th><th>Equipment</th><th></th></tr></thead>
          <tbody id="incident-tbody">${renderRows(incidents)}</tbody></table>
          ${incidents.length === 0 ? '<div class="empty-state" style="padding:40px;"><p>No incidents recorded yet</p></div>' : ''}
        </div>
      </div>`;
    bindEvents(container);
    container.querySelector('#btn-create-incident')?.addEventListener('click', () => showCreateModal());
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`; }
}

function renderRows(incidents) {
  return incidents.map(inc => `
    <tr class="incident-row" data-id="${inc.id}">
      <td style="max-width:300px;" class="truncate">${inc.properties.title}</td>
      <td><span class="badge badge-severity-${inc.properties.severity?.toLowerCase()}">${inc.properties.severity || '-'}</span></td>
      <td><span class="badge-status badge-status-${inc.properties.status?.toLowerCase()}">${inc.properties.status || '-'}</span></td>
      <td style="white-space:nowrap;font-size:12px;">${inc.properties.date || '-'}</td>
      <td style="font-size:12px;">${inc.properties.equipment || '-'}</td>
      <td style="text-align:center;color:var(--text-muted);">${icon('arrowRight', 14)}</td>
    </tr>`).join('');
}

function bindEvents(container) {
  container.querySelectorAll('.incident-row').forEach(row => { row.addEventListener('click', () => navigate('node-detail', { id: row.dataset.id })); });
  const filterFn = async () => {
    const sev = container.querySelector('#filter-severity').value;
    const stat = container.querySelector('#filter-status').value;
    const search = container.querySelector('#filter-search').value;
    const filtered = await api.getNodes({ type: 'incident', severity: sev || undefined, status: stat || undefined, search: search || undefined });
    container.querySelector('#incident-tbody').innerHTML = renderRows(filtered);
    container.querySelectorAll('.incident-row').forEach(row => { row.addEventListener('click', () => navigate('node-detail', { id: row.dataset.id })); });
  };
  container.querySelector('#filter-severity')?.addEventListener('change', filterFn);
  container.querySelector('#filter-status')?.addEventListener('change', filterFn);
  container.querySelector('#filter-search')?.addEventListener('input', filterFn);
}

async function showCreateModal() {
  const html = `<div style="display:flex;flex-direction:column;gap:12px;">
    <div class="form-group"><label class="form-label">Title *</label><input class="input" id="inc-title" placeholder="Brief incident description" /></div>
    <div class="form-group"><label class="form-label">Description</label><textarea class="textarea" id="inc-desc"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Severity</label><select class="select" id="inc-severity">${SEVERITY_LEVELS.map(s => `<option>${s}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Status</label><select class="select" id="inc-status">${INCIDENT_STATUSES.map(s => `<option>${s}</option>`).join('')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Date</label><input class="input" type="date" id="inc-date" value="${new Date().toISOString().split('T')[0]}" /></div>
      <div class="form-group"><label class="form-label">Root Cause</label><input class="input" id="inc-root" /></div>
    </div></div>`;
  const r = await showModal('Create New Incident', html, [{ label: 'Cancel', action: 'cancel', class: 'btn-secondary' }, { label: 'Create', action: 'create', class: 'btn-primary' }]);
  if (r === 'create') {
    const m = document.querySelector('.modal-content'); const title = m.querySelector('#inc-title').value.trim();
    if (!title) { showToast('Title is required', 'error'); return; }
    try { const node = await api.createNode({ type: 'incident', title, description: m.querySelector('#inc-desc').value, severity: m.querySelector('#inc-severity').value, status: m.querySelector('#inc-status').value, date: m.querySelector('#inc-date').value, root_cause: m.querySelector('#inc-root').value });
      showToast('Incident created', 'success'); navigate('node-detail', { id: node.id }); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  }
}
