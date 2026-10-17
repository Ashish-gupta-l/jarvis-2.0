package com.caretrail.model.enums;

public enum ShareScope {
    SELECTED_RECORD("Selected Record Only"),
    FULL_TIMELINE("Unified Medical Timeline"),
    CONTINUITY_BRIEF_ONLY("Continuity Brief Only");

    private final String displayName;

    ShareScope(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
