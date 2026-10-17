package com.caretrail.service;

import com.caretrail.dto.OcrCorrectionRequest;
import com.caretrail.model.entity.*;
import com.caretrail.model.enums.DocumentType;
import com.caretrail.model.enums.Role;
import com.caretrail.repository.*;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final DocumentMetadataRepository metadataRepository;
    private final ExtractedMedicalDataRepository extractedDataRepository;
    private final UserRepository userRepository;
    private final HealthcareProviderRepository providerRepository;
    private final DocumentStorageService storageService;
    private final OcrExtractionService ocrService;
    private final DuplicateDetectionService duplicateService;
    private final VerificationTrustService verificationService;
    private final ConflictDetectionService conflictService;
    private final SharingPermissionService sharingService;
    private final AuditLogService auditLogService;

    public MedicalRecordService(MedicalRecordRepository recordRepository,
                                DocumentMetadataRepository metadataRepository,
                                ExtractedMedicalDataRepository extractedDataRepository,
                                UserRepository userRepository,
                                HealthcareProviderRepository providerRepository,
                                DocumentStorageService storageService,
                                OcrExtractionService ocrService,
                                DuplicateDetectionService duplicateService,
                                VerificationTrustService verificationService,
                                ConflictDetectionService conflictService,
                                SharingPermissionService sharingService,
                                AuditLogService auditLogService) {
        this.recordRepository = recordRepository;
        this.metadataRepository = metadataRepository;
        this.extractedDataRepository = extractedDataRepository;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.storageService = storageService;
        this.ocrService = ocrService;
        this.duplicateService = duplicateService;
        this.verificationService = verificationService;
        this.conflictService = conflictService;
        this.sharingService = sharingService;
        this.auditLogService = auditLogService;
    }

    public List<MedicalRecord> getTimelineForPatient(Long patientId, User currentUser) {
        // Access check
        if (!currentUser.getId().equals(patientId) && currentUser.getRole() != Role.ROLE_ADMIN) {
            // Check provider active sharing permission for FULL_TIMELINE
            if (currentUser.getRole() == Role.ROLE_PROVIDER) {
                if (!sharingService.canProviderAccessContinuityBrief(currentUser, patientId)) {
                    throw new SecurityException("No active sharing consent granted by patient for this provider");
                }
            } else {
                throw new SecurityException("Unauthorized to access this medical timeline");
            }
        }

        List<MedicalRecord> records = recordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
        auditLogService.logEvent(currentUser, userRepository.findById(patientId).orElse(null), null,
                "RECORD_VIEW", null, null, "Viewed unified medical timeline of patient #" + patientId);
        return records;
    }

    public List<MedicalRecord> searchRecords(Long patientId, DocumentType docType, LocalDate start, LocalDate end, String query, User currentUser) {
        if (!currentUser.getId().equals(patientId) && currentUser.getRole() != Role.ROLE_ADMIN) {
            if (currentUser.getRole() == Role.ROLE_PROVIDER && !sharingService.canProviderAccessContinuityBrief(currentUser, patientId)) {
                throw new SecurityException("No active sharing permission to search this patient's records");
            }
        }
        return recordRepository.searchPatientRecords(patientId, docType, start, end, query);
    }

    @Transactional
    public MedicalRecord uploadPatientRecord(MultipartFile file,
                                            String title,
                                            DocumentType docType,
                                            LocalDate recordDate,
                                            String issuingFacility,
                                            String attendingPhysician,
                                            String notes,
                                            User patientUser,
                                            String ip,
                                            String userAgent) throws IOException {

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patientUser);
        record.setUploadedBy(patientUser);
        record.setTitle(title != null && !title.isBlank() ? title : file.getOriginalFilename());
        record.setDocumentType(docType != null ? docType : DocumentType.OTHER);
        record.setRecordDate(recordDate != null ? recordDate : LocalDate.now());
        record.setIssuingFacility(issuingFacility);
        record.setAttendingPhysician(attendingPhysician);
        record.setNotes(notes);
        record.setCreatedAt(Instant.now());
        record.setUpdatedAt(Instant.now());

        record = recordRepository.save(record);

        // Store physical document
        DocumentMetadata metadata = storageService.storeDocument(file, record);
        metadata = metadataRepository.save(metadata);
        record.setDocumentMetadata(metadata);

        // Run OCR text extraction
        File storedFile = new File(metadata.getStoredFilePath());
        ExtractedMedicalData extractedData = ocrService.extractFromDocument(storedFile, metadata.getFileType(), record);
        extractedData = extractedDataRepository.save(extractedData);
        record.setExtractedMedicalData(extractedData);

        // Process initial trust state (Patient-uploaded unverified)
        record = verificationService.processInitialTrustCheck(record, patientUser);

        // Check for duplicate records (cryptographic hash and metadata)
        duplicateService.checkForDuplicates(record, metadata);

        // Scan for clinical and temporal conflicts
        conflictService.scanForConflicts(record);

        auditLogService.logEvent(patientUser, patientUser, record, "RECORD_UPLOAD", ip, userAgent,
                "Patient uploaded new document: " + record.getTitle() + " (" + metadata.getOriginalFileName() + ")");

        return recordRepository.save(record);
    }

    @Transactional
    public MedicalRecord uploadProviderRecord(MultipartFile file,
                                             Long targetPatientId,
                                             String title,
                                             DocumentType docType,
                                             LocalDate recordDate,
                                             String notes,
                                             User providerUser,
                                             String ip,
                                             String userAgent) throws IOException {

        HealthcareProvider provider = providerRepository.findByUser(providerUser)
                .orElseThrow(() -> new IllegalArgumentException("Provider profile not found for user"));

        if (!"VERIFIED".equalsIgnoreCase(provider.getVerificationStatus())) {
            throw new SecurityException("Only verified healthcare providers are authorized to upload clinical records directly");
        }

        User patient = userRepository.findById(targetPatientId)
                .orElseThrow(() -> new IllegalArgumentException("Target patient not found"));

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setUploadedBy(providerUser);
        record.setProvider(provider);
        record.setTitle(title != null && !title.isBlank() ? title : file.getOriginalFilename());
        record.setDocumentType(docType != null ? docType : DocumentType.CONSULTATION);
        record.setRecordDate(recordDate != null ? recordDate : LocalDate.now());
        record.setIssuingFacility(provider.getInstitutionName());
        record.setAttendingPhysician(providerUser.getFullName());
        record.setNotes(notes);
        record.setCreatedAt(Instant.now());
        record.setUpdatedAt(Instant.now());

        record = recordRepository.save(record);

        // Store document
        DocumentMetadata metadata = storageService.storeDocument(file, record);
        metadata = metadataRepository.save(metadata);
        record.setDocumentMetadata(metadata);

        // OCR extraction
        File storedFile = new File(metadata.getStoredFilePath());
        ExtractedMedicalData extractedData = ocrService.extractFromDocument(storedFile, metadata.getFileType(), record);
        extractedData = extractedDataRepository.save(extractedData);
        record.setExtractedMedicalData(extractedData);

        // Initial trust check (Direct verified provider upload -> ISSUER_CONFIRMED)
        record = verificationService.processInitialTrustCheck(record, providerUser);

        // Duplicate check
        duplicateService.checkForDuplicates(record, metadata);

        // Conflict check
        conflictService.scanForConflicts(record);

        auditLogService.logEvent(providerUser, patient, record, "RECORD_UPLOAD", ip, userAgent,
                "Healthcare provider " + provider.getInstitutionName() + " uploaded clinical record for patient #" + patient.getId());

        return recordRepository.save(record);
    }

    @Transactional
    public ExtractedMedicalData correctOcrData(Long recordId, OcrCorrectionRequest request, User currentUser, String ip, String userAgent) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Medical record #" + recordId + " not found"));

        if (!sharingService.canUserAccessRecord(currentUser, record)) {
            throw new SecurityException("Unauthorized to modify annotations for this medical record");
        }

        ExtractedMedicalData data = record.getExtractedMedicalData();
        if (data == null) {
            data = new ExtractedMedicalData();
            data.setRecord(record);
        }

        // Keep raw text completely intact! We update corrected fields without altering original document
        if (request.getCorrectedDate() != null) {
            data.setExtractedDate(request.getCorrectedDate());
            record.setRecordDate(request.getCorrectedDate());
        }
        if (request.getCorrectedTitle() != null && !request.getCorrectedTitle().isBlank()) {
            record.setTitle(request.getCorrectedTitle());
        }
        if (request.getCorrectedProviderName() != null) {
            data.setExtractedProviderName(request.getCorrectedProviderName());
            record.setAttendingPhysician(request.getCorrectedProviderName());
        }
        if (request.getCorrectedFacilityName() != null) {
            data.setExtractedFacilityName(request.getCorrectedFacilityName());
            record.setIssuingFacility(request.getCorrectedFacilityName());
        }
        if (request.getCorrectedDocumentType() != null) {
            data.setExtractedDocumentType(request.getCorrectedDocumentType());
        }
        if (request.getCorrectedDiagnoses() != null) {
            data.setExtractedDiagnoses(request.getCorrectedDiagnoses());
        }
        if (request.getCorrectedMedications() != null) {
            data.setExtractedMedications(request.getCorrectedMedications());
        }
        if (request.getCorrectedLabValues() != null) {
            data.setExtractedLabValues(request.getCorrectedLabValues());
        }

        data.setIsReviewedByPatient(true);
        data.setUserCorrectedData("User notes: " + (request.getUserNotes() != null ? request.getUserNotes() : "User verified OCR extraction accuracy"));
        data.setUpdatedAt(Instant.now());

        recordRepository.save(record);
        ExtractedMedicalData updated = extractedDataRepository.save(data);

        // Re-scan for conflicts with corrected clinical facts
        conflictService.scanForConflicts(record);

        auditLogService.logEvent(currentUser, record.getPatient(), record, "CORRECTION_SUBMITTED", ip, userAgent,
                "Submitted human verification & correction of extracted OCR fields");

        return updated;
    }

    public Resource getOriginalDocumentResource(Long recordId, User currentUser, String ip, String userAgent) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Medical record #" + recordId + " not found"));

        if (!sharingService.canUserAccessRecord(currentUser, record)) {
            throw new SecurityException("Unauthorized: You do not possess consent or permission to view this medical document");
        }

        DocumentMetadata metadata = record.getDocumentMetadata();
        if (metadata == null) {
            throw new IllegalStateException("Document metadata not found for record #" + recordId);
        }

        auditLogService.logEvent(currentUser, record.getPatient(), record, "DOCUMENT_DOWNLOAD", ip, userAgent,
                "Accessed and viewed original medical document: " + metadata.getOriginalFileName());

        return storageService.loadAsResource(metadata.getStoredFilePath());
    }

    public MedicalRecord getRecordDetails(Long recordId, User currentUser) {
        MedicalRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Medical record #" + recordId + " not found"));

        if (!sharingService.canUserAccessRecord(currentUser, record)) {
            throw new SecurityException("Unauthorized: Access denied to medical record");
        }

        return record;
    }
}
