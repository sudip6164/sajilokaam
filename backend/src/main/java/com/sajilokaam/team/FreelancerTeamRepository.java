package com.sajilokaam.team;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FreelancerTeamRepository extends JpaRepository<FreelancerTeam, Long> {
    List<FreelancerTeam> findByLead_Id(Long leadId);
    List<FreelancerTeam> findByIdIn(List<Long> ids);
}

