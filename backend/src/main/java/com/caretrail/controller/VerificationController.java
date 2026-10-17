package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.dto.VerificationActionRequest;
import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.model.entity.User;
import com.caretrail.model.entity.VerificationEvent;
import com.caretrail.model.entity.VerificationRequest;
import com.caretrail.repository.VerificationRequestRepository;
import com.caretrail.service.VerificationTrustService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private final VerificationTrustService verificationService;
    private final VerificationRequestRepository requestRepository;

    public VerificationController(VerificationTrustService verificationService,
                                  VerificationRequestRepository requestRepository) {
        this.verificationService = verificationService;
        this.requestRepository = requestRepository;
    }

    @GetMapping("/{recordId}/history")
    public ResponseEntity<ApiResponse<List<VerificationEvent>>> getVerificationHistory(@PathVariable Long recordId) {
        List<VerificationEvent> events = verificationService.getVerificationHistory(recordId);
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    @PostMapping("/{recordId}/action")
    public ResponseEntity<ApiResponse<MedicalRecord>> performVerificationAction(
            @PathVariable Long recordId,
            @Valid @RequestBody VerificationActionRequest actionRequest,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {

        MedicalRecord record = verificationService.executeVerificationAction(
                recordId, actionRequest, user, request.getRemoteAddr(), request.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.ok("Verification status updated and logged to Trust Layer evidence log", record));
    }

    @PostMapping("/{recordId}/request-institution-check")
    public ResponseEntity<ApiResponse<VerificationRequest>> requestInstitutionCheck(
            @PathVariable Long recordId,
            @RequestParam(value = "targetProviderId", required = false) Long targetProviderId,
            @RequestParam(value = "notes", required = false) String notes,
            @AuthenticationPrincipal User user) {

        VerificationRequest req = verificationService.requestInstitutionVerification(recordId, targetProviderId, notes, user);
        return ResponseEntity.ok(ApiResponse.ok("Verification inquiry dispatched to issuing facility", req));
    }

    @GetMapping("/pending-requests")
    public ResponseEntity<ApiResponse<List<VerificationRequest>>> getPendingRequests() {
        return ResponseEntity.ok(ApiResponse.ok(requestRepository.findByRequestStatus("PENDING")));
    }
}
