export type SampleType = 'cell-culture' | 'tissue' | 'blood-derived' | 'reagent';
export type SampleStatus =
  | 'received'
  | 'in-processing'
  | 'used'
  | 'in-review'
  | 'flagged'
  | 'completed'
  | 'archived'
  | 'on-hold';
export type RunStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
export type QCOutcome = 'pass' | 'fail' | 'conditional-pass' | 'pending';
export type DeviationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DeviationCategory = 'equipment' | 'protocol' | 'environmental' | 'sample' | 'reagent';
export type DeviationStatus = 'open' | 'in-review' | 'resolved';
export type AuditEntityType = 'sample' | 'experiment_run' | 'deviation';

export interface Sample {
  id: string;
  sample_id: string;
  sample_type: SampleType;
  source: string;
  storage_condition: string;
  received_date: string;
  owner: string;
  status: SampleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperimentRun {
  id: string;
  run_id: string;
  protocol_name: string;
  operator: string;
  date: string;
  linked_sample_ids: string[];
  equipment_used: string;
  reagent_lot: string | null;
  run_status: RunStatus;
  qc_outcome: QCOutcome | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deviation {
  id: string;
  deviation_id: string;
  severity: DeviationSeverity;
  category: DeviationCategory;
  description: string;
  immediate_action: string | null;
  corrective_action: string | null;
  owner: string;
  status: DeviationStatus;
  opened_date: string;
  closed_date: string | null;
  linked_sample_id: string | null;
  linked_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user_name: string;
  action: string;
  entity_type: AuditEntityType;
  entity_id: string;
  change_summary: string;
  created_at: string;
}

export type SampleInsert = {
  sample_id: string;
  sample_type: SampleType;
  source: string;
  storage_condition: string;
  received_date: string;
  owner: string;
  status?: SampleStatus;
  notes?: string | null;
};

export type SampleUpdate = {
  status?: SampleStatus;
  notes?: string | null;
  storage_condition?: string;
  owner?: string;
  updated_at?: string;
};

export type ExperimentRunInsert = {
  run_id: string;
  protocol_name: string;
  operator: string;
  date: string;
  linked_sample_ids: string[];
  equipment_used: string;
  reagent_lot?: string | null;
  run_status: RunStatus;
  qc_outcome?: QCOutcome | null;
  observations?: string | null;
};

export type ExperimentRunUpdate = {
  run_status?: RunStatus;
  qc_outcome?: QCOutcome | null;
  observations?: string | null;
  updated_at?: string;
};

export type DeviationInsert = {
  deviation_id: string;
  severity: DeviationSeverity;
  category: DeviationCategory;
  description: string;
  immediate_action?: string | null;
  corrective_action?: string | null;
  owner: string;
  status?: DeviationStatus;
  opened_date: string;
  closed_date?: string | null;
  linked_sample_id?: string | null;
  linked_run_id?: string | null;
};

export type DeviationUpdate = {
  status?: DeviationStatus;
  closed_date?: string | null;
  immediate_action?: string | null;
  corrective_action?: string | null;
  updated_at?: string;
};

export type AuditEventInsert = {
  timestamp: string;
  user_name: string;
  action: string;
  entity_type: AuditEntityType;
  entity_id: string;
  change_summary: string;
};

export interface Database {
  public: {
    Tables: {
      samples: {
        Row: Sample;
        Insert: SampleInsert;
        Update: SampleUpdate;
      };
      experiment_runs: {
        Row: ExperimentRun;
        Insert: ExperimentRunInsert;
        Update: ExperimentRunUpdate;
      };
      deviations: {
        Row: Deviation;
        Insert: DeviationInsert;
        Update: DeviationUpdate;
      };
      audit_events: {
        Row: AuditEvent;
        Insert: AuditEventInsert;
        Update: Record<string, never>;
      };
    };
  };
}
