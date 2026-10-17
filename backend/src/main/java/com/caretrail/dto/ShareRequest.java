package com.caretrail.dto;

import com.caretrail.model.enums.ShareScope;
import jakarta.validation.constraints.NotNull;

public class ShareRequest {

    @NotNull
    private Long providerId;

    private Long recordId; // Optional: null if FULL_TIMELINE or CONTINUITY_BRIEF_ONLY

    @NotNull
    private ShareScope shareScope;

    private Integer durationHours = 72; // default 3 days (72 hours)

    public ShareRequest() {}

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public ShareScope getShareScope() { return shareScope; }
    public void setShareScope(ShareScope shareScope) { this.shareScope = shareScope; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }
}
