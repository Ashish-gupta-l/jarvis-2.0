package com.caretrail.repository;

import com.caretrail.model.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findByRecordId(Long recordId);
    List<VerificationRequest> findByTargetProviderId(Long targetProviderId);
    List<VerificationRequest> findByRequestStatus(String requestStatus);
}
