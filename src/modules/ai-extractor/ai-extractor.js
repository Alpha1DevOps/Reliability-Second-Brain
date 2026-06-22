import { api } from '../../api.js';
import { icons, icon } from '../../utils/icons.js';
import { NODE_TYPES, EDGE_TYPES } from '../../utils/constants.js';

let extractedData = null; // Store the result from AI

export function renderAIExtractor() {
  const container = document.getElementById('page-content');
  const savedKey = localStorage.getItem('gemini_api_key') || '';

  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto; padding: 24px;">
      <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="color: #8b5cf6;">${icons.sparkles}</span> AI Knowledge Extractor
          </h1>
          <p style="color: var(--text-secondary); font-size: 14px;">Automatically generate nodes and relationships from raw text or document files using Gemini AI.</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-end;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Model</label>
            <select id="ai-model" class="select" style="width: 140px; font-size: 12px; padding: 6px 10px;">
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Gemini API Key</label>
            <input type="password" id="api-key" class="input" placeholder="Enter API Key (sk-...)" value="${savedKey}" style="width: 200px; font-family: monospace; font-size: 12px; padding: 6px 10px;" />
          </div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
        
        <!-- Input Section -->
        <div class="card" style="padding: 24px;">
          <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            ${icon('info', 18)} Source Information
          </h2>
          
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Raw Text (Paste here)</label>
            <textarea id="ai-text-input" class="textarea" placeholder="Paste maintenance logs, incident reports, or technical manuals here..." style="min-height: 200px; font-family: monospace; font-size: 13px;"></textarea>
          </div>

          <div style="display: flex; align-items: center; justify-content: center; margin: 16px 0;">
            <div style="flex:1; height:1px; background: var(--border-light);"></div>
            <div style="padding: 0 12px; font-size: 12px; color: var(--text-muted); font-weight: 500;">OR</div>
            <div style="flex:1; height:1px; background: var(--border-light);"></div>
          </div>

          <div class="form-group" style="margin-bottom: 24px;">
            <label class="form-label">Upload Document (.txt, .pdf)</label>
            <div style="border: 2px dashed var(--border-light); border-radius: 8px; padding: 20px; text-align: center; background: var(--bg-canvas);">
              <input type="file" id="ai-file-input" accept=".txt, .pdf" style="display:none;" />
              <label for="ai-file-input" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px;">
                <div style="color:var(--text-muted);">${icon('upload', 24)}</div>
                <div style="font-size:13px; font-weight:500; color:var(--brand-600);">Browse File</div>
                <div style="font-size:11px; color:var(--text-muted);" id="file-name-display">No file selected</div>
              </label>
            </div>
          </div>

          <button id="btn-extract" class="btn btn-primary w-full" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#8b5cf6;border-color:#8b5cf6;">
            ${icons.sparkles} Extract Knowledge
          </button>
        </div>
        
        <!-- Output Section -->
        <div class="card" style="padding: 24px; min-height: 500px; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h2 style="font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              ${icon('check', 18)} Extracted Result Preview
            </h2>
            <span id="result-badge" class="badge" style="display:none; background:#ecfdf5; color:#059669;">Ready</span>
          </div>
          
          <div id="preview-area" style="flex: 1; border: 1px solid var(--border-light); border-radius: 8px; background: var(--bg-subtle); padding: 16px; overflow-y: auto; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; opacity: 0.5;">
              ${icons.brain}
              <p style="margin-top: 12px;">Waiting for extraction...</p>
            </div>
          </div>

          <button id="btn-approve" class="btn btn-primary w-full" disabled style="display:flex;align-items:center;justify-content:center;gap:8px;background:#10b981;border-color:#10b981;">
            ${icon('database', 16)} Approve & Import to Graph
          </button>
        </div>
      </div>
    </div>
  `;

  // UI Elements
  const apiKeyInput = container.querySelector('#api-key');
  const modelSelect = container.querySelector('#ai-model');
  const textInput = container.querySelector('#ai-text-input');
  const fileInput = container.querySelector('#ai-file-input');
  const fileDisplay = container.querySelector('#file-name-display');
  const btnExtract = container.querySelector('#btn-extract');
  const btnApprove = container.querySelector('#btn-approve');
  const previewArea = container.querySelector('#preview-area');
  const resultBadge = container.querySelector('#result-badge');

  // File variables
  let fileType = null;
  let fileData = null; // Base64 string or raw text

  apiKeyInput.addEventListener('change', (e) => {
    localStorage.setItem('gemini_api_key', e.target.value.trim());
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      fileDisplay.textContent = 'No file selected';
      fileType = null;
      fileData = null;
      return;
    }
    fileDisplay.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (file.name.endsWith('.pdf')) {
        fileType = 'application/pdf';
        // Remove data URL prefix (e.g., data:application/pdf;base64,)
        fileData = evt.target.result.split(',')[1]; 
      } else {
        fileType = 'text/plain';
        fileData = evt.target.result;
        // Optionally populate the textarea with the text
        textInput.value = fileData;
      }
    };

    if (file.name.endsWith('.pdf')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });

  btnExtract.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      alert('Please enter your Gemini API Key first.');
      return;
    }

    const text = textInput.value.trim();
    if (!text && !fileData) {
      alert('Please provide some raw text or upload a document.');
      return;
    }

    const selectedModel = modelSelect.value;
    
    btnExtract.disabled = true;
    btnExtract.innerHTML = 'Extracting... (Takes 5-15s)';
    previewArea.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted);">Analyzing with ${modelSelect.options[modelSelect.selectedIndex].text}...<br/><br/><div class="animate-pulse">⏳</div></div>`;
    btnApprove.disabled = true;
    resultBadge.style.display = 'none';

    try {
      const systemPrompt = `You are a strict JSON extraction API for a Knowledge Graph. 
Extract entities (nodes) and relationships (edges) from the user's input text or document.
IMPORTANT: You MUST ONLY output valid JSON. Do not include markdown code blocks (like json) or any other text.
The JSON must follow this exact schema:
{
  "nodes": [
    { 
      "id": "A unique string ID (no spaces)", 
      "type": "Must be one of: incident, lesson, edl, opl, equipment, system, failure_mode, person, skill, training", 
      "properties": { 
        "name": "Short name",
        "title": "Display title",
        "description": "Brief description"
      } 
    }
  ],
  "edges": [
    { 
      "source": "id of source node", 
      "target": "id of target node", 
      "type": "Must be one of: CAUSES, MITIGATES, LOCATED_IN, AFFECTS, PART_OF, HAS_LESSON, HAS_DOCUMENT, REQUIRES_SKILL" 
    }
  ]
}`;

      // Build payload
      let contents = [];
      
      // If PDF file is attached
      if (fileType === 'application/pdf' && fileData) {
        contents.push({
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: "Analyze the attached PDF document:" },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: fileData
              }
            }
          ]
        });
      } else {
        // Text only
        const targetText = fileType === 'text/plain' ? fileData : text;
        contents.push({
          role: 'user',
          parts: [
            { text: systemPrompt + "nnUSER TEXT:n" + targetText }
          ]
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'API request failed');
      }

      const data = await response.json();
      const rawOutput = data.candidates[0].content.parts[0].text;
      
      let parsed;
      try {
        parsed = JSON.parse(rawOutput);
      } catch (e) {
        // Sometimes LLMs still wrap in markdown
        const cleaned = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      if (!parsed.nodes || !parsed.edges) {
        throw new Error('Invalid JSON schema returned by AI.');
      }

      extractedData = parsed;
      renderPreview(parsed);
      
      btnApprove.disabled = false;
      resultBadge.style.display = 'block';

    } catch (err) {
      console.error(err);
      previewArea.innerHTML = `<div style="color: #dc2626; padding: 16px;"><strong>Error:</strong> ${err.message}</div>`;
    } finally {
      btnExtract.disabled = false;
      btnExtract.innerHTML = `${icons.sparkles} Extract Knowledge`;
    }
  });

  btnApprove.addEventListener('click', async () => {
    if (!extractedData) return;
    
    btnApprove.disabled = true;
    btnApprove.innerHTML = 'Importing...';

    try {
      let createdNodes = 0;
      let createdEdges = 0;

      // 1. Create Nodes
      for (const node of extractedData.nodes) {
        try {
          await api.createNode({
            id: node.id,
            type: node.type,
            ...node.properties
          });
          createdNodes++;
        } catch (e) {
          console.warn(`Failed to create node ${node.id}`, e);
        }
      }

      // 2. Create Edges
      for (const edge of extractedData.edges) {
        try {
          await api.createEdge({
            source: edge.source,
            target: edge.target,
            type: edge.type
          });
          createdEdges++;
        } catch (e) {
          console.warn(`Failed to create edge`, e);
        }
      }

      alert(`Successfully imported!nNodes created: ${createdNodes}nEdges created: ${createdEdges}`);
      
      // Reset
      extractedData = null;
      textInput.value = '';
      fileInput.value = '';
      fileDisplay.textContent = 'No file selected';
      fileData = null;
      previewArea.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; opacity: 0.5;">' + icons.check + '<p style="margin-top: 12px;">Import Complete. Ready for next file.</p></div>';
      btnApprove.disabled = true;
      resultBadge.style.display = 'none';

    } catch (err) {
      alert('Error during import: ' + err.message);
    } finally {
      btnApprove.innerHTML = `${icon('database', 16)} Approve & Import to Graph`;
      btnApprove.disabled = false;
    }
  });

  function renderPreview(data) {
    let html = `<div style="margin-bottom: 12px; font-weight: 600; color: var(--text-primary);">Found ${data.nodes.length} Nodes & ${data.edges.length} Relationships</div>`;
    
    html += `<div style="font-weight: 600; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Nodes</div>`;
    html += `<div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">`;
    data.nodes.forEach(n => {
      const nt = NODE_TYPES[n.type] || { color: '#666', label: n.type };
      html += `
        <div style="background: white; border: 1px solid var(--border-light); border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; gap: 12px;">
          <span style="background: ${nt.color}20; color: ${nt.color}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${nt.label}</span>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 500; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.properties.title || n.properties.name || n.id}</div>
            <div style="font-size: 11px; color: var(--text-muted);">ID: ${n.id}</div>
          </div>
        </div>`;
    });
    html += `</div>`;

    html += `<div style="font-weight: 600; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; color: var(--text-muted);">Relationships</div>`;
    html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
    data.edges.forEach(e => {
      html += `
        <div style="background: white; border: 1px solid var(--border-light); border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
          <span style="font-weight: 500; color: var(--text-primary);">${e.source}</span>
          <span style="color: var(--brand-600); font-weight: 600; font-size: 10px; background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px;">${e.type}</span>
          <span style="font-weight: 500; color: var(--text-primary);">${e.target}</span>
        </div>`;
    });
    html += `</div>`;

    previewArea.innerHTML = html;
  }
}
