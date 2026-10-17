package com.caretrail.service;

import com.caretrail.model.entity.*;
import com.caretrail.model.enums.ConflictType;
import com.caretrail.repository.MedicalRecordRepository;
import com.caretrail.repository.PatientProfileRepository;
import com.caretrail.repository.RecordConflictRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Instant;
import java.util.*;

@Service
public class ConflictDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(ConflictDetectionService.class);

    private final RecordConflictRepository conflictRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientProfileRepository patientProfileRepository;

    public ConflictDetectionService(RecordConflictRepository conflictRepository,
                                   MedicalRecordRepository medicalRecordRepository,
                                   PatientProfileRepository patientProfileRepository) {
        this.conflictRepository = conflictRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientProfileRepository = patientProfileRepository;
    }

    public List<RecordConflict> getConflictsForPatient(Long patientId) {
        return conflictRepository.findByPatientIdOrderByDetectedAtDesc(patientId);
    }

    public List<RecordConflict> getUnresolvedConflictsForPatient(Long patientId) {
        return conflictRepository.findByPatientIdAndIsResolvedFalse(patientId);
    }

    @Transactional
    public void scanForConflicts(MedicalRecord newRecord) {
        User patient = newRecord.getPatient();
        List<MedicalRecord> allPatientRecords = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patient.getId());
        Optional<PatientProfile> profileOpt = patientProfileRepository.findByUser(patient);

        // 1. Check for Future Date Anomaly
        if (newRecord.getRecordDate().isAfter(LocalDate.now())) {
            createConflictIfNotExists(
                    patient,
                    newRecord,
                    newRecord,
                    ConflictType.CONFLICTING_DATES,
                    "Temporal Anomaly: Record date (" + newRecord.getRecordDate() + ") is set in the future.",
                    "Record Date: " + newRecord.getRecordDate(),
                    "System Current Date: " + LocalDate.now()
            );
        }

        // Compare against all existing historical records of this patient
        for (MedicalRecord historical : allPatientRecords) {
            if (historical.getId().equals(newRecord.getId())) continue;

            // 2. Check for Duplicate Reports
            if (Boolean.TRUE.equals(newRecord.getIsFlaggedDuplicate()) &&
                    newRecord.getDuplicateOfRecord() != null &&
                    newRecord.getDuplicateOfRecord().getId().equals(historical.getId())) {
                createConflictIfNotExists(
                        patient,
                        historical,
                        newRecord,
                        ConflictType.DUPLICATE_REPORT,
                        "Suspected Duplicate Record Detected by cryptographic hash or identical clinical date & facility.",
                        "Existing Record #" + historical.getId() + " (" + historical.getTitle() + ", " + historical.getRecordDate() + ")",
                        "New Record #" + newRecord.getId() + " (" + newRecord.getTitle() + ", " + newRecord.getRecordDate() + ")"
                );
            }

            // 3. Check for Conflicting Medications
            checkMedicationConflicts(patient, historical, newRecord);

            // 4. Check for Inconsistent Clinical Diagnoses / Information
            checkDiagnosisConflicts(patient, historical, newRecord);

            // 5. Check for Mismatched Patient Identifiers in OCR text vs Profile
            if (profileOpt.isPresent() && newRecord.getExtractedMedicalData() != null) {
                checkPatientIdentifierMismatch(patient, profileOpt.get(), newRecord);
            }
        }
    }

    private void checkMedicationConflicts(User patient, MedicalRecord rec1, MedicalRecord rec2) {
        if (rec1.getExtractedMedicalData() == null || rec2.getExtractedMedicalData() == null) return;

        String meds1 = rec1.getExtractedMedicalData().getExtractedMedications();
        String meds2 = rec2.getExtractedMedicalData().getExtractedMedications();

        if (meds1 == null || meds2 == null) return;

        // Check for concurrent anticoagulant prescriptions (Warfarin vs Apixaban)
        boolean hasWarfarin = meds1.contains("Warfarin") || meds2.contains("Warfarin");
        boolean hasApixaban = meds1.contains("Apixaban") || meds2.contains("Apixaban");
        if (hasWarfarin && hasApixaban && !meds1.equalsIgnoreCase(meds2)) {
            createConflictIfNotExists(
                    patient,
                    rec1,
                    rec2,
                    ConflictType.CONFLICTING_MEDICATION,
                    "Conflicting Anticoagulation Therapy: Concurrent prescriptions of Warfarin and Apixaban detected across institutions without documented bridging.",
                    "Record #" + rec1.getId() + " (" + rec1.getIssuingFacility() + "): " + meds1,
                    "Record #" + rec2.getId() + " (" + rec2.getIssuingFacility() + "): " + meds2
            );
        }

        // Check for conflicting Metformin dosage across consecutive records
        if (meds1.contains("Metformin") && meds2.contains("Metformin")) {
            String m1Dose = extractDosageString(meds1, "Metformin");
            String m2Dose = extractDosageString(meds2, "Metformin");
            if (!m1Dose.isEmpty() && !m2Dose.isEmpty() && !m1Dose.equalsIgnoreCase(m2Dose)) {
                createConflictIfNotExists(
                        patient,
                        rec1,
                        rec2,
                        ConflictType.CONFLICTING_MEDICATION,
                        "Discrepancy in Metformin dosage between providers without documented titration order.",
                        "Record #" + rec1.getId() + " specifies: " + m1Dose,
                        "Record #" + rec2.getId() + " specifies: " + m2Dose
                );
            }
        }
    }

    private void checkDiagnosisConflicts(User patient, MedicalRecord rec1, MedicalRecord rec2) {
        if (rec1.getExtractedMedicalData() == null || rec2.getExtractedMedicalData() == null) return;

        String diag1 = rec1.getExtractedMedicalData().getExtractedDiagnoses();
        String diag2 = rec2.getExtractedMedicalData().getExtractedDiagnoses();

        if (diag1 == null || diag2 == null) return;

        // Check contradiction: Type 2 Diabetes vs "No evidence of diabetes"
        boolean rec1HasDiabetes = diag1.toLowerCase().contains("diabetes");
        boolean rec2HasDiabetes = diag2.toLowerCase().contains("diabetes");
        boolean rec1StatesNonDiabetic = rec1.getNotes() != null && rec1.getNotes().toLowerCase().contains("non-diabetic");
        boolean rec2StatesNonDiabetic = rec2.getNotes() != null && rec2.getNotes().toLowerCase().contains("non-diabetic");

        if ((rec1HasDiabetes && rec2StatesNonDiabetic) || (rec2HasDiabetes && rec1StatesNonDiabetic)) {
            createConflictIfNotExists(
                    patient,
                    rec1,
                    rec2,
                    ConflictType.INCONSISTENT_DIAGNOSIS,
                    "Conflicting glycemic status documented between healthcare providers.",
                    "Record #" + rec1.getId() + ": " + diag1 + " (" + rec1.getIssuingFacility() + ")",
                    "Record #" + rec2.getId() + ": " + diag2 + " (" + rec2.getIssuingFacility() + ")"
            );
        }
    }

    private void checkPatientIdentifierMismatch(User patient, PatientProfile profile, MedicalRecord record) {
        String rawText = record.getExtractedMedicalData().getRawExtractedText();
        if (rawText == null) return;

        // If document contains a National Health ID pattern that differs from patient's registered ID
        if (profile.getNationalHealthId() != null && !profile.getNationalHealthId().isBlank()) {
            if (rawText.contains("PID-") || rawText.contains("NHID-")) {
                // If it contains an explicit ID that does not match profile
                String[] tokens = rawText.split("\\s+");
                for (String t : tokens) {
                    if ((t.startsWith("PID-") || t.startsWith("NHID-")) && !t.equalsIgnoreCase(profile.getNationalHealthId())) {
                        createConflictIfNotExists(
                                patient,
                                record,
                                record,
                                ConflictType.MISMATCHED_PATIENT_ID,
                                "Mismatched Patient Identifier: Document contains identifier '" + t + "' which differs from patient's registered ID '" + profile.getNationalHealthId() + "'.",
                                "Document Extracted ID: " + t,
                                "Profile Registered ID: " + profile.getNationalHealthId()
                        );
                        break;
                    }
                }
            }
        }
    }

    private String extractDosageString(String medText, String medName) {
        int idx = medText.indexOf(medName);
        if (idx >= 0) {
            int end = Math.min(medText.length(), idx + medName.length() + 15);
            return medText.substring(idx, end).trim();
        }
        return "";
    }

    private void createConflictIfNotExists(User patient, MedicalRecord r1, MedicalRecord r2,
                                           ConflictType type, String desc, String val1, String val2) {
        if (!conflictRepository.existsByRecord1IdAndRecord2Id(r1.getId(), r2.getId())) {
            RecordConflict conflict = new RecordConflict();
            conflict.setPatient(patient);
            conflict.setRecord1(r1);
            conflict.setRecord2(r2);
            conflict.setConflictType(type);
            conflict.setDescription(desc);
            conflict.setConflictingValue1(val1);
            conflict.setConflictingValue2(val2);
            conflict.setIsResolved(false);
            conflict.setDetectedAt(Instant.now());
            conflictRepository.save(conflict);
            logger.warn("CONFLICT DETECTED for patient #{}: {} (Record #{} vs #{})",
                    patient.getId(), type.name(), r1.getId(), r2.getId());
        }
    }

    @Transactional
    public RecordConflict resolveConflict(Long conflictId, String notes, User user) {
        RecordConflict conflict = conflictRepository.findById(conflictId)
                .orElseThrow(() -> new IllegalArgumentException("Conflict #" + conflictId + " not found"));
        conflict.setIsResolved(true);
        conflict.setResolutionNotes(notes);
        conflict.setResolvedByUser(user);
        conflict.setResolvedAt(Instant.now());
        return conflictRepository.save(conflict);
    }
}
