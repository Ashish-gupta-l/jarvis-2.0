package com.caretrail.model.enums;

public enum ConflictType {
    CONFLICTING_DATES("Conflicting Record Dates"),
    DUPLICATE_REPORT("Suspected Duplicate Report"),
    MISMATCHED_PATIENT_ID("Mismatched Patient Identifier"),
    CONFLICTING_MEDICATION("Conflicting Medication Regimen"),
    INCONSISTENT_DIAGNOSIS("Inconsistent Diagnosis or Clinical Information");

    private final String displayName;

    ConflictType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
