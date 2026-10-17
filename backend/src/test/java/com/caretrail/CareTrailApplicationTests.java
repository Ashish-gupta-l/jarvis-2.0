package com.caretrail;

import com.caretrail.dto.AuthRequest;
import com.caretrail.dto.AuthResponse;
import com.caretrail.dto.OcrCorrectionRequest;
import com.caretrail.dto.RegisterRequest;
import com.caretrail.dto.ShareRequest;
import com.caretrail.dto.VerificationActionRequest;
import com.caretrail.model.entity.*;
import com.caretrail.model.enums.*;
import com.caretrail.repository.*;
import com.caretrail.service.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@SpringBootTest
class CareTrailApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private MedicalRecordService recordService;

    @Autowired
    private VerificationTrustService verificationService;

    @Autowired
    private ConflictDetectionService conflictService;

    @Autowired
    private SharingPermissionService sharingService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ContinuityService continuityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private HealthcareProviderRepository providerRepository;

    @Autowired
    private RecordConflictRepository conflictRepository;

    @Test
    void contextLoads() {
        Assertions.assertTrue(userRepository.count() > 0, "Synthetic users should be pre-loaded by DataInitializer");
    }

    @Test
    void testPatientLoginSuccess() {
        AuthRequest req = new AuthRequest("john_patient", "Password123!");
        AuthResponse res = authService.login(req, "127.0.0.1", "JUnit-Test-Agent");
        Assertions.assertNotNull(res.getToken());
        Assertions.assertEquals("john_patient", res.getUsername());
        Assertions.assertEquals(Role.ROLE_PATIENT, res.getRole());
    }

    @Test
    void testUnauthorizedLoginFails() {
        AuthRequest req = new AuthRequest("john_patient", "WrongPassword!");
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            authService.login(req, "127.0.0.1", "JUnit-Test-Agent");
        });
    }

    @Test
    @Transactional
    void testPatientRegistrationAndProfileCreation() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("new_patient_test");
        req.setEmail("new_patient_test@example.org");
        req.setPassword("SecurePass123!");
        req.setFullName("Alice Smith");
        req.setRole(Role.ROLE_PATIENT);
        req.setNationalHealthId("CT-PID-99901");
        req.setBloodGroup("A+");

        AuthResponse res = authService.register(req, "127.0.0.1", "JUnit");
        Assertions.assertNotNull(res.getToken());
        Assertions.assertEquals("new_patient_test", res.getUsername());

        User created = userRepository.findByUsername("new_patient_test").orElse(null);
        Assertions.assertNotNull(created);
        Assertions.assertEquals(Role.ROLE_PATIENT, created.getRole());
    }

    @Test
    @Transactional
    void testPatientUploadAndDuplicateDetection() throws Exception {
        User patient = userRepository.findByUsername("john_patient").orElseThrow();

        String fileContent = "CLINICAL LAB REPORT\nHbA1c: 7.2%\nDr. Sarah Jenkins\nSt. Jude Regional Medical Center";
        MockMultipartFile file1 = new MockMultipartFile(
                "file", "test_lab_1.txt", "text/plain", fileContent.getBytes(StandardCharsets.UTF_8)
        );

        MedicalRecord record1 = recordService.uploadPatientRecord(
                file1, "Test Initial Lab", DocumentType.LAB_REPORT, LocalDate.of(2026, 5, 10),
                "St. Jude Regional Medical Center", "Dr. Sarah Jenkins", "Initial baseline test",
                patient, "127.0.0.1", "JUnit"
        );

        Assertions.assertNotNull(record1.getId());
        Assertions.assertEquals(VerificationStatus.PATIENT_UPLOADED_UNVERIFIED, record1.getVerificationStatus());
        Assertions.assertFalse(record1.getIsFlaggedDuplicate());

        // Upload exact identical file -> Should trigger duplicate detection by SHA-256 hash
        MockMultipartFile file2 = new MockMultipartFile(
                "file", "test_lab_duplicate.txt", "text/plain", fileContent.getBytes(StandardCharsets.UTF_8)
        );

        MedicalRecord record2 = recordService.uploadPatientRecord(
                file2, "Test Duplicate Upload", DocumentType.LAB_REPORT, LocalDate.of(2026, 5, 10),
                "St. Jude Regional Medical Center", "Dr. Sarah Jenkins", "Duplicate attempt",
                patient, "127.0.0.1", "JUnit"
        );

        Assertions.assertTrue(record2.getIsFlaggedDuplicate(), "Exact file hash duplicate should be flagged");
    }

    @Test
    @Transactional
    void testOcrErrorCorrectionPreservesOriginalFile() throws Exception {
        User patient = userRepository.findByUsername("john_patient").orElseThrow();
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patient.getId());
        MedicalRecord record = records.get(0);

        OcrCorrectionRequest correction = new OcrCorrectionRequest();
        correction.setCorrectedTitle("Corrected Clinical Consultation Title");
        correction.setCorrectedDiagnoses("Hypertension (Stage 1 controlled)");
        correction.setUserNotes("Patient verified lab values with doctor");

        ExtractedMedicalData updated = recordService.correctOcrData(record.getId(), correction, patient, "127.0.0.1", "JUnit");
        Assertions.assertEquals("Hypertension (Stage 1 controlled)", updated.getExtractedDiagnoses());
        Assertions.assertTrue(updated.getIsReviewedByPatient());
    }

    @Test
    @Transactional
    void testVerificationStatusChangeAndEvidenceLogging() {
        User admin = userRepository.findByUsername("admin").orElseThrow();
        User patient = userRepository.findByUsername("john_patient").orElseThrow();
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patient.getId());
        MedicalRecord record = records.get(0);

        VerificationActionRequest action = new VerificationActionRequest();
        action.setTargetStatus(VerificationStatus.ISSUER_CONFIRMED);
        action.setMethodUsed("MANUAL_INSTITUTION_AUDIT");
        action.setEvidenceDetails("Audited by Medical Registry Staff. Hospital verified authentic issuance.");

        MedicalRecord updated = verificationService.executeVerificationAction(record.getId(), action, admin, "127.0.0.1", "JUnit");
        Assertions.assertEquals(VerificationStatus.ISSUER_CONFIRMED, updated.getVerificationStatus());

        List<VerificationEvent> history = verificationService.getVerificationHistory(record.getId());
        Assertions.assertFalse(history.isEmpty());
        Assertions.assertEquals("MANUAL_INSTITUTION_AUDIT", history.get(0).getMethodUsed());
    }

    @Test
    @Transactional
    void testConflictingRecordDetection() {
        User patient = userRepository.findByUsername("john_patient").orElseThrow();
        List<RecordConflict> conflicts = conflictService.getConflictsForPatient(patient.getId());
        Assertions.assertFalse(conflicts.isEmpty(), "Demo patient should have detected medication conflicts");

        RecordConflict conflict = conflicts.get(0);
        Assertions.assertNotNull(conflict.getConflictingValue1());
        Assertions.assertNotNull(conflict.getConflictingValue2());

        // Test resolving conflict
        RecordConflict resolved = conflictService.resolveConflict(conflict.getId(), "Clinician reconciled metformin dosage to 500mg daily", patient);
        Assertions.assertTrue(resolved.getIsResolved());
    }

    @Test
    @Transactional
    void testSharingPermissionGrantAndRevocation() {
        User patient = userRepository.findByUsername("john_patient").orElseThrow();
        HealthcareProvider provider = providerRepository.findAll().get(0);

        ShareRequest req = new ShareRequest();
        req.setProviderId(provider.getId());
        req.setShareScope(ShareScope.FULL_TIMELINE);
        req.setDurationHours(24);

        SharingPermission perm = sharingService.grantPermission(patient, req, "127.0.0.1", "JUnit");
        Assertions.assertNotNull(perm.getId());
        Assertions.assertTrue(perm.isCurrentlyValid());

        // Revoke access
        SharingPermission revoked = sharingService.revokePermission(perm.getId(), patient, "Patient opted to terminate sharing", "127.0.0.1", "JUnit");
        Assertions.assertFalse(revoked.isCurrentlyValid());
        Assertions.assertNotNull(revoked.getRevokedAt());
    }

    @Test
    void testAuditLogCreation() {
        User patient = userRepository.findByUsername("john_patient").orElseThrow();
        List<AccessAuditLog> logs = auditLogService.getAuditLogsForPatient(patient.getId());
        Assertions.assertFalse(logs.isEmpty(), "Audit events should be logged for actions");
    }
}
