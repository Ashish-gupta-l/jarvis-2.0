package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.dto.OcrCorrectionRequest;
import com.caretrail.model.entity.ExtractedMedicalData;
import com.caretrail.model.entity.HealthcareProvider;
import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.model.entity.PatientProfile;
import com.caretrail.model.entity.User;
import com.caretrail.model.enums.DocumentType;
import com.caretrail.repository.HealthcareProviderRepository;
import com.caretrail.repository.PatientProfileRepository;
import com.caretrail.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final MedicalRecordService recordService;
    private final PatientProfileRepository profileRepository;
    private final HealthcareProviderRepository providerRepository;

    public PatientController(MedicalRecordService recordService,
                             PatientProfileRepository profileRepository,
                             HealthcareProviderRepository providerRepository) {
        this.recordService = recordService;
        this.profileRepository = profileRepository;
        this.providerRepository = providerRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<PatientProfile>> getProfile(@AuthenticationPrincipal User user) {
        PatientProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<List<MedicalRecord>>> getTimeline(@AuthenticationPrincipal User user) {
        List<MedicalRecord> timeline = recordService.getTimelineForPatient(user.getId(), user);
        return ResponseEntity.ok(ApiResponse.ok(timeline));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MedicalRecord>>> searchRecords(
            @RequestParam(value = "docType", required = false) DocumentType docType,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "query", required = false) String query,
            @AuthenticationPrincipal User user) {

        List<MedicalRecord> results = recordService.searchRecords(user.getId(), docType, startDate, endDate, query, user);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @PutMapping("/records/{recordId}/correct-ocr")
    public ResponseEntity<ApiResponse<ExtractedMedicalData>> correctOcrData(
            @PathVariable Long recordId,
            @RequestBody OcrCorrectionRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {

        ExtractedMedicalData updated = recordService.correctOcrData(
                recordId, request, user, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.ok("OCR annotations updated successfully without modifying original document", updated));
    }

    @GetMapping("/available-providers")
    public ResponseEntity<ApiResponse<List<HealthcareProvider>>> getAvailableProviders() {
        // Return verified providers available for record sharing
        List<HealthcareProvider> providers = providerRepository.findByVerificationStatus("VERIFIED");
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }
}
