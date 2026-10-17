package com.caretrail.service;

import com.caretrail.model.entity.DocumentMetadata;
import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.repository.DocumentMetadataRepository;
import com.caretrail.repository.MedicalRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DuplicateDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(DuplicateDetectionService.class);

    private final DocumentMetadataRepository documentMetadataRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public DuplicateDetectionService(DocumentMetadataRepository documentMetadataRepository,
                                     MedicalRecordRepository medicalRecordRepository) {
        this.documentMetadataRepository = documentMetadataRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional
    public void checkForDuplicates(MedicalRecord newRecord, DocumentMetadata newMetadata) {
        // 1. Exact cryptographic match check (SHA-256)
        List<DocumentMetadata> matchingHashRecords = documentMetadataRepository.findBySha256Hash(newMetadata.getSha256Hash());
        for (DocumentMetadata existing : matchingHashRecords) {
            if (!existing.getRecord().getId().equals(newRecord.getId())) {
                newRecord.setIsFlaggedDuplicate(true);
                newRecord.setDuplicateOfRecord(existing.getRecord());
                logger.warn("Exact duplicate detected by SHA-256 ({}) between record #{} and #{}",
                        newMetadata.getSha256Hash(), newRecord.getId(), existing.getRecord().getId());
                medicalRecordRepository.save(newRecord);
                return;
            }
        }

        // 2. Metadata / Heuristic duplicate check (same patient, same date, matching facility, matching doc type)
        List<MedicalRecord> sameDayRecords = medicalRecordRepository.findByPatientIdAndRecordDate(
                newRecord.getPatient().getId(),
                newRecord.getRecordDate()
        );

        for (MedicalRecord candidate : sameDayRecords) {
            if (!candidate.getId().equals(newRecord.getId())) {
                boolean sameDocType = candidate.getDocumentType() == newRecord.getDocumentType();
                boolean sameFacility = candidate.getIssuingFacility() != null &&
                        newRecord.getIssuingFacility() != null &&
                        candidate.getIssuingFacility().trim().equalsIgnoreCase(newRecord.getIssuingFacility().trim());

                if (sameDocType && sameFacility) {
                    newRecord.setIsFlaggedDuplicate(true);
                    newRecord.setDuplicateOfRecord(candidate);
                    logger.warn("Suspected duplicate report detected (same patient, date, facility, type) between record #{} and #{}",
                            newRecord.getId(), candidate.getId());
                    medicalRecordRepository.save(newRecord);
                    return;
                }
            }
        }
    }
}
