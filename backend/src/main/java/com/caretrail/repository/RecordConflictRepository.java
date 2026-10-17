package com.caretrail.repository;

import com.caretrail.model.entity.RecordConflict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordConflictRepository extends JpaRepository<RecordConflict, Long> {
    List<RecordConflict> findByPatientIdOrderByDetectedAtDesc(Long patientId);
    List<RecordConflict> findByPatientIdAndIsResolvedFalse(Long patientId);
    boolean existsByRecord1IdAndRecord2Id(Long record1Id, Long record2Id);
}
