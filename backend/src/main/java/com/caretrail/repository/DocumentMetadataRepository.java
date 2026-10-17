package com.caretrail.repository;

import com.caretrail.model.entity.DocumentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentMetadataRepository extends JpaRepository<DocumentMetadata, Long> {
    Optional<DocumentMetadata> findByRecordId(Long recordId);
    List<DocumentMetadata> findBySha256Hash(String sha256Hash);
    boolean existsBySha256Hash(String sha256Hash);
}
