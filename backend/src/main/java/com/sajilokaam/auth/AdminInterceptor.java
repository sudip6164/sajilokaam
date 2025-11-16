package com.sajilokaam.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class AdminInterceptor implements HandlerInterceptor {
    private final AdminSecurityService adminSecurityService;

    public AdminInterceptor(AdminSecurityService adminSecurityService) {
        this.adminSecurityService = adminSecurityService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Only process method handlers
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // Check if method or class has @RequiresAdmin annotation
        RequiresAdmin methodAnnotation = handlerMethod.getMethodAnnotation(RequiresAdmin.class);
        RequiresAdmin classAnnotation = handlerMethod.getBeanType().getAnnotation(RequiresAdmin.class);
        
        if (methodAnnotation == null && classAnnotation == null) {
            // No admin requirement, allow request
            return true;
        }

        // Admin required - verify token
        String authorization = request.getHeader("Authorization");
        Optional<com.sajilokaam.user.User> adminOpt = adminSecurityService.verifyAdmin(authorization);

        if (adminOpt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\":\"Admin access required\"}");
            return false;
        }

        // Store admin user in request attribute for use in controller
        request.setAttribute("adminUser", adminOpt.get());
        return true;
    }
}

