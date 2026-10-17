package com.caretrail.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "provider_credentials")
public class ProviderCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private HealthcareProvider provider;

    @Column(name = "credential_type", nullable = false, length = 100)
    private String credentialType;

    @Column(name = "issuer_authority", nullable = false, length = 200)
    private String issuerAuthority;

    @Column(name = "document_ref")
    private String documentRef;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "verification_evidence", columnDefinition = "TEXT")
    private String verificationEvidence;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public ProviderCredential() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public HealthcareProvider getProvider() { return provider; }
    public void setProvider(HealthcareProvider provider) { this.provider = provider; }

    public String getCredentialType() { return credentialType; }
    public void setCredentialType(String credentialType) { this.credentialType = credentialType; }

    public String getIssuerAuthority() { return issuerAuthority; }
    public void setIssuerAuthority(String issuerAuthority) { this.issuerAuthority = issuerAuthority; }

    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String documentRef) { this.documentRef = documentRef; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getVerificationEvidence() { return verificationEvidence; }
    public void setVerificationEvidence(String verificationEvidence) { this.verificationEvidence = verificationEvidence; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
