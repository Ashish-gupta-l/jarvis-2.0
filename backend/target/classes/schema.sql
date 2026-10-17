-- ============================================================================
-- CareTrail: Intelligent Healthcare Continuity Platform
-- Complete PostgreSQL Relational Database Schema
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ROLE_PATIENT, ROLE_PROVIDER, ROLE_ADMIN
    phone_number VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    national_health_id VARCHAR(100) UNIQUE,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    known_allergies TEXT,
    chronic_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Healthcare Providers
CREATE TABLE IF NOT EXISTS healthcare_providers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    license_number VARCHAR(100) UNIQUE NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    specialization VARCHAR(150),
    contact_email VARCHAR(150),
    office_address TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Provider Credentials
CREATE TABLE IF NOT EXISTS provider_credentials (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    credential_type VARCHAR(100) NOT NULL, -- MEDICAL_COUNCIL_REGISTRATION, HOSPITAL_AFFILIATION, BOARD_CERTIFICATION
    issuer_authority VARCHAR(200) NOT NULL,
    document_ref VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    verification_evidence TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_by_user_id BIGINT NOT NULL REFERENCES users(id),
    provider_id BIGINT REFERENCES healthcare_providers(id),
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- CONSULTATION, PRESCRIPTION, LAB_REPORT, DISCHARGE_SUMMARY, IMAGING, OTHER
    record_date DATE NOT NULL,
    issuing_facility VARCHAR(200),
    attending_physician VARCHAR(150),
    verification_status VARCHAR(60) NOT NULL DEFAULT 'PATIENT_UPLOADED_UNVERIFIED',
    notes TEXT,
    is_flagged_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of_record_id BIGINT REFERENCES medical_records(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Document Metadata (Physical File integrity & storage)
CREATE TABLE IF NOT EXISTS document_metadata (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT UNIQUE NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    has_digital_signature BOOLEAN DEFAULT FALSE,
    signature_issuer VARCHAR(255),
    qr_code_payload TEXT,
    encryption_status VARCHAR(50) DEFAULT 'STORED_ENCRYPTED_AT_REST',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Extracted Medical Data (OCR extraction & user corrections)
CREATE TABLE IF NOT EXISTS extracted_medical_data (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT UNIQUE NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    raw_extracted_text TEXT,
    extracted_date DATE,
    extracted_provider_name VARCHAR(200),
    extracted_facility_name VARCHAR(200),
    extracted_document_type VARCHAR(100),
    extracted_diagnoses TEXT, -- Comma or JSON formatted strings
    extracted_medications TEXT,
    extracted_lab_values TEXT,
    user_corrected_data TEXT, -- JSON structure storing patient/provider corrections
    is_reviewed_by_patient BOOLEAN DEFAULT FALSE,
    ocr_confidence_score DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Verification Requests
CREATE TABLE IF NOT EXISTS verification_requests (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    requested_by_user_id BIGINT NOT NULL REFERENCES users(id),
    target_provider_id BIGINT REFERENCES healthcare_providers(id),
    target_facility_name VARCHAR(200),
    request_type VARCHAR(60) NOT NULL, -- ISSUER_CONFIRMATION, SIGNATURE_CHECK, QR_VALIDATION, MANUAL_REVIEW
    request_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, CONFIRMED, DISPUTED, UNABLE_TO_VERIFY
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Verification Events (Transparent Trust Layer Evidence Log)
CREATE TABLE IF NOT EXISTS verification_events (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    verification_request_id BIGINT REFERENCES verification_requests(id),
    actor_user_id BIGINT REFERENCES users(id),
    previous_status VARCHAR(60),
    new_status VARCHAR(60) NOT NULL,
    method_used VARCHAR(80) NOT NULL, -- ISSUER_CONFIRMATION, CRYPTOGRAPHIC_SIGNATURE, QR_CODE_LOOKUP, MANUAL_INSTITUTION_AUDIT
    evidence_details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Record Conflicts (Discrepancy and conflict tracking)
CREATE TABLE IF NOT EXISTS record_conflicts (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_id_1 BIGINT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    record_id_2 BIGINT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    conflict_type VARCHAR(60) NOT NULL, -- CONFLICTING_DATES, DUPLICATE_REPORT, MISMATCHED_PATIENT_ID, CONFLICTING_MEDICATION, INCONSISTENT_DIAGNOSIS
    description TEXT NOT NULL,
    conflicting_value_1 TEXT NOT NULL,
    conflicting_value_2 TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    resolved_by_user_id BIGINT REFERENCES users(id),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 11. Follow-up Tasks (Continuity tracker)
CREATE TABLE IF NOT EXISTS follow_up_tasks (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_record_id BIGINT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, UNCONFIRMED
    evidence_record_id BIGINT REFERENCES medical_records(id),
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Sharing Permissions (Consent-based granular access control)
CREATE TABLE IF NOT EXISTS sharing_permissions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id BIGINT NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    record_id BIGINT REFERENCES medical_records(id) ON DELETE CASCADE, -- NULL means entire Continuity Brief / All records
    share_scope VARCHAR(50) NOT NULL DEFAULT 'SELECTED_RECORD', -- SELECTED_RECORD, FULL_TIMELINE, CONTINUITY_BRIEF_ONLY
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Access Audit Logs (Immutable security ledger)
CREATE TABLE IF NOT EXISTS access_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    patient_id BIGINT REFERENCES users(id),
    record_id BIGINT REFERENCES medical_records(id),
    action VARCHAR(80) NOT NULL, -- RECORD_VIEW, DOCUMENT_DOWNLOAD, RECORD_UPLOAD, RECORD_SHARE, ACCESS_REVOKED, VERIFICATION_ATTEMPT, LOGIN_SUCCESS
    ip_address VARCHAR(60),
    user_agent TEXT,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(record_date);
CREATE INDEX IF NOT EXISTS idx_doc_metadata_hash ON document_metadata(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_sharing_patient_provider ON sharing_permissions(patient_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_audit_patient ON access_audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON access_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_conflicts_patient ON record_conflicts(patient_id);
