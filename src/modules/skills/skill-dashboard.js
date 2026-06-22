import { api } from '../../api.js';
import { navigate } from '../../router.js';
import { NODE_TYPES } from '../../utils/constants.js';
import { icons, icon } from '../../utils/icons.js';

export async function renderSkills() {
  const container = document.getElementById('page-content');
  try {
    const [persons, skills] = await Promise.all([api.getNodes({ type: 'person' }), api.getNodes({ type: 'skill' })]);
    const personSkills = {};
    for (const person of persons) {
      const detail = await api.getNode(person.id);
      personSkills[person.id] = {};
      detail.relationships.forEach(r => { if (r.edge.type === 'has_skill' && r.node) personSkills[person.id][r.node.id] = r.edge.properties?.level || 3; });
    }

    container.innerHTML = `
      <div class="animate-slideUp">
        <div class="page-header"><div><h1>Skills & Learning</h1><p class="text-sm text-secondary">Skill map, gap analysis, and training recommendations</p></div></div>

        <div class="card" style="margin-bottom:16px;overflow-x:auto;">
          <div class="card-header"><span class="card-title" style="display:flex;align-items:center;gap:6px;">${icon('target', 15)} Skill Matrix</span></div>
          <table class="skill-matrix" style="width:100%;">
            <thead><tr>
              <th style="text-align:left;min-width:140px;">Person</th>
              ${skills.map(s => `<th style="min-width:80px;font-size:10px;writing-mode:vertical-rl;text-orientation:mixed;height:100px;">${s.properties.name}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${persons.map(p => `<tr>
                <td style="text-align:left;font-size:12px;font-weight:500;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="color:var(--text-muted);display:flex;">${icon('user', 14)}</span>
                    <div><div>${p.properties.name}</div><div style="font-size:10px;color:var(--text-muted);">${p.properties.role}</div></div>
                  </div>
                </td>
                ${skills.map(s => {
                  const level = personSkills[p.id]?.[s.id] || 0;
                  const required = s.properties.level_required || 3;
                  const isGap = level < required && level > 0;
                  return `<td><div class="skill-cell level-${level} ${isGap ? 'gap' : ''}" title="${s.properties.name}: Level ${level}/${required}">${level || '—'}</div></td>`;
                }).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
          <div style="display:flex;gap:14px;margin-top:12px;padding-top:8px;border-top:1px solid var(--border-light);flex-wrap:wrap;">
            <span style="font-size:11px;color:var(--text-muted);font-weight:500;">Level: </span>
            ${[0,1,2,3,4,5].map(l => `<div style="display:flex;align-items:center;gap:3px;"><div class="skill-cell level-${l}" style="width:20px;height:20px;font-size:10px;">${l}</div><span style="font-size:10px;color:var(--text-muted);">${['None','Novice','Basic','Competent','Proficient','Expert'][l]}</span></div>`).join('')}
            <div style="display:flex;align-items:center;gap:3px;margin-left:8px;"><div class="skill-cell level-0 gap" style="width:20px;height:20px;font-size:10px;">!</div><span style="font-size:10px;color:#dc2626;">Gap</span></div>
          </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title" style="display:flex;align-items:center;gap:6px;">${icon('user', 15)} Individual Skill Profiles (Radar Charts)</span></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;">
            ${persons.map(p => `
              <div class="card" style="padding:16px;background:var(--bg-subtle);border:1px solid var(--border-light);box-shadow:none;display:flex;flex-direction:column;align-items:center;cursor:pointer;" onclick="window.location.hash='#/node-detail/${p.id}'">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:2px;">${p.properties.name}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:16px;">${p.properties.role}</div>
                <div style="width:100%;aspect-ratio:1;max-width:220px;position:relative;">
                  ${createRadarChartSVG(skills, personSkills[p.id] || {})}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="charts-row" style="grid-template-columns:1fr;">
          <div class="card">
            <div class="card-header"><span class="card-title">Skills Overview</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${skills.map(s => `<div class="rel-card" data-id="${s.id}">
                <div class="rel-icon" style="background:#f0fdfa;color:#0d9488;">${icon('target', 14)}</div>
                <div class="rel-info"><div class="rel-name">${s.properties.name}</div><div class="rel-type">${s.properties.category} · Required Level: ${s.properties.level_required || 3}</div></div>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
    container.querySelectorAll('.rel-card').forEach(card => { card.addEventListener('click', () => navigate('node-detail', { id: card.dataset.id })); });
  } catch (err) { container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`; }
}

function createRadarChartSVG(skills, levels) {
  if (!skills || skills.length === 0) return '';
  const size = 240;
  const center = size / 2;
  const radius = 70;
  const numAxes = skills.length;
  const angleStep = (Math.PI * 2) / numAxes;

  let svg = `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" style="overflow:visible; font-family:var(--font-sans);">`;

  // Draw concentric polygons for background grid (levels 1 to 5)
  for (let level = 1; level <= 5; level++) {
    const r = (level / 5) * radius;
    let points = '';
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      points += `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)} `;
    }
    svg += `<polygon points="${points.trim()}" fill="rgba(0,0,0,0.02)" stroke="var(--border-default)" stroke-width="1" stroke-dasharray="2,2"/>`;
  }

  // Draw axes & labels
  for (let i = 0; i < numAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--border-default)" stroke-width="1" />`;
    
    // Labels
    const labelR = radius + 20;
    const lx = center + labelR * Math.cos(angle);
    const ly = center + labelR * Math.sin(angle);
    const anchor = lx < center - 10 ? 'end' : (lx > center + 10 ? 'start' : 'middle');
    const skillName = skills[i].properties.name.length > 15 ? skills[i].properties.name.substring(0, 15) + '…' : skills[i].properties.name;
    svg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" alignment-baseline="middle" font-size="10" font-weight="500" fill="var(--text-secondary)">${skillName}</text>`;
  }

  // Draw data polygon
  let dataPoints = '';
  for (let i = 0; i < numAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const level = levels[skills[i].id] || 0;
    const r = (level / 5) * radius;
    dataPoints += `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)} `;
  }
  
  svg += `<polygon points="${dataPoints.trim()}" fill="rgba(99, 102, 241, 0.2)" stroke="var(--brand-500)" stroke-width="2" />`;
  
  // Draw data points
  for (let i = 0; i < numAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const level = levels[skills[i].id] || 0;
    const r = (level / 5) * radius;
    svg += `<circle cx="${center + r * Math.cos(angle)}" cy="${center + r * Math.sin(angle)}" r="3.5" fill="var(--bg-white)" stroke="var(--brand-500)" stroke-width="2" />`;
  }

  svg += `</svg>`;
  return svg;
}
