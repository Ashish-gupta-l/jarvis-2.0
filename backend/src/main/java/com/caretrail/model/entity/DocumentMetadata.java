package com.caretrail.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "document_metadata")
public class DocumentMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false, unique = true)
    private MedicalRecord record;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @JsonIgnore
    @Column(name = "stored_file_path", nullable = false, length = 500)
    private String storedFilePath;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "sha256_hash", nullable = false, length = 64)
    private String sha256Hash;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "has_digital_signature")
    private Boolean hasDigitalSignature = false;

    @Column(name = "signature_issuer")
    private String signatureIssuer;

    @Column(name = "qr_code_payload", columnDefinition = "TEXT")
    private String qrCodePayload;

    @Column(name = "encryption_status", length = 50)
    private String encryptionStatus = "STORED_ENCRYPTED_AT_REST";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public DocumentMetadata() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicalRecord getRecord() { return record; }
    public void setRecord(MedicalRecord record) { this.record = record; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFilePath() { return storedFilePath; }
    public void setStoredFilePath(String storedFilePath) { this.storedFilePath = storedFilePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getSha256Hash() { return sha256Hash; }
    public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Boolean getHasDigitalSignature() { return hasDigitalSignature; }
    public void setHasDigitalSignature(Boolean hasDigitalSignature) { this.hasDigitalSignature = hasDigitalSignature; }

    public String getSignatureIssuer() { return signatureIssuer; }
    public void setSignatureIssuer(String signatureIssuer) { this.signatureIssuer = signatureIssuer; }

    public String getQrCodePayload() { return qrCodePayload; }
    public void setQrCodePayload(String qrCodePayload) { this.qrCodePayload = qrCodePayload; }

    public String getEncryptionStatus() { return encryptionStatus; }
    public void setEncryptionStatus(String encryptionStatus) { this.encryptionStatus = encryptionStatus; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
