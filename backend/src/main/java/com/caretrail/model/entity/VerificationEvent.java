package com.caretrail.model.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "verification_events")
public class VerificationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_request_id")
    private VerificationRequest verificationRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "actor_user_id")
    private User actorUser;

    @Column(name = "previous_status", length = 60)
    private String previousStatus;

    @Column(name = "new_status", nullable = false, length = 60)
    private String newStatus;

    @Column(name = "method_used", nullable = false, length = 80)
    private String methodUsed;

    @Column(name = "evidence_details", nullable = false, columnDefinition = "TEXT")
    private String evidenceDetails;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public VerificationEvent() {}

    public VerificationEvent(MedicalRecord record, User actorUser, String previousStatus, String newStatus, String methodUsed, String evidenceDetails) {
        this.record = record;
        this.actorUser = actorUser;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.methodUsed = methodUsed;
        this.evidenceDetails = evidenceDetails;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalRecord getRecord() { return record; }
    public void setRecord(MedicalRecord record) { this.record = record; }

    public VerificationRequest getVerificationRequest() { return verificationRequest; }
    public void setVerificationRequest(VerificationRequest verificationRequest) { this.verificationRequest = verificationRequest; }

    public User getActorUser() { return actorUser; }
    public void setActorUser(User actorUser) { this.actorUser = actorUser; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getMethodUsed() { return methodUsed; }
    public void setMethodUsed(String methodUsed) { this.methodUsed = methodUsed; }

    public String getEvidenceDetails() { return evidenceDetails; }
    public void setEvidenceDetails(String evidenceDetails) { this.evidenceDetails = evidenceDetails; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
