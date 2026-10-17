package com.caretrail.repository;

import com.caretrail.model.entity.FollowUpTask;
import com.caretrail.model.enums.FollowUpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpTaskRepository extends JpaRepository<FollowUpTask, Long> {
    List<FollowUpTask> findByPatientIdOrderByDueDateAsc(Long patientId);
    List<FollowUpTask> findByPatientIdAndStatus(Long patientId, FollowUpStatus status);
}
