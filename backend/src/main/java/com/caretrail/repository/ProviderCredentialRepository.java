package com.caretrail.repository;

import com.caretrail.model.entity.HealthcareProvider;
import com.caretrail.model.entity.ProviderCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderCredentialRepository extends JpaRepository<ProviderCredential, Long> {
    List<ProviderCredential> findByProvider(HealthcareProvider provider);
    List<ProviderCredential> findByProviderId(Long providerId);
}
