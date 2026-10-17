package com.caretrail.model.entity;

import com.caretrail.model.enums.ShareScope;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sharing_permissions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SharingPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id", nullable = false)
    private HealthcareProvider provider;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id")
    private MedicalRecord record;

    @Enumerated(EnumType.STRING)
    @Column(name = "share_scope", nullable = false, length = 50)
    private ShareScope shareScope = ShareScope.SELECTED_RECORD;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "revocation_reason")
    private String revocationReason;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public SharingPermission() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public HealthcareProvider getProvider() { return provider; }
    public void setProvider(HealthcareProvider provider) { this.provider = provider; }

    public MedicalRecord getRecord() { return record; }
    public void setRecord(MedicalRecord record) { this.record = record; }

    public ShareScope getShareScope() { return shareScope; }
    public void setShareScope(ShareScope shareScope) { this.shareScope = shareScope; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }

    public String getRevocationReason() { return revocationReason; }
    public void setRevocationReason(String revocationReason) { this.revocationReason = revocationReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isCurrentlyValid() {
        return Boolean.TRUE.equals(isActive) 
                && (revokedAt == null) 
                && (expiresAt != null && expiresAt.isAfter(Instant.now()));
    }
}
