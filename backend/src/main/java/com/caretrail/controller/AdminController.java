package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.model.entity.HealthcareProvider;
import com.caretrail.model.entity.User;
import com.caretrail.repository.*;
import com.caretrail.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final HealthcareProviderRepository providerRepository;
    private final MedicalRecordRepository recordRepository;
    private final UserRepository userRepository;
    private final RecordConflictRepository conflictRepository;
    private final AuditLogService auditLogService;

    public AdminController(HealthcareProviderRepository providerRepository,
                           MedicalRecordRepository recordRepository,
                           UserRepository userRepository,
                           RecordConflictRepository conflictRepository,
                           AuditLogService auditLogService) {
        this.providerRepository = providerRepository;
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
        this.conflictRepository = conflictRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<HealthcareProvider>>> getAllProviders() {
        return ResponseEntity.ok(ApiResponse.ok(providerRepository.findAll()));
    }

    @GetMapping("/providers/pending")
    public ResponseEntity<ApiResponse<List<HealthcareProvider>>> getPendingProviders() {
        return ResponseEntity.ok(ApiResponse.ok(providerRepository.findByVerificationStatus("PENDING")));
    }

    @PostMapping("/providers/{providerId}/verify")
    public ResponseEntity<ApiResponse<HealthcareProvider>> verifyProvider(
            @PathVariable Long providerId,
            @RequestParam("status") String status, // VERIFIED, REJECTED
            @AuthenticationPrincipal User adminUser,
            HttpServletRequest request) {

        HealthcareProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider #" + providerId + " not found"));

        provider.setVerificationStatus(status.toUpperCase());
        provider.setVerifiedAt(Instant.now());
        provider.setVerifiedBy(adminUser);
        HealthcareProvider saved = providerRepository.save(provider);

        auditLogService.logEvent(
                adminUser,
                null,
                null,
                "PROVIDER_ONBOARDING",
                request.getRemoteAddr(),
                request.getHeader("User-Agent"),
                "Administrator " + adminUser.getUsername() + " updated provider " + provider.getInstitutionName() + " to " + status
        );

        return ResponseEntity.ok(ApiResponse.ok("Provider status updated to " + status, saved));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalRecords", recordRepository.count());
        stats.put("totalProviders", providerRepository.count());
        stats.put("pendingProviders", providerRepository.findByVerificationStatus("PENDING").size());
        stats.put("activeConflicts", conflictRepository.count());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
