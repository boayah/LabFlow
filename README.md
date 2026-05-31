# LabFlow QA

A lightweight lab operations dashboard for sample tracking, experiment documentation, QC management, and deviation handling. Built with Next.js 15 App Router and Supabase.

Inspired by regulated documentation workflows. Does not claim compliance with FDA, CLIA, GLP, GMP, or ISO standards.

---

## Why I Built This

I spent two years as a lab technician before transitioning into software. During that time, I kept meticulous sample logs in a shared Google Sheet that three people edited simultaneously, with no version history, no traceability between samples and the experiments that used them, and no reliable way to reconstruct what happened to a sample six months later.

When a sample integrity question came up during manuscript review, the answer required reconstructing a chain of custody from memory and partial records. We got lucky that time.

LabFlow QA shows what a lightweight, purpose-built alternative looks like. Not a full commercial LIMS - a focused system that captures the four things a small research lab actually needs: where are my samples, what was done to them, did the work pass QC, and what happened when something went wrong.

---

## What It Does

**Sample Tracking** - Log samples from receipt through use. Each sample carries type, source description, storage condition, owner, and status. Status transitions are tracked with a full audit trail.

**Experiment Runs** - Document assay runs with protocol name, operator, equipment, reagent lot, and QC outcome. Link one or more samples to a run. When the QC outcome is recorded, linked sample statuses update automatically: pass moves samples to "Used", fail flags them, conditional pass marks them "In Review".

**Deviation Management** - File deviations with severity (Low / Medium / High / Critical), category (Equipment / Protocol / Environmental / Sample / Reagent), immediate action, corrective action, and optional links to specific samples or runs. Track deviation status from Open through In Review to Resolved.

**QC Report** - Derived view of all experiment runs with QC outcomes. Shows pass rate, pass/fail/conditional breakdown, and a filterable run list.

**Audit Trail** - Every create and update action generates an immutable audit event with timestamp, user, action type, entity ID, and a change summary. Filter by entity type, action, or entity ID.

---

## Tech Stack

- **Next.js 15** with App Router, TypeScript, Tailwind CSS
- **Supabase** (PostgreSQL) for data storage
- **Server Actions** for all mutations - no REST API layer
- **Server Components** for data fetching with URL search params for filter state
- **lucide-react** for icons

---

## Data Model

### samples
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| sample_id | text | Auto-assigned SMP-YYYY-XXX |
| sample_type | text | cell-culture, tissue, blood-derived, reagent |
| source | text | Descriptive name |
| storage_condition | text | Storage location |
| received_date | date | |
| owner | text | Responsible person |
| status | text | received, in-processing, used, in-review, flagged, completed, archived, on-hold |
| notes | text | Optional |

### experiment_runs
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| run_id | text | Auto-assigned EXP-YYYY-XXX |
| protocol_name | text | |
| operator | text | |
| date | date | |
| linked_sample_ids | text[] | Array of sample_id values |
| equipment_used | text | |
| reagent_lot | text | Optional |
| run_status | text | pending, in-progress, completed, failed, cancelled |
| qc_outcome | text | pass, fail, conditional-pass, pending |
| observations | text | Optional |

### deviations
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| deviation_id | text | Auto-assigned DEV-YYYY-XXX |
| severity | text | low, medium, high, critical |
| category | text | equipment, protocol, environmental, sample, reagent |
| description | text | |
| immediate_action | text | Optional |
| corrective_action | text | Optional |
| owner | text | |
| status | text | open, in-review, resolved |
| opened_date | date | |
| closed_date | date | Set when resolved |
| linked_sample_id | text | Optional foreign key to sample_id |
| linked_run_id | text | Optional foreign key to run_id |

### audit_events (append-only)
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| timestamp | timestamptz | Auto-set |
| user_name | text | |
| action | text | e.g. SAMPLE_CREATED, EXPERIMENT_UPDATED |
| entity_type | text | sample, experiment_run, deviation |
| entity_id | text | The ID string of the affected record |
| change_summary | text | Human-readable description |

---

## Lab Workflow

```
Sample Received
      |
      v
[samples] status = "received"
      |
      v
Linked to experiment run
      |
      v
[samples] status = "in-processing"
      |
      v
Run completed, QC outcome recorded
      |
      +-- pass          --> [samples] status = "used"
      +-- fail          --> [samples] status = "flagged"
      +-- conditional   --> [samples] status = "in-review"
      |
      v
Deviations filed as needed
      |
      v
All actions written to audit_events
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd labflow-qa
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run `supabase/schema.sql`
3. Optionally run `supabase/seed.sql` to load demo data

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key (found under Project Settings > API).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deploy to Vercel with one command:

```bash
npx vercel
```

Add your environment variables in the Vercel dashboard under Project > Settings > Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## Security Note

This demo uses open Row Level Security policies (`FOR ALL USING (true)`) that allow all operations without authentication. This is intentional for a portfolio demo.

A production deployment would require:
- Supabase Auth for user identity
- RLS policies scoped to `auth.uid()` and user roles
- Role-based access control (only lab managers close deviations, only QA coordinators approve QC reports)
- Input validation and rate limiting on server actions
- Audit events protected from deletion (append-only enforced at the database level)
- Stricter CORS and environment variable management

---

## Project Structure

```
app/
  page.tsx                  Dashboard
  samples/
    page.tsx                Sample list with filters
    actions.ts              createSample, updateSampleStatus
  experiments/
    page.tsx                Experiment run list
    actions.ts              createExperimentRun, updateExperimentRun
  deviations/
    page.tsx                Deviation list
    actions.ts              createDeviation, updateDeviationStatus
  qc-report/page.tsx        QC summary derived from runs
  audit-trail/page.tsx      Full audit log
  case-study/page.tsx       Portfolio case study

components/
  layout/Sidebar.tsx        Navigation sidebar
  ui/                       StatusBadge, PageHeader, EmptyState
  samples/                  AddSampleModal, SampleFilters, SampleTable
  experiments/              AddExperimentModal, ExperimentFilters, ExperimentTable
  deviations/               AddDeviationModal, DeviationFilters, DeviationTable
  audit/AuditFilters.tsx

lib/
  supabase/
    client.ts               Supabase client factory
    types.ts                TypeScript types matching DB schema
  audit.ts                  logAuditEvent helper

supabase/
  schema.sql                Database setup
  seed.sql                  Demo data
```

---

## Engineering Relevance

This project was built to demonstrate skills relevant to:

**Lab Automation** - Sample state machines, automated status transitions based on outcome logic, instrument and reagent lot tracking.

**QA / QC Systems** - Deviation management with severity classification, corrective action documentation, acceptance criteria enforcement.

**Engineering Technician** - Structured chain-of-custody documentation, audit readiness built into every operation.

**Bioinformatics / Technical Operations** - Data integrity patterns over free-text records, provenance tracking from sample to result, queryable data model.

---

## Future Improvements

- Authentication with role-based access (technician, scientist, supervisor, QA)
- File attachments for run data, gel images, and protocol PDFs
- Instrument maintenance log with calibration due-date tracking
- PDF export of deviation reports and QC summaries
- Real-time updates via Supabase Realtime
- Sample barcode / QR code generation for physical labeling
- Batch import from CSV for high-throughput receipt workflows

---

## Demo Data Disclaimer

The seed data contains fictional lab records created for demonstration purposes. Any resemblance to real experiments, samples, donors, or personnel is coincidental. Do not use this system for actual clinical or regulated research without appropriate validation, authentication, and compliance review.
