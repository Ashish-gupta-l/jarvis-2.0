package com.caretrail.controller;

import com.caretrail.dto.ApiResponse;
import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.model.entity.User;
import com.caretrail.model.enums.DocumentType;
import com.caretrail.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    private final MedicalRecordService recordService;

    public MedicalRecordController(MedicalRecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping(value = "/upload-patient", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MedicalRecord>> uploadPatientRecord(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "documentType", required = false) DocumentType documentType,
            @RequestParam(value = "recordDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordDate,
            @RequestParam(value = "issuingFacility", required = false) String issuingFacility,
            @RequestParam(value = "attendingPhysician", required = false) String attendingPhysician,
            @RequestParam(value = "notes", required = false) String notes,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) throws IOException {

        MedicalRecord record = recordService.uploadPatientRecord(
                file, title, documentType, recordDate, issuingFacility, attendingPhysician, notes,
                user, request.getRemoteAddr(), request.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.ok("Document uploaded and digitized successfully", record));
    }

    @PostMapping(value = "/upload-provider", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MedicalRecord>> uploadProviderRecord(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "documentType", required = false) DocumentType documentType,
            @RequestParam(value = "recordDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordDate,
            @RequestParam(value = "notes", required = false) String notes,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) throws IOException {

        MedicalRecord record = recordService.uploadProviderRecord(
                file, patientId, title, documentType, recordDate, notes,
                user, request.getRemoteAddr(), request.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.ok("Provider medical record uploaded successfully", record));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecord>> getRecordDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(recordService.getRecordDetails(id, user)));
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<Resource> viewOriginalDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {

        Resource resource = recordService.getOriginalDocumentResource(
                id, user, request.getRemoteAddr(), request.getHeader("User-Agent")
        );

        String contentType = "application/octet-stream";
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(resource);
    }
}
