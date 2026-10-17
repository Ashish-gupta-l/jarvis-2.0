package com.caretrail.repository;

import com.caretrail.model.entity.VerificationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationEventRepository extends JpaRepository<VerificationEvent, Long> {
    List<VerificationEvent> findByRecordIdOrderByCreatedAtDesc(Long recordId);
}
