package com.sajilokaam.admin;

import com.sajilokaam.auth.RequiresAdmin;
import com.sajilokaam.systemsetting.SystemSetting;
import com.sajilokaam.systemsetting.SystemSettingRepository;
import com.sajilokaam.user.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiresAdmin
public class AdminSystemSettingsController {
    private final SystemSettingRepository systemSettingRepository;

    public AdminSystemSettingsController(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        List<SystemSetting> settings = systemSettingRepository.findAll();
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/{key}")
    public ResponseEntity<SystemSetting> getSettingByKey(@PathVariable String key) {
        Optional<SystemSetting> settingOpt = systemSettingRepository.findBySettingKey(key);
        return settingOpt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{key}")
    public ResponseEntity<SystemSetting> updateSetting(
            @PathVariable String key,
            @RequestBody SystemSettingUpdateRequest request,
            HttpServletRequest httpRequest) {
        Optional<SystemSetting> settingOpt = systemSettingRepository.findBySettingKey(key);
        
        if (settingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SystemSetting setting = settingOpt.get();
        if (request.getSettingValue() != null) {
            setting.setSettingValue(request.getSettingValue());
        }
        if (request.getDescription() != null) {
            setting.setDescription(request.getDescription());
        }

        // Get admin user from request attribute (set by AdminInterceptor)
        User adminUser = (User) httpRequest.getAttribute("adminUser");
        if (adminUser != null) {
            setting.setUpdatedBy(adminUser);
        }

        SystemSetting updated = systemSettingRepository.save(setting);
        return ResponseEntity.ok(updated);
    }

    @PostMapping
    public ResponseEntity<SystemSetting> createSetting(
            @RequestBody SystemSettingCreateRequest request,
            HttpServletRequest httpRequest) {
        if (request.getSettingKey() == null || request.getSettingKey().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Check if key already exists
        if (systemSettingRepository.findBySettingKey(request.getSettingKey()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        SystemSetting setting = new SystemSetting();
        setting.setSettingKey(request.getSettingKey());
        setting.setSettingValue(request.getSettingValue());
        setting.setDescription(request.getDescription());
        setting.setSettingType(request.getSettingType() != null ? request.getSettingType() : "STRING");

        User adminUser = (User) httpRequest.getAttribute("adminUser");
        if (adminUser != null) {
            setting.setUpdatedBy(adminUser);
        }

        SystemSetting created = systemSettingRepository.save(setting);
        return ResponseEntity.created(URI.create("/api/admin/settings/" + created.getSettingKey())).body(created);
    }
}

