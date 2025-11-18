package com.sajilokaam.team;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FreelancerTeamMemberRepository extends JpaRepository<FreelancerTeamMember, Long> {
    List<FreelancerTeamMember> findByUser_Id(Long userId);
    List<FreelancerTeamMember> findByTeam_Id(Long teamId);
    boolean existsByTeam_IdAndUser_Id(Long teamId, Long userId);
}

