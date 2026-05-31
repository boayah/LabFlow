export default function CaseStudyPage() {
  return (
    <div className="max-w-3xl space-y-10 pb-12">
      <div>
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Case Study</p>
        <h1 className="text-2xl font-semibold text-slate-900">LabFlow QA</h1>
        <p className="mt-2 text-slate-600">
          A lightweight lab operations dashboard for sample tracking, experiment documentation, QC
          management, and deviation handling. Inspired by regulated documentation workflows.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Why I Built This
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          I spent two years as a lab technician before transitioning into software. During that
          time, I kept meticulous sample logs in a shared Google Sheet that three people edited
          simultaneously, with no version history, no link between the samples and the experiments
          that consumed them, and no way to know who changed the status of a sample from
          "available" to "discarded" and when.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          When a sample integrity question came up during manuscript review six months after the
          experiment, the answer required reconstructing a chain of custody from memory and partial
          records. We got lucky.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          LabFlow QA shows what a lightweight, purpose-built alternative looks like. Not a full
          commercial LIMS - those exist and do far more. A minimal system that captures the four
          things a small research lab actually needs: where are my samples, what was done to them,
          did the work pass QC, and what happened when something went wrong.
        </p>
        <p className="text-sm text-slate-500 italic">
          This project is inspired by regulated documentation workflows. It does not claim
          compliance with FDA, CLIA, GLP, GMP, or ISO standards.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          The Problem
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Labs produce a lot of documentation. Sample logs, experiment run sheets, QC records,
          deviation reports, and audit trails are often maintained in disconnected systems: paper
          binders, shared Excel workbooks, generic ticketing tools. When a question about sample
          provenance comes up six months later, the answer may require searching through three
          different file directories and a physical binder.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Modern lab operations need sample traceability from receipt through use, clear linkage
          between samples and the experiments that consumed them, automatic status transitions when
          results land outside acceptance criteria, a deviation management workflow that captures
          both immediate and corrective actions, and an audit trail that answers who changed what
          and when.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Users
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              role: 'Lab Technician',
              workflow:
                'Receives samples, logs them into the system, updates status as processing moves forward.',
            },
            {
              role: 'Research Scientist',
              workflow:
                'Creates experiment runs, links samples, records QC outcomes and observations.',
            },
            {
              role: 'Lab Supervisor',
              workflow:
                'Reviews open deviations, tracks corrective actions, monitors QC pass rate trends.',
            },
            {
              role: 'QA Coordinator',
              workflow:
                'Exports audit trails, verifies documentation completeness, signs off on resolved deviations.',
            },
          ].map(u => (
            <div key={u.role} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-900">{u.role}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{u.workflow}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Workflow Walk-Through
        </h2>
        <ol className="space-y-4">
          {[
            {
              step: '1. Sample Receipt',
              detail:
                'A new sample arrives. The technician logs it: sample type, source description, storage location, received date, and responsible owner. A unique ID is auto-assigned (SMP-YYYY-XXX). Status begins at "Received".',
            },
            {
              step: '2. Experiment Planning',
              detail:
                'A scientist creates an experiment run, selects a protocol name, links one or more samples, records the instrument and reagent lot, and sets the initial status to "Pending" or "In Progress". All linked samples move to "In Processing".',
            },
            {
              step: '3. QC Outcome',
              detail:
                'When the run completes, the operator records the QC outcome. Pass moves all linked samples to "Used". Fail flags them. Conditional Pass marks them "In Review" for a second look. The change is written to the audit trail automatically.',
            },
            {
              step: '4. Deviation Filing',
              detail:
                'If something goes wrong - a temperature excursion, a reagent lot failure, a protocol departure - a deviation is filed with severity, category, immediate action, and corrective action. Deviations can be linked to specific samples or runs.',
            },
            {
              step: '5. Audit Review',
              detail:
                'Every create and update operation generates an immutable audit event with timestamp, user, action, entity, and change summary. The audit trail page lets supervisors filter by entity type, action, or entity ID.',
            },
          ].map(item => (
            <li key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-28 text-xs font-semibold text-slate-900 pt-0.5">
                {item.step}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Technical Architecture
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              label: 'Next.js 15 App Router',
              detail:
                'Server components for data fetching, server actions for mutations, no separate API layer. URL search params for filter state - shareable and history-aware.',
            },
            {
              label: 'Supabase (PostgreSQL)',
              detail:
                'Four tables: samples, experiment_runs, deviations, audit_events. Row-level security enabled with open demo policies. Updated_at triggers via plpgsql function.',
            },
            {
              label: 'Automatic Audit Trail',
              detail:
                'Every server action writes an audit event synchronously alongside the main operation. No background jobs, no triggers - the action itself is the unit of traceability.',
            },
            {
              label: 'Auto Status Propagation',
              detail:
                'When a run QC outcome is set, all linked samples update status atomically server-side. Pass -> Used, Fail -> Flagged, Conditional Pass -> In Review. The client never needs to know the rules.',
            },
          ].map(t => (
            <div key={t.label} className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-900">{t.label}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Key Design Decisions and Tradeoffs
        </h2>
        <div className="space-y-3">
          {[
            {
              decision: 'Server actions instead of REST API',
              tradeoff:
                'Simpler type-safe mutations with zero boilerplate. Works well for a single-application context. Would not scale if multiple clients needed to consume the same endpoints.',
            },
            {
              decision: 'Synchronous audit writes in the action',
              tradeoff:
                'If the audit write fails, the main operation has already committed. Simpler to reason about than a transaction, acceptable for lab-tool traffic. A queue or database trigger would be more robust in production.',
            },
            {
              decision: 'No authentication',
              tradeoff:
                'Reduces demo complexity. Production deployment requires Supabase Auth with RLS policies tied to user ID and role-based access control - for example, only lab managers should be able to close deviations.',
            },
            {
              decision: 'URL search params for filters',
              tradeoff:
                'Filter state is in the URL, not React state. Pages are shareable and support browser back/forward. The tradeoff is slightly more boilerplate in filter components.',
            },
          ].map(d => (
            <div key={d.decision} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex-shrink-0 w-56 text-xs font-semibold text-slate-900 pt-0.5">
                {d.decision}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{d.tradeoff}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Engineering Relevance
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              role: 'Lab Automation',
              points: [
                'Sample state machine with defined transitions',
                'Automated status propagation based on outcome logic',
                'Instrument tracking and reagent lot linkage',
              ],
            },
            {
              role: 'QA / QC Systems',
              points: [
                'Deviation management with severity classification',
                'Immediate and corrective action capture',
                'QC pass rate metrics derived from run data',
              ],
            },
            {
              role: 'Engineering Technician',
              points: [
                'Structured documentation with chain of custody',
                'Audit readiness built into every operation',
                'Clear separation of concerns across entity types',
              ],
            },
            {
              role: 'Bioinformatics / Technical Ops',
              points: [
                'Data integrity patterns over free-text records',
                'Provenance tracking from sample to result',
                'Filterable, queryable data model from the start',
              ],
            },
          ].map(r => (
            <div key={r.role} className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">{r.role}</p>
              <ul className="space-y-1">
                {r.points.map(p => (
                  <li key={p} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">-</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Future Work
        </h2>
        <ul className="space-y-1.5">
          {[
            'Authentication with Supabase Auth and role-based access (technician, scientist, supervisor, QA)',
            'File attachments for run data exports, gel images, and protocol PDFs via Supabase Storage',
            'Real-time updates via Supabase Realtime subscriptions on the audit trail and dashboard',
            'Instrument maintenance log with calibration due-date tracking',
            'PDF export of deviation reports and QC summaries',
            'Sample barcode / QR code generation for physical labeling',
            'Batch import from CSV for high-throughput sample receipt',
          ].map(item => (
            <li key={item} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-slate-400 mt-0.5 flex-shrink-0">-</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
