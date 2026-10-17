package com.caretrail.config;

import com.caretrail.model.entity.*;
import com.caretrail.model.enums.*;
import com.caretrail.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PatientProfileRepository profileRepository;
    private final HealthcareProviderRepository providerRepository;
    private final ProviderCredentialRepository credentialRepository;
    private final MedicalRecordRepository recordRepository;
    private final DocumentMetadataRepository metadataRepository;
    private final ExtractedMedicalDataRepository extractedDataRepository;
    private final VerificationEventRepository verificationEventRepository;
    private final RecordConflictRepository conflictRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final SharingPermissionRepository sharingPermissionRepository;
    private final AccessAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${caretrail.upload.dir:./uploads}")
    private String uploadDir;

    public DataInitializer(UserRepository userRepository,
                           PatientProfileRepository profileRepository,
                           HealthcareProviderRepository providerRepository,
                           ProviderCredentialRepository credentialRepository,
                           MedicalRecordRepository recordRepository,
                           DocumentMetadataRepository metadataRepository,
                           ExtractedMedicalDataRepository extractedDataRepository,
                           VerificationEventRepository verificationEventRepository,
                           RecordConflictRepository conflictRepository,
                           FollowUpTaskRepository followUpTaskRepository,
                           SharingPermissionRepository sharingPermissionRepository,
                           AccessAuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.providerRepository = providerRepository;
        this.credentialRepository = credentialRepository;
        this.recordRepository = recordRepository;
        this.metadataRepository = metadataRepository;
        this.extractedDataRepository = extractedDataRepository;
        this.verificationEventRepository = verificationEventRepository;
        this.conflictRepository = conflictRepository;
        this.followUpTaskRepository = followUpTaskRepository;
        this.sharingPermissionRepository = sharingPermissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database already contains data; skipping initial demo dataset population.");
            return;
        }

        logger.info("Initializing CareTrail with synthetic demonstration scenario...");
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // 1. Create Admin User
        User admin = new User("admin", "admin@caretrail.internal", passwordEncoder.encode("AdminPass123!"), "Administrator (Security Operations)", Role.ROLE_ADMIN);
        admin = userRepository.save(admin);

        // 2. Create Healthcare Providers
        // Provider 1: St. Jude Regional Medical Center (Verified)
        User doctor1User = new User("dr_sarah", "s.jenkins@stjude-health.org", passwordEncoder.encode("DoctorPass123!"), "Dr. Sarah Jenkins, MD", Role.ROLE_PROVIDER);
        doctor1User = userRepository.save(doctor1User);

        HealthcareProvider provider1 = new HealthcareProvider();
        provider1.setUser(doctor1User);
        provider1.setInstitutionName("St. Jude Regional Medical Center");
        provider1.setDepartment("Cardiovascular Medicine");
        provider1.setLicenseNumber("MD-CARDIO-88492");
        provider1.setSpecialization("Interventional Cardiology");
        provider1.setContactEmail("records@stjude-health.org");
        provider1.setOfficeAddress("450 Healthcare Boulevard, Suite 300, Metro City");
        provider1.setVerificationStatus("VERIFIED");
        provider1.setVerifiedAt(Instant.now());
        provider1.setVerifiedBy(admin);
        provider1 = providerRepository.save(provider1);

        ProviderCredential cred1 = new ProviderCredential();
        cred1.setProvider(provider1);
        cred1.setCredentialType("STATE_MEDICAL_BOARD_LICENSE");
        cred1.setIssuerAuthority("State Board of Medical Examiners");
        cred1.setDocumentRef("SBME-2024-88492");
        cred1.setIssueDate(LocalDate.of(2020, 1, 15));
        cred1.setExpiryDate(LocalDate.of(2028, 1, 15));
        cred1.setVerificationEvidence("Cryptographically verified against State Medical Registry API on 2024-03-01.");
        cred1.setIsVerified(true);
        credentialRepository.save(cred1);

        // Provider 2: Metro Health Diagnostic & Imaging Center (Verified)
        User doctor2User = new User("dr_chen", "r.chen@metrohealth-labs.org", passwordEncoder.encode("DoctorPass123!"), "Dr. Robert Chen, MD", Role.ROLE_PROVIDER);
        doctor2User = userRepository.save(doctor2User);

        HealthcareProvider provider2 = new HealthcareProvider();
        provider2.setUser(doctor2User);
        provider2.setInstitutionName("Metro Health Diagnostic Center");
        provider2.setDepartment("Clinical Pathology & Laboratory Services");
        provider2.setLicenseNumber("CLIA-LAB-99214");
        provider2.setSpecialization("Diagnostic Pathology");
        provider2.setContactEmail("lab-dispatch@metrohealth-labs.org");
        provider2.setOfficeAddress("100 Innovation Way, Building B, Metro City");
        provider2.setVerificationStatus("VERIFIED");
        provider2.setVerifiedAt(Instant.now());
        provider2.setVerifiedBy(admin);
        provider2 = providerRepository.save(provider2);

        // Provider 3: Apex Urgent Care & Community Clinic (Pending Review)
        User doctor3User = new User("dr_emily", "e.davis@apex-urgentcare.org", passwordEncoder.encode("DoctorPass123!"), "Dr. Emily Davis, DO", Role.ROLE_PROVIDER);
        doctor3User = userRepository.save(doctor3User);

        HealthcareProvider provider3 = new HealthcareProvider();
        provider3.setUser(doctor3User);
        provider3.setInstitutionName("Apex Urgent Care & Community Clinic");
        provider3.setDepartment("Urgent Care & Family Practice");
        provider3.setLicenseNumber("DO-FAM-77143");
        provider3.setSpecialization("Family Medicine");
        provider3.setContactEmail("verification@apex-urgentcare.org");
        provider3.setOfficeAddress("78 Suburban Plaza, Metro City");
        provider3.setVerificationStatus("PENDING"); // For admin verification demo
        provider3 = providerRepository.save(provider3);

        // 3. Create Demonstration Patient
        User patient = new User("john_patient", "john.doe@patient-mail.org", passwordEncoder.encode("Password123!"), "John Doe", Role.ROLE_PATIENT);
        patient.setPhoneNumber("+1 (555) 234-5678");
        patient = userRepository.save(patient);

        PatientProfile profile = new PatientProfile();
        profile.setUser(patient);
        profile.setDateOfBirth(LocalDate.of(1982, 5, 14));
        profile.setGender("Male");
        profile.setBloodGroup("O+");
        profile.setNationalHealthId("CT-PID-100452");
        profile.setEmergencyContactName("Mary Doe (Spouse)");
        profile.setEmergencyContactPhone("+1 (555) 234-5679");
        profile.setKnownAllergies("Penicillin (severe cutaneous anaphylactoid reaction)");
        profile.setChronicConditions("Essential Hypertension; Impaired Fasting Glycemia");
        profileRepository.save(profile);

        // 4. Create Medical Records demonstrating the 18 Features & Conflicts
        // Record 1: Cardiology Consultation (St. Jude) - ISSUER_CONFIRMED
        MedicalRecord rec1 = createSyntheticRecord(
                patient, doctor1User, provider1,
                "Cardiology Comprehensive Consultation",
                DocumentType.CONSULTATION,
                LocalDate.of(2026, 3, 10),
                "St. Jude Regional Medical Center",
                "Dr. Sarah Jenkins, MD",
                VerificationStatus.ISSUER_CONFIRMED,
                "Patient presented with intermittent exertional dyspnea and elevated blood pressure readings at home. EKG shows normal sinus rhythm. Prescribed Metformin 500mg daily and Lisinopril 10mg daily.",
                "Essential Hypertension; Impaired Glucose Tolerance",
                "Metformin 500mg daily; Lisinopril 10mg daily",
                "Blood Pressure: 138/86 mmHg; Resting Heart Rate: 72 bpm",
                uploadPath, "st_jude_consultation_20260310.txt"
        );

        // Record 2: Scanned paper prescription from Apex Urgent Care uploaded by patient
        // Status: PATIENT_UPLOADED_UNVERIFIED
        // Intentionally introduces CONFLICTING MEDICATION: Metformin 1000mg twice daily (conflicts with 500mg) and Warfarin 5mg daily!
        MedicalRecord rec2 = createSyntheticRecord(
                patient, patient, null,
                "Urgent Care Prescription & Clinical Note",
                DocumentType.PRESCRIPTION,
                LocalDate.of(2026, 6, 15),
                "Apex Urgent Care & Community Clinic",
                "Dr. Emily Davis, DO",
                VerificationStatus.PATIENT_UPLOADED_UNVERIFIED,
                "Patient seen for acute bronchitis and lower extremity aching. Prescribed high-dose Metformin 1000mg twice daily and Warfarin 5mg daily. Note: Scanned paper certificate uploaded by patient.",
                "Acute Bronchitis; Deep Vein Thrombosis (Suspected)",
                "Metformin 1000mg twice daily; Warfarin 5mg daily; Amoxicillin 500mg",
                "Oxygen Saturation: 97%; Temp: 98.6 F",
                uploadPath, "apex_prescription_scanned_paper.txt"
        );

        // Record 3: Laboratory Blood Panel (Metro Health Diagnostics) - DIGITALLY_SIGNED_VALIDATED
        MedicalRecord rec3 = createSyntheticRecord(
                patient, doctor2User, provider2,
                "Comprehensive Metabolic Panel & Glycated Hemoglobin",
                DocumentType.LAB_REPORT,
                LocalDate.of(2026, 8, 20),
                "Metro Health Diagnostic Center",
                "Dr. Robert Chen, MD",
                VerificationStatus.DIGITALLY_SIGNED_VALIDATED,
                "Standard fasting blood panel. Specimen collected under verified CLIA protocols. Cryptographic digital signature validated by hospital PKI infrastructure.",
                "Type 2 Diabetes Mellitus; Hyperlipidemia",
                "Metformin (continuation recommended)",
                "HbA1c: 6.9%; Fasting Blood Glucose: 134 mg/dL; Serum Creatinine: 1.0 mg/dL; eGFR: >60 mL/min; Total Cholesterol: 215 mg/dL",
                uploadPath, "metro_health_lab_report_signed.txt"
        );

        // Record 4: Hospital Inpatient Discharge Summary (St. Jude) - ISSUER_CONFIRMED
        MedicalRecord rec4 = createSyntheticRecord(
                patient, doctor1User, provider1,
                "Inpatient Hospital Discharge Summary",
                DocumentType.DISCHARGE_SUMMARY,
                LocalDate.of(2026, 9, 2),
                "St. Jude Regional Medical Center",
                "Dr. Sarah Jenkins, MD",
                VerificationStatus.ISSUER_CONFIRMED,
                "Patient discharged following 48-hour observation for chest tightness. Ruled out acute coronary syndrome. Follow-up plan: mandatory repeat HbA1c panel and outpatient transthoracic echocardiogram in 4 weeks.",
                "Hypertensive Urgency (Resolved); Type 2 Diabetes Mellitus",
                "Lisinopril 20mg daily; Atorvastatin 20mg daily; Metformin 500mg daily",
                "Troponin T: <0.01 ng/mL (Normal); Ejection Fraction: 55%",
                uploadPath, "st_jude_discharge_summary.txt"
        );

        // 5. Create Demonstration Conflicts
        RecordConflict conflict1 = new RecordConflict();
        conflict1.setPatient(patient);
        conflict1.setRecord1(rec1);
        conflict1.setRecord2(rec2);
        conflict1.setConflictType(ConflictType.CONFLICTING_MEDICATION);
        conflict1.setDescription("Contradictory Metformin Regimen: Record #1 prescribes Metformin 500mg daily, whereas patient-uploaded paper record #2 prescribes Metformin 1000mg twice daily without documented titration.");
        conflict1.setConflictingValue1("Record #1 (St. Jude): Metformin 500mg daily");
        conflict1.setConflictingValue2("Record #2 (Apex Urgent Care): Metformin 1000mg twice daily");
        conflict1.setIsResolved(false);
        conflict1.setDetectedAt(Instant.now());
        conflictRepository.save(conflict1);

        RecordConflict conflict2 = new RecordConflict();
        conflict2.setPatient(patient);
        conflict2.setRecord1(rec2);
        conflict2.setRecord2(rec4);
        conflict2.setConflictType(ConflictType.CONFLICTING_MEDICATION);
        conflict2.setDescription("Unreconciled Anticoagulation: Record #2 documents Warfarin therapy, yet hospital discharge summary #4 omits anticoagulation without documented cessation rationale.");
        conflict2.setConflictingValue1("Record #2: Warfarin 5mg daily");
        conflict2.setConflictingValue2("Record #4: No anticoagulant listed on discharge medication reconciliation");
        conflict2.setIsResolved(false);
        conflict2.setDetectedAt(Instant.now());
        conflictRepository.save(conflict2);

        // 6. Create Follow-up tasks demonstrating the Follow-up Tracker & Gap Map
        FollowUpTask task1 = new FollowUpTask();
        task1.setPatient(patient);
        task1.setSourceRecord(rec4);
        task1.setTaskDescription("Repeat Outpatient Glycated Hemoglobin (HbA1c) Panel to assess glycemic control post-discharge");
        task1.setDueDate(LocalDate.of(2026, 10, 5));
        task1.setStatus(FollowUpStatus.UNCONFIRMED);
        task1.setCompletionNotes("Notice: Due date has elapsed with no confirmatory lab upload in CareTrail platform. Missing document does not guarantee test was omitted.");
        followUpTaskRepository.save(task1);

        FollowUpTask task2 = new FollowUpTask();
        task2.setPatient(patient);
        task2.setSourceRecord(rec4);
        task2.setTaskDescription("Outpatient Transthoracic Echocardiogram (TTE) follow-up at Cardiology Outpatient Center");
        task2.setDueDate(LocalDate.of(2026, 11, 15));
        task2.setStatus(FollowUpStatus.PENDING);
        task2.setCompletionNotes("Scheduled at St. Jude Cardiovascular Diagnostics");
        followUpTaskRepository.save(task2);

        // 7. Create Active Sharing Permission with Dr. Sarah Jenkins (Provider 1)
        SharingPermission sharingPermission = new SharingPermission();
        sharingPermission.setPatient(patient);
        sharingPermission.setProvider(provider1);
        sharingPermission.setShareScope(ShareScope.FULL_TIMELINE);
        sharingPermission.setIsActive(true);
        sharingPermission.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        sharingPermission.setCreatedAt(Instant.now());
        sharingPermissionRepository.save(sharingPermission);

        // 8. Create Initial Security Audit Entries
        auditLogRepository.save(new AccessAuditLog(patient, patient, null, "LOGIN_SUCCESS", "127.0.0.1", "Mozilla/5.0", "Patient logged in to portal"));
        auditLogRepository.save(new AccessAuditLog(patient, patient, rec2, "RECORD_UPLOAD", "127.0.0.1", "Mozilla/5.0", "Patient uploaded paper document: apex_prescription_scanned_paper.txt"));
        auditLogRepository.save(new AccessAuditLog(doctor1User, patient, rec1, "RECORD_UPLOAD", "127.0.0.1", "Mozilla/5.0", "Cardiology consultation filed by Dr. Sarah Jenkins"));
        auditLogRepository.save(new AccessAuditLog(patient, patient, null, "RECORD_SHARE", "127.0.0.1", "Mozilla/5.0", "Patient granted 7-day FULL_TIMELINE access to St. Jude Regional Medical Center"));

        logger.info("CareTrail synthetic demo scenario successfully initialized!");
    }

    private MedicalRecord createSyntheticRecord(User patient, User uploader, HealthcareProvider provider,
                                                String title, DocumentType type, LocalDate date,
                                                String facility, String physician, VerificationStatus status,
                                                String notes, String diag, String meds, String labs,
                                                Path uploadDir, String sampleFileName) throws IOException {

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setUploadedBy(uploader);
        record.setProvider(provider);
        record.setTitle(title);
        record.setDocumentType(type);
        record.setRecordDate(date);
        record.setIssuingFacility(facility);
        record.setAttendingPhysician(physician);
        record.setVerificationStatus(status);
        record.setNotes(notes);
        record.setCreatedAt(Instant.now());
        record.setUpdatedAt(Instant.now());
        record = recordRepository.save(record);

        // Write synthetic file to upload directory
        Path filePath = uploadDir.resolve(sampleFileName);
        String fileContent = "========================================================\n" +
                "CARE-TRAIL CLINICAL REPOSITORY DOCUMENT ARCHIVE\n" +
                "========================================================\n" +
                "FACILITY: " + facility + "\n" +
                "PHYSICIAN: " + physician + "\n" +
                "DOCUMENT TITLE: " + title + "\n" +
                "DATE OF RECORD: " + date + "\n" +
                "PATIENT: " + patient.getFullName() + " (ID: CT-PID-100452)\n" +
                "VERIFICATION STATUS: " + status.getDisplayName() + "\n\n" +
                "CLINICAL SUMMARY:\n" + notes + "\n\n" +
                "DIAGNOSES:\n" + diag + "\n\n" +
                "MEDICATIONS:\n" + meds + "\n\n" +
                "INVESTIGATIONS / LAB VALUES:\n" + labs + "\n\n" +
                "AUTHENTICITY METADATA:\n" +
                "Issuer Verification Channel: " + (provider != null ? "Direct EHR/EMR Integration" : "Patient Paper Scan Intake") + "\n" +
                "Digital Signature: " + (status == VerificationStatus.DIGITALLY_SIGNED_VALIDATED ? "SHA-256 with RSA-2048 PKI Verified" : "None / Unsigned Physical Certificate") + "\n" +
                "========================================================\n";

        try (FileWriter writer = new FileWriter(filePath.toFile())) {
            writer.write(fileContent);
        }

        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setRecord(record);
        metadata.setOriginalFileName(sampleFileName);
        metadata.setStoredFilePath(filePath.toString());
        metadata.setFileType("txt");
        metadata.setFileSizeBytes(Files.size(filePath));
        metadata.setSha256Hash(Integer.toHexString(sampleFileName.hashCode()) + "e4f8902b1c8a");
        metadata.setMimeType("text/plain");
        metadata.setHasDigitalSignature(status == VerificationStatus.DIGITALLY_SIGNED_VALIDATED);
        metadata.setSignatureIssuer(status == VerificationStatus.DIGITALLY_SIGNED_VALIDATED ? facility + " Digital Trust CA" : null);
        metadata.setEncryptionStatus("STORED_ENCRYPTED_AT_REST");
        metadata = metadataRepository.save(metadata);
        record.setDocumentMetadata(metadata);

        ExtractedMedicalData ext = new ExtractedMedicalData();
        ext.setRecord(record);
        ext.setRawExtractedText(fileContent);
        ext.setExtractedDate(date);
        ext.setExtractedProviderName(physician);
        ext.setExtractedFacilityName(facility);
        ext.setExtractedDocumentType(type.name());
        ext.setExtractedDiagnoses(diag);
        ext.setExtractedMedications(meds);
        ext.setExtractedLabValues(labs);
        ext.setIsReviewedByPatient(true);
        ext.setOcrConfidenceScore(0.96);
        ext = extractedDataRepository.save(ext);
        record.setExtractedMedicalData(ext);

        // Verification Event
        VerificationEvent event = new VerificationEvent();
        event.setRecord(record);
        event.setActorUser(uploader);
        event.setPreviousStatus("NONE");
        event.setNewStatus(status.name());
        event.setMethodUsed(provider != null ? "ISSUER_DIRECT_UPLOAD" : "INITIAL_PATIENT_SCAN");
        event.setEvidenceDetails("Document intake registered with status: " + status.getDisplayName());
        event.setCreatedAt(Instant.now());
        verificationEventRepository.save(event);

        return record;
    }
}
