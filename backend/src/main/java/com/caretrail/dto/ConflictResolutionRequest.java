package com.caretrail.dto;

import jakarta.validation.constraints.NotBlank;

public class ConflictResolutionRequest {

    @NotBlank
    private String resolutionNotes;

    public ConflictResolutionRequest() {}

    public ConflictResolutionRequest(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
