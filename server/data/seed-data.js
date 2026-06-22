// Seed Data Generator - Realistic Thai Oil engineering data
import graphStore from '../services/graph-store.js';

export function seedData() {
  if (graphStore.nodes.size > 0) {
    console.log('[Seed] Data already exists, skipping seed');
    return;
  }
  console.log('[Seed] Generating demo data...');

  // ─── Systems ───
  const sys1 = graphStore.createNode('system', { id: 'sys-1', name: 'Crude Distillation Unit (CDU)', description: 'Primary crude oil distillation system', area: 'Area 1' });
  const sys2 = graphStore.createNode('system', { id: 'sys-2', name: 'Hydrocracking Unit (HCU)', description: 'Heavy oil hydrocracking system', area: 'Area 2' });
  const sys3 = graphStore.createNode('system', { id: 'sys-3', name: 'Cooling Water System', description: 'Plant-wide cooling water circulation', area: 'Utilities' });

  // ─── Equipment ───
  const eq1 = graphStore.createNode('equipment', { id: 'eq-1', tag_number: 'P-1101A', name: 'CDU Feed Pump A', type: 'Centrifugal Pump', system: 'CDU', location: 'Area 1', criticality: 'Critical' });
  const eq2 = graphStore.createNode('equipment', { id: 'eq-2', tag_number: 'P-1101B', name: 'CDU Feed Pump B', type: 'Centrifugal Pump', system: 'CDU', location: 'Area 1', criticality: 'Critical' });
  const eq3 = graphStore.createNode('equipment', { id: 'eq-3', tag_number: 'E-2201', name: 'HCU Feed/Effluent Exchanger', type: 'Shell & Tube Heat Exchanger', system: 'HCU', location: 'Area 2', criticality: 'High' });
  const eq4 = graphStore.createNode('equipment', { id: 'eq-4', tag_number: 'V-1501', name: 'CDU Overhead Drum', type: 'Pressure Vessel', system: 'CDU', location: 'Area 1', criticality: 'Critical' });
  const eq5 = graphStore.createNode('equipment', { id: 'eq-5', tag_number: 'C-2101', name: 'HCU Reactor', type: 'Reactor Vessel', system: 'HCU', location: 'Area 2', criticality: 'Critical' });
  const eq6 = graphStore.createNode('equipment', { id: 'eq-6', tag_number: 'P-3001', name: 'Cooling Water Pump', type: 'Centrifugal Pump', system: 'CWS', location: 'Utilities', criticality: 'High' });
  const eq7 = graphStore.createNode('equipment', { id: 'eq-7', tag_number: 'E-3001', name: 'Cooling Tower', type: 'Cooling Tower', system: 'CWS', location: 'Utilities', criticality: 'High' });
  const eq8 = graphStore.createNode('equipment', { id: 'eq-8', tag_number: 'K-2301', name: 'HCU Recycle Compressor', type: 'Centrifugal Compressor', system: 'HCU', location: 'Area 2', criticality: 'Critical' });

  // ─── Failure Modes ───
  const fm1 = graphStore.createNode('failure_mode', { id: 'fm-1', name: 'Seal Failure', description: 'Mechanical seal leakage due to wear or misalignment', mechanism: 'Wear', consequence: 'Hydrocarbon leak, fire risk' });
  const fm2 = graphStore.createNode('failure_mode', { id: 'fm-2', name: 'Bearing Failure', description: 'Bearing degradation from lubrication issues or overload', mechanism: 'Fatigue', consequence: 'Unplanned shutdown, collateral damage' });
  const fm3 = graphStore.createNode('failure_mode', { id: 'fm-3', name: 'Tube Leak', description: 'Heat exchanger tube failure from corrosion or erosion', mechanism: 'Corrosion', consequence: 'Product contamination, efficiency loss' });
  const fm4 = graphStore.createNode('failure_mode', { id: 'fm-4', name: 'Vibration Excessive', description: 'Abnormal vibration exceeding alarm levels', mechanism: 'Imbalance', consequence: 'Equipment damage, forced shutdown' });
  const fm5 = graphStore.createNode('failure_mode', { id: 'fm-5', name: 'Corrosion Under Insulation', description: 'CUI on piping and vessels', mechanism: 'Corrosion', consequence: 'Wall thinning, potential rupture' });
  const fm6 = graphStore.createNode('failure_mode', { id: 'fm-6', name: 'Fouling', description: 'Internal fouling reducing heat transfer', mechanism: 'Deposition', consequence: 'Reduced efficiency, increased energy' });

  // ─── Incidents ───
  const inc1 = graphStore.createNode('incident', { id: 'inc-1', title: 'P-1101A Seal Failure During Normal Operation', description: 'Mechanical seal on CDU feed pump failed causing hydrocarbon leak. Pump was isolated and switched to spare.', severity: 'High', status: 'Closed', date: '2025-08-15', root_cause: 'Seal face damage from dry running during brief suction loss' });
  const inc2 = graphStore.createNode('incident', { id: 'inc-2', title: 'E-2201 Tube Leak Detected During Turnaround', description: 'Multiple tube leaks found in HCU feed/effluent exchanger during inspection. Tubes showed signs of erosion-corrosion.', severity: 'Medium', status: 'Closed', date: '2025-06-20', root_cause: 'High velocity erosion at tube inlet combined with naphthenic acid corrosion' });
  const inc3 = graphStore.createNode('incident', { id: 'inc-3', title: 'K-2301 High Vibration Trip', description: 'HCU recycle compressor tripped on high vibration alarm. Investigation revealed bearing wear.', severity: 'Critical', status: 'Closed', date: '2025-11-03', root_cause: 'Bearing lubrication system filter bypass led to contaminated oil' });
  const inc4 = graphStore.createNode('incident', { id: 'inc-4', title: 'V-1501 CUI Found During Inspection', description: 'Corrosion under insulation found on CDU overhead drum. Wall thickness below minimum in 2 locations.', severity: 'High', status: 'Investigating', date: '2026-01-10', root_cause: 'Damaged insulation jacketing allowed moisture ingress' });
  const inc5 = graphStore.createNode('incident', { id: 'inc-5', title: 'P-3001 Bearing Temperature High', description: 'Cooling water pump bearing temperature trending high. Investigated and found inadequate lubrication.', severity: 'Medium', status: 'Resolved', date: '2026-02-28', root_cause: 'Lubrication schedule not followed during shift change' });

  // ─── Lessons Learned ───
  const les1 = graphStore.createNode('lesson', { id: 'les-1', title: 'Pump Seal Protection System Review', description: 'All critical pumps should have seal flush system with low-flow alarm. Dry running protection is essential for mechanical seals on hydrocarbon service.', category: 'Mechanical', impact: 'Prevent seal failures on 15+ critical pumps', date: '2025-09-01' });
  const les2 = graphStore.createNode('lesson', { id: 'les-2', title: 'Velocity Limits for Naphthenic Acid Service', description: 'Tube inlet velocity must be limited to 1.5 m/s for naphthenic acid service. Material upgrade to 317L SS recommended for TAN > 0.5.', category: 'Process/Materials', impact: 'Prevent erosion-corrosion in 8 exchangers', date: '2025-07-15' });
  const les3 = graphStore.createNode('lesson', { id: 'les-3', title: 'Lube Oil System Monitoring Enhancement', description: 'Install online particle counter on lube oil system for critical rotating equipment. Filter differential pressure alarm should trigger immediate response.', category: 'Rotating Equipment', impact: 'Early detection of oil contamination across all compressors', date: '2025-12-01' });
  const les4 = graphStore.createNode('lesson', { id: 'les-4', title: 'CUI Risk Assessment and Inspection Priority', description: 'Implement risk-based CUI inspection program based on operating temperature, insulation type, and environmental exposure. Priority areas: 50-175°C operating range.', category: 'Inspection', impact: 'Systematic CUI prevention for 200+ insulated items', date: '2026-02-01' });
  const les5 = graphStore.createNode('lesson', { id: 'les-5', title: 'Lubrication Management Best Practices', description: 'Establish lubrication routes with checklist verification. Use color-coded lube points and QR-code based tracking for compliance verification.', category: 'Maintenance', impact: 'Standardize lubrication across all rotating equipment', date: '2026-03-15' });

  // ─── EDL Documents ───
  const edl1 = graphStore.createNode('edl', { id: 'edl-1', title: 'Mechanical Seal Selection Guide', doc_type: 'Engineering Standard', doc_number: 'ES-MECH-001', version: '3.0', external_url: 'https://sharepoint.example.com/edl/ES-MECH-001', category: 'Mechanical' });
  const edl2 = graphStore.createNode('edl', { id: 'edl-2', title: 'Heat Exchanger Design for Corrosive Service', doc_type: 'Design Guide', doc_number: 'DG-PROC-012', version: '2.1', external_url: 'https://sharepoint.example.com/edl/DG-PROC-012', category: 'Process' });
  const edl3 = graphStore.createNode('edl', { id: 'edl-3', title: 'Vibration Monitoring Specification', doc_type: 'Specification', doc_number: 'SP-INST-005', version: '1.5', external_url: 'https://sharepoint.example.com/edl/SP-INST-005', category: 'Instrumentation' });
  const edl4 = graphStore.createNode('edl', { id: 'edl-4', title: 'CUI Prevention and Inspection Guideline', doc_type: 'Inspection Guideline', doc_number: 'IG-INSP-003', version: '2.0', external_url: 'https://sharepoint.example.com/edl/IG-INSP-003', category: 'Inspection' });
  const edl5 = graphStore.createNode('edl', { id: 'edl-5', title: 'Centrifugal Pump Maintenance Procedure', doc_type: 'Procedure', doc_number: 'MP-MECH-020', version: '4.2', external_url: 'https://sharepoint.example.com/edl/MP-MECH-020', category: 'Mechanical' });
  const edl6 = graphStore.createNode('edl', { id: 'edl-6', title: 'Lube Oil System Design Standard', doc_type: 'Engineering Standard', doc_number: 'ES-MECH-015', version: '2.0', external_url: 'https://sharepoint.example.com/edl/ES-MECH-015', category: 'Mechanical' });

  // ─── OPLs ───
  const opl1 = graphStore.createNode('opl', { id: 'opl-1', title: 'How to Check Pump Seal Flush System', one_point: 'Always verify seal flush flow indicator shows GREEN before pump startup', category: 'Safety', steps: ['Check seal flush pressure gauge reads > 1 bar above seal chamber', 'Verify flow indicator shows GREEN', 'Check flush supply valve is fully open', 'If no flow, DO NOT start pump - report to engineer'], target_audience: 'Operator' });
  const opl2 = graphStore.createNode('opl', { id: 'opl-2', title: 'Heat Exchanger Tube Leak Detection', one_point: 'Monitor product quality and pressure differential daily - sudden change indicates tube leak', category: 'Quality', steps: ['Record shell/tube pressure differential each shift', 'Compare with baseline value on trend chart', 'If DP change > 0.5 bar, sample product for contamination', 'Report any abnormal finding immediately'], target_audience: 'Operator' });
  const opl3 = graphStore.createNode('opl', { id: 'opl-3', title: 'Compressor Vibration Daily Check', one_point: 'Check vibration reading at bearing housing BEFORE and AFTER each shift handover', category: 'Reliability', steps: ['Read vibration value from local display', 'Compare with alert/alarm levels on nameplate', 'Record in logbook', 'If above alert level, increase monitoring frequency to every 2 hours'], target_audience: 'Operator' });
  const opl4 = graphStore.createNode('opl', { id: 'opl-4', title: 'CUI Visual Inspection Quick Guide', one_point: 'Look for damaged jacketing, rust stains, and bulging insulation as CUI indicators', category: 'Inspection', steps: ['Walk-down insulated piping/vessels during field rounds', 'Check for damaged or missing jacketing', 'Look for rust-colored stains at insulation joints', 'Check for bulging or wet spots on insulation', 'Tag and report any findings via work order'], target_audience: 'Operator' });
  const opl5 = graphStore.createNode('opl', { id: 'opl-5', title: 'Proper Bearing Lubrication Procedure', one_point: 'Use correct grease type (check color code) and apply correct quantity - over-greasing causes failure', category: 'Maintenance', steps: ['Identify correct grease by checking color-coded label', 'Clean grease fitting before applying', 'Apply grease gun strokes per specification table', 'Run equipment for 10 min then check temperature', 'Record in lubrication tracking system'], target_audience: 'Technician' });

  // ─── Persons ───
  const per1 = graphStore.createNode('person', { id: 'per-1', name: 'Somchai Prasert', role: 'Reliability Engineer', discipline: 'Mechanical', department: 'Engineering' });
  const per2 = graphStore.createNode('person', { id: 'per-2', name: 'Wichai Tanaka', role: 'Maintenance Engineer', discipline: 'Mechanical', department: 'Maintenance' });
  const per3 = graphStore.createNode('person', { id: 'per-3', name: 'Pranee Suksawat', role: 'Process Engineer', discipline: 'Process', department: 'Engineering' });
  const per4 = graphStore.createNode('person', { id: 'per-4', name: 'Anong Chaisakul', role: 'Operator', discipline: 'Operations', department: 'Production' });
  const per5 = graphStore.createNode('person', { id: 'per-5', name: 'Kittisak Wongsri', role: 'Instrument Technician', discipline: 'Instrumentation', department: 'Maintenance' });
  const per6 = graphStore.createNode('person', { id: 'per-6', name: 'Nattaporn Pimchan', role: 'Inspection Engineer', discipline: 'Inspection', department: 'Engineering' });

  // ─── Skills ───
  const sk1 = graphStore.createNode('skill', { id: 'sk-1', name: 'Pump Maintenance', category: 'Mechanical', description: 'Centrifugal pump overhaul, alignment, seal replacement', level_required: 4 });
  const sk2 = graphStore.createNode('skill', { id: 'sk-2', name: 'Vibration Analysis', category: 'Predictive Maintenance', description: 'Vibration data collection, spectrum analysis, diagnosis', level_required: 3 });
  const sk3 = graphStore.createNode('skill', { id: 'sk-3', name: 'Corrosion Assessment', category: 'Inspection', description: 'Corrosion mechanism identification, remaining life calculation', level_required: 4 });
  const sk4 = graphStore.createNode('skill', { id: 'sk-4', name: 'Heat Exchanger Inspection', category: 'Inspection', description: 'Tube testing, bundle inspection, repair assessment', level_required: 3 });
  const sk5 = graphStore.createNode('skill', { id: 'sk-5', name: 'RCA Facilitation', category: 'Reliability', description: 'Root Cause Analysis methodology and facilitation', level_required: 4 });
  const sk6 = graphStore.createNode('skill', { id: 'sk-6', name: 'Compressor Operations', category: 'Operations', description: 'Centrifugal compressor startup, monitoring, troubleshooting', level_required: 3 });

  // ─── Training ───
  const tr1 = graphStore.createNode('training', { id: 'tr-1', name: 'Pump Maintenance Workshop', description: '3-day hands-on pump maintenance training', duration: '3 days', provider: 'Internal', skill_covered: 'Pump Maintenance' });
  const tr2 = graphStore.createNode('training', { id: 'tr-2', name: 'Vibration Analysis Level II', description: 'ISO Category II vibration analyst certification', duration: '5 days', provider: 'Mobius Institute', skill_covered: 'Vibration Analysis' });
  const tr3 = graphStore.createNode('training', { id: 'tr-3', name: 'API 571 Corrosion Mechanisms', description: 'Damage mechanisms affecting refinery equipment', duration: '4 days', provider: 'API', skill_covered: 'Corrosion Assessment' });

  // ═══ RELATIONSHIPS ═══

  // Equipment → System
  graphStore.createEdge('part_of', 'eq-1', 'sys-1', {});
  graphStore.createEdge('part_of', 'eq-2', 'sys-1', {});
  graphStore.createEdge('part_of', 'eq-4', 'sys-1', {});
  graphStore.createEdge('part_of', 'eq-3', 'sys-2', {});
  graphStore.createEdge('part_of', 'eq-5', 'sys-2', {});
  graphStore.createEdge('part_of', 'eq-8', 'sys-2', {});
  graphStore.createEdge('part_of', 'eq-6', 'sys-3', {});
  graphStore.createEdge('part_of', 'eq-7', 'sys-3', {});

  // Incident → Equipment (occurred_on)
  graphStore.createEdge('occurred_on', 'inc-1', 'eq-1', {});
  graphStore.createEdge('occurred_on', 'inc-2', 'eq-3', {});
  graphStore.createEdge('occurred_on', 'inc-3', 'eq-8', {});
  graphStore.createEdge('occurred_on', 'inc-4', 'eq-4', {});
  graphStore.createEdge('occurred_on', 'inc-5', 'eq-6', {});

  // Incident → Failure Mode (caused_by)
  graphStore.createEdge('caused_by', 'inc-1', 'fm-1', {});
  graphStore.createEdge('caused_by', 'inc-2', 'fm-3', {});
  graphStore.createEdge('caused_by', 'inc-3', 'fm-2', {});
  graphStore.createEdge('caused_by', 'inc-3', 'fm-4', {});
  graphStore.createEdge('caused_by', 'inc-4', 'fm-5', {});
  graphStore.createEdge('caused_by', 'inc-5', 'fm-2', {});

  // Incident → Lesson (results_in)
  graphStore.createEdge('results_in', 'inc-1', 'les-1', {});
  graphStore.createEdge('results_in', 'inc-2', 'les-2', {});
  graphStore.createEdge('results_in', 'inc-3', 'les-3', {});
  graphStore.createEdge('results_in', 'inc-4', 'les-4', {});
  graphStore.createEdge('results_in', 'inc-5', 'les-5', {});

  // Lesson → EDL (supported_by)
  graphStore.createEdge('supported_by', 'les-1', 'edl-1', {});
  graphStore.createEdge('supported_by', 'les-1', 'edl-5', {});
  graphStore.createEdge('supported_by', 'les-2', 'edl-2', {});
  graphStore.createEdge('supported_by', 'les-3', 'edl-3', {});
  graphStore.createEdge('supported_by', 'les-3', 'edl-6', {});
  graphStore.createEdge('supported_by', 'les-4', 'edl-4', {});
  graphStore.createEdge('supported_by', 'les-5', 'edl-5', {});

  // OPL → Equipment (applicable_to)
  graphStore.createEdge('applicable_to', 'opl-1', 'eq-1', {});
  graphStore.createEdge('applicable_to', 'opl-1', 'eq-2', {});
  graphStore.createEdge('applicable_to', 'opl-2', 'eq-3', {});
  graphStore.createEdge('applicable_to', 'opl-3', 'eq-8', {});
  graphStore.createEdge('applicable_to', 'opl-4', 'eq-4', {});
  graphStore.createEdge('applicable_to', 'opl-5', 'eq-6', {});

  // OPL → Failure Mode (prevents)
  graphStore.createEdge('prevents', 'opl-1', 'fm-1', {});
  graphStore.createEdge('prevents', 'opl-2', 'fm-3', {});
  graphStore.createEdge('prevents', 'opl-3', 'fm-4', {});
  graphStore.createEdge('prevents', 'opl-4', 'fm-5', {});
  graphStore.createEdge('prevents', 'opl-5', 'fm-2', {});

  // OPL → Lesson (linked knowledge)
  graphStore.createEdge('supported_by', 'opl-1', 'les-1', {});
  graphStore.createEdge('supported_by', 'opl-2', 'les-2', {});
  graphStore.createEdge('supported_by', 'opl-3', 'les-3', {});
  graphStore.createEdge('supported_by', 'opl-4', 'les-4', {});
  graphStore.createEdge('supported_by', 'opl-5', 'les-5', {});

  // Equipment → Skill (requires_skill)
  graphStore.createEdge('requires_skill', 'eq-1', 'sk-1', {});
  graphStore.createEdge('requires_skill', 'eq-2', 'sk-1', {});
  graphStore.createEdge('requires_skill', 'eq-8', 'sk-2', {});
  graphStore.createEdge('requires_skill', 'eq-8', 'sk-6', {});
  graphStore.createEdge('requires_skill', 'eq-3', 'sk-4', {});
  graphStore.createEdge('requires_skill', 'eq-4', 'sk-3', {});

  // Person → Skill (has_skill)
  graphStore.createEdge('has_skill', 'per-1', 'sk-5', { level: 4 });
  graphStore.createEdge('has_skill', 'per-1', 'sk-2', { level: 3 });
  graphStore.createEdge('has_skill', 'per-2', 'sk-1', { level: 4 });
  graphStore.createEdge('has_skill', 'per-3', 'sk-4', { level: 2 });
  graphStore.createEdge('has_skill', 'per-5', 'sk-2', { level: 3 });
  graphStore.createEdge('has_skill', 'per-6', 'sk-3', { level: 4 });
  graphStore.createEdge('has_skill', 'per-6', 'sk-4', { level: 3 });
  graphStore.createEdge('has_skill', 'per-4', 'sk-6', { level: 2 });

  // EDL → EDL (references)
  graphStore.createEdge('references', 'edl-1', 'edl-5', {});
  graphStore.createEdge('references', 'edl-3', 'edl-6', {});

  graphStore.save();
  console.log(`[Seed] Created ${graphStore.nodes.size} nodes, ${graphStore.edges.size} edges`);
}
