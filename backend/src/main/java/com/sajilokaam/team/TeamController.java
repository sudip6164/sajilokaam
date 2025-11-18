package com.sajilokaam.team;

import com.sajilokaam.team.dto.AddMemberRequest;
import com.sajilokaam.team.dto.CreateTeamRequest;
import com.sajilokaam.team.dto.TeamMemberResponse;
import com.sajilokaam.team.dto.TeamResponse;
import com.sajilokaam.user.User;
import com.sajilokaam.user.UserContextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "http://localhost:5173")
public class TeamController {

    private final TeamService teamService;
    private final UserContextService userContextService;

    public TeamController(TeamService teamService, UserContextService userContextService) {
        this.teamService = teamService;
        this.userContextService = userContextService;
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getMyTeams(
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        List<TeamResponse> responses = teamService.getTeamsForUser(userOpt.get())
                .stream()
                .map(team -> toTeamResponse(team, teamService.getTeamMembers(team.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @RequestBody CreateTeamRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }
        FreelancerTeam team = teamService.createTeam(userOpt.get(), request.getName().trim(), request.getDescription());
        List<FreelancerTeamMember> members = teamService.getTeamMembers(team.getId());
        return ResponseEntity.ok(toTeamResponse(team, members));
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponse> getTeam(
            @PathVariable Long teamId,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        return teamService.getTeamsForUser(userOpt.get()).stream()
                .filter(team -> team.getId().equals(teamId))
                .findFirst()
                .map(team -> ResponseEntity.ok(toTeamResponse(team, teamService.getTeamMembers(teamId))))
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamResponse> addMember(
            @PathVariable Long teamId,
            @RequestBody AddMemberRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        Optional<User> userOpt = userContextService.resolveUser(authorization);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        FreelancerTeam team = teamService.getTeamsForUser(userOpt.get()).stream()
                .filter(t -> t.getId().equals(teamId))
                .findFirst()
                .orElse(null);

        if (team == null) {
            return ResponseEntity.status(404).build();
        }

        try {
            teamService.addMember(team, userOpt.get(), request.getEmail().trim(), request.getRole());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }

        List<FreelancerTeamMember> members = teamService.getTeamMembers(teamId);
        return ResponseEntity.ok(toTeamResponse(team, members));
    }

    private TeamResponse toTeamResponse(FreelancerTeam team, List<FreelancerTeamMember> members) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());
        response.setDescription(team.getDescription());
        response.setCreatedAt(team.getCreatedAt());

        TeamResponse.LeadSummary leadSummary = new TeamResponse.LeadSummary();
        if (team.getLead() != null) {
            leadSummary.setId(team.getLead().getId());
            leadSummary.setFullName(team.getLead().getFullName());
            leadSummary.setEmail(team.getLead().getEmail());
        }
        response.setLead(leadSummary);

        List<TeamMemberResponse> memberResponses = members.stream()
                .map(member -> {
                    TeamMemberResponse memberResponse = new TeamMemberResponse();
                    memberResponse.setId(member.getId());
                    if (member.getUser() != null) {
                        memberResponse.setUserId(member.getUser().getId());
                        memberResponse.setFullName(member.getUser().getFullName());
                        memberResponse.setEmail(member.getUser().getEmail());
                    }
                    memberResponse.setRole(member.getTeamRole());
                    memberResponse.setStatus(member.getStatus());
                    memberResponse.setJoinedAt(member.getJoinedAt());
                    return memberResponse;
                })
                .collect(Collectors.toList());
        response.setMembers(memberResponses);
        return response;
    }
}

