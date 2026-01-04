package com.sajilokaam.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sajilokaam.role.Role;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true)
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    @JsonIgnore
    private String password;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"users"})
    private Set<Role> roles = new HashSet<>();

    @Column(name = "reset_token", length = 255)
    @JsonIgnore
    private String resetToken;

    @Column(name = "reset_token_expires_at")
    @JsonIgnore
    private Instant resetTokenExpiresAt;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "verification_token", length = 255)
    @JsonIgnore
    private String verificationToken;

    @Column(name = "verification_token_expires_at")
    @JsonIgnore
    private Instant verificationTokenExpiresAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public Instant getResetTokenExpiresAt() { return resetTokenExpiresAt; }
    public void setResetTokenExpiresAt(Instant resetTokenExpiresAt) { this.resetTokenExpiresAt = resetTokenExpiresAt; }
    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }
    public Instant getVerificationTokenExpiresAt() { return verificationTokenExpiresAt; }
    public void setVerificationTokenExpiresAt(Instant verificationTokenExpiresAt) { this.verificationTokenExpiresAt = verificationTokenExpiresAt; }
}


