package com.caretrail.dto;

import java.time.LocalDate;

public class OcrCorrectionRequest {
    private String correctedTitle;
    private LocalDate correctedDate;
    private String correctedProviderName;
    private String correctedFacilityName;
    private String correctedDocumentType;
    private String correctedDiagnoses;
    private String correctedMedications;
    private String correctedLabValues;
    private String userNotes;

    public OcrCorrectionRequest() {}

    public String getCorrectedTitle() { return correctedTitle; }
    public void setCorrectedTitle(String correctedTitle) { this.correctedTitle = correctedTitle; }

    public LocalDate getCorrectedDate() { return correctedDate; }
    public void setCorrectedDate(LocalDate correctedDate) { this.correctedDate = correctedDate; }

    public String getCorrectedProviderName() { return correctedProviderName; }
    public void setCorrectedProviderName(String correctedProviderName) { this.correctedProviderName = correctedProviderName; }

    public String getCorrectedFacilityName() { return correctedFacilityName; }
    public void setCorrectedFacilityName(String correctedFacilityName) { this.correctedFacilityName = correctedFacilityName; }

    public String getCorrectedDocumentType() { return correctedDocumentType; }
    public void setCorrectedDocumentType(String correctedDocumentType) { this.correctedDocumentType = correctedDocumentType; }

    public String getCorrectedDiagnoses() { return correctedDiagnoses; }
    public void setCorrectedDiagnoses(String correctedDiagnoses) { this.correctedDiagnoses = correctedDiagnoses; }

    public String getCorrectedMedications() { return correctedMedications; }
    public void setCorrectedMedications(String correctedMedications) { this.correctedMedications = correctedMedications; }

    public String getCorrectedLabValues() { return correctedLabValues; }
    public void setCorrectedLabValues(String correctedLabValues) { this.correctedLabValues = correctedLabValues; }

    public String getUserNotes() { return userNotes; }
    public void setUserNotes(String userNotes) { this.userNotes = userNotes; }
}
