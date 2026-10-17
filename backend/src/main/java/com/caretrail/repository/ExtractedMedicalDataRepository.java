package com.caretrail.repository;

import com.caretrail.model.entity.ExtractedMedicalData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExtractedMedicalDataRepository extends JpaRepository<ExtractedMedicalData, Long> {
    Optional<ExtractedMedicalData> findByRecordId(Long recordId);
}
