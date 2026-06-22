import { api } from '../../api.js';
import { NODE_TYPES, EDGE_TYPES } from '../../utils/constants.js';
import { navigate } from '../../router.js';
import { showToast, showModal } from '../../components/modal.js';
import { icons, icon } from '../../utils/icons.js';

export async function renderNodeDetail(params) {
  const container = document.getElementById('page-content');
  const nodeId = params.id;
  if (!nodeId) { container.innerHTML = '<div class="empty-state"><p>No node selected</p></div>'; return; }
  container.innerHTML = '<div class="animate-pulse" style="padding:40px;text-align:center;color:var(--text-muted);">Loading...</div>';

  try {
    const data = await api.getNode(nodeId);
    const t = NODE_TYPES[data.type] || { icon: icons.info, label: data.type, color: '#666', bgColor: '#f5f5f5' };

    container.innerHTML = `
      <div class="animate-slideUp">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <button class="btn btn-ghost btn-sm" id="btn-back">${icon('arrowLeft', 15)} Back</button>
          <span class="badge badge-${data.type}" style="display:flex;align-items:center;gap:3px;">${t.icon} ${t.label}</span>
          ${data.properties.severity ? `<span class="badge badge-severity-${data.properties.severity?.toLowerCase()}">${data.properties.severity}</span>` : ''}
          ${data.properties.status ? `<span class="badge-status badge-status-${data.properties.status?.toLowerCase()}">${data.properties.status}</span>` : ''}
        </div>
        <h1 style="font-size: 20px; margin-bottom: 4px;">${data.properties.title || data.properties.name || data.id}</h1>
        ${data.properties.tag_number ? `<p class="text-sm text-muted" style="margin-bottom:16px;">Tag: <code style="font-family:var(--font-mono);background:var(--bg-subtle);padding:1px 6px;border-radius:4px;">${data.properties.tag_number}</code></p>` : ''}

        <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;margin-top:20px;">
          <div>
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header"><span class="card-title">Details</span>
                <button class="btn btn-sm btn-secondary" id="btn-edit">${icon('edit', 13)} Edit</button>
              </div>
              ${renderProperties(data)}
            </div>
            ${data.properties.description ? `<div class="card" style="margin-bottom:16px;"><div class="card-header"><span class="card-title">Description</span></div>
              <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">${data.properties.description}</p></div>` : ''}
            ${data.properties.steps ? `<div class="card" style="margin-bottom:16px;"><div class="card-header"><span class="card-title">Steps</span></div>
              <ol style="padding-left:20px;display:flex;flex-direction:column;gap:6px;">${data.properties.steps.map(s => `<li style="font-size:14px;color:var(--text-secondary);">${s}</li>`).join('')}</ol></div>` : ''}
            ${data.properties.one_point ? `<div class="card" style="margin-bottom:16px;border-left:3px solid #059669;">
              <div class="card-header"><span class="card-title" style="color:#059669;display:flex;align-items:center;gap:6px;">${icon('check', 14)} Key Point</span></div>
              <p style="font-size:15px;font-weight:500;color:var(--text-primary);">${data.properties.one_point}</p></div>` : ''}
          </div>
          <div>
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header"><span class="card-title">Relationships (${data.relationships.length})</span>
                <button class="btn btn-sm btn-primary" id="btn-add-rel">${icon('plus', 13)} Link</button>
              </div>
              ${data.relationships.length === 0 ? '<p class="text-sm text-muted">No relationships yet</p>' :
                data.relationships.map(rel => {
                  const rt = NODE_TYPES[rel.node?.type] || { icon: icons.info, label: rel.node?.type, color: '#666', bgColor: '#f5f5f5' };
                  return `<div class="rel-card" data-node-id="${rel.node?.id}" data-edge-id="${rel.edge.id}">
                    <div class="rel-icon" style="background:${rt.bgColor};color:${rt.color};">${rt.icon}</div>
                    <div class="rel-info"><div class="rel-name truncate">${rel.node?.properties?.title || rel.node?.properties?.name || rel.node?.properties?.tag_number || ''}</div>
                    <div class="rel-type">${rel.direction === 'out' ? '→' : '←'} ${rel.edge.type.replace(/_/g, ' ')}</div></div>
                    <button class="btn btn-ghost btn-sm rel-remove" data-edge-id="${rel.edge.id}" title="Remove" style="color:var(--text-muted);opacity:0.4;">${icon('close', 12)}</button>
                  </div>`;
                }).join('')}
            </div>
            <div class="card"><div class="card-header"><span class="card-title">Graph View</span></div>
              <button class="btn btn-secondary w-full" id="btn-view-graph">${icon('graph', 14)} View in Graph Explorer</button>
            </div>
            <div style="margin-top:12px;font-size:10px;color:var(--text-muted);">
              Created: ${new Date(data.createdAt).toLocaleDateString()}<br/>Updated: ${new Date(data.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>`;

    container.querySelector('#btn-back')?.addEventListener('click', () => history.back());
    container.querySelector('#btn-view-graph')?.addEventListener('click', () => navigate('graph', { id: nodeId }));
    container.querySelectorAll('.rel-card').forEach(card => { card.addEventListener('click', (e) => { if (e.target.closest('.rel-remove')) return; navigate('node-detail', { id: card.dataset.nodeId }); }); });
    container.querySelectorAll('.rel-remove').forEach(btn => { btn.addEventListener('click', async (e) => { e.stopPropagation(); try { await api.deleteEdge(btn.dataset.edgeId); showToast('Relationship removed', 'success'); renderNodeDetail(params); } catch (err) { showToast('Error: ' + err.message, 'error'); } }); });
    container.querySelector('#btn-edit')?.addEventListener('click', () => showEditModal(data));
    container.querySelector('#btn-add-rel')?.addEventListener('click', () => showAddRelModal(data));
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`; }
}

function renderProperties(data) {
  const skip = ['title', 'name', 'description', 'steps', 'one_point', 'id'];
  const entries = Object.entries(data.properties).filter(([k, v]) => !skip.includes(k) && v != null && v !== '');
  if (entries.length === 0) return '<p class="text-sm text-muted">No additional properties</p>';
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    ${entries.map(([k, v]) => `<div class="detail-field"><div class="detail-field-label">${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
      <div class="detail-field-value">${Array.isArray(v) ? v.join(', ') : v}</div></div>`).join('')}
  </div>`;
}

async function showEditModal(data) {
  const skip = ['id'];
  const entries = Object.entries(data.properties).filter(([k]) => !skip.includes(k));
  const html = `<div style="display:flex;flex-direction:column;gap:12px;">
    ${entries.map(([k, v]) => `<div class="form-group"><label class="form-label">${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
      ${k === 'description' || k === 'one_point' ? `<textarea class="textarea" data-field="${k}">${v || ''}</textarea>` :
        `<input class="input" data-field="${k}" value="${Array.isArray(v) ? v.join(', ') : (v || '')}"/>`}</div>`).join('')}
  </div>`;
  const result = await showModal('Edit ' + (NODE_TYPES[data.type]?.label || data.type), html, [
    { label: 'Cancel', action: 'cancel', class: 'btn-secondary' }, { label: 'Save Changes', action: 'save', class: 'btn-primary' }
  ]);
  if (result === 'save') {
    const modal = document.querySelector('.modal-content'); const updates = {};
    modal.querySelectorAll('[data-field]').forEach(el => { updates[el.dataset.field] = el.value; });
    try { await api.updateNode(data.id, updates); showToast('Node updated', 'success'); renderNodeDetail({ id: data.id }); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  }
}

async function showAddRelModal(data) {
  const html = `<div style="display:flex;flex-direction:column;gap:12px;">
    <div class="form-group"><label class="form-label">Relationship Type</label>
      <select class="select" id="rel-type">${Object.entries(EDGE_TYPES).map(([k, v]) => `<option value="${k}">${v.label} (${k})</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Target Node ID</label><input class="input" id="rel-target" placeholder="Enter node ID..." /></div>
    <div class="form-group"><label class="form-label">Direction</label>
      <select class="select" id="rel-direction"><option value="out">This node → Target</option><option value="in">Target → This node</option></select></div>
  </div>`;
  const result = await showModal('Add Relationship', html, [
    { label: 'Cancel', action: 'cancel', class: 'btn-secondary' }, { label: 'Add Link', action: 'add', class: 'btn-primary' }
  ]);
  if (result === 'add') {
    const m = document.querySelector('.modal-content');
    const type = m.querySelector('#rel-type').value; const target = m.querySelector('#rel-target').value; const dir = m.querySelector('#rel-direction').value;
    try { if (dir === 'out') await api.createEdge({ type, source: data.id, target }); else await api.createEdge({ type, source: target, target: data.id });
      showToast('Relationship created', 'success'); renderNodeDetail({ id: data.id }); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
  }
}
