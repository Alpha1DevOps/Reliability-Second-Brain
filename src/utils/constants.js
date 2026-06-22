import { icons } from './icons.js';

// Node type definitions with Lucide icons and monochromatic brand colors
// Using a single blue-slate brand palette for professional appearance
export const NODE_TYPES = {
  incident:     { label: 'Incident',           icon: icons.incident,     color: '#dc2626', bgColor: '#fef2f2' },
  lesson:       { label: 'Lesson Learned',     icon: icons.lesson,       color: '#d97706', bgColor: '#fffbeb' },
  edl:          { label: 'Engineering Document',icon: icons.edl,          color: '#2563eb', bgColor: '#eff6ff' },
  opl:          { label: 'OPL',                icon: icons.opl,          color: '#059669', bgColor: '#ecfdf5' },
  equipment:    { label: 'Equipment',          icon: icons.equipment,    color: '#7c3aed', bgColor: '#f5f3ff' },
  system:       { label: 'System',             icon: icons.system,       color: '#4f46e5', bgColor: '#eef2ff' },
  failure_mode: { label: 'Failure Mode',       icon: icons.failure_mode, color: '#e11d48', bgColor: '#fff1f2' },
  person:       { label: 'Person',             icon: icons.person,       color: '#0891b2', bgColor: '#ecfeff' },
  skill:        { label: 'Skill',              icon: icons.skill,        color: '#0d9488', bgColor: '#f0fdfa' },
  training:     { label: 'Training',           icon: icons.training,     color: '#0284c7', bgColor: '#f0f9ff' }
};

export const EDGE_TYPES = {
  occurred_on:    { label: 'Occurred On',    from: 'incident', to: 'equipment' },
  caused_by:      { label: 'Caused By',      from: 'incident', to: 'failure_mode' },
  results_in:     { label: 'Results In',     from: 'incident', to: 'lesson' },
  supported_by:   { label: 'Supported By',   from: 'lesson',   to: 'edl' },
  applicable_to:  { label: 'Applicable To',  from: 'opl',      to: 'equipment' },
  prevents:       { label: 'Prevents',       from: 'opl',      to: 'failure_mode' },
  requires_skill: { label: 'Requires Skill', from: 'equipment',to: 'skill' },
  has_skill:      { label: 'Has Skill',      from: 'person',   to: 'skill' },
  part_of:        { label: 'Part Of',        from: 'equipment',to: 'system' },
  references:     { label: 'References',     from: 'edl',      to: 'edl' }
};

export const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
export const INCIDENT_STATUSES = ['Open', 'Investigating', 'Resolved', 'Closed'];
export const ROLES = ['Operator', 'Technician', 'Engineer', 'Reliability Engineer', 'Manager', 'Admin'];
export const EDL_CATEGORIES = ['Mechanical', 'Process', 'Instrumentation', 'Inspection', 'Electrical', 'Civil'];
export const EDL_DOC_TYPES = ['Engineering Standard', 'Design Guide', 'Specification', 'Procedure', 'Inspection Guideline', 'Drawing'];
export const OPL_CATEGORIES = ['Safety', 'Quality', 'Reliability', 'Inspection', 'Maintenance', 'Operations'];
export const SKILL_CATEGORIES = ['Mechanical', 'Electrical', 'Instrumentation', 'Process', 'Inspection', 'Reliability', 'Operations', 'Predictive Maintenance'];
