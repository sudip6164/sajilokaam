package com.sajilokaam.team;

import com.sajilokaam.user.User;
import com.sajilokaam.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final FreelancerTeamRepository teamRepository;
    private final FreelancerTeamMemberRepository memberRepository;
    private final UserRepository userRepository;

    public TeamService(FreelancerTeamRepository teamRepository,
                       FreelancerTeamMemberRepository memberRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    public List<FreelancerTeam> getTeamsForUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        Long userId = user.getId();

        List<FreelancerTeam> leadTeams = teamRepository.findByLead_Id(userId);
        List<FreelancerTeamMember> memberships = memberRepository.findByUser_Id(userId);
        List<Long> memberTeamIds = memberships.stream()
                .map(member -> member.getTeam().getId())
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<FreelancerTeam> memberTeams = memberTeamIds.isEmpty()
                ? List.of()
                : teamRepository.findByIdIn(memberTeamIds);

        Map<Long, FreelancerTeam> merged = new LinkedHashMap<>();
        leadTeams.forEach(team -> merged.put(team.getId(), team));
        memberTeams.forEach(team -> merged.putIfAbsent(team.getId(), team));
        return new ArrayList<>(merged.values());
    }

    @Transactional
    public FreelancerTeam createTeam(User lead, String name, String description) {
        FreelancerTeam team = new FreelancerTeam();
        team.setName(name);
        team.setDescription(description);
        team.setLead(lead);
        FreelancerTeam saved = teamRepository.save(team);

        FreelancerTeamMember member = new FreelancerTeamMember();
        member.setTeam(saved);
        member.setUser(lead);
        member.setTeamRole("LEAD");
        memberRepository.save(member);
        return saved;
    }

    @Transactional
    public FreelancerTeamMember addMember(FreelancerTeam team, User actor, String email, String role) {
        if (!Objects.equals(team.getLead().getId(), actor.getId())) {
            throw new IllegalStateException("Only team leads can invite members");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));

        if (memberRepository.existsByTeam_IdAndUser_Id(team.getId(), user.getId())) {
            throw new IllegalStateException("User is already part of the team");
        }

        FreelancerTeamMember member = new FreelancerTeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setTeamRole(role != null ? role : "MEMBER");
        return memberRepository.save(member);
    }

    public List<FreelancerTeamMember> getTeamMembers(Long teamId) {
        return memberRepository.findByTeam_Id(teamId);
    }
}

