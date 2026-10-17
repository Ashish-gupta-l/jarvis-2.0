package com.caretrail.model.entity;

import com.caretrail.model.enums.ConflictType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "record_conflicts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RecordConflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id_1", nullable = false)
    private MedicalRecord record1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "record_id_2", nullable = false)
    private MedicalRecord record2;

    @Enumerated(EnumType.STRING)
    @Column(name = "conflict_type", nullable = false, length = 60)
    private ConflictType conflictType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "conflicting_value_1", nullable = false, columnDefinition = "TEXT")
    private String conflictingValue1;

    @Column(name = "conflicting_value_2", nullable = false, columnDefinition = "TEXT")
    private String conflictingValue2;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_user_id")
    private User resolvedByUser;

    @Column(name = "detected_at", updatable = false)
    private Instant detectedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public RecordConflict() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public MedicalRecord getRecord1() { return record1; }
    public void setRecord1(MedicalRecord record1) { this.record1 = record1; }

    public MedicalRecord getRecord2() { return record2; }
    public void setRecord2(MedicalRecord record2) { this.record2 = record2; }

    public ConflictType getConflictType() { return conflictType; }
    public void setConflictType(ConflictType conflictType) { this.conflictType = conflictType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getConflictingValue1() { return conflictingValue1; }
    public void setConflictingValue1(String conflictingValue1) { this.conflictingValue1 = conflictingValue1; }

    public String getConflictingValue2() { return conflictingValue2; }
    public void setConflictingValue2(String conflictingValue2) { this.conflictingValue2 = conflictingValue2; }

    public Boolean getIsResolved() { return isResolved; }
    public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public User getResolvedByUser() { return resolvedByUser; }
    public void setResolvedByUser(User resolvedByUser) { this.resolvedByUser = resolvedByUser; }

    public Instant getDetectedAt() { return detectedAt; }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
