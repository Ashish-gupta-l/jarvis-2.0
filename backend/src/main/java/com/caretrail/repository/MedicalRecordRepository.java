package com.caretrail.repository;

import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.model.entity.User;
import com.caretrail.model.enums.DocumentType;
import com.caretrail.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientOrderByRecordDateDesc(User patient);
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);
    List<MedicalRecord> findByProviderIdOrderByRecordDateDesc(Long providerId);

    @Query("SELECT r FROM MedicalRecord r WHERE r.patient.id = :patientId " +
           "AND (:docType IS NULL OR r.documentType = :docType) " +
           "AND (:startDate IS NULL OR r.recordDate >= :startDate) " +
           "AND (:endDate IS NULL OR r.recordDate <= :endDate) " +
           "AND (:searchQuery IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
           "    OR LOWER(r.issuingFacility) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
           "    OR LOWER(r.attendingPhysician) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
           "    OR LOWER(r.notes) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
           "    OR (r.extractedMedicalData IS NOT NULL AND LOWER(r.extractedMedicalData.rawExtractedText) LIKE LOWER(CONCAT('%', :searchQuery, '%')))) " +
           "ORDER BY r.recordDate DESC")
    List<MedicalRecord> searchPatientRecords(
            @Param("patientId") Long patientId,
            @Param("docType") DocumentType docType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("searchQuery") String searchQuery);

    List<MedicalRecord> findByPatientIdAndVerificationStatus(Long patientId, VerificationStatus verificationStatus);
    List<MedicalRecord> findByPatientIdAndIsFlaggedDuplicateTrue(Long patientId);

    List<MedicalRecord> findByPatientIdAndRecordDate(Long patientId, LocalDate recordDate);
}
