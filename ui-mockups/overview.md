# CareTrail — User Interface Specification & Architecture

This document provides a complete visual architecture, navigation flow, and screen specification for **CareTrail — Intelligent Healthcare Continuity Platform**.

---

## 1. Global Navigation & Role Architecture

The navigation bar dynamically adapts to the authenticated user's role:

```
+----------------------------------------------------------------------------------------------------+
|  [+] CareTrail | Healthcare Continuity Platform       [Patient: John Doe v] [Notifications (3)]    |
+----------------------------------------------------------------------------------------------------+
|  Navigation:                                                                                       |
|  [Dashboard]  [Unified Timeline]  [Upload Record]  [Gap Map]  [Conflicts]  [Brief]  [Consent]      |
+----------------------------------------------------------------------------------------------------+
```

### Role-Based Access Views:
1. **Patient Portal**: Timeline, Document Upload, OCR Field Correction, Conflict Review, Continuity Gap Map, Consent Grants & Revocation, Access Audit Logs.
2. **Healthcare Provider Portal**: Authorized Patient Roster, Clinical Continuity Brief with Provenance, Record Upload for Authorized Patients, Institutional Document Attestation & Dispute.
3. **System Administrator Portal**: Provider Credential Review, Institutional Verification Queue, Immutable Audit & Security Monitor, System Discrepancy Overview.

---

## 2. Screen Specifications & Layouts

### Screen 1: Patient Dashboard (`/patient/dashboard`)
- **Key Performance Indicators (KPIs)**:
  - Total Digitized Records (e.g. `4`)
  - Verified Documents (e.g. `2`)
  - Active Continuity Gaps (e.g. `6`)
  - Clinical Conflicts Detected (e.g. `2`)
- **Quick Action Bar**: Upload Paper Record, Generate Continuity Brief, Review Active Consents.
- **Recent Medical Activity**: Last 3 consultation/investigation notes with color-coded status badges.
- **Continuity Gap Alert Banner**: Highlights pending follow-up cardiology consult and missing MRI report.

### Screen 2: Unified Medical Timeline (`/patient/timeline`)
- **Filters**: Date range, Healthcare Provider, Record Type (Consultation, Prescription, Investigation, Discharge Summary, Lab Report).
- **Interactive Timeline Cards**:
  - Date & Issuing Institution (e.g. *Metro General Hospital*, *Apex Diagnostic Lab*)
  - Document Title & Type Badge
  - Extracted Clinical Summary (Diagnoses, Prescribed medications, Key vitals/lab values)
  - **Verification Trust Badge**:
    - `PATIENT_UPLOADED_UNVERIFIED` (Amber)
    - `ISSUER_CONFIRMED` (Emerald)
    - `DIGITALLY_SIGNED` (Blue)
    - `DISCREPANCY_FOUND` (Rose)
    - `UNABLE_TO_VERIFY` (Slate)
  - Action Buttons: `[View Original Document]`, `[Review / Correct OCR]`, `[View Verification Evidence]`.

### Screen 3: OCR-Based Document Digitization & Upload (`/patient/upload`)
- **Drag & Drop Upload Zone**: Validates PDF, JPG, JPEG, PNG (< 25MB).
- **Document Metadata Form**: Title, Document Type selector, Issuing Facility, Record Date.
- **Instant Digitization Preview**:
  - Side-by-side or tabbed extraction view showing:
    - Raw OCR Extracted Text
    - Normalized Structured Entities (Dates, Provider, Patient IDs, Medications with dosages, Lab analytes).
    - Extraction Confidence Score (e.g. `94%`).
  - **Safety Notice**: Original file is cryptographically hashed (`SHA-256`) and preserved untouched; patient edits update metadata only.

### Screen 4: Continuity Gap Map (`/patient/gap-map`)
Visual dashboard structured into 4 critical continuity dimensions:
1. **Missing Supporting Documents**: Prescriptions mentioning pending lab investigations without corresponding lab reports.
2. **Conflicting Medical Information**: Discrepancies flagged across records requiring clinician reconciliation.
3. **Unresolved Verification Issues**: Documents where issuer contact details failed or verification is pending.
4. **Follow-Up Instruction Tracker**:
   - Instruction: *Cardiology Echo follow-up within 14 days*
   - Status: `PENDING` / `COMPLETED` / `UNCONFIRMED`
   - Source: Metro General Discharge Summary (2026-09-15)

### Screen 5: Clinical Conflict Detector (`/patient/conflicts`)
Side-by-side comparative inspection card:
- **Conflict Type**: Medication Dosage Discrepancy
- **Record A (Metro General Hospital - Dr. Sarah Chen)**: `Metformin 1000mg BID` (Issued 2026-09-15)
- **Record B (Westside Community Clinic - Dr. Marcus Vance)**: `Metformin 500mg Once Daily` (Issued 2026-10-02)
- **System Clinical Policy**: Both values are retained; no automatic overwrite occurs. A clinical note is attached for the consulting physician.

### Screen 6: Continuity Brief & Provenance Summary (`/patient/brief`)
- Concise, high-density clinical summary designed for fast consulting physician intake (< 90 seconds).
- **Clinical Sections**: Active Diagnoses, Current Prescriptions, Significant Diagnostic Findings, Unresolved Gaps.
- **Interactive Provenance Links**: Every clinical assertion links directly to its source document ID and verification hash.
- **Export Capabilities**: Clean printable format and secure PDF export.

### Screen 7: Consent-Based Sharing & Revocation (`/patient/sharing`)
- **Grant Access Form**: Select Healthcare Provider, Scope (`FULL_RECORD`, `CONTINUITY_BRIEF_ONLY`, `SELECTED_DOCUMENTS`), Expiration Date (e.g. 24h, 7 days, 30 days).
- **Active Consents Table**: Provider name, Granted date, Expiry countdown, Access status.
- **1-Click Immediate Revocation**: Instantly invalidates backend access token and updates audit trail.

### Screen 8: Healthcare Provider Portal (`/provider/dashboard`)
- Patient lookup by secure National Health ID / Patient identifier.
- Verification status of incoming transfer records.
- Ability to attest/confirm records issued by the provider's own hospital.

### Screen 9: Admin Verification & Security Audit (`/admin/verification`)
- Hospital and doctor credential verification queue with medical license verification flags.
- Immutable security audit log viewer (User, IP, Action, Timestamp, Resource ID, Result).

---

## 3. Running the Complete Application Locally

### Quick Launch Scripts:
- **Backend (Spring Boot + H2/PostgreSQL + Tesseract)**:
  ```powershell
  .\start-backend.bat
  ```
  Runs on `http://localhost:8080`. API documentation & Swagger/H2 console at `http://localhost:8080/h2-console`.

- **Frontend (React + Vite + Tailwind CSS)**:
  ```powershell
  .\start-frontend.bat
  ```
  Runs on `http://localhost:5173`.

### Demo User Accounts:
| Role | Username | Password |
|---|---|---|
| **Patient** | `john_patient` | `Password123!` |
| **Healthcare Provider** | `dr_sarah_chen` | `Password123!` |
| **Administrator** | `system_admin` | `Password123!` |
