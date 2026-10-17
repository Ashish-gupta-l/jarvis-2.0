package com.caretrail.service;

import com.caretrail.dto.VerificationActionRequest;
import com.caretrail.model.entity.*;
import com.caretrail.model.enums.VerificationStatus;
import com.caretrail.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class VerificationTrustService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationTrustService.class);

    private final MedicalRecordRepository medicalRecordRepository;
    private final VerificationEventRepository verificationEventRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final HealthcareProviderRepository providerRepository;
    private final AuditLogService auditLogService;

    public VerificationTrustService(MedicalRecordRepository medicalRecordRepository,
                                    VerificationEventRepository verificationEventRepository,
                                    VerificationRequestRepository verificationRequestRepository,
                                    HealthcareProviderRepository providerRepository,
                                    AuditLogService auditLogService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.verificationEventRepository = verificationEventRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.providerRepository = providerRepository;
        this.auditLogService = auditLogService;
    }

    public List<VerificationEvent> getVerificationHistory(Long recordId) {
        return verificationEventRepository.findByRecordIdOrderByCreatedAtDesc(recordId);
    }

    @Transactional
    public MedicalRecord processInitialTrustCheck(MedicalRecord record, User uploader) {
        // Document starts as PATIENT_UPLOADED_UNVERIFIED if patient uploaded
        // If uploaded directly by a verified healthcare provider, it can be ISSUER_CONFIRMED
        if (record.getProvider() != null && "VERIFIED".equalsIgnoreCase(record.getProvider().getVerificationStatus())) {
            record.setVerificationStatus(VerificationStatus.ISSUER_CONFIRMED);
            logVerificationEvent(
                    record,
                    uploader,
                    VerificationStatus.PATIENT_UPLOADED_UNVERIFIED.name(),
                    VerificationStatus.ISSUER_CONFIRMED.name(),
                    "ISSUER_DIRECT_UPLOAD",
                    "Uploaded directly by authenticated & verified provider: " +
                            record.getProvider().getInstitutionName() + " (License: " + record.getProvider().getLicenseNumber() + ")."
            );
        } else {
            record.setVerificationStatus(VerificationStatus.PATIENT_UPLOADED_UNVERIFIED);
            logVerificationEvent(
                    record,
                    uploader,
                    "NONE",
                    VerificationStatus.PATIENT_UPLOADED_UNVERIFIED.name(),
                    "INITIAL_INGESTION",
                    "Document received via patient upload. Pending independent institutional validation."
            );
        }
        return medicalRecordRepository.save(record);
    }

    @Transactional
    public MedicalRecord executeVerificationAction(Long recordId, VerificationActionRequest request, User actor, String ip, String userAgent) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Medical record #" + recordId + " not found"));

        String oldStatus = record.getVerificationStatus().name();
        record.setVerificationStatus(request.getTargetStatus());
        MedicalRecord updated = medicalRecordRepository.save(record);

        // Record transparent trust layer event
        VerificationEvent event = new VerificationEvent();
        event.setRecord(updated);
        event.setActorUser(actor);
        event.setPreviousStatus(oldStatus);
        event.setNewStatus(request.getTargetStatus().name());
        event.setMethodUsed(request.getMethodUsed());
        event.setEvidenceDetails(request.getEvidenceDetails() +
                (request.getNotes() != null && !request.getNotes().isBlank() ? " | Notes: " + request.getNotes() : ""));
        event.setCreatedAt(Instant.now());
        verificationEventRepository.save(event);

        auditLogService.logEvent(
                actor,
                record.getPatient(),
                record,
                "VERIFICATION_UPDATE",
                ip,
                userAgent,
                "Changed status from " + oldStatus + " to " + request.getTargetStatus().name() + " via " + request.getMethodUsed()
        );

        logger.info("Verification event recorded for record #{}: {} -> {} by user {}",
                recordId, oldStatus, request.getTargetStatus().name(), actor.getUsername());

        return updated;
    }

    @Transactional
    public VerificationRequest requestInstitutionVerification(Long recordId, Long targetProviderId, String notes, User requester) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));

        VerificationRequest req = new VerificationRequest();
        req.setRecord(record);
        req.setRequestedBy(requester);

        if (targetProviderId != null) {
            HealthcareProvider targetProvider = providerRepository.findById(targetProviderId).orElse(null);
            req.setTargetProvider(targetProvider);
            req.setTargetFacilityName(targetProvider != null ? targetProvider.getInstitutionName() : record.getIssuingFacility());
        } else {
            req.setTargetFacilityName(record.getIssuingFacility());
        }

        req.setRequestType("ISSUER_CONFIRMATION");
        req.setRequestStatus("PENDING");
        req.setNotes(notes != null ? notes : "Verification request dispatched to issuing facility.");
        req.setCreatedAt(Instant.now());
        req.setUpdatedAt(Instant.now());

        // Update record status to VERIFICATION_PENDING
        record.setVerificationStatus(VerificationStatus.VERIFICATION_PENDING);
        medicalRecordRepository.save(record);

        logVerificationEvent(
                record,
                requester,
                VerificationStatus.PATIENT_UPLOADED_UNVERIFIED.name(),
                VerificationStatus.VERIFICATION_PENDING.name(),
                "INSTITUTION_INQUIRY_DISPATCHED",
                "Verification inquiry initiated to issuing institution: " + req.getTargetFacilityName()
        );

        return verificationRequestRepository.save(req);
    }

    private void logVerificationEvent(MedicalRecord record, User actor, String oldStatus, String newStatus, String method, String details) {
        VerificationEvent event = new VerificationEvent();
        event.setRecord(record);
        event.setActorUser(actor);
        event.setPreviousStatus(oldStatus);
        event.setNewStatus(newStatus);
        event.setMethodUsed(method);
        event.setEvidenceDetails(details);
        event.setCreatedAt(Instant.now());
        verificationEventRepository.save(event);
    }
}
