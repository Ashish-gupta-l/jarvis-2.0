package com.caretrail.service;

import com.caretrail.dto.ShareRequest;
import com.caretrail.model.entity.*;
import com.caretrail.model.enums.Role;
import com.caretrail.model.enums.ShareScope;
import com.caretrail.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class SharingPermissionService {

    private final SharingPermissionRepository permissionRepository;
    private final HealthcareProviderRepository providerRepository;
    private final MedicalRecordRepository recordRepository;
    private final AuditLogService auditLogService;

    public SharingPermissionService(SharingPermissionRepository permissionRepository,
                                    HealthcareProviderRepository providerRepository,
                                    MedicalRecordRepository recordRepository,
                                    AuditLogService auditLogService) {
        this.permissionRepository = permissionRepository;
        this.providerRepository = providerRepository;
        this.recordRepository = recordRepository;
        this.auditLogService = auditLogService;
    }

    public List<SharingPermission> getPermissionsForPatient(Long patientId) {
        return permissionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<SharingPermission> getPermissionsForProvider(Long providerId) {
        return permissionRepository.findByProviderIdOrderByCreatedAtDesc(providerId);
    }

    @Transactional
    public SharingPermission grantPermission(User patient, ShareRequest request, String ip, String userAgent) {
        HealthcareProvider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException("Healthcare provider not found"));

        MedicalRecord record = null;
        if (request.getRecordId() != null && request.getShareScope() == ShareScope.SELECTED_RECORD) {
            record = recordRepository.findById(request.getRecordId())
                    .orElseThrow(() -> new IllegalArgumentException("Medical record not found"));
            if (!record.getPatient().getId().equals(patient.getId())) {
                throw new SecurityException("Cannot share a record belonging to another patient");
            }
        }

        int hours = (request.getDurationHours() != null && request.getDurationHours() > 0) ? request.getDurationHours() : 72;
        Instant expiresAt = Instant.now().plus(hours, ChronoUnit.HOURS);

        SharingPermission permission = new SharingPermission();
        permission.setPatient(patient);
        permission.setProvider(provider);
        permission.setRecord(record);
        permission.setShareScope(request.getShareScope());
        permission.setIsActive(true);
        permission.setExpiresAt(expiresAt);
        permission.setCreatedAt(Instant.now());

        SharingPermission saved = permissionRepository.save(permission);

        auditLogService.logEvent(
                patient,
                patient,
                record,
                "RECORD_SHARE",
                ip,
                userAgent,
                "Granted " + request.getShareScope().name() + " access to " + provider.getInstitutionName() +
                        " for " + hours + " hours (Expires: " + expiresAt + ")"
        );

        return saved;
    }

    @Transactional
    public SharingPermission revokePermission(Long permissionId, User patient, String reason, String ip, String userAgent) {
        SharingPermission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission #" + permissionId + " not found"));

        if (!permission.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("Unauthorized: Cannot revoke another patient's consent permission");
        }

        permission.setIsActive(false);
        permission.setRevokedAt(Instant.now());
        permission.setRevocationReason(reason != null ? reason : "Revoked by patient via CareTrail platform");

        SharingPermission updated = permissionRepository.save(permission);

        auditLogService.logEvent(
                patient,
                patient,
                permission.getRecord(),
                "ACCESS_REVOKED",
                ip,
                userAgent,
                "Revoked future access for " + permission.getProvider().getInstitutionName() +
                        ". Reason: " + permission.getRevocationReason() +
                        " (Note: Revocation cannot guarantee deletion of documents previously downloaded)."
        );

        return updated;
    }

    public boolean canUserAccessRecord(User user, MedicalRecord record) {
        if (user == null || record == null) return false;

        // 1. Patient owns the record
        if (record.getPatient().getId().equals(user.getId())) {
            return true;
        }

        // 2. User uploaded this record
        if (record.getUploadedBy().getId().equals(user.getId())) {
            return true;
        }

        // 3. User is a healthcare provider with an active, unexpired, non-revoked consent permission
        if (user.getRole() == Role.ROLE_PROVIDER) {
            Optional<HealthcareProvider> hpOpt = providerRepository.findByUser(user);
            if (hpOpt.isEmpty()) return false;

            HealthcareProvider provider = hpOpt.get();
            List<SharingPermission> activePermissions = permissionRepository.findActivePermissions(
                    record.getPatient().getId(),
                    provider.getId(),
                    Instant.now()
            );

            for (SharingPermission perm : activePermissions) {
                if (perm.getShareScope() == ShareScope.FULL_TIMELINE) {
                    return true;
                }
                if (perm.getShareScope() == ShareScope.SELECTED_RECORD && perm.getRecord() != null
                        && perm.getRecord().getId().equals(record.getId())) {
                    return true;
                }
            }
        }

        // Note: As specified, Administrators do NOT automatically have unrestricted access to all patient medical documents!
        return false;
    }

    public boolean canProviderAccessContinuityBrief(User providerUser, Long patientId) {
        if (providerUser.getRole() != Role.ROLE_PROVIDER) return false;

        Optional<HealthcareProvider> hpOpt = providerRepository.findByUser(providerUser);
        if (hpOpt.isEmpty()) return false;

        List<SharingPermission> permissions = permissionRepository.findActivePermissions(
                patientId,
                hpOpt.get().getId(),
                Instant.now()
        );

        for (SharingPermission p : permissions) {
            if (p.getShareScope() == ShareScope.FULL_TIMELINE || p.getShareScope() == ShareScope.CONTINUITY_BRIEF_ONLY) {
                return true;
            }
        }
        return false;
    }
}
