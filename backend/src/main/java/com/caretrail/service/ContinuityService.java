package com.caretrail.service;

import com.caretrail.dto.ContinuityBriefDto;
import com.caretrail.dto.ContinuityBriefDto.SourceLinkedClaim;
import com.caretrail.dto.GapMapDto;
import com.caretrail.dto.GapMapDto.GapItem;
import com.caretrail.model.entity.*;
import com.caretrail.model.enums.DocumentType;
import com.caretrail.model.enums.FollowUpStatus;
import com.caretrail.model.enums.VerificationStatus;
import com.caretrail.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Instant;
import java.util.*;

@Service
public class ContinuityService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final RecordConflictRepository recordConflictRepository;
    private final PatientProfileRepository patientProfileRepository;

    public ContinuityService(MedicalRecordRepository medicalRecordRepository,
                             FollowUpTaskRepository followUpTaskRepository,
                             RecordConflictRepository recordConflictRepository,
                             PatientProfileRepository patientProfileRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.followUpTaskRepository = followUpTaskRepository;
        this.recordConflictRepository = recordConflictRepository;
        this.patientProfileRepository = patientProfileRepository;
    }

    public GapMapDto generateContinuityGapMap(Long patientId) {
        GapMapDto gapMap = new GapMapDto();
        gapMap.setPatientId(patientId);

        List<GapItem> missingDocs = new ArrayList<>();
        List<MedicalRecord> allRecords = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
        List<RecordConflict> conflicts = recordConflictRepository.findByPatientIdAndIsResolvedFalse(patientId);
        List<FollowUpTask> followUps = followUpTaskRepository.findByPatientIdOrderByDueDateAsc(patientId);

        List<MedicalRecord> unverifiedList = new ArrayList<>();
        List<MedicalRecord> pendingReviewList = new ArrayList<>();
        List<FollowUpTask> unconfirmedFollowUps = new ArrayList<>();

        boolean hasDischargeSummary = false;
        boolean hasPostDischargeLab = false;
        LocalDate dischargeDate = null;

        for (MedicalRecord rec : allRecords) {
            // Check verification status
            if (rec.getVerificationStatus() == VerificationStatus.PATIENT_UPLOADED_UNVERIFIED
                    || rec.getVerificationStatus() == VerificationStatus.UNABLE_TO_VERIFY) {
                unverifiedList.add(rec);
            }

            // Check if patient review is pending
            if (rec.getExtractedMedicalData() != null && !Boolean.TRUE.equals(rec.getExtractedMedicalData().getIsReviewedByPatient())) {
                pendingReviewList.add(rec);
            }

            if (rec.getDocumentType() == DocumentType.DISCHARGE_SUMMARY) {
                hasDischargeSummary = true;
                if (dischargeDate == null || rec.getRecordDate().isAfter(dischargeDate)) {
                    dischargeDate = rec.getRecordDate();
                }
            }

            if (rec.getDocumentType() == DocumentType.LAB_REPORT && dischargeDate != null && rec.getRecordDate().isAfter(dischargeDate)) {
                hasPostDischargeLab = true;
            }
        }

        // Identify Missing Supporting Documents
        if (hasDischargeSummary && !hasPostDischargeLab) {
            missingDocs.add(new GapItem(
                    "MISSING_SUPPORTING_DOCUMENT",
                    "MEDIUM",
                    "Post-Discharge Confirmatory Laboratory Tests",
                    "Patient has a hospital discharge summary on " + dischargeDate + ", but no subsequent confirmatory lab panel or investigations have been registered in the platform.",
                    null
            ));
        }

        // Identify Follow-up tasks without documented completion evidence
        for (FollowUpTask task : followUps) {
            if (task.getStatus() != FollowUpStatus.COMPLETED) {
                unconfirmedFollowUps.add(task);
            }
        }

        gapMap.setMissingSupportingDocs(missingDocs);
        gapMap.setConflictingInformation(conflicts);
        gapMap.setUnverifiedRecords(unverifiedList);
        gapMap.setUnconfirmedFollowUps(unconfirmedFollowUps);
        gapMap.setPendingReviewRecords(pendingReviewList);

        int total = missingDocs.size() + conflicts.size() + unverifiedList.size() + unconfirmedFollowUps.size() + pendingReviewList.size();
        gapMap.setTotalGapsCount(total);

        return gapMap;
    }

    public ContinuityBriefDto generateContinuityBrief(Long patientId) {
        ContinuityBriefDto brief = new ContinuityBriefDto();
        brief.setPatientId(patientId);

        Optional<PatientProfile> profileOpt = patientProfileRepository.findByUserId(patientId);
        if (profileOpt.isPresent()) {
            PatientProfile profile = profileOpt.get();
            brief.setPatientName(profile.getUser().getFullName());
            brief.setNationalHealthId(profile.getNationalHealthId());
            brief.setBloodGroup(profile.getBloodGroup() != null ? profile.getBloodGroup() : "Unknown");
            brief.setAllergies(profile.getKnownAllergies() != null ? profile.getKnownAllergies() : "None reported");
            brief.setChronicConditions(profile.getChronicConditions() != null ? profile.getChronicConditions() : "None reported");
        }

        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
        List<SourceLinkedClaim> diagnoses = new ArrayList<>();
        List<SourceLinkedClaim> prescriptions = new ArrayList<>();
        List<SourceLinkedClaim> investigations = new ArrayList<>();
        List<SourceLinkedClaim> dischargeSummaries = new ArrayList<>();
        List<String> limitations = new ArrayList<>();

        int unverifiedCount = 0;

        for (MedicalRecord rec : records) {
            boolean isUnverified = rec.getVerificationStatus() == VerificationStatus.PATIENT_UPLOADED_UNVERIFIED
                    || rec.getVerificationStatus() == VerificationStatus.UNABLE_TO_VERIFY;
            if (isUnverified) unverifiedCount++;

            if (rec.getExtractedMedicalData() != null) {
                ExtractedMedicalData ext = rec.getExtractedMedicalData();

                // Diagnoses
                if (ext.getExtractedDiagnoses() != null && !ext.getExtractedDiagnoses().isBlank()) {
                    String[] diagList = ext.getExtractedDiagnoses().split(";");
                    for (String d : diagList) {
                        diagnoses.add(new SourceLinkedClaim(
                                "DIAGNOSIS",
                                d.trim(),
                                rec.getId(),
                                rec.getTitle(),
                                rec.getRecordDate(),
                                rec.getIssuingFacility(),
                                rec.getVerificationStatus().getDisplayName(),
                                isUnverified
                        ));
                    }
                }

                // Prescriptions
                if (rec.getDocumentType() == DocumentType.PRESCRIPTION && ext.getExtractedMedications() != null) {
                    String[] medList = ext.getExtractedMedications().split(";");
                    for (String m : medList) {
                        prescriptions.add(new SourceLinkedClaim(
                                "MEDICATION",
                                m.trim(),
                                rec.getId(),
                                rec.getTitle(),
                                rec.getRecordDate(),
                                rec.getIssuingFacility(),
                                rec.getVerificationStatus().getDisplayName(),
                                isUnverified
                        ));
                    }
                }

                // Investigations
                if (rec.getDocumentType() == DocumentType.LAB_REPORT || rec.getDocumentType() == DocumentType.IMAGING) {
                    investigations.add(new SourceLinkedClaim(
                            "INVESTIGATION",
                            ext.getExtractedLabValues() != null ? ext.getExtractedLabValues() : rec.getTitle(),
                            rec.getId(),
                            rec.getTitle(),
                            rec.getRecordDate(),
                            rec.getIssuingFacility(),
                            rec.getVerificationStatus().getDisplayName(),
                            isUnverified
                    ));
                }

                // Discharge Summary
                if (rec.getDocumentType() == DocumentType.DISCHARGE_SUMMARY) {
                    dischargeSummaries.add(new SourceLinkedClaim(
                            "DISCHARGE_NOTE",
                            rec.getNotes() != null ? rec.getNotes() : "Inpatient discharge summary recorded.",
                            rec.getId(),
                            rec.getTitle(),
                            rec.getRecordDate(),
                            rec.getIssuingFacility(),
                            rec.getVerificationStatus().getDisplayName(),
                            isUnverified
                    ));
                }
            }
        }

        // Verification limitations statement
        if (unverifiedCount > 0) {
            limitations.add("Notice: " + unverifiedCount + " record(s) are patient-uploaded and have not been independently confirmed by the issuing institution.");
        }
        limitations.add("A valid signature or OCR parse proves document integrity only within the scope of verification; it does not substitute for attending clinician evaluation.");
        limitations.add("Absence of a record does not guarantee absence of prior illness or undocumented outpatient procedures.");

        brief.setDiagnoses(diagnoses);
        brief.setActivePrescriptions(prescriptions);
        brief.setRecentInvestigations(investigations);
        brief.setDischargeSummaries(dischargeSummaries);
        brief.setUnresolvedConflicts(recordConflictRepository.findByPatientIdAndIsResolvedFalse(patientId));
        brief.setFollowUpTasks(followUpTaskRepository.findByPatientIdOrderByDueDateAsc(patientId));
        brief.setVerificationLimitations(limitations);

        return brief;
    }

    public List<FollowUpTask> getFollowUpsForPatient(Long patientId) {
        return followUpTaskRepository.findByPatientIdOrderByDueDateAsc(patientId);
    }

    @Transactional
    public FollowUpTask updateFollowUpStatus(Long taskId, FollowUpStatus newStatus, Long evidenceRecordId, String notes) {
        FollowUpTask task = followUpTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Follow-up task #" + taskId + " not found"));

        task.setStatus(newStatus);
        if (evidenceRecordId != null) {
            medicalRecordRepository.findById(evidenceRecordId).ifPresent(task::setEvidenceRecord);
        }
        if (notes != null && !notes.isBlank()) {
            task.setCompletionNotes(notes);
        }
        task.setUpdatedAt(Instant.now());
        return followUpTaskRepository.save(task);
    }

    @Transactional
    public FollowUpTask createFollowUpTask(Long patientId, Long sourceRecordId, String description, LocalDate dueDate) {
        MedicalRecord record = medicalRecordRepository.findById(sourceRecordId)
                .orElseThrow(() -> new IllegalArgumentException("Source record not found"));

        FollowUpTask task = new FollowUpTask();
        task.setPatient(record.getPatient());
        task.setSourceRecord(record);
        task.setTaskDescription(description);
        task.setDueDate(dueDate != null ? dueDate : LocalDate.now().plusWeeks(2));
        task.setStatus(FollowUpStatus.PENDING);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
        return followUpTaskRepository.save(task);
    }
}
