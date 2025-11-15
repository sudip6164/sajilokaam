package com.sajilokaam.auth;

import com.sajilokaam.role.Role;
import java.util.Set;

public class UserProfile {
    private Long id;
    private String email;
    private String fullName;
    private Set<Role> roles;

    public UserProfile() {}
    public UserProfile(Long id, String email, String fullName) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
    }
    public UserProfile(Long id, String email, String fullName, Set<Role> roles) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}


