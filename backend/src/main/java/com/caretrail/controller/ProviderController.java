package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.model.entity.*;
import com.caretrail.model.enums.Role;
import com.caretrail.repository.*;
import com.caretrail.service.SharingPermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final HealthcareProviderRepository providerRepository;
    private final SharingPermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final ProviderCredentialRepository credentialRepository;

    public ProviderController(HealthcareProviderRepository providerRepository,
                              SharingPermissionRepository permissionRepository,
                              UserRepository userRepository,
                              ProviderCredentialRepository credentialRepository) {
        this.providerRepository = providerRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER')")
    public ResponseEntity<ApiResponse<HealthcareProvider>> getMyProfile(@AuthenticationPrincipal User user) {
        HealthcareProvider hp = providerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Provider record not found"));
        return ResponseEntity.ok(ApiResponse.ok(hp));
    }

    @GetMapping("/authorized-patients")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER')")
    public ResponseEntity<ApiResponse<List<User>>> getAuthorizedPatients(@AuthenticationPrincipal User user) {
        HealthcareProvider hp = providerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Provider record not found"));

        List<SharingPermission> activePerms = permissionRepository.findAllActivePermissionsForProvider(hp.getId(), Instant.now());
        Set<User> patients = activePerms.stream()
                .map(SharingPermission::getPatient)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(ApiResponse.ok(new ArrayList<>(patients)));
    }

    @GetMapping("/all-patients")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllPatients() {
        List<User> patients = userRepository.findByRole(Role.ROLE_PATIENT);
        return ResponseEntity.ok(ApiResponse.ok(patients));
    }

    @GetMapping("/credentials/{providerId}")
    public ResponseEntity<ApiResponse<List<ProviderCredential>>> getProviderCredentials(@PathVariable Long providerId) {
        return ResponseEntity.ok(ApiResponse.ok(credentialRepository.findByProviderId(providerId)));
    }
}
