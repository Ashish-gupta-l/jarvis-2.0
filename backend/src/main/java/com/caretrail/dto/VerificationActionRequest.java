package com.caretrail.dto;

import com.caretrail.model.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class VerificationActionRequest {

    @NotNull
    private VerificationStatus targetStatus;

    @NotNull
    private String methodUsed; // ISSUER_CONFIRMATION, DIGITAL_SIGNATURE, QR_CODE_LOOKUP, MANUAL_INSTITUTION_AUDIT

    @NotNull
    private String evidenceDetails;

    private String notes;

    public VerificationActionRequest() {}

    public VerificationStatus getTargetStatus() { return targetStatus; }
    public void setTargetStatus(VerificationStatus targetStatus) { this.targetStatus = targetStatus; }

    public String getMethodUsed() { return methodUsed; }
    public void setMethodUsed(String methodUsed) { this.methodUsed = methodUsed; }

    public String getEvidenceDetails() { return evidenceDetails; }
    public void setEvidenceDetails(String evidenceDetails) { this.evidenceDetails = evidenceDetails; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
