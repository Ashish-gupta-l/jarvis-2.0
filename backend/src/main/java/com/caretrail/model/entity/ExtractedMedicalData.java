package com.caretrail.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "extracted_medical_data")
public class ExtractedMedicalData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false, unique = true)
    private MedicalRecord record;

    @Column(name = "raw_extracted_text", columnDefinition = "TEXT")
    private String rawExtractedText;

    @Column(name = "extracted_date")
    private LocalDate extractedDate;

    @Column(name = "extracted_provider_name", length = 200)
    private String extractedProviderName;

    @Column(name = "extracted_facility_name", length = 200)
    private String extractedFacilityName;

    @Column(name = "extracted_document_type", length = 100)
    private String extractedDocumentType;

    @Column(name = "extracted_diagnoses", columnDefinition = "TEXT")
    private String extractedDiagnoses;

    @Column(name = "extracted_medications", columnDefinition = "TEXT")
    private String extractedMedications;

    @Column(name = "extracted_lab_values", columnDefinition = "TEXT")
    private String extractedLabValues;

    @Column(name = "user_corrected_data", columnDefinition = "TEXT")
    private String userCorrectedData;

    @Column(name = "is_reviewed_by_patient")
    private Boolean isReviewedByPatient = false;

    @Column(name = "ocr_confidence_score")
    private Double ocrConfidenceScore = 0.90;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public ExtractedMedicalData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalRecord getRecord() { return record; }
    public void setRecord(MedicalRecord record) { this.record = record; }

    public String getRawExtractedText() { return rawExtractedText; }
    public void setRawExtractedText(String rawExtractedText) { this.rawExtractedText = rawExtractedText; }

    public LocalDate getExtractedDate() { return extractedDate; }
    public void setExtractedDate(LocalDate extractedDate) { this.extractedDate = extractedDate; }

    public String getExtractedProviderName() { return extractedProviderName; }
    public void setExtractedProviderName(String extractedProviderName) { this.extractedProviderName = extractedProviderName; }

    public String getExtractedFacilityName() { return extractedFacilityName; }
    public void setExtractedFacilityName(String extractedFacilityName) { this.extractedFacilityName = extractedFacilityName; }

    public String getExtractedDocumentType() { return extractedDocumentType; }
    public void setExtractedDocumentType(String extractedDocumentType) { this.extractedDocumentType = extractedDocumentType; }

    public String getExtractedDiagnoses() { return extractedDiagnoses; }
    public void setExtractedDiagnoses(String extractedDiagnoses) { this.extractedDiagnoses = extractedDiagnoses; }

    public String getExtractedMedications() { return extractedMedications; }
    public void setExtractedMedications(String extractedMedications) { this.extractedMedications = extractedMedications; }

    public String getExtractedLabValues() { return extractedLabValues; }
    public void setExtractedLabValues(String extractedLabValues) { this.extractedLabValues = extractedLabValues; }

    public String getUserCorrectedData() { return userCorrectedData; }
    public void setUserCorrectedData(String userCorrectedData) { this.userCorrectedData = userCorrectedData; }

    public Boolean getIsReviewedByPatient() { return isReviewedByPatient; }
    public void setIsReviewedByPatient(Boolean isReviewedByPatient) { this.isReviewedByPatient = isReviewedByPatient; }

    public Double getOcrConfidenceScore() { return ocrConfidenceScore; }
    public void setOcrConfidenceScore(Double ocrConfidenceScore) { this.ocrConfidenceScore = ocrConfidenceScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
