package com.caretrail.repository;

import com.caretrail.model.entity.AccessAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccessAuditLogRepository extends JpaRepository<AccessAuditLog, Long> {
    List<AccessAuditLog> findByPatientIdOrderByTimestampDesc(Long patientId);
    List<AccessAuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<AccessAuditLog> findAllByOrderByTimestampDesc();
}
