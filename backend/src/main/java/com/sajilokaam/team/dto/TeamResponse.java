package com.sajilokaam.team.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class TeamResponse {
    private Long id;
    private String name;
    private String description;
    private Instant createdAt;
    private LeadSummary lead;
    private List<TeamMemberResponse> members = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public LeadSummary getLead() {
        return lead;
    }

    public void setLead(LeadSummary lead) {
        this.lead = lead;
    }

    public List<TeamMemberResponse> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberResponse> members) {
        this.members = members;
    }

    public static class LeadSummary {
        private Long id;
        private String fullName;
        private String email;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}

