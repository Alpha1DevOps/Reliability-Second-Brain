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
        }
      }
    }, 500);
  }

  return () => { container.style.padding = ''; };
}

function renderFilters() {
  const el = document.getElementById('graph-filters');
  const allLocations = ['APU-A', 'APU-B', 'APU-C', 'APU-D', 'APU-E', 'APU-F'];

  // Safe fallback if state.js was cached by browser
  if (!state.graphFilters.locations) state.graphFilters.locations = [...allLocations];

  el.innerHTML = `
    <div class="graph-filter-group">
      <div class="graph-filter-title">Area / Location</div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        ${allLocations.map(loc => `
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-secondary);font-weight:450;">
            <input type="checkbox" data-loc="${loc}" ${(state.graphFilters.locations || []).includes(loc) ? 'checked' : ''} style="width:14px;height:14px;"/>
            <span>${loc}</span>
          </label>`).join('')}
      </div>
    </div>
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
    state.graphFilters.locations = Array.from(el.querySelectorAll('input[type=checkbox][data-loc]:checked')).map(cb => cb.dataset.loc);
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
    const locations = state.graphFilters.locations || [];
    const graphData = await api.getGraph(types.length < 10 ? types : null);

    // Apply Area Filter
    graphData.nodes = graphData.nodes.filter(n => {
      const loc = n.properties?.location;
      return loc ? locations.includes(loc) : true;
    });

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
  marker.appendChild(mp); defs.appendChild(marker);

  const markerCross = document.createElementNS(ns, 'marker');
  markerCross.setAttribute('id', 'arrowhead-cross'); markerCross.setAttribute('viewBox', '0 0 10 7');
  markerCross.setAttribute('refX', '10'); markerCross.setAttribute('refY', '3.5');
  markerCross.setAttribute('markerWidth', '8'); markerCross.setAttribute('markerHeight', '6'); markerCross.setAttribute('orient', 'auto');
  const mpCross = document.createElementNS(ns, 'path'); mpCross.setAttribute('d', 'M 0 0 L 10 3.5 L 0 7 z'); mpCross.setAttribute('fill', '#f59e0b');
  markerCross.appendChild(mpCross); defs.appendChild(markerCross);

  const markerSkill = document.createElementNS(ns, 'marker');
  markerSkill.setAttribute('id', 'arrowhead-skill'); markerSkill.setAttribute('viewBox', '0 0 10 7');
  markerSkill.setAttribute('refX', '10'); markerSkill.setAttribute('refY', '3.5');
  markerSkill.setAttribute('markerWidth', '8'); markerSkill.setAttribute('markerHeight', '6'); markerSkill.setAttribute('orient', 'auto');
  const mpSkill = document.createElementNS(ns, 'path'); mpSkill.setAttribute('d', 'M 0 0 L 10 3.5 L 0 7 z'); mpSkill.setAttribute('fill', '#4ade80');
  markerSkill.appendChild(mpSkill); defs.appendChild(markerSkill);

  svgEl.appendChild(defs);

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
        line.dataset.baseStroke = '1';
      } else {
        line.dataset.baseStroke = '1.5'; // Thicker lines for related
      }
    } else {
      line.dataset.baseStroke = '1';
    }

    const isSkillLink = (link.sourceNode?.type === 'skill' || link.targetNode?.type === 'skill');
    const isCrossArea = link.sourceNode?.properties?.location && link.targetNode?.properties?.location && link.sourceNode.properties.location !== link.targetNode.properties.location;

    if (isSkillLink) {
      line.classList.add('skill-link');
      line.setAttribute('marker-end', 'url(#arrowhead-skill)');
      line.style.stroke = 'rgba(74, 222, 128, 0.4)'; // subtle light green
      line.style.strokeDasharray = '2,4'; // dashed to reduce visual weight
      line.dataset.baseStroke = '0.5'; // very thin
    } else if (isCrossArea) {
      line.classList.add('cross-area-link');
      line.setAttribute('marker-end', 'url(#arrowhead-cross)');
      line.style.stroke = '#f59e0b';
      line.style.strokeDasharray = '4,4';
    } else {
      line.setAttribute('marker-end', 'url(#arrowhead)');
      line.style.stroke = '';
      line.style.strokeDasharray = '';
    }

    line.dataset.source = link.source; line.dataset.target = link.target;
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

    // Add solid background to prevent lines from showing through the translucent node
    const bgCircle = document.createElementNS(ns, 'circle');
    bgCircle.setAttribute('r', currentRadius); bgCircle.setAttribute('fill', 'var(--bg-default)');
    g.appendChild(bgCircle);

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('r', currentRadius); circle.setAttribute('fill', color);
    circle.setAttribute('stroke', color); circle.setAttribute('stroke-width', isAnchor ? '3' : '1.5');
    g.appendChild(circle);

    // Small inner circle as icon placeholder, hide for unrelated
    if (!hasFocus || isAnchor || isRelated) {
      const inner = document.createElementNS(ns, 'circle');
      inner.setAttribute('r', isAnchor ? 4 : 3); inner.setAttribute('fill', color); inner.setAttribute('opacity', '0.6');
      g.appendChild(inner);
    }

    const label = document.createElementNS(ns, 'text');
    label.setAttribute('class', 'node-label');
    label.setAttribute('text-anchor', 'middle'); label.setAttribute('dy', currentRadius + 15);
    const name = node.properties.title || node.properties.name || node.properties.tag_number || '';
    label.textContent = name.length > 22 ? name.substring(0, 22) + '…' : name;

    // Hide text for unrelated nodes to clean up view
    if (hasFocus && !isAnchor && !isRelated) {
      label.style.display = 'none';
    }

    g.appendChild(label);

    // Render penalty_loss inside the circle
    if (node.properties?.penalty_loss !== undefined) {
      const penaltyText = document.createElementNS(ns, 'text');
      penaltyText.setAttribute('class', 'node-penalty');
      penaltyText.setAttribute('text-anchor', 'middle');
      penaltyText.setAttribute('dominant-baseline', 'central');
      penaltyText.setAttribute('fill', '#ffffff'); // White text
      // Relying on CSS text-shadow for outline effect
      penaltyText.style.fontWeight = '800'; // Extra bold
      penaltyText.style.fontSize = Math.max(10, currentRadius * 0.75) + 'px'; // Slightly larger
      penaltyText.style.pointerEvents = 'none';
      penaltyText.style.fontFamily = 'var(--font-sans)';

      let pVal = node.properties.penalty_loss;
      if (typeof pVal === 'string') {
        pVal = pVal.replace(' KUSD', 'K').replace(' MUSD', 'M');
      }
      penaltyText.textContent = pVal;

      if (hasFocus && !isAnchor && !isRelated) {
        penaltyText.style.display = 'none';
      }
      g.appendChild(penaltyText);
    }

    g.addEventListener('click', (e) => { e.stopPropagation(); selectNode(node.id, nodes, links); });
    g.addEventListener('dblclick', (e) => { e.stopPropagation(); navigate('node-detail', { id: node.id }); });
    g.addEventListener('mouseenter', () => handleNodeHover(node.id, nodes, links));
    g.addEventListener('mouseleave', () => handleNodeUnhover(nodes, links));

    let dragging = false;
    g.addEventListener('mousedown', () => {
      dragging = true; node.fx = node.x; node.fy = node.y;
      const onMove = (ev) => { if (dragging) { node.fx = node.x = ev.offsetX; node.fy = node.y = ev.offsetY; updatePositions(nodes, links); } };
      const onUp = () => { dragging = false; delete node.fx; delete node.fy; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    });
    nodeGroup.appendChild(g);
  });

  // Removed background click deselect so the user can pan freely without closing the panel
  // svgEl.addEventListener('click', () => deselectNode(nodes, links));

  runSimulation(nodes, links, width, height);

  let viewBox = { x: 0, y: 0, w: width, h: height };
  let isPanning = false, startPan = { x: 0, y: 0 };
  svgEl.addEventListener('wheel', (e) => {
    e.preventDefault(); const scale = e.deltaY > 0 ? 1.1 : 0.9;
    const mx = e.offsetX / wrapper.clientWidth; const my = e.offsetY / wrapper.clientHeight;
    const nw = viewBox.w * scale; const nh = viewBox.h * scale;
    viewBox.x += (viewBox.w - nw) * mx; viewBox.y += (viewBox.h - nh) * my;
    viewBox.w = nw; viewBox.h = nh; svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    updatePositions(svgEl._nodes, svgEl._links);
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

  // Calculate Location Centers and dynamic radii
  const uniqueLocations = [...new Set(nodes.map(n => n.properties?.location).filter(Boolean))].sort();
  const locationCenters = {};
  const locCounts = {};
  const locRadii = {};

  nodes.forEach(n => {
    const loc = n.properties?.location;
    if (loc) locCounts[loc] = (locCounts[loc] || 0) + 1;
  });

  const numLocs = uniqueLocations.length;
  if (numLocs > 0) {
    const angleStep = (2 * Math.PI) / numLocs;
    // Bring clusters closer together
    const layoutRadius = Math.max(width, height) * 0.5;
    uniqueLocations.forEach((loc, i) => {
      const angle = i * angleStep - Math.PI / 2; // start top, clockwise
      locationCenters[loc] = {
        x: width / 2 + Math.cos(angle) * layoutRadius,
        y: height / 2 + Math.sin(angle) * layoutRadius
      };
      // Dynamic radius using square root scaling to fit packed nodes perfectly without being excessively large
      locRadii[loc] = 100 + Math.sqrt(locCounts[loc] || 1) * 20;
    });
  }

  // Initialize node positions near their location centers to avoid initial cross-cluster tangling
  nodes.forEach(n => {
    if (n.x === undefined || isNaN(n.x)) {
      const loc = n.properties?.location;
      const center = loc && locationCenters[loc] ? locationCenters[loc] : { x: width / 2, y: height / 2 };
      const r = loc && locRadii[loc] ? locRadii[loc] * 0.5 : 100;
      n.x = center.x + (Math.random() - 0.5) * r;
      n.y = center.y + (Math.random() - 0.5) * r;
    }
  });

  // Draw Location Backgrounds
  const ns = 'http://www.w3.org/2000/svg';
  const svgEl = document.getElementById('graph-svg');
  let locGroup = svgEl.querySelector('.locations-group');
  if (!locGroup) {
    locGroup = document.createElementNS(ns, 'g');
    locGroup.setAttribute('class', 'locations-group');
    locGroup.setAttribute('style', 'pointer-events: none;');
    const firstChild = svgEl.firstChild;
    if (firstChild.tagName === 'defs') {
      svgEl.insertBefore(locGroup, firstChild.nextSibling);
    } else {
      svgEl.insertBefore(locGroup, firstChild);
    }
  }
  locGroup.innerHTML = '';

  if (numLocs > 0) {
    uniqueLocations.forEach(loc => {
      const center = locationCenters[loc];
      const clusterRadius = locRadii[loc];
      const g = document.createElementNS(ns, 'g');

      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', center.x); circle.setAttribute('cy', center.y);
      circle.setAttribute('r', clusterRadius);
      circle.setAttribute('fill', 'rgba(255, 255, 255, 0.01)');
      circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('stroke-dasharray', '8,8');
      g.appendChild(circle);

      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', center.x); label.setAttribute('y', center.y - clusterRadius - 15);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'rgba(255, 255, 255, 0.3)');
      label.setAttribute('font-size', '18px');
      label.setAttribute('font-weight', '600');
      label.setAttribute('letter-spacing', '2px');
      label.textContent = loc;
      g.appendChild(label);

      locGroup.appendChild(g);
    });
  }

  const focusNodes = hasFocus ? nodes.filter(n => n.type === focusType) : [];
  const focusCenters = {};

  if (hasFocus && focusNodes.length > 0) {
    const nodesByLoc = {};
    focusNodes.forEach(n => {
      const loc = n.properties?.location || 'global';
      if (!nodesByLoc[loc]) nodesByLoc[loc] = [];
      nodesByLoc[loc].push(n);
    });

    Object.entries(nodesByLoc).forEach(([loc, locNodes]) => {
      const center = locationCenters[loc] || { x: width / 2, y: height / 2 };
      const cols = Math.ceil(Math.sqrt(locNodes.length));
      const rows = Math.ceil(locNodes.length / cols);
      const cellW = 70;
      const cellH = 70;
      const startX = center.x - (cols * cellW) / 2 + cellW / 2;
      const startY = center.y - (rows * cellH) / 2 + cellH / 2;

      locNodes.forEach((n, i) => {
        focusCenters[n.id] = {
          x: startX + (i % cols) * cellW,
          y: startY + Math.floor(i / cols) * cellH
        };
      });
    });
  }

  const typeOffsets = {};
  if (isClusteringAll) {
    const types = Object.keys(NODE_TYPES);
    const angleStep = (2 * Math.PI) / types.length;
    const miniRadius = 140;
    types.forEach((t, i) => {
      typeOffsets[t] = { dx: Math.cos(i * angleStep) * miniRadius, dy: Math.sin(i * angleStep) * miniRadius };
    });
  }

  function tick(isWarmup = false) {
    if (alpha < 0.001) return; alpha *= 0.98;

    if (hasFocus && focusNodes.length > 0) {
      nodes.forEach(n => {
        const locCenter = locationCenters[n.properties?.location] || { x: width / 2, y: height / 2 };
        if (n.type === focusType && focusCenters[n.id]) {
          const center = focusCenters[n.id];
          n.vx += (center.x - n.x) * 0.15 * alpha;
          n.vy += (center.y - n.y) * 0.15 * alpha;
        } else {
          n.vx += (locCenter.x - n.x) * 0.01 * alpha;
          n.vy += (locCenter.y - n.y) * 0.01 * alpha;
        }
      });
    } else if (isClusteringAll) {
      nodes.forEach(n => {
        const locCenter = locationCenters[n.properties?.location] || { x: width / 2, y: height / 2 };
        const offset = typeOffsets[n.type];
        if (offset) {
          n.vx += (locCenter.x + offset.dx - n.x) * 0.08 * alpha;
          n.vy += (locCenter.y + offset.dy - n.y) * 0.08 * alpha;
        } else {
          n.vx += (locCenter.x - n.x) * 0.01 * alpha;
          n.vy += (locCenter.y - n.y) * 0.01 * alpha;
        }
      });
    } else {
      nodes.forEach(n => {
        const locCenter = locationCenters[n.properties?.location] || { x: width / 2, y: height / 2 };
        n.vx += (locCenter.x - n.x) * 0.1 * alpha;
        n.vy += (locCenter.y - n.y) * 0.1 * alpha;
      });
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x; let dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1; let force = -300 * alpha / (dist * dist);
        if (isClusteringAll) force *= 0.5;
        if (hasFocus) force *= 0.3; // Reduce collision so they can pack

        // Push apart slightly more if they belong to different locations
        if (nodes[i].properties?.location !== nodes[j].properties?.location) {
          force *= 1.5;
        }

        nodes[i].vx -= dx / dist * force; nodes[i].vy -= dy / dist * force;
        nodes[j].vx += dx / dist * force; nodes[j].vy += dy / dist * force;
      }
    }
    links.forEach(l => {
      let dx = l.targetNode.x - l.sourceNode.x; let dy = l.targetNode.y - l.sourceNode.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = (dist - 100) * (isClusteringAll ? 0.01 : 0.05) * alpha;
      if (hasFocus && (l.sourceNode.type === focusType || l.targetNode.type === focusType)) {
        force = (dist - 80) * 0.08 * alpha;
      }
      l.sourceNode.vx += dx / dist * force; l.sourceNode.vy += dy / dist * force;
      l.targetNode.vx -= dx / dist * force; l.targetNode.vy -= dy / dist * force;
    });
    nodes.forEach(n => {
      if (n.fx !== undefined) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; return; }
      n.vx *= 0.4; n.vy *= 0.4; n.x += n.vx; n.y += n.vy;

      // Strict invisible boundary to prevent nodes from scattering outside their location
      const loc = n.properties?.location;
      if (loc && locationCenters[loc]) {
        const center = locationCenters[loc];
        // Allow them to touch the inner edge of the dashed circle
        const maxRadius = Math.max(10, locRadii[loc] - (n.radius || 15));
        const dx = n.x - center.x;
        const dy = n.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist > maxRadius) {
          n.x = center.x + (dx / dist) * maxRadius;
          n.y = center.y + (dy / dist) * maxRadius;
        }
      } else {
        // Global boundary for any stray nodes
        const center = { x: width / 2, y: height / 2 };
        const maxRadius = Math.max(width, height) * 0.8;
        const dx = n.x - center.x;
        const dy = n.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist > maxRadius) {
          n.x = center.x + (dx / dist) * maxRadius;
          n.y = center.y + (dy / dist) * maxRadius;
        }
      }
    });

    if (!isWarmup) {
      updatePositions(nodes, links);
      requestAnimationFrame(() => tick(false));
    }
  }

  // Warm up simulation synchronously for 250 ticks to avoid initial visual jitter
  for (let i = 0; i < 250; i++) {
    tick(true);
  }

  // Render initial frame and let the remaining simulation run visually
  updatePositions(nodes, links);
  requestAnimationFrame(() => tick(false));
}

function updatePositions(nodes, links) {
  const svgEl = document.getElementById('graph-svg'); if (!svgEl) return;

  let nodeScale = 1;
  let viewScale = 1;
  if (svgEl._viewBox && svgEl._dims) {
    viewScale = svgEl._dims.width / svgEl._viewBox.w;
    // Cap scale at 1.0 to prevent nodes from growing and overlapping when zooming out
    nodeScale = Math.min(1.0, Math.pow(1 / viewScale, 0.75));

    // Performance LOD (Level of Detail) CSS classes
    svgEl.classList.toggle('zoom-out-far', viewScale < 0.35);
    svgEl.classList.toggle('zoom-out-mid', viewScale >= 0.35 && viewScale < 0.75);
    svgEl.classList.toggle('zoom-in', viewScale >= 0.75);
  }

  nodes.forEach(node => {
    const g = svgEl.querySelector(`.graph-node[data-id="${node.id}"]`);
    if (g) {
      g.setAttribute('transform', `translate(${node.x}, ${node.y}) scale(${nodeScale})`);
    }
  });

  links.forEach(link => {
    const line = svgEl.querySelector(`.graph-link[data-id="${link.id}"]`); if (!line) return;
    const dx = link.targetNode.x - link.sourceNode.x; const dy = link.targetNode.y - link.sourceNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Calculate radius dynamically based on state
    let tr = link.targetNode.radius + 4;
    const focusType = state.graphFilters.clusterFocus;
    if (focusType && focusType !== 'all') {
      if (link.targetNode.type === focusType) tr = (link.targetNode.radius * 1.6) + 4;
      else if (link.targetNode.radius * 1.1 > link.targetNode.radius) tr = (link.targetNode.radius * 1.1) + 4; // Just use 1.1x as fallback for related
      else tr = (link.targetNode.radius * 0.25) + 4;
    }

    tr = tr * nodeScale;

    line.setAttribute('x1', link.sourceNode.x); line.setAttribute('y1', link.sourceNode.y);
    line.setAttribute('x2', link.targetNode.x - (dx / dist) * tr); line.setAttribute('y2', link.targetNode.y - (dy / dist) * tr);

    // Scale the line thickness and arrowhead size
    const baseStroke = parseFloat(line.dataset.baseStroke || '1');
    line.style.strokeWidth = (baseStroke * nodeScale) + 'px';
  });
}

let hoveredNodeId = null;

function highlightNode(nodeId, nodes, links) {
  const svgEl = document.getElementById('graph-svg');
  if (!svgEl) return;
  if (!nodeId) {
    svgEl.querySelectorAll('.graph-node').forEach(g => { g.classList.remove('selected', 'highlighted', 'dimmed'); });
    svgEl.querySelectorAll('.graph-link').forEach(l => { l.classList.remove('highlighted', 'dimmed'); });
    return;
  }
  const connected = new Set([nodeId]); const connEdges = new Set();
  links.forEach(l => {
    const srcId = typeof l.source === 'object' ? l.source.id : l.source;
    const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
    if (srcId === nodeId || tgtId === nodeId) { connected.add(srcId); connected.add(tgtId); connEdges.add(l.id); }
  });
  svgEl.querySelectorAll('.graph-node').forEach(g => { const id = g.dataset.id; g.classList.toggle('selected', id === nodeId); g.classList.toggle('highlighted', connected.has(id) && id !== nodeId); g.classList.toggle('dimmed', !connected.has(id)); });
  svgEl.querySelectorAll('.graph-link').forEach(l => { l.classList.toggle('highlighted', connEdges.has(l.dataset.id)); l.classList.toggle('dimmed', !connEdges.has(l.dataset.id)); });
}

function selectNode(nodeId, nodes, links) {
  selectedNodeId = nodeId;
  highlightNode(nodeId, nodes, links);
  showDetailPanel(nodeId);
}

function deselectNode(nodes, links) {
  selectedNodeId = null;
  highlightNode(hoveredNodeId, nodes, links);
  document.getElementById('graph-detail').style.display = 'none';
}

function handleNodeHover(nodeId, nodes, links) {
  hoveredNodeId = nodeId;
  if (!selectedNodeId) {
    highlightNode(nodeId, nodes, links);
  }
}

function handleNodeUnhover(nodes, links) {
  hoveredNodeId = null;
  if (!selectedNodeId) {
    highlightNode(null, nodes, links);
  }
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
    panel.querySelector('#close-detail').addEventListener('click', () => {
      const svgEl = document.getElementById('graph-svg');
      if (svgEl) deselectNode(svgEl._nodes, svgEl._links);
    });
    panel.querySelector('#btn-open-detail').addEventListener('click', () => navigate('node-detail', { id: nodeId }));
    panel.querySelectorAll('.rel-card').forEach(c => c.addEventListener('click', () => navigate('node-detail', { id: c.dataset.id })));
  } catch (err) { panel.innerHTML = `<div style="padding:20px;color:var(--text-muted);">Error loading node</div>`; }
}

function initControls() {
  const svgEl = document.getElementById('graph-svg');
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => { const v = svgEl._viewBox; v.x += v.w * 0.1; v.y += v.h * 0.1; v.w *= 0.8; v.h *= 0.8; svgEl.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); updatePositions(svgEl._nodes, svgEl._links); });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => { const v = svgEl._viewBox; v.x -= v.w * 0.125; v.y -= v.h * 0.125; v.w *= 1.25; v.h *= 1.25; svgEl.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); updatePositions(svgEl._nodes, svgEl._links); });
  document.getElementById('btn-zoom-fit')?.addEventListener('click', () => { const d = svgEl._dims; const v = svgEl._viewBox; v.x = 0; v.y = 0; v.w = d.width; v.h = d.height; svgEl.setAttribute('viewBox', `0 0 ${d.width} ${d.height}`); updatePositions(svgEl._nodes, svgEl._links); });
  document.getElementById('btn-reset')?.addEventListener('click', () => loadAndRenderGraph());
}
