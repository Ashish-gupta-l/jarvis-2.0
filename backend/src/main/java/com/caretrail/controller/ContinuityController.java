package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.dto.ContinuityBriefDto;
import com.caretrail.dto.GapMapDto;
import com.caretrail.model.entity.FollowUpTask;
import com.caretrail.model.entity.User;
import com.caretrail.model.enums.FollowUpStatus;
import com.caretrail.service.ContinuityService;
import com.caretrail.service.SharingPermissionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/continuity")
public class ContinuityController {

    private final ContinuityService continuityService;
    private final SharingPermissionService sharingService;

    public ContinuityController(ContinuityService continuityService,
                                SharingPermissionService sharingService) {
        this.continuityService = continuityService;
        this.sharingService = sharingService;
    }

    @GetMapping("/my-gap-map")
    public ResponseEntity<ApiResponse<GapMapDto>> getMyGapMap(@AuthenticationPrincipal User user) {
        GapMapDto gapMap = continuityService.generateContinuityGapMap(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(gapMap));
    }

    @GetMapping("/gap-map/{patientId}")
    public ResponseEntity<ApiResponse<GapMapDto>> getPatientGapMap(
            @PathVariable Long patientId,
            @AuthenticationPrincipal User user) {
        if (!user.getId().equals(patientId) && !sharingService.canProviderAccessContinuityBrief(user, patientId)) {
            throw new SecurityException("Unauthorized to access patient Continuity Gap Map");
        }
        GapMapDto gapMap = continuityService.generateContinuityGapMap(patientId);
        return ResponseEntity.ok(ApiResponse.ok(gapMap));
    }

    @GetMapping("/my-brief")
    public ResponseEntity<ApiResponse<ContinuityBriefDto>> getMyBrief(@AuthenticationPrincipal User user) {
        ContinuityBriefDto brief = continuityService.generateContinuityBrief(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(brief));
    }

    @GetMapping("/brief/{patientId}")
    public ResponseEntity<ApiResponse<ContinuityBriefDto>> getPatientBrief(
            @PathVariable Long patientId,
            @AuthenticationPrincipal User user) {
        if (!user.getId().equals(patientId) && !sharingService.canProviderAccessContinuityBrief(user, patientId)) {
            throw new SecurityException("No active sharing consent granted to access this patient's Continuity Brief");
        }
        ContinuityBriefDto brief = continuityService.generateContinuityBrief(patientId);
        return ResponseEntity.ok(ApiResponse.ok(brief));
    }

    @GetMapping("/follow-ups/{patientId}")
    public ResponseEntity<ApiResponse<List<FollowUpTask>>> getFollowUps(
            @PathVariable Long patientId,
            @AuthenticationPrincipal User user) {
        if (!user.getId().equals(patientId) && !sharingService.canProviderAccessContinuityBrief(user, patientId)) {
            throw new SecurityException("Unauthorized to access patient follow-up tasks");
        }
        return ResponseEntity.ok(ApiResponse.ok(continuityService.getFollowUpsForPatient(patientId)));
    }

    @PatchMapping("/follow-ups/{taskId}/status")
    public ResponseEntity<ApiResponse<FollowUpTask>> updateFollowUpStatus(
            @PathVariable Long taskId,
            @RequestParam("status") FollowUpStatus status,
            @RequestParam(value = "evidenceRecordId", required = false) Long evidenceRecordId,
            @RequestParam(value = "notes", required = false) String notes) {

        FollowUpTask updated = continuityService.updateFollowUpStatus(taskId, status, evidenceRecordId, notes);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up task status updated with documented evidence", updated));
    }

    @PostMapping("/follow-ups")
    public ResponseEntity<ApiResponse<FollowUpTask>> createFollowUp(
            @RequestParam("patientId") Long patientId,
            @RequestParam("sourceRecordId") Long sourceRecordId,
            @RequestParam("description") String description,
            @RequestParam(value = "dueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate) {

        FollowUpTask task = continuityService.createFollowUpTask(patientId, sourceRecordId, description, dueDate);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up task created", task));
    }
}
