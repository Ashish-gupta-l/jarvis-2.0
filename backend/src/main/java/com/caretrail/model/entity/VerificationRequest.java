package com.caretrail.model.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "verification_requests")
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord record;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_provider_id")
    private HealthcareProvider targetProvider;

    @Column(name = "target_facility_name", length = 200)
    private String targetFacilityName;

    @Column(name = "request_type", nullable = false, length = 60)
    private String requestType; // ISSUER_CONFIRMATION, SIGNATURE_CHECK, QR_VALIDATION, MANUAL_REVIEW

    @Column(name = "request_status", length = 50)
    private String requestStatus = "PENDING"; // PENDING, IN_PROGRESS, CONFIRMED, DISPUTED, UNABLE_TO_VERIFY

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public VerificationRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalRecord getRecord() { return record; }
    public void setRecord(MedicalRecord record) { this.record = record; }

    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }

    public HealthcareProvider getTargetProvider() { return targetProvider; }
    public void setTargetProvider(HealthcareProvider targetProvider) { this.targetProvider = targetProvider; }

    public String getTargetFacilityName() { return targetFacilityName; }
    public void setTargetFacilityName(String targetFacilityName) { this.targetFacilityName = targetFacilityName; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getRequestStatus() { return requestStatus; }
    public void setRequestStatus(String requestStatus) { this.requestStatus = requestStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
