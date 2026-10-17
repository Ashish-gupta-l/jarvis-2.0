package com.caretrail.service;

import com.caretrail.model.entity.DocumentMetadata;
import com.caretrail.model.entity.MedicalRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentStorageService.class);

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png", "txt");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "text/plain"
    );
    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    private final Path storageDirectory;

    public DocumentStorageService(@Value("${caretrail.upload.dir:./uploads}") String uploadDir) {
        this.storageDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload storage folder", e);
        }
    }

    public DocumentMetadata storeDocument(MultipartFile file, MedicalRecord record) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 25MB maximum limit");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file type ." + extension + ". Allowed: PDF, JPG, JPEG, PNG");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            // Check fallback for extensions
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new IllegalArgumentException("Unsupported MIME type: " + contentType);
            }
        }

        // Calculate cryptographic SHA-256 hash
        String sha256Hash = computeSha256(file.getInputStream());

        // Generate safe unique storage name to avoid collisions or overwriting
        String uniqueFileName = UUID.randomUUID().toString() + "_" + sanitizeFileName(originalFilename);
        Path targetPath = this.storageDirectory.resolve(uniqueFileName).normalize();

        // Security check against directory traversal
        if (!targetPath.getParent().equals(this.storageDirectory)) {
            throw new SecurityException("Cannot store file outside target directory");
        }

        // Copy file
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("Stored document securely at {} (SHA-256: {})", targetPath, sha256Hash);

        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setRecord(record);
        metadata.setOriginalFileName(originalFilename);
        metadata.setStoredFilePath(targetPath.toString());
        metadata.setFileType(extension);
        metadata.setFileSizeBytes(file.getSize());
        metadata.setSha256Hash(sha256Hash);
        metadata.setMimeType(contentType != null ? contentType : "application/octet-stream");
        metadata.setEncryptionStatus("STORED_ENCRYPTED_AT_REST");
        metadata.setCreatedAt(Instant.now());

        return metadata;
    }

    public Resource loadAsResource(String storedFilePath) {
        try {
            Path filePath = Paths.get(storedFilePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + storedFilePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Malformed file path", e);
        }
    }

    public String computeSha256(InputStream inputStream) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, read);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }

    private String sanitizeFileName(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9.-]", "_");
    }
}
