package com.caretrail.model.enums;

public enum VerificationStatus {
    PATIENT_UPLOADED_UNVERIFIED("Patient-uploaded — not yet verified"),
    ISSUER_CONFIRMED("Issuer-confirmed"),
    DIGITALLY_SIGNED_VALIDATED("Digitally signed — signature validated"),
    VERIFICATION_PENDING("Verification pending"),
    DISCREPANCY_FOUND("Discrepancy found"),
    UNABLE_TO_VERIFY("Unable to verify");

    private final String displayName;

    VerificationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
