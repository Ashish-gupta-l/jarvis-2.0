package com.caretrail.dto;

import com.caretrail.model.entity.FollowUpTask;
import com.caretrail.model.entity.MedicalRecord;
import com.caretrail.model.entity.RecordConflict;
import java.util.List;

public class GapMapDto {

    public static class GapItem {
        private String category; // MISSING_SUPPORTING_DOCUMENT, CONFLICT, UNRESOLVED_VERIFICATION, PENDING_FOLLOW_UP, NEEDS_HUMAN_REVIEW
        private String severity; // HIGH, MEDIUM, LOW
        private String title;
        private String explanation;
        private Long relatedRecordId;
        private String disclaimer = "Notice: A missing document or unverified record indicates an information gap; it does not prove that clinical treatment was omitted.";

        public GapItem() {}

        public GapItem(String category, String severity, String title, String explanation, Long relatedRecordId) {
            this.category = category;
            this.severity = severity;
            this.title = title;
            this.explanation = explanation;
            this.relatedRecordId = relatedRecordId;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public Long getRelatedRecordId() { return relatedRecordId; }
        public void setRelatedRecordId(Long relatedRecordId) { this.relatedRecordId = relatedRecordId; }
        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }

    private Long patientId;
    private int totalGapsCount;
    private List<GapItem> missingSupportingDocs;
    private List<RecordConflict> conflictingInformation;
    private List<MedicalRecord> unverifiedRecords;
    private List<FollowUpTask> unconfirmedFollowUps;
    private List<MedicalRecord> pendingReviewRecords;

    public GapMapDto() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public int getTotalGapsCount() { return totalGapsCount; }
    public void setTotalGapsCount(int totalGapsCount) { this.totalGapsCount = totalGapsCount; }
    public List<GapItem> getMissingSupportingDocs() { return missingSupportingDocs; }
    public void setMissingSupportingDocs(List<GapItem> missingSupportingDocs) { this.missingSupportingDocs = missingSupportingDocs; }
    public List<RecordConflict> getConflictingInformation() { return conflictingInformation; }
    public void setConflictingInformation(List<RecordConflict> conflictingInformation) { this.conflictingInformation = conflictingInformation; }
    public List<MedicalRecord> getUnverifiedRecords() { return unverifiedRecords; }
    public void setUnverifiedRecords(List<MedicalRecord> unverifiedRecords) { this.unverifiedRecords = unverifiedRecords; }
    public List<FollowUpTask> getUnconfirmedFollowUps() { return unconfirmedFollowUps; }
    public void setUnconfirmedFollowUps(List<FollowUpTask> unconfirmedFollowUps) { this.unconfirmedFollowUps = unconfirmedFollowUps; }
    public List<MedicalRecord> getPendingReviewRecords() { return pendingReviewRecords; }
    public void setPendingReviewRecords(List<MedicalRecord> pendingReviewRecords) { this.pendingReviewRecords = pendingReviewRecords; }
}
