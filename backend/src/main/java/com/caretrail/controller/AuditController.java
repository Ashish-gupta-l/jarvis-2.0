package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.model.entity.AccessAuditLog;
import com.caretrail.model.entity.User;
import com.caretrail.model.enums.Role;
import com.caretrail.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogService auditLogService;

    public AuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/my-logs")
    public ResponseEntity<ApiResponse<List<AccessAuditLog>>> getMyLogs(@AuthenticationPrincipal User user) {
        List<AccessAuditLog> logs = auditLogService.getAuditLogsForPatient(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AccessAuditLog>>> getAllAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.getAllAuditLogs()));
    }
}
