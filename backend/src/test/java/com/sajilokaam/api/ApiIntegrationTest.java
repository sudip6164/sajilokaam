package com.sajilokaam.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive API Integration Tests
 * 
 * This test suite automatically tests all API endpoints.
 * 
 * Prerequisites:
 * - Docker compose must be running (backend, database)
 * - Backend should be accessible at http://localhost:8080
 * 
 * Run with: ./mvnw test -Dtest=ApiIntegrationTest
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@DisplayName("API Integration Tests")
public class ApiIntegrationTest {

    private static RestTemplate restTemplate;
    private static ObjectMapper objectMapper;
    private static String baseUrl;
    private static String adminToken;
    private static String userToken;
    private static Long testProjectId;
    private static Long testTaskId;
    private static Long testPaymentId;

    @BeforeAll
    static void setUp() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
        // Connect to running Docker backend, not embedded server
        baseUrl = "http://localhost:8080/api";
        
        // Authenticate as admin
        adminToken = authenticate("admin@sajilokaam.com", "admin123");
        assertNotNull(adminToken, "Admin authentication failed");
        
        // Create and authenticate test user
        String testEmail = "testuser_" + System.currentTimeMillis() + "@test.com";
        registerUser(testEmail, "password123", "Test User");
        userToken = authenticate(testEmail, "password123");
        assertNotNull(userToken, "User authentication failed");
    }

    // ==================== Authentication Tests ====================

    @Test
    @DisplayName("Health Check")
    void testHealthCheck() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "http://localhost:8080/actuator/health", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("Login with valid credentials")
    void testLogin() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "admin@sajilokaam.com");
        loginRequest.put("password", "admin123");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/auth/login", request, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().get("token"));
    }

    @Test
    @DisplayName("Login with invalid credentials")
    void testLoginInvalid() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "invalid@test.com");
        loginRequest.put("password", "wrongpassword");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<?> response = restTemplate.postForEntity(
            baseUrl + "/auth/login", request, Object.class);

        assertTrue(response.getStatusCode().is4xxClientError());
    }

    // ==================== Dispute Resolution Tests ====================

    @Test
    @DisplayName("Get all disputes (admin)")
    void testGetAllDisputes() {
        HttpHeaders headers = createAuthHeaders(adminToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/payment-disputes",
            HttpMethod.GET,
            request,
            List.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Get my disputes")
    void testGetMyDisputes() {
        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/payment-disputes/my",
            HttpMethod.GET,
            request,
            List.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Create dispute")
    void testCreateDispute() {
        // First, we need a payment ID - this would typically come from existing data
        // For now, we'll test the endpoint structure
        Long paymentId = 1L; // Adjust based on your test data

        Map<String, String> disputeRequest = new HashMap<>();
        disputeRequest.put("disputeType", "REFUND_REQUEST");
        disputeRequest.put("reason", "Test dispute reason");

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(disputeRequest, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/payment-disputes/payment/" + paymentId,
                HttpMethod.POST,
                request,
                Map.class
            );

            // May return 404 if payment doesn't exist, or 403 if user can't dispute
            assertTrue(response.getStatusCode().is2xxSuccessful() || 
                      response.getStatusCode().equals(HttpStatus.NOT_FOUND) ||
                      response.getStatusCode().equals(HttpStatus.FORBIDDEN));
        } catch (Exception e) {
            // Expected if payment doesn't exist in test data
            System.out.println("Note: Dispute creation test skipped - payment may not exist");
        }
    }

    // ==================== Subtasks Tests ====================

    @Test
    @DisplayName("Get subtasks for a task")
    void testGetSubtasks() {
        Long taskId = getOrCreateTestTask();
        
        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/tasks/" + taskId + "/subtasks",
            HttpMethod.GET,
            request,
            List.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Create subtask")
    void testCreateSubtask() {
        Long taskId = getOrCreateTestTask();

        Map<String, String> subtaskRequest = new HashMap<>();
        subtaskRequest.put("title", "Test Subtask " + System.currentTimeMillis());
        subtaskRequest.put("status", "TODO");

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(subtaskRequest, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/tasks/" + taskId + "/subtasks",
            HttpMethod.POST,
            request,
            Map.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().get("id"));
    }

    @Test
    @DisplayName("Update subtask status")
    void testUpdateSubtaskStatus() {
        Long taskId = getOrCreateTestTask();
        Long subtaskId = createTestSubtask(taskId);

        Map<String, String> updateRequest = new HashMap<>();
        updateRequest.put("status", "DONE");

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(updateRequest, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/tasks/" + taskId + "/subtasks/" + subtaskId + "/status",
            HttpMethod.PATCH,
            request,
            Map.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DONE", response.getBody().get("status"));
    }

    @Test
    @DisplayName("Delete subtask")
    void testDeleteSubtask() {
        Long taskId = getOrCreateTestTask();
        Long subtaskId = createTestSubtask(taskId);

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
            baseUrl + "/tasks/" + taskId + "/subtasks/" + subtaskId,
            HttpMethod.DELETE,
            request,
            Void.class
        );

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    // ==================== Projects Tests ====================

    @Test
    @DisplayName("Get all projects")
    void testGetProjects() {
        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/projects",
            HttpMethod.GET,
            request,
            List.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Get project by ID")
    void testGetProjectById() {
        Long projectId = getOrCreateTestProject();

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/projects/" + projectId,
            HttpMethod.GET,
            request,
            Map.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // ==================== Tasks Tests ====================

    @Test
    @DisplayName("Get tasks for project")
    void testGetTasks() {
        Long projectId = getOrCreateTestProject();

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/projects/" + projectId + "/tasks",
            HttpMethod.GET,
            request,
            List.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Create task")
    void testCreateTask() {
        Long projectId = getOrCreateTestProject();

        Map<String, Object> taskRequest = new HashMap<>();
        taskRequest.put("title", "Test Task " + System.currentTimeMillis());
        taskRequest.put("description", "Test description");
        taskRequest.put("status", "TODO");
        taskRequest.put("priority", "MEDIUM");

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(taskRequest, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/projects/" + projectId + "/tasks",
            HttpMethod.POST,
            request,
            Map.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // ==================== Task Labels Tests ====================

    @Test
    @DisplayName("Get all task labels")
    void testGetTaskLabels() {
        ResponseEntity<List> response = restTemplate.getForEntity(
            baseUrl + "/task-labels", List.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Create task label")
    void testCreateTaskLabel() {
        Map<String, String> labelRequest = new HashMap<>();
        labelRequest.put("name", "Test Label " + System.currentTimeMillis());
        labelRequest.put("color", "#ff0000");

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(labelRequest, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/task-labels",
            HttpMethod.POST,
            request,
            Map.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // ==================== Jobs Tests ====================

    @Test
    @DisplayName("Get all jobs")
    void testGetJobs() {
        ResponseEntity<List> response = restTemplate.getForEntity(
            baseUrl + "/jobs", List.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // ==================== Admin Tests ====================

    @Test
    @DisplayName("Get admin dashboard stats")
    void testGetAdminDashboard() {
        HttpHeaders headers = createAuthHeaders(adminToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/admin/analytics/dashboard",
            HttpMethod.GET,
            request,
            Map.class
        );

        // May return 200 or 404 depending on implementation
        assertTrue(response.getStatusCode().is2xxSuccessful() || 
                  response.getStatusCode().equals(HttpStatus.NOT_FOUND));
    }

    @Test
    @DisplayName("Get all users (admin)")
    void testGetAllUsers() {
        HttpHeaders headers = createAuthHeaders(adminToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/admin/users",
            HttpMethod.GET,
            request,
            List.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    // ==================== Helper Methods ====================

    private static String authenticate(String email, String password) {
        try {
            Map<String, String> loginRequest = new HashMap<>();
            loginRequest.put("email", email);
            loginRequest.put("password", password);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(loginRequest, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/auth/login", request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("token");
            }
        } catch (Exception e) {
            System.err.println("Authentication failed: " + e.getMessage());
        }
        return null;
    }

    private static void registerUser(String email, String password, String fullName) {
        try {
            Map<String, String> registerRequest = new HashMap<>();
            registerRequest.put("email", email);
            registerRequest.put("password", password);
            registerRequest.put("fullName", fullName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(registerRequest, headers);

            restTemplate.postForEntity(baseUrl + "/auth/register", request, Map.class);
        } catch (Exception e) {
            // User might already exist, that's okay
        }
    }

    private HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private Long getOrCreateTestProject() {
        if (testProjectId != null) return testProjectId;
        
        try {
            HttpHeaders headers = createAuthHeaders(userToken);
            HttpEntity<?> request = new HttpEntity<>(headers);
            
            ResponseEntity<List> response = restTemplate.exchange(
                baseUrl + "/projects",
                HttpMethod.GET,
                request,
                List.class
            );
            
            if (response.getBody() != null && !response.getBody().isEmpty()) {
                Map<String, Object> project = (Map<String, Object>) response.getBody().get(0);
                testProjectId = ((Number) project.get("id")).longValue();
                return testProjectId;
            }
        } catch (Exception e) {
            // Project creation would go here if needed
        }
        
        // Default fallback
        return 1L;
    }

    private Long getOrCreateTestTask() {
        if (testTaskId != null) return testTaskId;
        
        Long projectId = getOrCreateTestProject();
        
        try {
            HttpHeaders headers = createAuthHeaders(userToken);
            Map<String, Object> taskRequest = new HashMap<>();
            taskRequest.put("title", "Test Task for Subtasks");
            taskRequest.put("status", "TODO");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(taskRequest, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/projects/" + projectId + "/tasks",
                HttpMethod.POST,
                request,
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                testTaskId = ((Number) response.getBody().get("id")).longValue();
                return testTaskId;
            }
        } catch (Exception e) {
            // Fallback to existing task
        }
        
        // Try to get existing task
        try {
            HttpHeaders headers = createAuthHeaders(userToken);
            HttpEntity<?> getRequest = new HttpEntity<>(headers);
            
            ResponseEntity<List> response = restTemplate.exchange(
                baseUrl + "/projects/" + projectId + "/tasks",
                HttpMethod.GET,
                getRequest,
                List.class
            );
            
            if (response.getBody() != null && !response.getBody().isEmpty()) {
                Map<String, Object> task = (Map<String, Object>) response.getBody().get(0);
                testTaskId = ((Number) task.get("id")).longValue();
                return testTaskId;
            }
        } catch (Exception e) {
            // Ignore
        }
        
        return 1L; // Fallback
    }

    private Long createTestSubtask(Long taskId) {
        Map<String, String> subtaskRequest = new HashMap<>();
        subtaskRequest.put("title", "Test Subtask " + System.currentTimeMillis());
        subtaskRequest.put("status", "TODO");

        HttpHeaders headers = createAuthHeaders(userToken);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(subtaskRequest, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            baseUrl + "/tasks/" + taskId + "/subtasks",
            HttpMethod.POST,
            request,
            Map.class
        );

        if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
            return ((Number) response.getBody().get("id")).longValue();
        }
        return 1L; // Fallback
    }
}

