package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.dto.RevokeRequest;
import com.caretrail.dto.ShareRequest;
import com.caretrail.model.entity.HealthcareProvider;
import com.caretrail.model.entity.SharingPermission;
import com.caretrail.model.entity.User;
import com.caretrail.repository.HealthcareProviderRepository;
import com.caretrail.service.SharingPermissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sharing")
public class SharingController {

    private final SharingPermissionService sharingService;
    private final HealthcareProviderRepository providerRepository;

    public SharingController(SharingPermissionService sharingService,
                             HealthcareProviderRepository providerRepository) {
        this.sharingService = sharingService;
        this.providerRepository = providerRepository;
    }

    @PostMapping("/grant")
    public ResponseEntity<ApiResponse<SharingPermission>> grantSharingPermission(
            @Valid @RequestBody ShareRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {

        SharingPermission permission = sharingService.grantPermission(
                user, request, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.ok("Record sharing consent granted successfully", permission));
    }

    @GetMapping("/patient-permissions")
    public ResponseEntity<ApiResponse<List<SharingPermission>>> getPatientPermissions(@AuthenticationPrincipal User user) {
        List<SharingPermission> list = sharingService.getPermissionsForPatient(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/provider-permissions")
    public ResponseEntity<ApiResponse<List<SharingPermission>>> getProviderPermissions(@AuthenticationPrincipal User user) {
        Optional<HealthcareProvider> hp = providerRepository.findByUser(user);
        if (hp.isEmpty()) {
            throw new IllegalArgumentException("Provider profile not found for this user");
        }
        List<SharingPermission> list = sharingService.getPermissionsForProvider(hp.get().getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{permissionId}/revoke")
    public ResponseEntity<ApiResponse<SharingPermission>> revokePermission(
            @PathVariable Long permissionId,
            @RequestBody(required = false) RevokeRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {

        String reason = (request != null) ? request.getReason() : "Revoked by patient";
        SharingPermission updated = sharingService.revokePermission(
                permissionId, user, reason, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.ok("Consent permission revoked. Future access is now blocked.", updated));
    }
}
