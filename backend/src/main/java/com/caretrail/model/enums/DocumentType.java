package com.caretrail.model.enums;

public enum DocumentType {
    CONSULTATION("Consultation Record"),
    PRESCRIPTION("Prescription"),
    LAB_REPORT("Laboratory Report"),
    DISCHARGE_SUMMARY("Discharge Summary"),
    IMAGING("Medical Imaging / Radiology"),
    OTHER("Other Medical Certificate");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
