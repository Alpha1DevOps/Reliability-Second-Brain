import { api } from '../../api.js';
import { NODE_TYPES } from '../../utils/constants.js';
import { navigate } from '../../router.js';
import { icons, icon } from '../../utils/icons.js';

export async function renderDashboard() {
  const container = document.getElementById('page-content');
  container.innerHTML = '<div class="animate-pulse" style="padding:40px;text-align:center;color:var(--text-muted);">Loading dashboard...</div>';

  try {
    const kpis = await api.getKPIs();
    const stats = await api.getStats();
    container.innerHTML = buildDashboardHTML(kpis, stats);
    initDashboardEvents(container);
    animateCounters(container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error loading dashboard: ${err.message}</p></div>`;
  }
}

function buildDashboardHTML(kpis, stats) {
  return `
    <div class="page-header animate-slideUp">
      <div>
        <h1>DOT: Digital Organizational Topology</h1>
        <p class="text-sm text-secondary" style="margin-top:2px;">Connecting every data point to empower the big picture.</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="location.hash='#/graph'">
          ${icon('graph', 16)} Explore Graph
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="dashboard-grid animate-slideUp" style="animation-delay: 80ms;">
      <div class="kpi-card">
        <div class="kpi-card-icon" style="background:#fef2f2;color:#dc2626;">${icon('incident', 18)}</div>
        <div class="kpi-card-value counter" data-target="${kpis.incidentCount}" style="color:var(--text-primary);">0</div>
        <div class="kpi-card-label">Total Incidents</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon" style="background:#fffbeb;color:#d97706;">${icon('lesson', 18)}</div>
        <div class="kpi-card-value counter" data-target="${kpis.lessonCount}" style="color:var(--text-primary);">0</div>
        <div class="kpi-card-label">Lessons Learned</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon" style="background:#ecfdf5;color:#059669;">${icon('opl', 18)}</div>
        <div class="kpi-card-value counter" data-target="${kpis.oplCount}" style="color:var(--text-primary);">0</div>
        <div class="kpi-card-label">OPL Created</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon" style="background:var(--brand-50);color:var(--brand-600);">${icon('link', 18)}</div>
        <div class="kpi-card-value counter" data-target="${stats.totalEdges}" style="color:var(--text-primary);">0</div>
        <div class="kpi-card-label">Knowledge Links</div>
      </div>
    </div>

    <!-- Quality KPIs -->
    <div class="dashboard-grid animate-slideUp" style="animation-delay: 160ms;">
      <div class="kpi-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="kpi-card-value" style="color:#059669;">${kpis.incidentWithLesson.pct}%</div>
            <div class="kpi-card-label">Incident → Lesson</div>
          </div>
          <span style="font-size:11px;color:var(--text-muted);">${kpis.incidentWithLesson.count}/${kpis.incidentWithLesson.total}</span>
        </div>
        <div class="kpi-card-bar"><div class="progress"><div class="progress-bar success" style="width:${kpis.incidentWithLesson.pct}%"></div></div></div>
      </div>
      <div class="kpi-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="kpi-card-value" style="color:#d97706;">${kpis.lessonWithOPL.pct}%</div>
            <div class="kpi-card-label">Lesson → OPL</div>
          </div>
          <span style="font-size:11px;color:var(--text-muted);">${kpis.lessonWithOPL.count}/${kpis.lessonWithOPL.total}</span>
        </div>
        <div class="kpi-card-bar"><div class="progress"><div class="progress-bar warning" style="width:${kpis.lessonWithOPL.pct}%"></div></div></div>
      </div>
      <div class="kpi-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="kpi-card-value" style="color:#2563eb;">${kpis.oplPreventingFM.pct}%</div>
            <div class="kpi-card-label">OPL → Failure Prevention</div>
          </div>
          <span style="font-size:11px;color:var(--text-muted);">${kpis.oplPreventingFM.count}/${kpis.oplPreventingFM.total}</span>
        </div>
        <div class="kpi-card-bar"><div class="progress"><div class="progress-bar accent" style="width:${kpis.oplPreventingFM.pct}%"></div></div></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-card-value" style="color:var(--brand-600);">${kpis.linkDensity}</div>
          <div class="kpi-card-label">Link Density (edges/node)</div>
        </div>
      </div>
    </div>

    <!-- Top Nodes & Distribution -->
    <div class="charts-row animate-slideUp" style="animation-delay: 240ms;">
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Top Connected Nodes</span>
        </div>
        <div class="top-nodes-list">
          ${kpis.topNodes.map((n, i) => {
            const t = NODE_TYPES[n.type] || { icon: icons.info, color: '#666' };
            return `
            <div class="top-node-item" data-id="${n.id}">
              <div class="top-node-rank ${i < 3 ? 'top-3' : ''}">${i + 1}</div>
              <span style="color:${t.color};display:flex;">${t.icon}</span>
              <span class="top-node-name truncate">${n.name}</span>
              <span class="badge badge-${n.type}">${t.label}</span>
              <span class="top-node-count">${n.connections}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Node Distribution</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${Object.entries(stats.nodesByType || {}).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const t = NODE_TYPES[type] || { icon: icons.info, label: type, color: '#666' };
            const maxCount = Math.max(...Object.values(stats.nodesByType || {}));
            const pct = maxCount > 0 ? (count / maxCount * 100) : 0;
            return `
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:18px;text-align:center;color:${t.color};display:flex;justify-content:center;">${t.icon}</span>
              <span style="width:130px;font-size:12px;color:var(--text-secondary);font-weight:500;">${t.label}</span>
              <div style="flex:1;height:6px;background:var(--bg-muted);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${t.color};border-radius:3px;transition:width 1s ease;opacity:0.7;"></div>
              </div>
              <span style="font-size:13px;font-weight:600;color:var(--text-primary);width:28px;text-align:right;">${count}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="animate-slideUp" style="animation-delay: 320ms;">
      <div class="chart-card">
        <div class="chart-card-header"><span class="chart-card-title">Quick Actions</span></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="location.hash='#/incidents'" style="flex:1;min-width:130px;">${icon('incident', 15)} New Incident</button>
          <button class="btn btn-secondary" onclick="location.hash='#/lessons'" style="flex:1;min-width:130px;">${icon('lesson', 15)} New Lesson</button>
          <button class="btn btn-secondary" onclick="location.hash='#/edl'" style="flex:1;min-width:130px;">${icon('edl', 15)} Register EDL</button>
          <button class="btn btn-secondary" onclick="location.hash='#/opl'" style="flex:1;min-width:130px;">${icon('opl', 15)} Create OPL</button>
          <button class="btn btn-secondary" onclick="location.hash='#/graph'" style="flex:1;min-width:130px;">${icon('graph', 15)} Explore Graph</button>
        </div>
      </div>
    </div>
  `;
}

function animateCounters(container) {
  container.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    let current = 0;
    const increment = Math.ceil(target / 25);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current;
    }, 30);
  });
}

function initDashboardEvents(container) {
  container.querySelectorAll('.top-node-item').forEach(item => {
    item.addEventListener('click', () => navigate('node-detail', { id: item.dataset.id }));
  });
}
