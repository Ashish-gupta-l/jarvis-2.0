package com.caretrail.repository;

import com.caretrail.model.entity.PatientProfile;
import com.caretrail.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUser(User user);
    Optional<PatientProfile> findByUserId(Long userId);
    Optional<PatientProfile> findByNationalHealthId(String nationalHealthId);
}
