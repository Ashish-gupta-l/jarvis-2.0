package com.caretrail.model.enums;

public enum AuditEventType {
    LOGIN_SUCCESS("User logged in successfully"),
    RECORD_VIEW("Medical record metadata viewed"),
    DOCUMENT_DOWNLOAD("Original medical document accessed/viewed"),
    RECORD_UPLOAD("New medical record uploaded"),
    RECORD_SHARE("Record sharing permission granted"),
    ACCESS_REVOKED("Record sharing permission revoked"),
    VERIFICATION_UPDATE("Document verification status changed"),
    CORRECTION_SUBMITTED("Extracted OCR field correction recorded"),
    PROVIDER_ONBOARDING("Provider onboarding status updated");

    private final String description;

    AuditEventType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
