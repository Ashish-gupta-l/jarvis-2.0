package com.caretrail.repository;

import com.caretrail.model.entity.HealthcareProvider;
import com.caretrail.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthcareProviderRepository extends JpaRepository<HealthcareProvider, Long> {
    Optional<HealthcareProvider> findByUser(User user);
    Optional<HealthcareProvider> findByUserId(Long userId);
    Optional<HealthcareProvider> findByLicenseNumber(String licenseNumber);
    List<HealthcareProvider> findByVerificationStatus(String verificationStatus);
}
