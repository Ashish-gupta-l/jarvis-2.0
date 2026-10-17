package com.caretrail.dto;

public class RevokeRequest {
    private String reason;

    public RevokeRequest() {}
    public RevokeRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
