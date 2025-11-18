package com.sajilokaam.team;

import com.sajilokaam.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "freelancer_team_members", indexes = {
        @Index(name = "idx_team_member_role", columnList = "team_role"),
        @Index(name = "idx_team_member_status", columnList = "status")
})
public class FreelancerTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private FreelancerTeam team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "team_role", nullable = false, length = 50)
    private String teamRole = "MEMBER";

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FreelancerTeam getTeam() {
        return team;
    }

    public void setTeam(FreelancerTeam team) {
        this.team = team;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTeamRole() {
        return teamRole;
    }

    public void setTeamRole(String teamRole) {
        this.teamRole = teamRole;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}

