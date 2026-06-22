import { api } from '../../api.js';
import { icons, icon } from '../../utils/icons.js';
import { NODE_TYPES } from '../../utils/constants.js';

export function renderDataSync() {
  const container = document.getElementById('page-content');
  
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; padding: 24px;">
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Data Management</h1>
        <p style="color: var(--text-secondary); font-size: 14px;">Export graph nodes to Excel for bulk editing, or import an Excel file to update and create records.</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
        <!-- Export Section -->
        <div class="card" style="padding: 24px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; color: var(--brand-600);">
              ${icons.download}
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: 600;">Export Data</h2>
              <p style="font-size: 12px; color: var(--text-muted);">Select node types to export to .xlsx</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; max-height: 240px; overflow-y: auto; border: 1px solid var(--border-light); border-radius: 6px; padding: 12px;">
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-weight:600;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="export-all" checked style="accent-color: var(--brand-600);" /> Select All
            </label>
            <div style="height:1px;background:var(--border-light);margin-bottom:8px;"></div>
            <div id="export-types-list" style="display:flex;flex-direction:column;gap:6px;">
              ${Object.entries(NODE_TYPES).map(([k, v]) => `
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;color:var(--text-secondary);">
                  <input type="checkbox" class="export-type-cb" value="${k}" checked style="accent-color: ${v.color};" /> 
                  <span style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:${v.color};"></span>${v.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <button id="btn-export" class="btn btn-primary w-full" style="display:flex;align-items:center;justify-content:center;gap:8px;">
            ${icon('download', 16)} Export to Excel
          </button>
        </div>
        
        <!-- Import Section -->
        <div class="card" style="padding: 24px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; color: #10b981;">
              ${icons.upload}
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: 600;">Import Data</h2>
              <p style="font-size: 12px; color: var(--text-muted);">Upload .xlsx file to update or create records</p>
            </div>
          </div>
          
          <div style="border: 2px dashed var(--border-light); border-radius: 8px; padding: 32px; text-align: center; margin-bottom: 20px; background: var(--bg-canvas);">
            <input type="file" id="import-file" accept=".xlsx, .xls" style="display:none;" />
            <label for="import-file" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:12px;">
              <div style="color:var(--text-muted);">${icon('database', 32)}</div>
              <div style="font-size:14px;font-weight:500;color:var(--brand-600);">Click to browse Excel file</div>
              <div style="font-size:12px;color:var(--text-muted);" id="file-name-display">No file selected</div>
            </label>
          </div>
          
          <button id="btn-import" class="btn btn-primary w-full" disabled style="display:flex;align-items:center;justify-content:center;gap:8px;background:#10b981;">
            ${icon('upload', 16)} Import & Update Database
          </button>
          <div style="margin-top:12px;font-size:11px;color:var(--text-muted);text-align:center;">
            * Matching IDs will be updated. New IDs will be created.
          </div>
        </div>
      </div>
      
      <div id="sync-logs" style="margin-top:24px;background:#0f172a;border-radius:8px;padding:16px;font-family:monospace;font-size:12px;color:#94a3b8;height:200px;overflow-y:auto;display:none;border:1px solid #1e293b;">
        <div style="color:#f8fafc;font-weight:bold;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:8px;">Sync Operations Log</div>
        <div id="log-content"></div>
      </div>
    </div>
  `;

  // UI Event Listeners
  const exportAllCb = container.querySelector('#export-all');
  const typeCbs = container.querySelectorAll('.export-type-cb');
  const fileInput = container.querySelector('#import-file');
  const fileDisplay = container.querySelector('#file-name-display');
  const btnExport = container.querySelector('#btn-export');
  const btnImport = container.querySelector('#btn-import');
  const logsContainer = container.querySelector('#sync-logs');
  const logContent = container.querySelector('#log-content');

  function logMsg(msg, type = 'info') {
    logsContainer.style.display = 'block';
    const color = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#94a3b8';
    const el = document.createElement('div');
    el.style.color = color;
    el.style.marginBottom = '4px';
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logContent.appendChild(el);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  exportAllCb.addEventListener('change', (e) => {
    const checked = e.target.checked;
    typeCbs.forEach(cb => cb.checked = checked);
  });

  typeCbs.forEach(cb => cb.addEventListener('change', () => {
    const allChecked = Array.from(typeCbs).every(c => c.checked);
    exportAllCb.checked = allChecked;
  }));

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      fileDisplay.textContent = e.target.files[0].name;
      btnImport.disabled = false;
    } else {
      fileDisplay.textContent = 'No file selected';
      btnImport.disabled = true;
    }
  });

  // Export Logic
  btnExport.addEventListener('click', async () => {
    if (!window.XLSX) {
      alert('Excel library is still loading. Please try again in a few seconds.');
      return;
    }

    const selectedTypes = Array.from(typeCbs).filter(cb => cb.checked).map(cb => cb.value);
    if (selectedTypes.length === 0) {
      alert('Please select at least one node type to export.');
      return;
    }

    btnExport.disabled = true;
    btnExport.innerHTML = 'Exporting...';
    logContent.innerHTML = '';
    logMsg(`Starting export for ${selectedTypes.length} types...`, 'info');

    try {
      const wb = XLSX.utils.book_new();
      
      for (const type of selectedTypes) {
        const nodes = await api.getNodes({ type });
        if (nodes.length === 0) continue;
        
        // Flatten node structure for Excel
        const flatData = nodes.map(n => {
          // Put required fields first
          const row = {
            ID: n.id,
            Type: n.type,
            Name: n.properties.name || '',
            Title: n.properties.title || ''
          };
          // Add all other properties
          for (const [k, v] of Object.entries(n.properties)) {
            if (k !== 'name' && k !== 'title') {
              row[k] = Array.isArray(v) ? v.join(', ') : v;
            }
          }
          return row;
        });

        const ws = XLSX.utils.json_to_sheet(flatData);
        // Add sheet to workbook (sheet names max 31 chars)
        let sheetName = NODE_TYPES[type]?.label || type;
        sheetName = sheetName.substring(0, 31).replace(/[\[\]\*\\\/\?]/g, ''); 
        
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        logMsg(`Generated sheet for ${sheetName} (${nodes.length} records)`, 'success');
      }

      if (wb.SheetNames.length === 0) {
        logMsg('No data found for selected types.', 'error');
        alert('No data to export.');
      } else {
        XLSX.writeFile(wb, `Knowledge_Graph_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        logMsg(`Export complete. Downloading file.`, 'success');
      }
    } catch (err) {
      console.error(err);
      logMsg(`Export failed: ${err.message}`, 'error');
      alert('Failed to export. See logs for details.');
    } finally {
      btnExport.disabled = false;
      btnExport.innerHTML = `${icon('download', 16)} Export to Excel`;
    }
  });

  // Import Logic
  btnImport.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file || !window.XLSX) return;

    btnImport.disabled = true;
    btnImport.innerHTML = 'Importing...';
    logContent.innerHTML = '';
    logMsg(`Reading file: ${file.name}`, 'info');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          
          let updatedCount = 0;
          let createdCount = 0;
          
          // Get all existing nodes for fast lookup
          const allNodes = await api.getNodes();
          const existingIds = new Set(allNodes.map(n => n.id));

          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(ws);
            
            if (rows.length === 0) continue;
            logMsg(`Processing sheet ${sheetName} with ${rows.length} rows...`, 'info');

            for (const row of rows) {
              if (!row.ID) continue; // Skip rows without ID
              
              const id = row.ID.toString();
              const type = row.Type || Object.keys(NODE_TYPES).find(k => NODE_TYPES[k].label === sheetName) || 'unknown';
              
              // Reconstruct properties
              const properties = {};
              for (const [k, v] of Object.entries(row)) {
                if (k !== 'ID' && k !== 'Type') {
                  // Attempt to parse arrays if they were joined
                  if (typeof v === 'string' && v.includes(',') && (k === 'tags' || k === 'categories')) {
                    properties[k.toLowerCase()] = v.split(',').map(s => s.trim());
                  } else {
                    properties[k.toLowerCase()] = v;
                  }
                }
              }

              // Overwrite specific fields if present
              if (row.Name) properties.name = row.Name;
              if (row.Title) properties.title = row.Title;

              const nodeData = { type, ...properties };

              if (existingIds.has(id)) {
                await api.updateNode(id, nodeData);
                updatedCount++;
              } else {
                nodeData.id = id;
                await api.createNode(nodeData);
                createdCount++;
              }
            }
          }

          logMsg(`Import complete: ${updatedCount} updated, ${createdCount} created.`, 'success');
          alert(`Successfully imported data!\nUpdated: ${updatedCount}\nCreated: ${createdCount}`);
          
          // Reset file input
          fileInput.value = '';
          fileDisplay.textContent = 'No file selected';

        } catch (err) {
          console.error(err);
          logMsg(`Error processing file: ${err.message}`, 'error');
        } finally {
          btnImport.disabled = false;
          btnImport.innerHTML = `${icon('upload', 16)} Import & Update Database`;
        }
      };
      
      reader.onerror = () => {
        logMsg('Failed to read file.', 'error');
        btnImport.disabled = false;
        btnImport.innerHTML = `${icon('upload', 16)} Import & Update Database`;
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (err) {
      console.error(err);
      logMsg(`Import failed: ${err.message}`, 'error');
      btnImport.disabled = false;
      btnImport.innerHTML = `${icon('upload', 16)} Import & Update Database`;
    }
  });
}
