// Seed data for browser-based graph store
import { graphStore } from './graph-store.js';

export function seedData() {
  graphStore.reset(); // Always generate fresh mock data on load for demo purposes

  // ─── Systems ───
  graphStore.createNode('system', { id: 'sys-1', name: 'Crude Distillation Unit (CDU)', description: 'Primary crude oil distillation system', location: 'APU-A' });
  graphStore.createNode('system', { id: 'sys-2', name: 'Hydrocracking Unit (HCU)', description: 'Heavy oil hydrocracking system', location: 'APU-B' });
  graphStore.createNode('system', { id: 'sys-3', name: 'Cooling Water System', description: 'Plant-wide cooling water circulation', location: 'APU-C' });
  graphStore.createNode('system', { id: 'sys-4', name: 'Fluid Catalytic Cracking (FCC)', description: 'FCC Unit', location: 'APU-D' });
  graphStore.createNode('system', { id: 'sys-5', name: 'Sulfur Recovery Unit (SRU)', description: 'SRU Unit', location: 'APU-E' });
  graphStore.createNode('system', { id: 'sys-6', name: 'Lube Base Oil Plant', description: 'Lube Oil Unit', location: 'APU-F' });

  // ─── Equipment ───
  // APU-A
  graphStore.createNode('equipment', { id: 'eq-1', tag_number: 'P-1101A', name: 'CDU Feed Pump A', type: 'Centrifugal Pump', system: 'CDU', location: 'APU-A', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-2', tag_number: 'P-1101B', name: 'CDU Feed Pump B', type: 'Centrifugal Pump', system: 'CDU', location: 'APU-A', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-4', tag_number: 'V-1501', name: 'CDU Overhead Drum', type: 'Pressure Vessel', system: 'CDU', location: 'APU-A', criticality: 'Critical' });
  
  // APU-B
  graphStore.createNode('equipment', { id: 'eq-3', tag_number: 'E-2201', name: 'HCU Feed/Effluent Exchanger', type: 'Shell & Tube Heat Exchanger', system: 'HCU', location: 'APU-B', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-5', tag_number: 'C-2101', name: 'HCU Reactor', type: 'Reactor Vessel', system: 'HCU', location: 'APU-B', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-8', tag_number: 'K-2301', name: 'HCU Recycle Compressor', type: 'Centrifugal Compressor', system: 'HCU', location: 'APU-B', criticality: 'Critical' });

  // APU-C
  graphStore.createNode('equipment', { id: 'eq-6', tag_number: 'P-3001', name: 'Cooling Water Pump', type: 'Centrifugal Pump', system: 'CWS', location: 'APU-C', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-7', tag_number: 'E-3001', name: 'Cooling Tower', type: 'Cooling Tower', system: 'CWS', location: 'APU-C', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-c1', tag_number: 'P-3002', name: 'CW Makeup Pump', type: 'Centrifugal Pump', system: 'CWS', location: 'APU-C', criticality: 'Low' });

  // APU-D
  graphStore.createNode('equipment', { id: 'eq-d1', tag_number: 'C-4101', name: 'FCC Reactor', type: 'Reactor', system: 'FCC', location: 'APU-D', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-d2', tag_number: 'K-4301', name: 'Main Air Blower', type: 'Compressor', system: 'FCC', location: 'APU-D', criticality: 'Critical' });

  // APU-E
  graphStore.createNode('equipment', { id: 'eq-e1', tag_number: 'E-5001', name: 'SRU Condenser', type: 'Heat Exchanger', system: 'SRU', location: 'APU-E', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-e2', tag_number: 'P-5001', name: 'Sulfur Transfer Pump', type: 'Pump', system: 'SRU', location: 'APU-E', criticality: 'Medium' });

  // APU-F
  graphStore.createNode('equipment', { id: 'eq-f1', tag_number: 'V-6001', name: 'Vacuum Flasher', type: 'Vessel', system: 'Lube', location: 'APU-F', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-f2', tag_number: 'P-6001', name: 'Vacuum Bottoms Pump', type: 'Pump', system: 'Lube', location: 'APU-F', criticality: 'Medium' });

  // ─── Failure Modes ─── (Global, but related to specific equipments, so they'll be pulled naturally. We can assign them locations to make it cleaner, or leave them without location to act as global connectors)
  // Let's assign locations to failure modes so they cluster perfectly
  graphStore.createNode('failure_mode', { id: 'fm-1', name: 'Seal Failure', description: 'Mechanical seal leakage', mechanism: 'Wear', location: 'APU-A' });
  graphStore.createNode('failure_mode', { id: 'fm-2', name: 'Bearing Failure', description: 'Bearing degradation', mechanism: 'Fatigue', location: 'APU-C' });
  graphStore.createNode('failure_mode', { id: 'fm-3', name: 'Tube Leak', description: 'Heat exchanger tube failure', mechanism: 'Corrosion', location: 'APU-B' });
  graphStore.createNode('failure_mode', { id: 'fm-4', name: 'Vibration Excessive', description: 'Abnormal vibration', mechanism: 'Imbalance', location: 'APU-D' });
  graphStore.createNode('failure_mode', { id: 'fm-5', name: 'Corrosion Under Insulation', description: 'CUI', mechanism: 'Corrosion', location: 'APU-A' });
  graphStore.createNode('failure_mode', { id: 'fm-6', name: 'Fouling', description: 'Internal fouling', mechanism: 'Deposition', location: 'APU-E' });

  // ─── Incidents ───
  graphStore.createNode('incident', { id: 'inc-1', title: 'P-1101A Seal Failure', location: 'APU-A', severity: 'High', status: 'Closed' });
  graphStore.createNode('incident', { id: 'inc-2', title: 'E-2201 Tube Leak', location: 'APU-B', severity: 'Medium', status: 'Closed' });
  graphStore.createNode('incident', { id: 'inc-3', title: 'K-2301 High Vibration Trip', location: 'APU-B', severity: 'Critical', status: 'Closed' });
  graphStore.createNode('incident', { id: 'inc-4', title: 'V-1501 CUI Found', location: 'APU-A', severity: 'High', status: 'Investigating' });
  graphStore.createNode('incident', { id: 'inc-5', title: 'P-3001 Bearing Temp High', location: 'APU-C', severity: 'Medium', status: 'Resolved' });
  graphStore.createNode('incident', { id: 'inc-6', title: 'K-4301 Trip', location: 'APU-D', severity: 'Critical', status: 'Closed' });
  graphStore.createNode('incident', { id: 'inc-7', title: 'E-5001 Fouling', location: 'APU-E', severity: 'Medium', status: 'Resolved' });
  graphStore.createNode('incident', { id: 'inc-8', title: 'P-6001 Leak', location: 'APU-F', severity: 'Low', status: 'Closed' });

  // ─── Lessons ───
  graphStore.createNode('lesson', { id: 'les-1', title: 'Pump Seal Protection System Review', location: 'APU-A' });
  graphStore.createNode('lesson', { id: 'les-2', title: 'Velocity Limits for Naphthenic Acid Service', location: 'APU-B' });
  graphStore.createNode('lesson', { id: 'les-3', title: 'Lube Oil System Monitoring Enhancement', location: 'APU-B' });
  graphStore.createNode('lesson', { id: 'les-4', title: 'CUI Risk Assessment', location: 'APU-A' });
  graphStore.createNode('lesson', { id: 'les-5', title: 'Lubrication Management', location: 'APU-C' });

  // ─── EDL ───
  graphStore.createNode('edl', { id: 'edl-1', title: 'Mechanical Seal Selection Guide', location: 'APU-A' });
  graphStore.createNode('edl', { id: 'edl-2', title: 'Heat Exchanger Design', location: 'APU-B' });
  graphStore.createNode('edl', { id: 'edl-3', title: 'Vibration Monitoring Spec', location: 'APU-D' });
  graphStore.createNode('edl', { id: 'edl-4', title: 'CUI Prevention Guideline', location: 'APU-A' });
  graphStore.createNode('edl', { id: 'edl-5', title: 'Pump Maintenance Procedure', location: 'APU-C' });

  // ─── OPLs ───
  graphStore.createNode('opl', { id: 'opl-1', title: 'Check Pump Seal Flush', location: 'APU-A' });
  graphStore.createNode('opl', { id: 'opl-2', title: 'Tube Leak Detection', location: 'APU-B' });
  graphStore.createNode('opl', { id: 'opl-3', title: 'Compressor Vibration Check', location: 'APU-D' });
  graphStore.createNode('opl', { id: 'opl-4', title: 'CUI Visual Inspection', location: 'APU-A' });
  graphStore.createNode('opl', { id: 'opl-5', title: 'Bearing Lubrication', location: 'APU-C' });

  // (Persons and Skills will be dynamically generated in the post-processing step to ensure exactly 15 people and 3 skills, perfectly linked to the graph)

  // ─── Training ───
  graphStore.createNode('training', { id: 'tr-1', name: 'Pump Maintenance Workshop', location: 'APU-A' });
  graphStore.createNode('training', { id: 'tr-2', name: 'Vibration Analysis Level II', location: 'APU-D' });

  // ═══ RELATIONSHIPS ═══
  const edges = [
    // APU-A
    ['part_of', 'eq-1', 'sys-1'], ['part_of', 'eq-2', 'sys-1'], ['part_of', 'eq-4', 'sys-1'],
    ['occurred_on', 'inc-1', 'eq-1'], ['occurred_on', 'inc-4', 'eq-4'],
    ['caused_by', 'inc-1', 'fm-1'], ['caused_by', 'inc-4', 'fm-5'],
    ['results_in', 'inc-1', 'les-1'], ['results_in', 'inc-4', 'les-4'],
    ['supported_by', 'les-1', 'edl-1'], ['supported_by', 'les-4', 'edl-4'],
    ['applicable_to', 'opl-1', 'eq-1'], ['applicable_to', 'opl-4', 'eq-4'],
    
    // APU-B
    ['part_of', 'eq-3', 'sys-2'], ['part_of', 'eq-5', 'sys-2'], ['part_of', 'eq-8', 'sys-2'],
    ['occurred_on', 'inc-2', 'eq-3'], ['occurred_on', 'inc-3', 'eq-8'],
    ['caused_by', 'inc-2', 'fm-3'],
    ['results_in', 'inc-2', 'les-2'], ['results_in', 'inc-3', 'les-3'],
    ['supported_by', 'les-2', 'edl-2'],
    ['applicable_to', 'opl-2', 'eq-3'],
    
    // APU-C
    ['part_of', 'eq-6', 'sys-3'], ['part_of', 'eq-7', 'sys-3'], ['part_of', 'eq-c1', 'sys-3'],
    ['occurred_on', 'inc-5', 'eq-6'],
    ['caused_by', 'inc-5', 'fm-2'],
    ['results_in', 'inc-5', 'les-5'],
    ['supported_by', 'les-5', 'edl-5'],
    ['applicable_to', 'opl-5', 'eq-6'],
    ['prevents', 'opl-5', 'fm-2'],
    
    // APU-D
    ['part_of', 'eq-d1', 'sys-4'], ['part_of', 'eq-d2', 'sys-4'],
    ['occurred_on', 'inc-6', 'eq-d2'],
    ['caused_by', 'inc-6', 'fm-4'],
    ['applicable_to', 'opl-3', 'eq-d2'],
    ['prevents', 'opl-3', 'fm-4'],
    
    // APU-E
    ['part_of', 'eq-e1', 'sys-5'], ['part_of', 'eq-e2', 'sys-5'],
    ['occurred_on', 'inc-7', 'eq-e1'],
    ['caused_by', 'inc-7', 'fm-6'],
    
    // APU-F
    ['part_of', 'eq-f1', 'sys-6'], ['part_of', 'eq-f2', 'sys-6'],
    ['occurred_on', 'inc-8', 'eq-f2']
  ];
  edges.forEach(([type, source, target]) => graphStore.createEdge(type, source, target, {}));

  // ─── Generate 80 Mock Nodes (20% of original 400) ───
  const apus = ['APU-A', 'APU-B', 'APU-C', 'APU-D', 'APU-E', 'APU-F'];
  const nodeTypes = ['equipment', 'incident', 'lesson', 'opl', 'edl'];
  
  const generatedNodesByApu = {
    'APU-A': [], 'APU-B': [], 'APU-C': [], 'APU-D': [], 'APU-E': [], 'APU-F': []
  };
  const allGeneratedNodes = [];

  const generateMockNode = (i, isExtraB) => {
    const apu = isExtraB ? 'APU-B' : apus[Math.floor(Math.random() * apus.length)];
    const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    const id = isExtraB ? `mock-extra-b-${type}-${i}` : `mock-${type}-${i}`;
    const prefix = isExtraB ? 'Mock APU-B' : 'Mock';
    
    const props = { 
      id: id, 
      name: `${prefix} ${type} ${i}`,
      title: `${prefix} ${type} ${i}`,
      tag_number: isExtraB ? `TAG-B-${i}` : `TAG-${i}`,
      location: apu,
      penalty_loss: Math.random() > 0.8 ? `${(Math.random() * 9 + 1).toFixed(1)} MUSD` : `${Math.floor(Math.random() * 990) + 10} KUSD`
    };

    if (type === 'incident') {
      const severities = ['Low', 'Medium', 'High', 'Critical'];
      const statuses = ['Open', 'Investigating', 'Resolved', 'Closed'];
      props.severity = severities[Math.floor(Math.random() * severities.length)];
      props.status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      props.date = date.toISOString().split('T')[0];
      
      props.description = `Detailed mock incident description for ${id}. Occurred in ${apu} during normal operations. Immediate action was taken to secure the area.`;
      props.root_cause = `Root cause identified as component failure due to environmental stress and material fatigue in ${apu}.`;
      // We will assign real equipment in a post-processing step to ensure valid links
    } else if (type === 'equipment') {
      const tagPrefixes = ['K-', 'T-', 'P-', 'V-', '71-PICA-', '23-LISA-', 'EM-', 'S-', 'A-'];
      const pfx = tagPrefixes[Math.floor(Math.random() * tagPrefixes.length)];
      let num = Math.floor(Math.random() * 9000) + 1000;
      if (pfx === '71-PICA-' || pfx === '23-LISA-') num = Math.floor(Math.random() * 900) + 100;
      
      const generatedTag = `${pfx}${num}`;
      
      props.tag_number = generatedTag;
      props.name = generatedTag;
      props.title = generatedTag;
      
      const typesList = ['Centrifugal Pump', 'Compressor', 'Pressure Vessel', 'Shell & Tube Heat Exchanger', 'Control Valve', 'Storage Tank'];
      props.type = typesList[Math.floor(Math.random() * typesList.length)];
      
      const sysList = ['CDU', 'HCU', 'CWS', 'FCC', 'SRU', 'Lube'];
      props.system = sysList[Math.floor(Math.random() * sysList.length)];
      
      const crit = ['Critical', 'High', 'Medium', 'Low'];
      props.criticality = crit[Math.floor(Math.random() * crit.length)];
    }
    
    graphStore.createNode(type, props);
    
    const nodeObj = { id, type, location: apu };
    generatedNodesByApu[apu].push(nodeObj);
    allGeneratedNodes.push(nodeObj);
  };

  for (let i = 0; i < 80; i++) {
    generateMockNode(i, false);
  }

  // ─── Generate 20 Extra Nodes specifically for APU-B (20% of original 100) ───
  for (let i = 0; i < 20; i++) {
    generateMockNode(i, true);
  }

  // Generate edges: mostly within the same APU, but some Cross-Area links for learning
  Object.keys(generatedNodesByApu).forEach(apu => {
    const locNodes = generatedNodesByApu[apu];
    for (let i = 0; i < locNodes.length; i++) {
      const source = locNodes[i];
      const numEdges = Math.floor(Math.random() * 2) + 1; // 1 to 2 edges per node
      for (let j = 0; j < numEdges; j++) {
        let target;
        // 3% chance to create a cross-area relationship (Cross-Area Learning) - Reduced to 20% of original
        if (Math.random() < 0.03) {
          target = allGeneratedNodes[Math.floor(Math.random() * allGeneratedNodes.length)];
        } else {
          target = locNodes[Math.floor(Math.random() * locNodes.length)];
        }
        
        if (source.id !== target.id) {
          let edgeType = 'references';
          
          if (source.type === 'incident' && target.type === 'equipment') edgeType = 'occurred_on';
          else if (source.type === 'incident' && target.type === 'failure_mode') edgeType = 'caused_by';
          else if (source.type === 'incident' && target.type === 'lesson') edgeType = 'results_in';
          else if (source.type === 'equipment' && target.type === 'system') edgeType = 'part_of';
          else if (source.type === 'equipment' && target.type === 'skill') edgeType = 'requires_skill';
          else if (source.type === 'person' && target.type === 'skill') edgeType = 'has_skill';
          else if (source.type === 'lesson' && target.type === 'edl') edgeType = 'supported_by';
          else if (source.type === 'opl' && target.type === 'equipment') edgeType = 'applicable_to';
          else if (source.type === 'opl' && target.type === 'failure_mode') edgeType = 'prevents';
          else if (source.location !== target.location) edgeType = 'supported_by';

          graphStore.createEdge(edgeType, source.id, target.id, {});
        }
      }
    }
  });

  // Post-process: Ensure Incidents and Lessons use REAL equipment tags that were generated
  const allEquipment = Array.from(graphStore.nodes.values()).filter(n => n.type === 'equipment');
  if (allEquipment.length > 0) {
    graphStore.nodes.forEach(node => {
      if (node.type === 'lesson') {
        const eq = allEquipment[Math.floor(Math.random() * allEquipment.length)];
        const issues = ['Seal Failure', 'Vibration', 'Overheating', 'Calibration Error', 'Corrosion'];
        const issue = issues[Math.floor(Math.random() * issues.length)];
        node.properties.title = `${eq.properties.tag_number} - ${issue} Prevention`;
        node.properties.description = `Lesson learned regarding ${eq.properties.type} ${eq.properties.tag_number}. Implemented new preventative maintenance steps to avoid ${issue}.`;
        node.properties.equipment = eq.properties.tag_number;
        node.properties.equipment_id = eq.id;
        node.properties.category = eq.properties.system;
        node.properties.impact = `Increased MTBF for ${eq.properties.tag_number}`;
        
        // Ensure graph edge exists
        graphStore.createEdge('applicable_to', node.id, eq.id, {});
      } else if (node.type === 'incident') {
        const eq = allEquipment[Math.floor(Math.random() * allEquipment.length)];
        node.properties.equipment = eq.properties.tag_number;
        node.properties.equipment_id = eq.id;
        node.properties.title = `Incident on ${eq.properties.tag_number}`;
        
        // Ensure graph edge exists
        graphStore.createEdge('occurred_on', node.id, eq.id, {});
      } else if (node.type === 'edl') {
        const eq = allEquipment[Math.floor(Math.random() * allEquipment.length)];
        const docTypes = ['Engineering Standard', 'Procedure', 'Manual', 'P&ID', 'Datasheet'];
        node.properties.doc_type = docTypes[Math.floor(Math.random() * docTypes.length)];
        node.properties.doc_number = `DOC-${Math.floor(Math.random() * 90000) + 10000}`;
        node.properties.version = `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}`;
        node.properties.category = eq.properties.system;
        node.properties.title = `${node.properties.doc_type} for ${eq.properties.tag_number}`;
        node.properties.equipment = eq.properties.tag_number;
        node.properties.equipment_id = eq.id;
        node.properties.external_url = '#';

        graphStore.createEdge('supported_by', node.id, eq.id, {});
      } else if (node.type === 'opl') {
        const eq = allEquipment[Math.floor(Math.random() * allEquipment.length)];
        const tasks = ['Start-up', 'Shutdown', 'Filter change', 'Lubrication', 'Alignment'];
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        node.properties.title = `OPL: ${task} for ${eq.properties.tag_number}`;
        node.properties.category = eq.properties.system;
        node.properties.target_audience = ['Operator', 'Technician', 'Engineer'][Math.floor(Math.random() * 3)];
        node.properties.one_point = `Always verify pressure before ${task.toLowerCase()} on ${eq.properties.tag_number}.`;
        node.properties.steps = ['Isolate equipment', 'Check gauges', 'Perform task', 'Verify operation'];
        node.properties.equipment = eq.properties.tag_number;
        node.properties.equipment_id = eq.id;

        graphStore.createEdge('applicable_to', node.id, eq.id, {});
      }
    });
  }

  // --- Generate 15 Explicit Persons ---
  const persons = [];
  const firstNames = ['Somchai', 'Wichai', 'Pranee', 'Anong', 'Kittisak', 'Nattaporn', 'Niti', 'Somsak', 'Suda', 'Pornchai', 'Malee', 'Sutee', 'Tawatchai', 'Siriporn', 'Kanchana'];
  const lastNames = ['Prasert', 'Tanaka', 'Suksawat', 'Chaisakul', 'Wongsri', 'Pimchan', 'Meesuk', 'Kongsiri', 'Thongkum', 'Sukjai', 'Saetang', 'Charoen', 'Maneerat', 'Boonmak', 'Srisawat'];
  
  for (let i = 0; i < 15; i++) {
    const p = graphStore.createNode('person', {
      id: `per-${i+1}`,
      name: `${firstNames[i]} ${lastNames[i]}`,
      title: `${firstNames[i]} ${lastNames[i]}`,
      role: ['Reliability Engineer', 'Rotating Engineer', 'Stationary Engineer'][i % 3],
      department: 'Reliability & Integrity',
      location: apus[i % apus.length],
      email: `${firstNames[i].toLowerCase()}.${lastNames[i].substring(0,1).toLowerCase()}@thaioilgroup.com`,
      phone: `+66 38 400 000 ext ${1000 + i}`
    });
    persons.push(p);
  }

  // --- Generate Explicit Skills (Sub-skills for the 3 main roles) ---
  const skills = [
    // Reliability Engineer Sub-skills
    { id: 'sk-rel-1', name: 'Root Cause Analysis (RCA)', category: 'Reliability Engineer' },
    { id: 'sk-rel-2', name: 'Weibull Analysis', category: 'Reliability Engineer' },
    { id: 'sk-rel-3', name: 'RAM Modeling', category: 'Reliability Engineer' },
    { id: 'sk-rel-4', name: 'Predictive Maintenance', category: 'Reliability Engineer' },
    
    // Rotating Engineer Sub-skills
    { id: 'sk-rot-1', name: 'Vibration Analysis', category: 'Rotating Engineer' },
    { id: 'sk-rot-2', name: 'Alignment & Balancing', category: 'Rotating Engineer' },
    { id: 'sk-rot-3', name: 'Seal & Bearing Diagnostics', category: 'Rotating Engineer' },
    { id: 'sk-rot-4', name: 'Compressor Aerodynamics', category: 'Rotating Engineer' },

    // Stationary Engineer Sub-skills
    { id: 'sk-sta-1', name: 'Risk-Based Inspection (RBI)', category: 'Stationary Engineer' },
    { id: 'sk-sta-2', name: 'Piping & Valve Design', category: 'Stationary Engineer' },
    { id: 'sk-sta-3', name: 'Corrosion Assessment', category: 'Stationary Engineer' },
    { id: 'sk-sta-4', name: 'Heat Exchanger Analysis', category: 'Stationary Engineer' }
  ].map(s => graphStore.createNode('skill', {
    ...s,
    title: s.name,
    description: `Specific technical competency in ${s.name} for the ${s.category} discipline.`,
    level_required: 4
  }));

  // --- Link Persons and Skills to Graph ---
  persons.forEach((p, idx) => {
    // Each person is an expert in their primary role's sub-skills, and has basic knowledge of others
    skills.forEach((s) => {
      // Determine if this skill belongs to the person's primary role
      const isPrimary = (p.properties.role === s.category);
      const level = isPrimary 
        ? 3 + Math.floor(Math.random() * 3) // Level 3-5 for primary sub-skills
        : Math.floor(Math.random() * 3);    // Level 0-2 for cross-disciplinary skills
        
      if (level > 0) {
        graphStore.createEdge('has_skill', p.id, s.id, { level });
      }
    });

    // Link Person to Incident (Investigated By)
    const incs = Array.from(graphStore.nodes.values()).filter(n => n.type === 'incident');
    if (incs.length > 0) {
      const numIncs = Math.floor(Math.random() * 2) + 1;
      for(let j=0; j<numIncs; j++) {
         const inc = incs[Math.floor(Math.random() * incs.length)];
         graphStore.createEdge('investigated_by', inc.id, p.id, { role: 'Lead Investigator' });
      }
    }

    // Link Person to OPL and Lessons (Author)
    const opls = Array.from(graphStore.nodes.values()).filter(n => n.type === 'opl');
    if (opls.length > 0) {
      const opl = opls[Math.floor(Math.random() * opls.length)];
      graphStore.createEdge('authored_by', opl.id, p.id, {});
    }

    const lessons = Array.from(graphStore.nodes.values()).filter(n => n.type === 'lesson');
    if (lessons.length > 0) {
      const les = lessons[Math.floor(Math.random() * lessons.length)];
      graphStore.createEdge('authored_by', les.id, p.id, {});
    }
    
    // Link Person to Equipment (Responsible Engineer)
    if (allEquipment.length > 0) {
      const numEqs = Math.floor(Math.random() * 3) + 1;
      for(let j=0; j<numEqs; j++) {
        const eq = allEquipment[Math.floor(Math.random() * allEquipment.length)];
        graphStore.createEdge('responsible_for', p.id, eq.id, {});
      }
    }
  });

  // Link Skills to Equipment
  skills.forEach(s => {
    for (let i = 0; i < 15; i++) {
      if (allEquipment.length > 0) {
        const eq = allEquipment[Math.floor(Math.random() * allEquipment.length)];
        graphStore.createEdge('requires_skill', eq.id, s.id, { proficiency: 3 });
      }
    }
  });

  graphStore.save();
  console.log(`[DOT Seed] Created ${graphStore.nodes.size} nodes, ${graphStore.edges.size} edges`);
}
