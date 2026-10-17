package com.caretrail.model.entity;

import com.caretrail.model.enums.DocumentType;
import com.caretrail.model.enums.VerificationStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "medical_records")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by_user_id", nullable = false)
    private User uploadedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id")
    private HealthcareProvider provider;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType documentType;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "issuing_facility", length = 200)
    private String issuingFacility;

    @Column(name = "attending_physician", length = 150)
    private String attendingPhysician;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 60)
    private VerificationStatus verificationStatus = VerificationStatus.PATIENT_UPLOADED_UNVERIFIED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_flagged_duplicate")
    private Boolean isFlaggedDuplicate = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duplicate_of_record_id")
    private MedicalRecord duplicateOfRecord;

    @OneToOne(mappedBy = "record", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private DocumentMetadata documentMetadata;

    @OneToOne(mappedBy = "record", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private ExtractedMedicalData extractedMedicalData;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public MedicalRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public HealthcareProvider getProvider() { return provider; }
    public void setProvider(HealthcareProvider provider) { this.provider = provider; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public String getIssuingFacility() { return issuingFacility; }
    public void setIssuingFacility(String issuingFacility) { this.issuingFacility = issuingFacility; }

    public String getAttendingPhysician() { return attendingPhysician; }
    public void setAttendingPhysician(String attendingPhysician) { this.attendingPhysician = attendingPhysician; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getIsFlaggedDuplicate() { return isFlaggedDuplicate; }
    public void setIsFlaggedDuplicate(Boolean isFlaggedDuplicate) { this.isFlaggedDuplicate = isFlaggedDuplicate; }

    public MedicalRecord getDuplicateOfRecord() { return duplicateOfRecord; }
    public void setDuplicateOfRecord(MedicalRecord duplicateOfRecord) { this.duplicateOfRecord = duplicateOfRecord; }

    public DocumentMetadata getDocumentMetadata() { return documentMetadata; }
    public void setDocumentMetadata(DocumentMetadata documentMetadata) { this.documentMetadata = documentMetadata; }

    public ExtractedMedicalData getExtractedMedicalData() { return extractedMedicalData; }
    public void setExtractedMedicalData(ExtractedMedicalData extractedMedicalData) { this.extractedMedicalData = extractedMedicalData; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
