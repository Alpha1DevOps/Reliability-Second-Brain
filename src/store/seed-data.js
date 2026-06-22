// Seed data for browser-based graph store
import { graphStore } from './graph-store.js';

export function seedData() {
  if (graphStore.nodes.size > 0) return; // already has data

  // ─── Systems ───
  graphStore.createNode('system', { id: 'sys-1', name: 'Crude Distillation Unit (CDU)', description: 'Primary crude oil distillation system', area: 'Area 1' });
  graphStore.createNode('system', { id: 'sys-2', name: 'Hydrocracking Unit (HCU)', description: 'Heavy oil hydrocracking system', area: 'Area 2' });
  graphStore.createNode('system', { id: 'sys-3', name: 'Cooling Water System', description: 'Plant-wide cooling water circulation', area: 'Utilities' });

  // ─── Equipment ───
  graphStore.createNode('equipment', { id: 'eq-1', tag_number: 'P-1101A', name: 'CDU Feed Pump A', type: 'Centrifugal Pump', system: 'CDU', location: 'Area 1', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-2', tag_number: 'P-1101B', name: 'CDU Feed Pump B', type: 'Centrifugal Pump', system: 'CDU', location: 'Area 1', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-3', tag_number: 'E-2201', name: 'HCU Feed/Effluent Exchanger', type: 'Shell & Tube Heat Exchanger', system: 'HCU', location: 'Area 2', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-4', tag_number: 'V-1501', name: 'CDU Overhead Drum', type: 'Pressure Vessel', system: 'CDU', location: 'Area 1', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-5', tag_number: 'C-2101', name: 'HCU Reactor', type: 'Reactor Vessel', system: 'HCU', location: 'Area 2', criticality: 'Critical' });
  graphStore.createNode('equipment', { id: 'eq-6', tag_number: 'P-3001', name: 'Cooling Water Pump', type: 'Centrifugal Pump', system: 'CWS', location: 'Utilities', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-7', tag_number: 'E-3001', name: 'Cooling Tower', type: 'Cooling Tower', system: 'CWS', location: 'Utilities', criticality: 'High' });
  graphStore.createNode('equipment', { id: 'eq-8', tag_number: 'K-2301', name: 'HCU Recycle Compressor', type: 'Centrifugal Compressor', system: 'HCU', location: 'Area 2', criticality: 'Critical' });

  // ─── Failure Modes ───
  graphStore.createNode('failure_mode', { id: 'fm-1', name: 'Seal Failure', description: 'Mechanical seal leakage due to wear or misalignment', mechanism: 'Wear', consequence: 'Hydrocarbon leak, fire risk' });
  graphStore.createNode('failure_mode', { id: 'fm-2', name: 'Bearing Failure', description: 'Bearing degradation from lubrication issues', mechanism: 'Fatigue', consequence: 'Unplanned shutdown' });
  graphStore.createNode('failure_mode', { id: 'fm-3', name: 'Tube Leak', description: 'Heat exchanger tube failure from corrosion', mechanism: 'Corrosion', consequence: 'Product contamination' });
  graphStore.createNode('failure_mode', { id: 'fm-4', name: 'Vibration Excessive', description: 'Abnormal vibration exceeding alarm levels', mechanism: 'Imbalance', consequence: 'Equipment damage' });
  graphStore.createNode('failure_mode', { id: 'fm-5', name: 'Corrosion Under Insulation', description: 'CUI on piping and vessels', mechanism: 'Corrosion', consequence: 'Wall thinning, potential rupture' });
  graphStore.createNode('failure_mode', { id: 'fm-6', name: 'Fouling', description: 'Internal fouling reducing heat transfer', mechanism: 'Deposition', consequence: 'Reduced efficiency' });

  // ─── Incidents ───
  graphStore.createNode('incident', { id: 'inc-1', title: 'P-1101A Seal Failure During Normal Operation', description: 'Mechanical seal on CDU feed pump failed causing hydrocarbon leak.', severity: 'High', status: 'Closed', date: '2025-08-15', root_cause: 'Seal face damage from dry running' });
  graphStore.createNode('incident', { id: 'inc-2', title: 'E-2201 Tube Leak Detected During Turnaround', description: 'Multiple tube leaks found in HCU feed/effluent exchanger during inspection.', severity: 'Medium', status: 'Closed', date: '2025-06-20', root_cause: 'High velocity erosion + naphthenic acid corrosion' });
  graphStore.createNode('incident', { id: 'inc-3', title: 'K-2301 High Vibration Trip', description: 'HCU recycle compressor tripped on high vibration alarm.', severity: 'Critical', status: 'Closed', date: '2025-11-03', root_cause: 'Bearing lubrication filter bypass' });
  graphStore.createNode('incident', { id: 'inc-4', title: 'V-1501 CUI Found During Inspection', description: 'Corrosion under insulation found on CDU overhead drum.', severity: 'High', status: 'Investigating', date: '2026-01-10', root_cause: 'Damaged insulation jacketing' });
  graphStore.createNode('incident', { id: 'inc-5', title: 'P-3001 Bearing Temperature High', description: 'Cooling water pump bearing temperature trending high.', severity: 'Medium', status: 'Resolved', date: '2026-02-28', root_cause: 'Lubrication schedule not followed' });

  // ─── Lessons ───
  graphStore.createNode('lesson', { id: 'les-1', title: 'Pump Seal Protection System Review', description: 'All critical pumps should have seal flush system with low-flow alarm.', category: 'Mechanical', impact: 'Prevent seal failures on 15+ critical pumps', date: '2025-09-01' });
  graphStore.createNode('lesson', { id: 'les-2', title: 'Velocity Limits for Naphthenic Acid Service', description: 'Tube inlet velocity must be limited to 1.5 m/s for naphthenic acid service.', category: 'Process/Materials', impact: 'Prevent erosion-corrosion in 8 exchangers', date: '2025-07-15' });
  graphStore.createNode('lesson', { id: 'les-3', title: 'Lube Oil System Monitoring Enhancement', description: 'Install online particle counter on lube oil system for critical rotating equipment.', category: 'Rotating Equipment', impact: 'Early detection of oil contamination', date: '2025-12-01' });
  graphStore.createNode('lesson', { id: 'les-4', title: 'CUI Risk Assessment and Inspection Priority', description: 'Implement risk-based CUI inspection program based on operating temperature.', category: 'Inspection', impact: 'Systematic CUI prevention for 200+ items', date: '2026-02-01' });
  graphStore.createNode('lesson', { id: 'les-5', title: 'Lubrication Management Best Practices', description: 'Establish lubrication routes with checklist verification.', category: 'Maintenance', impact: 'Standardize lubrication across all equipment', date: '2026-03-15' });

  // ─── EDL ───
  graphStore.createNode('edl', { id: 'edl-1', title: 'Mechanical Seal Selection Guide', doc_type: 'Engineering Standard', doc_number: 'ES-MECH-001', version: '3.0', category: 'Mechanical' });
  graphStore.createNode('edl', { id: 'edl-2', title: 'Heat Exchanger Design for Corrosive Service', doc_type: 'Design Guide', doc_number: 'DG-PROC-012', version: '2.1', category: 'Process' });
  graphStore.createNode('edl', { id: 'edl-3', title: 'Vibration Monitoring Specification', doc_type: 'Specification', doc_number: 'SP-INST-005', version: '1.5', category: 'Instrumentation' });
  graphStore.createNode('edl', { id: 'edl-4', title: 'CUI Prevention and Inspection Guideline', doc_type: 'Inspection Guideline', doc_number: 'IG-INSP-003', version: '2.0', category: 'Inspection' });
  graphStore.createNode('edl', { id: 'edl-5', title: 'Centrifugal Pump Maintenance Procedure', doc_type: 'Procedure', doc_number: 'MP-MECH-020', version: '4.2', category: 'Mechanical' });
  graphStore.createNode('edl', { id: 'edl-6', title: 'Lube Oil System Design Standard', doc_type: 'Engineering Standard', doc_number: 'ES-MECH-015', version: '2.0', category: 'Mechanical' });

  // ─── OPLs ───
  graphStore.createNode('opl', { id: 'opl-1', title: 'How to Check Pump Seal Flush System', one_point: 'Always verify seal flush flow indicator shows GREEN before pump startup', category: 'Safety', steps: ['Check seal flush pressure gauge', 'Verify flow indicator shows GREEN', 'Check flush supply valve is fully open', 'If no flow, DO NOT start pump'], target_audience: 'Operator' });
  graphStore.createNode('opl', { id: 'opl-2', title: 'Heat Exchanger Tube Leak Detection', one_point: 'Monitor product quality and pressure differential daily', category: 'Quality', steps: ['Record shell/tube pressure differential', 'Compare with baseline', 'If DP change > 0.5 bar, sample product', 'Report any abnormal finding'], target_audience: 'Operator' });
  graphStore.createNode('opl', { id: 'opl-3', title: 'Compressor Vibration Daily Check', one_point: 'Check vibration reading BEFORE and AFTER each shift', category: 'Reliability', steps: ['Read vibration from local display', 'Compare with alarm levels', 'Record in logbook', 'If above alert, increase monitoring'], target_audience: 'Operator' });
  graphStore.createNode('opl', { id: 'opl-4', title: 'CUI Visual Inspection Quick Guide', one_point: 'Look for damaged jacketing, rust stains, and bulging insulation', category: 'Inspection', steps: ['Walk-down insulated piping', 'Check for damaged jacketing', 'Look for rust stains at joints', 'Tag and report findings'], target_audience: 'Operator' });
  graphStore.createNode('opl', { id: 'opl-5', title: 'Proper Bearing Lubrication Procedure', one_point: 'Use correct grease type (check color code) and apply correct quantity', category: 'Maintenance', steps: ['Identify grease by color label', 'Clean grease fitting', 'Apply correct strokes per spec', 'Run equipment 10 min then check temp'], target_audience: 'Technician' });

  // ─── Persons ───
  graphStore.createNode('person', { id: 'per-1', name: 'Somchai Prasert', role: 'Reliability Engineer', discipline: 'Mechanical', department: 'Engineering' });
  graphStore.createNode('person', { id: 'per-2', name: 'Wichai Tanaka', role: 'Maintenance Engineer', discipline: 'Mechanical', department: 'Maintenance' });
  graphStore.createNode('person', { id: 'per-3', name: 'Pranee Suksawat', role: 'Process Engineer', discipline: 'Process', department: 'Engineering' });
  graphStore.createNode('person', { id: 'per-4', name: 'Anong Chaisakul', role: 'Operator', discipline: 'Operations', department: 'Production' });
  graphStore.createNode('person', { id: 'per-5', name: 'Kittisak Wongsri', role: 'Instrument Technician', discipline: 'Instrumentation', department: 'Maintenance' });
  graphStore.createNode('person', { id: 'per-6', name: 'Nattaporn Pimchan', role: 'Inspection Engineer', discipline: 'Inspection', department: 'Engineering' });

  // ─── Skills ───
  graphStore.createNode('skill', { id: 'sk-1', name: 'Pump Maintenance', category: 'Mechanical', description: 'Centrifugal pump overhaul, alignment, seal replacement', level_required: 4 });
  graphStore.createNode('skill', { id: 'sk-2', name: 'Vibration Analysis', category: 'Predictive Maintenance', description: 'Vibration data collection, spectrum analysis', level_required: 3 });
  graphStore.createNode('skill', { id: 'sk-3', name: 'Corrosion Assessment', category: 'Inspection', description: 'Corrosion mechanism identification, remaining life', level_required: 4 });
  graphStore.createNode('skill', { id: 'sk-4', name: 'Heat Exchanger Inspection', category: 'Inspection', description: 'Tube testing, bundle inspection', level_required: 3 });
  graphStore.createNode('skill', { id: 'sk-5', name: 'RCA Facilitation', category: 'Reliability', description: 'Root Cause Analysis methodology', level_required: 4 });
  graphStore.createNode('skill', { id: 'sk-6', name: 'Compressor Operations', category: 'Operations', description: 'Compressor startup, monitoring, troubleshooting', level_required: 3 });

  // ─── Training ───
  graphStore.createNode('training', { id: 'tr-1', name: 'Pump Maintenance Workshop', description: '3-day hands-on training', duration: '3 days', provider: 'Internal' });
  graphStore.createNode('training', { id: 'tr-2', name: 'Vibration Analysis Level II', description: 'ISO Category II certification', duration: '5 days', provider: 'Mobius Institute' });
  graphStore.createNode('training', { id: 'tr-3', name: 'API 571 Corrosion Mechanisms', description: 'Damage mechanisms in refinery', duration: '4 days', provider: 'API' });

  // ═══ RELATIONSHIPS ═══
  const edges = [
    ['part_of', 'eq-1', 'sys-1'], ['part_of', 'eq-2', 'sys-1'], ['part_of', 'eq-4', 'sys-1'],
    ['part_of', 'eq-3', 'sys-2'], ['part_of', 'eq-5', 'sys-2'], ['part_of', 'eq-8', 'sys-2'],
    ['part_of', 'eq-6', 'sys-3'], ['part_of', 'eq-7', 'sys-3'],
    ['occurred_on', 'inc-1', 'eq-1'], ['occurred_on', 'inc-2', 'eq-3'], ['occurred_on', 'inc-3', 'eq-8'],
    ['occurred_on', 'inc-4', 'eq-4'], ['occurred_on', 'inc-5', 'eq-6'],
    ['caused_by', 'inc-1', 'fm-1'], ['caused_by', 'inc-2', 'fm-3'], ['caused_by', 'inc-3', 'fm-2'],
    ['caused_by', 'inc-3', 'fm-4'], ['caused_by', 'inc-4', 'fm-5'], ['caused_by', 'inc-5', 'fm-2'],
    ['results_in', 'inc-1', 'les-1'], ['results_in', 'inc-2', 'les-2'], ['results_in', 'inc-3', 'les-3'],
    ['results_in', 'inc-4', 'les-4'], ['results_in', 'inc-5', 'les-5'],
    ['supported_by', 'les-1', 'edl-1'], ['supported_by', 'les-1', 'edl-5'], ['supported_by', 'les-2', 'edl-2'],
    ['supported_by', 'les-3', 'edl-3'], ['supported_by', 'les-3', 'edl-6'], ['supported_by', 'les-4', 'edl-4'],
    ['supported_by', 'les-5', 'edl-5'],
    ['applicable_to', 'opl-1', 'eq-1'], ['applicable_to', 'opl-1', 'eq-2'], ['applicable_to', 'opl-2', 'eq-3'],
    ['applicable_to', 'opl-3', 'eq-8'], ['applicable_to', 'opl-4', 'eq-4'], ['applicable_to', 'opl-5', 'eq-6'],
    ['prevents', 'opl-1', 'fm-1'], ['prevents', 'opl-2', 'fm-3'], ['prevents', 'opl-3', 'fm-4'],
    ['prevents', 'opl-4', 'fm-5'], ['prevents', 'opl-5', 'fm-2'],
    ['supported_by', 'opl-1', 'les-1'], ['supported_by', 'opl-2', 'les-2'], ['supported_by', 'opl-3', 'les-3'],
    ['supported_by', 'opl-4', 'les-4'], ['supported_by', 'opl-5', 'les-5'],
    ['requires_skill', 'eq-1', 'sk-1'], ['requires_skill', 'eq-2', 'sk-1'], ['requires_skill', 'eq-8', 'sk-2'],
    ['requires_skill', 'eq-8', 'sk-6'], ['requires_skill', 'eq-3', 'sk-4'], ['requires_skill', 'eq-4', 'sk-3'],
    ['has_skill', 'per-1', 'sk-5'], ['has_skill', 'per-1', 'sk-2'], ['has_skill', 'per-2', 'sk-1'],
    ['has_skill', 'per-3', 'sk-4'], ['has_skill', 'per-5', 'sk-2'], ['has_skill', 'per-6', 'sk-3'],
    ['has_skill', 'per-6', 'sk-4'], ['has_skill', 'per-4', 'sk-6'],
    ['references', 'edl-1', 'edl-5'], ['references', 'edl-3', 'edl-6'],
  ];
  edges.forEach(([type, source, target]) => graphStore.createEdge(type, source, target, {}));

  graphStore.save();
  console.log(`[DOT Seed] Created ${graphStore.nodes.size} nodes, ${graphStore.edges.size} edges`);
}
