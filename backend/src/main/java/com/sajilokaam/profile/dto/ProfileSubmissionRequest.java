package com.sajilokaam.profile.dto;

public class ProfileSubmissionRequest {
    private boolean confirmTerms;
    private String additionalNotes;

    public boolean isConfirmTerms() {
        return confirmTerms;
    }

    public void setConfirmTerms(boolean confirmTerms) {
        this.confirmTerms = confirmTerms;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
}



