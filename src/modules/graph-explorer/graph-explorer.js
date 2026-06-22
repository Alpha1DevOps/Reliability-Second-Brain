import { api } from '../../api.js';
import { NODE_TYPES } from '../../utils/constants.js';
import { navigate } from '../../router.js';
import { state } from '../../state.js';
import { icons, icon } from '../../utils/icons.js';

let selectedNodeId = null;

export async function renderGraphExplorer(params = {}) {
  const container = document.getElementById('page-content');
  container.style.padding = '0';
  container.innerHTML = `
    <div class="graph-container">
      <div class="graph-sidebar">
        <div class="graph-sidebar-header">
          <h3 style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">${icon('filter', 14)} Filters</h3>
        </div>
        <div class="graph-sidebar-content" id="graph-filters"></div>
      </div>
      <div class="graph-canvas-wrapper" id="graph-canvas-wrapper">
        <svg class="graph-svg" id="graph-svg"></svg>
        <div class="graph-controls" id="graph-controls">
          <button class="graph-control-btn" id="btn-zoom-in" title="Zoom In">${icon('zoomIn', 15)}</button>
          <button class="graph-control-btn" id="btn-zoom-out" title="Zoom Out">${icon('zoomOut', 15)}</button>
          <button class="graph-control-btn" id="btn-zoom-fit" title="Fit View">${icon('maximize', 15)}</button>
          <button class="graph-control-btn" id="btn-reset" title="Reset">${icon('refresh', 15)}</button>
        </div>
        <div class="graph-info-bar" id="graph-info"></div>
        <div class="graph-legend" id="graph-legend"></div>
      </div>
      <div class="graph-detail-panel" id="graph-detail" style="display:none;"></div>
    </div>`;

  renderFilters();
  renderLegend();
  await loadAndRenderGraph();
  initControls();
  
  if (params.id) {
    setTimeout(() => {
      const svgEl = document.getElementById('graph-svg');
      if (svgEl && svgEl._nodes) {
        const node = svgEl._nodes.find(n => n.id === params.id);
        if (node) {
          selectNode(params.id, svgEl._nodes, svgEl._links);
          const d = svgEl._dims;
          const v = svgEl._viewBox;
          v.x = node.x - d.width / 2;
          v.y = node.y - d.height / 2;
          svgEl.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
          applyZoomScaling();
        }
      }
    }, 500);
  }

  return () => { container.style.padding = ''; };
}

function renderFilters() {
  const el = document.getElementById('graph-filters');
  el.innerHTML = `
    <div class="graph-filter-group">
      <div class="graph-filter-title">Node Types</div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        ${Object.entries(NODE_TYPES).map(([key, val]) => `
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-secondary);font-weight:450;">
            <input type="checkbox" data-type="${key}" ${state.graphFilters.nodeTypes.includes(key) ? 'checked' : ''} style="accent-color:${val.color};width:14px;height:14px;"/>
            <span style="display:flex;align-items:center;gap:5px;">
              <span style="width:6px;height:6px;border-radius:50%;background:${val.color};"></span>
              ${val.label}
            </span>
          </label>`).join('')}
      </div>
    </div>
    <div class="graph-filter-group">
      <div class="graph-filter-title">Clustering Focus</div>
      <select class="select" id="cluster-select" style="font-size:12px;">
        <option value="">Default Layout (No Clustering)</option>
        ${Object.entries(NODE_TYPES).map(([k, v]) => `<option value="${k}" ${state.graphFilters.clusterFocus === k ? 'selected' : ''}>Focus: ${v.label}</option>`).join('')}
        <option value="all" ${state.graphFilters.clusterFocus === 'all' ? 'selected' : ''}>Cluster All Types</option>
      </select>
    </div>
    <button class="btn btn-secondary w-full" id="btn-apply-filters" style="margin-top:8px;">Apply Filters</button>`;

  el.querySelector('#btn-apply-filters').addEventListener('click', () => {
    state.graphFilters.nodeTypes = Array.from(el.querySelectorAll('input[type=checkbox][data-type]:checked')).map(cb => cb.dataset.type);
    state.graphFilters.clusterFocus = el.querySelector('#cluster-select').value;
    loadAndRenderGraph();
  });
}

function renderLegend() {
  const el = document.getElementById('graph-legend');
  el.innerHTML = state.graphFilters.nodeTypes.map(type => {
    const t = NODE_TYPES[type];
    return `<div class="legend-item"><div class="legend-dot" style="background:${t.color};"></div>${t.label}</div>`;
  }).join('');
}

async function loadAndRenderGraph() {
  try {
    const types = state.graphFilters.nodeTypes;
    const graphData = await api.getGraph(types.length < 10 ? types : null);
    document.getElementById('graph-info').innerHTML = `
      <span class="stat">${icon('barChart', 13)} ${graphData.nodes.length} nodes</span>
      <span class="stat">${icon('link', 13)} ${graphData.edges.length} edges</span>`;
    renderGraph(graphData);
    renderLegend();
  } catch (err) { console.error('Graph load error:', err); }
}

function renderGraph(data) {
  const wrapper = document.getElementById('graph-canvas-wrapper');
  const svgEl = document.getElementById('graph-svg');
  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;
  svgEl.innerHTML = '';
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const nodes = data.nodes.map(n => ({ ...n, x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0, radius: getNodeRadius(n) }));
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const links = data.edges.filter(e => nodeMap.has(e.source) && nodeMap.has(e.target)).map(e => ({ ...e, sourceNode: nodeMap.get(e.source), targetNode: nodeMap.get(e.target) }));

  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  const marker = document.createElementNS(ns, 'marker');
  marker.setAttribute('id', 'arrowhead'); marker.setAttribute('viewBox', '0 0 10 7');
  marker.setAttribute('refX', '10'); marker.setAttribute('refY', '3.5');
  marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '6'); marker.setAttribute('orient', 'auto');
  const mp = document.createElementNS(ns, 'path'); mp.setAttribute('d', 'M 0 0 L 10 3.5 L 0 7 z'); mp.setAttribute('fill', '#cbd5e1');
  marker.appendChild(mp); defs.appendChild(marker); svgEl.appendChild(defs);

  const linkGroup = document.createElementNS(ns, 'g'); linkGroup.setAttribute('class', 'links'); svgEl.appendChild(linkGroup);
  const nodeGroup = document.createElementNS(ns, 'g'); nodeGroup.setAttribute('class', 'nodes'); svgEl.appendChild(nodeGroup);

  const focusType = state.graphFilters.clusterFocus;
  const hasFocus = !!focusType && focusType !== 'all';

  const focusGroupIds = new Set();
  if (hasFocus) {
    nodes.forEach(n => { if (n.type === focusType) focusGroupIds.add(n.id); });
    links.forEach(l => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      if (focusGroupIds.has(srcId)) focusGroupIds.add(tgtId);
      if (focusGroupIds.has(tgtId)) focusGroupIds.add(srcId);
    });
  }

  links.forEach(link => {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('class', 'graph-link'); line.setAttribute('data-id', link.id);
    
    if (hasFocus) {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
      if (!focusGroupIds.has(srcId) || !focusGroupIds.has(tgtId)) {
        line.classList.add('unfocused');
        line.style.opacity = '0.01'; // Extremely faint
      } else {
        line.style.strokeWidth = '1.5px'; // Thicker lines for related
      }
    }
    
    line.setAttribute('marker-end', 'url(#arrowhead)'); line.dataset.source = link.source; line.dataset.target = link.target;
    linkGroup.appendChild(line);
  });

  nodes.forEach(node => {
    const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'graph-node'); g.dataset.id = node.id;
    let isAnchor = false;
    let isRelated = false;
    
    if (hasFocus) {
      if (node.type === focusType) {
        isAnchor = true;
        g.classList.add('focused-anchor');
      } else if (focusGroupIds.has(node.id)) {
        isRelated = true;
      } else {
        g.classList.add('unfocused');
      }
    }
    
    const color = NODE_TYPES[node.type]?.color || '#666';
    const bgColor = NODE_TYPES[node.type]?.bgColor || '#f5f5f5';

    // Make anchors massive, related slightly larger, and unrelated nodes tiny specks
    let currentRadius = node.radius;
    if (isAnchor) {
      currentRadius *= 1.6;
    } else if (isRelated) {
      currentRadius *= 1.1;
    } else if (hasFocus) {
      currentRadius *= 0.25;
    }

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('r', currentRadius); circle.setAttribute('fill', bgColor);
    circle.setAttribute('stroke', color); circle.setAttribute('stroke-width', isAnchor ? '3' : '1.5');
    circle.setAttribute('data-base-r', currentRadius);
    g.appendChild(circle);

    // Small inner circle as icon placeholder, hide for unrelated
    if (!hasFocus || isAnchor || isRelated) {
      const inner = document.createElementNS(ns, 'circle');
      const innerRadius = isAnchor ? 4 : 3;
      inner.setAttribute('r', innerRadius); inner.setAttribute('fill', color); inner.setAttribute('opacity', '0.6');
      inner.setAttribute('data-base-r', innerRadius);
      g.appendChild(inner);
    }

    const label = document.createElementNS(ns, 'text');
    label.setAttribute('text-anchor', 'middle'); label.setAttribute('dy', currentRadius + 13);
    label.setAttribute('data-base-dy', currentRadius + 13);
    const name = node.properties.title || node.properties.name || node.properties.tag_number || '';
    label.textContent = name.length > 22 ? name.substring(0, 22) + '…' : name;
    
    // Hide text for unrelated nodes to clean up view
    if (hasFocus && !isAnchor && !isRelated) {
      label.style.display = 'none';
    }
    
    g.appendChild(label);

    g.addEventListener('click', (e) => { e.stopPropagation(); selectNode(node.id, nodes, links); });
    g.addEventListener('dblclick', (e) => { e.stopPropagation(); navigate('node-detail', { id: node.id }); });

    let dragging = false;
    g.addEventListener('mousedown', () => {
      dragging = true; node.fx = node.x; node.fy = node.y;
      const onMove = (ev) => { if (dragging) { node.fx = node.x = ev.offsetX; node.fy = node.y = ev.offsetY; updatePositions(nodes, links); }};
      const onUp = () => { dragging = false; delete node.fx; delete node.fy; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    });
    nodeGroup.appendChild(g);
  });

  svgEl.addEventListener('click', () => deselectNode(nodes, links));
  runSimulation(nodes, links, width, height);

  let viewBox = { x: 0, y: 0, w: width, h: height };
  let isPanning = false, startPan = { x: 0, y: 0 };
  svgEl.addEventListener('wheel', (e) => {
    e.preventDefault(); const scale = e.deltaY > 0 ? 1.1 : 0.9;
    const mx = e.offsetX / wrapper.clientWidth; const my = e.offsetY / wrapper.clientHeight;
    const nw = viewBox.w * scale; const nh = viewBox.h * scale;
    viewBox.x += (viewBox.w - nw) * mx; viewBox.y += (viewBox.h - nh) * my;
    viewBox.w = nw; viewBox.h = nh; svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    applyZoomScaling();
  });
  svgEl.addEventListener('mousedown', (e) => { if (e.target === svgEl || e.target.closest('.links')) { isPanning = true; startPan = { x: e.clientX, y: e.clientY }; } });
  svgEl.addEventListener('mousemove', (e) => { if (!isPanning) return; viewBox.x -= (e.clientX - startPan.x) * (viewBox.w / wrapper.clientWidth); viewBox.y -= (e.clientY - startPan.y) * (viewBox.h / wrapper.clientHeight); startPan = { x: e.clientX, y: e.clientY }; svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`); });
  window.addEventListener('mouseup', () => { isPanning = false; });
  svgEl._viewBox = viewBox; svgEl._dims = { width, height };
  svgEl._nodes = nodes; svgEl._links = links;
}

function getNodeRadius(node) {
  return { system: 20, equipment: 16, incident: 15, lesson: 14, edl: 13, opl: 13, failure_mode: 13, person: 12, skill: 11, training: 11 }[node.type] || 13;
}

function runSimulation(nodes, links, width, height) {
  let alpha = 1;
  const focusType = state.graphFilters.clusterFocus;
  const isClusteringAll = focusType === 'all';
  const hasFocus = !!focusType && focusType !== 'all';
  const clusterCenters = {};
  
  const focusNodes = hasFocus ? nodes.filter(n => n.type === focusType) : [];
  
  if (hasFocus && focusNodes.length > 0) {
    // Grid layout for individual focus nodes
    const cols = Math.ceil(Math.sqrt(focusNodes.length));
    const rows = Math.ceil(focusNodes.length / cols);
    const cellW = width / cols;
    const cellH = height / rows;
    
    focusNodes.forEach((n, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      clusterCenters[n.id] = {
        x: cellW * c + cellW / 2,
        y: cellH * r + cellH / 2
      };
    });
  } else if (isClusteringAll) {
    const types = Object.keys(NODE_TYPES);
    const angleStep = (2 * Math.PI) / types.length;
    const radius = Math.min(width, height) * 0.35;
    
    types.forEach((t, i) => {
      clusterCenters[t] = { 
        x: width/2 + Math.cos(i*angleStep)*radius, 
        y: height/2 + Math.sin(i*angleStep)*radius 
      };
    });
  }

  function tick() {
    if (alpha < 0.001) return; alpha *= 0.98;
    
    if (hasFocus && focusNodes.length > 0) {
      nodes.forEach(n => {
        if (n.type === focusType && clusterCenters[n.id]) {
          const center = clusterCenters[n.id];
          n.vx += (center.x - n.x) * 0.15 * alpha;
          n.vy += (center.y - n.y) * 0.15 * alpha;
        } else {
          n.vx += (width / 2 - n.x) * 0.005 * alpha;
          n.vy += (height / 2 - n.y) * 0.005 * alpha;
        }
      });
    } else if (isClusteringAll) {
      nodes.forEach(n => {
        const center = clusterCenters[n.type];
        if (center) {
          n.vx += (center.x - n.x) * 0.08 * alpha;
          n.vy += (center.y - n.y) * 0.08 * alpha;
        } else {
          n.vx += (width / 2 - n.x) * 0.01 * alpha; n.vy += (height / 2 - n.y) * 0.01 * alpha;
        }
      });
    } else {
      nodes.forEach(n => { n.vx += (width / 2 - n.x) * 0.01 * alpha; n.vy += (height / 2 - n.y) * 0.01 * alpha; });
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x; let dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1; let force = -300 * alpha / (dist * dist);
        if (isClusteringAll) force *= 0.5;
        if (hasFocus) force *= 0.3; // Reduce collision so they can pack around the center
        nodes[i].vx -= dx / dist * force; nodes[i].vy -= dy / dist * force;
        nodes[j].vx += dx / dist * force; nodes[j].vy += dy / dist * force;
      }
    }
    links.forEach(l => {
      let dx = l.targetNode.x - l.sourceNode.x; let dy = l.targetNode.y - l.sourceNode.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1; 
      // Stronger pull towards focus nodes if hasFocus, otherwise normal
      let force = (dist - 100) * (isClusteringAll ? 0.01 : 0.05) * alpha;
      if (hasFocus && (l.sourceNode.type === focusType || l.targetNode.type === focusType)) {
        force = (dist - 80) * 0.08 * alpha; // tighter links for the focus groups
      }
      l.sourceNode.vx += dx / dist * force; l.sourceNode.vy += dy / dist * force;
      l.targetNode.vx -= dx / dist * force; l.targetNode.vy -= dy / dist * force;
    });
    nodes.forEach(n => {
      if (n.fx !== undefined) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; return; }
      n.vx *= 0.4; n.vy *= 0.4; n.x += n.vx; n.y += n.vy;
      n.x = Math.max(30, Math.min(width - 30, n.x)); n.y = Math.max(30, Math.min(height - 30, n.y));
    });
    updatePositions(nodes, links); requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updatePositions(nodes, links) {
  const svgEl = document.getElementById('graph-svg'); if (!svgEl) return;
  const wrapper = document.getElementById('graph-canvas-wrapper');
  let inverseScale = 1;
  if (svgEl._viewBox && wrapper) {
    const zoomScale = wrapper.clientWidth / svgEl._viewBox.w;
    inverseScale = 1 / Math.pow(zoomScale, 0.7);
  }

  nodes.forEach(node => { const g = svgEl.querySelector(`.graph-node[data-id="${node.id}"]`); if (g) g.setAttribute('transform', `translate(${node.x}, ${node.y})`); });
  links.forEach(link => {
    const line = svgEl.querySelector(`.graph-link[data-id="${link.id}"]`); if (!line) return;
    const dx = link.targetNode.x - link.sourceNode.x; const dy = link.targetNode.y - link.sourceNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1; 
    
    // Calculate radius dynamically based on state
    let tr = link.targetNode.radius;
    const focusType = state.graphFilters.clusterFocus;
    if (focusType && focusType !== 'all') {
      if (link.targetNode.type === focusType) tr = link.targetNode.radius * 1.6;
      else if (link.targetNode.radius * 1.1 > link.targetNode.radius) tr = link.targetNode.radius * 1.1; 
      else tr = link.targetNode.radius * 0.25;
    }
    
    tr = (tr * inverseScale) + (4 * inverseScale);
    
    line.setAttribute('x1', link.sourceNode.x); line.setAttribute('y1', link.sourceNode.y);
    line.setAttribute('x2', link.targetNode.x - (dx / dist) * tr); line.setAttribute('y2', link.targetNode.y - (dy / dist) * tr);
  });
}

function selectNode(nodeId, nodes, links) {
  selectedNodeId = nodeId;
  const svgEl = document.getElementById('graph-svg');
  const connected = new Set([nodeId]); const connEdges = new Set();
  links.forEach(l => { if (l.source === nodeId || l.target === nodeId) { connected.add(l.source); connected.add(l.target); connEdges.add(l.id); } });
  svgEl.querySelectorAll('.graph-node').forEach(g => { const id = g.dataset.id; g.classList.toggle('selected', id === nodeId); g.classList.toggle('highlighted', connected.has(id) && id !== nodeId); g.classList.toggle('dimmed', !connected.has(id)); });
  svgEl.querySelectorAll('.graph-link').forEach(l => { l.classList.toggle('highlighted', connEdges.has(l.dataset.id)); l.classList.toggle('dimmed', !connEdges.has(l.dataset.id)); });
  showDetailPanel(nodeId);
}

function deselectNode() {
  const svgEl = document.getElementById('graph-svg');
  svgEl.querySelectorAll('.graph-node').forEach(g => { g.classList.remove('selected', 'highlighted', 'dimmed'); });
  svgEl.querySelectorAll('.graph-link').forEach(l => { l.classList.remove('highlighted', 'dimmed'); });
  document.getElementById('graph-detail').style.display = 'none';
}

async function showDetailPanel(nodeId) {
  const panel = document.getElementById('graph-detail'); panel.style.display = 'flex';
  try {
    const data = await api.getNode(nodeId);
    const t = NODE_TYPES[data.type] || { icon: icons.info, label: data.type, color: '#666' };
    panel.innerHTML = `
      <div class="graph-detail-header">
        <div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="color:${t.color};display:flex;">${t.icon}</span>
            <span class="badge badge-${data.type}">${t.label}</span>
          </div>
          <h3 style="font-size:14px;font-weight:600;">${data.properties.title || data.properties.name || data.id}</h3>
        </div>
        <button class="modal-close" id="close-detail">${icon('close', 14)}</button>
      </div>
      <div class="graph-detail-body">
        <div class="detail-section">
          <div class="detail-section-title">Properties</div>
          ${Object.entries(data.properties).filter(([k, v]) => v && k !== 'title' && k !== 'name').map(([k, v]) => `
            <div class="detail-field"><div class="detail-field-label">${k.replace(/_/g, ' ')}</div><div class="detail-field-value">${Array.isArray(v) ? v.join(', ') : v}</div></div>`).join('')}
        </div>
        <div class="detail-section">
          <div class="detail-section-title">Relationships (${data.relationships.length})</div>
          ${data.relationships.map(rel => {
            const rt = NODE_TYPES[rel.node?.type] || { icon: icons.info, color: '#666' };
            return `<div class="rel-card" data-id="${rel.node?.id}">
              <div class="rel-icon" style="background:${rt.bgColor || '#f5f5f5'};color:${rt.color};">${rt.icon}</div>
              <div class="rel-info"><div class="rel-name truncate">${rel.node?.properties?.title || rel.node?.properties?.name || ''}</div>
              <div class="rel-type">${rel.direction === 'out' ? '→' : '←'} ${rel.edge.type.replace(/_/g, ' ')}</div></div></div>`;
          }).join('')}
        </div>
        <button class="btn btn-primary w-full" id="btn-open-detail">${icon('externalLink', 14)} Open Full Detail</button>
      </div>`;
    panel.querySelector('#close-detail').addEventListener('click', () => { panel.style.display = 'none'; });
    panel.querySelector('#btn-open-detail').addEventListener('click', () => navigate('node-detail', { id: nodeId }));
    panel.querySelectorAll('.rel-card').forEach(c => c.addEventListener('click', () => navigate('node-detail', { id: c.dataset.id })));
  } catch (err) { panel.innerHTML = `<div style="padding:20px;color:var(--text-muted);">Error loading node</div>`; }
}

function initControls() {
  const svgEl = document.getElementById('graph-svg');
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => { const v = svgEl._viewBox; v.x += v.w * 0.1; v.y += v.h * 0.1; v.w *= 0.8; v.h *= 0.8; svgEl.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); applyZoomScaling(); });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => { const v = svgEl._viewBox; v.x -= v.w * 0.125; v.y -= v.h * 0.125; v.w *= 1.25; v.h *= 1.25; svgEl.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); applyZoomScaling(); });
  document.getElementById('btn-zoom-fit')?.addEventListener('click', () => { const d = svgEl._dims; const v = svgEl._viewBox; v.x = 0; v.y = 0; v.w = d.width; v.h = d.height; svgEl.setAttribute('viewBox', `0 0 ${d.width} ${d.height}`); applyZoomScaling(); });
  document.getElementById('btn-reset')?.addEventListener('click', () => { loadAndRenderGraph(); });
}

function applyZoomScaling() {
  const svgEl = document.getElementById('graph-svg');
  const wrapper = document.getElementById('graph-canvas-wrapper');
  if (!svgEl || !svgEl._nodes || !svgEl._viewBox || !wrapper) return;
  const zoomScale = wrapper.clientWidth / svgEl._viewBox.w;
  const inverseScale = 1 / Math.pow(zoomScale, 0.7);

  svgEl.querySelectorAll('.graph-node').forEach(g => {
    const circle = g.querySelector('circle');
    if (circle && circle.hasAttribute('data-base-r')) {
      const baseR = parseFloat(circle.getAttribute('data-base-r'));
      circle.setAttribute('r', baseR * inverseScale);
    }
    const inner = g.querySelectorAll('circle')[1];
    if (inner && inner.hasAttribute('data-base-r')) {
      const baseInnerR = parseFloat(inner.getAttribute('data-base-r'));
      inner.setAttribute('r', baseInnerR * inverseScale);
    }
    const text = g.querySelector('text');
    if (text && text.hasAttribute('data-base-dy')) {
      const baseDy = parseFloat(text.getAttribute('data-base-dy'));
      text.setAttribute('dy', baseDy * inverseScale);
      text.style.fontSize = `${10 * inverseScale}px`;
    }
  });

  if (svgEl._nodes && svgEl._links) {
     updatePositions(svgEl._nodes, svgEl._links);
  }
}
