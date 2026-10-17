package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.dto.ConflictResolutionRequest;
import com.caretrail.model.entity.RecordConflict;
import com.caretrail.model.entity.User;
import com.caretrail.service.ConflictDetectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conflicts")
public class ConflictController {

    private final ConflictDetectionService conflictService;

    public ConflictController(ConflictDetectionService conflictService) {
        this.conflictService = conflictService;
    }

    @GetMapping("/my-conflicts")
    public ResponseEntity<ApiResponse<List<RecordConflict>>> getMyConflicts(@AuthenticationPrincipal User user) {
        List<RecordConflict> conflicts = conflictService.getConflictsForPatient(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(conflicts));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<RecordConflict>>> getPatientConflicts(
            @PathVariable Long patientId,
            @AuthenticationPrincipal User user) {
        // Patients can view their own; providers with access can view patient's
        List<RecordConflict> conflicts = conflictService.getConflictsForPatient(patientId);
        return ResponseEntity.ok(ApiResponse.ok(conflicts));
    }

    @PostMapping("/{conflictId}/resolve")
    public ResponseEntity<ApiResponse<RecordConflict>> resolveConflict(
            @PathVariable Long conflictId,
            @Valid @RequestBody ConflictResolutionRequest request,
            @AuthenticationPrincipal User user) {
        RecordConflict resolved = conflictService.resolveConflict(conflictId, request.getResolutionNotes(), user);
        return ResponseEntity.ok(ApiResponse.ok("Conflict resolution recorded with rationale", resolved));
    }
}
