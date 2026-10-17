package com.caretrail.service;

import com.caretrail.model.entity.AccessAuditLog;
import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.model.entity.User;
import com.caretrail.repository.AccessAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);
    private final AccessAuditLogRepository auditLogRepository;

    public AuditLogService(AccessAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logEvent(User actor, User targetPatient, MedicalRecord record, String action, String ipAddress, String userAgent, String details) {
        try {
            AccessAuditLog log = new AccessAuditLog();
            log.setUser(actor);
            log.setPatient(targetPatient != null ? targetPatient : (record != null ? record.getPatient() : null));
            log.setRecord(record);
            log.setAction(action);
            log.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
            log.setUserAgent(userAgent != null ? (userAgent.length() > 200 ? userAgent.substring(0, 200) : userAgent) : "Unknown");
            log.setDetails(details);
            log.setTimestamp(Instant.now());
            auditLogRepository.save(log);
            logger.info("AUDIT: action={}, user={}, targetPatient={}, recordId={}",
                    action,
                    actor != null ? actor.getUsername() : "ANONYMOUS",
                    targetPatient != null ? targetPatient.getId() : "NONE",
                    record != null ? record.getId() : "NONE");
        } catch (Exception e) {
            logger.error("Failed to write audit log event: {}", e.getMessage(), e);
        }
    }

    public List<AccessAuditLog> getAuditLogsForPatient(Long patientId) {
        return auditLogRepository.findByPatientIdOrderByTimestampDesc(patientId);
    }

    public List<AccessAuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
