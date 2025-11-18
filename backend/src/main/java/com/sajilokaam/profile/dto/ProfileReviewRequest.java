package com.sajilokaam.profile.dto;

import com.sajilokaam.profile.ProfileStatus;
import com.sajilokaam.profile.ProfileType;

public class ProfileReviewRequest {
    private ProfileType profileType;
    private ProfileStatus decision;
    private String verificationNotes;
    private String rejectionReason;

    public ProfileType getProfileType() {
        return profileType;
    }

    public void setProfileType(ProfileType profileType) {
        this.profileType = profileType;
    }

    public ProfileStatus getDecision() {
        return decision;
    }

    public void setDecision(ProfileStatus decision) {
        this.decision = decision;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}



