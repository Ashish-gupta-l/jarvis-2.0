package com.caretrail.dto;

import com.caretrail.model.entity.FollowUpTask;
import com.caretrail.model.entity.RecordConflict;
import java.time.LocalDate;
import java.util.List;

public class ContinuityBriefDto {

    public static class SourceLinkedClaim {
        private String claimType; // DIAGNOSIS, MEDICATION, LAB_FINDING, DISCHARGE_NOTE
        private String claimValue;
        private Long sourceRecordId;
        private String sourceRecordTitle;
        private LocalDate sourceDate;
        private String sourceFacility;
        private String verificationStatus;
        private boolean isUncertainOrUnverified;

        public SourceLinkedClaim() {}

        public SourceLinkedClaim(String claimType, String claimValue, Long sourceRecordId, String sourceRecordTitle,
                                 LocalDate sourceDate, String sourceFacility, String verificationStatus, boolean isUncertainOrUnverified) {
            this.claimType = claimType;
            this.claimValue = claimValue;
            this.sourceRecordId = sourceRecordId;
            this.sourceRecordTitle = sourceRecordTitle;
            this.sourceDate = sourceDate;
            this.sourceFacility = sourceFacility;
            this.verificationStatus = verificationStatus;
            this.isUncertainOrUnverified = isUncertainOrUnverified;
        }

        public String getClaimType() { return claimType; }
        public void setClaimType(String claimType) { this.claimType = claimType; }
        public String getClaimValue() { return claimValue; }
        public void setClaimValue(String claimValue) { this.claimValue = claimValue; }
        public Long getSourceRecordId() { return sourceRecordId; }
        public void setSourceRecordId(Long sourceRecordId) { this.sourceRecordId = sourceRecordId; }
        public String getSourceRecordTitle() { return sourceRecordTitle; }
        public void setSourceRecordTitle(String sourceRecordTitle) { this.sourceRecordTitle = sourceRecordTitle; }
        public LocalDate getSourceDate() { return sourceDate; }
        public void setSourceDate(LocalDate sourceDate) { this.sourceDate = sourceDate; }
        public String getSourceFacility() { return sourceFacility; }
        public void setSourceFacility(String sourceFacility) { this.sourceFacility = sourceFacility; }
        public String getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
        public boolean isUncertainOrUnverified() { return isUncertainOrUnverified; }
        public void setUncertainOrUnverified(boolean uncertainOrUnverified) { isUncertainOrUnverified = uncertainOrUnverified; }
    }

    private Long patientId;
    private String patientName;
    private String nationalHealthId;
    private String bloodGroup;
    private String allergies;
    private String chronicConditions;

    private List<SourceLinkedClaim> diagnoses;
    private List<SourceLinkedClaim> activePrescriptions;
    private List<SourceLinkedClaim> recentInvestigations;
    private List<SourceLinkedClaim> dischargeSummaries;
    private List<RecordConflict> unresolvedConflicts;
    private List<FollowUpTask> followUpTasks;
    private List<String> verificationLimitations;

    public ContinuityBriefDto() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getNationalHealthId() { return nationalHealthId; }
    public void setNationalHealthId(String nationalHealthId) { this.nationalHealthId = nationalHealthId; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }
    public List<SourceLinkedClaim> getDiagnoses() { return diagnoses; }
    public void setDiagnoses(List<SourceLinkedClaim> diagnoses) { this.diagnoses = diagnoses; }
    public List<SourceLinkedClaim> getActivePrescriptions() { return activePrescriptions; }
    public void setActivePrescriptions(List<SourceLinkedClaim> activePrescriptions) { this.activePrescriptions = activePrescriptions; }
    public List<SourceLinkedClaim> getRecentInvestigations() { return recentInvestigations; }
    public void setRecentInvestigations(List<SourceLinkedClaim> recentInvestigations) { this.recentInvestigations = recentInvestigations; }
    public List<SourceLinkedClaim> getDischargeSummaries() { return dischargeSummaries; }
    public void setDischargeSummaries(List<SourceLinkedClaim> dischargeSummaries) { this.dischargeSummaries = dischargeSummaries; }
    public List<RecordConflict> getUnresolvedConflicts() { return unresolvedConflicts; }
    public void setUnresolvedConflicts(List<RecordConflict> unresolvedConflicts) { this.unresolvedConflicts = unresolvedConflicts; }
    public List<FollowUpTask> getFollowUpTasks() { return followUpTasks; }
    public void setFollowUpTasks(List<FollowUpTask> followUpTasks) { this.followUpTasks = followUpTasks; }
    public List<String> getVerificationLimitations() { return verificationLimitations; }
    public void setVerificationLimitations(List<String> verificationLimitations) { this.verificationLimitations = verificationLimitations; }
}
