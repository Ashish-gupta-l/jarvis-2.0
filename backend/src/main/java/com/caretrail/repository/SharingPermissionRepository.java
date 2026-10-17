package com.caretrail.repository;

import com.caretrail.model.entity.SharingPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SharingPermissionRepository extends JpaRepository<SharingPermission, Long> {
    List<SharingPermission> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<SharingPermission> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    @Query("SELECT p FROM SharingPermission p WHERE p.patient.id = :patientId " +
           "AND p.provider.id = :providerId " +
           "AND p.isActive = true " +
           "AND p.revokedAt IS NULL " +
           "AND p.expiresAt > :now")
    List<SharingPermission> findActivePermissions(
            @Param("patientId") Long patientId,
            @Param("providerId") Long providerId,
            @Param("now") Instant now);

    @Query("SELECT p FROM SharingPermission p WHERE p.provider.id = :providerId " +
           "AND p.isActive = true " +
           "AND p.revokedAt IS NULL " +
           "AND p.expiresAt > :now")
    List<SharingPermission> findAllActivePermissionsForProvider(
            @Param("providerId") Long providerId,
            @Param("now") Instant now);
}
