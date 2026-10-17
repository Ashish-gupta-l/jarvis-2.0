package com.caretrail.model.enums;

public enum FollowUpStatus {
    PENDING("Follow-up Pending"),
    COMPLETED("Confirmed Completed"),
    UNCONFIRMED("Unconfirmed - Evidence Missing");

    private final String displayName;

    FollowUpStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
