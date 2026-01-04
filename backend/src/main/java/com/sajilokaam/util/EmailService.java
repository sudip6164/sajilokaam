package com.sajilokaam.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from.address:noreply@sajilokaam.com}")
    private String fromAddress;

    @Value("${mail.from.name:SajiloKaam}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        // Allow null JavaMailSender - email will be logged to console instead
        this.mailSender = mailSender;
        System.out.println("EmailService initialized. SMTP configured: " + (mailSender != null));
        if (mailSender == null) {
            System.out.println("Note: Email sending disabled. Password reset tokens will be logged to console.");
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            if (mailSender == null) {
                System.err.println("JavaMailSender is not configured. Cannot send email.");
                System.out.println("Password reset token for " + toEmail + ": " + resetToken);
                System.out.println("Reset link: " + frontendUrl + "/reset-password?token=" + resetToken);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - SajiloKaam");

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetEmail(resetLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            e.printStackTrace();
            // Don't throw - just log and fallback to console output
            System.out.println("Password reset token for " + toEmail + ": " + resetToken);
            System.out.println("Reset link: " + frontendUrl + "/reset-password?token=" + resetToken);
        } catch (Exception e) {
            System.err.println("Unexpected error sending email: " + e.getMessage());
            e.printStackTrace();
            // Fallback to console output
            System.out.println("Password reset token for " + toEmail + ": " + resetToken);
            System.out.println("Reset link: " + frontendUrl + "/reset-password?token=" + resetToken);
        }
    }

    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            if (mailSender == null) {
                System.err.println("JavaMailSender is not configured. Cannot send email.");
                System.out.println("Email verification token for " + toEmail + ": " + verificationToken);
                System.out.println("Verification link: " + frontendUrl + "/verify-email?token=" + verificationToken);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email - SajiloKaam");

            String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;
            String htmlContent = buildVerificationEmail(verificationLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Verification email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            e.printStackTrace();
            // Don't throw - just log and fallback to console output
            System.out.println("Email verification token for " + toEmail + ": " + verificationToken);
            System.out.println("Verification link: " + frontendUrl + "/verify-email?token=" + verificationToken);
        } catch (Exception e) {
            System.err.println("Unexpected error sending verification email: " + e.getMessage());
            e.printStackTrace();
            // Fallback to console output
            System.out.println("Email verification token for " + toEmail + ": " + verificationToken);
            System.out.println("Verification link: " + frontendUrl + "/verify-email?token=" + verificationToken);
        }
    }

    private String buildPasswordResetEmail(String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>SajiloKaam</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>Reset Your Password</h2>" +
                "<p>You requested to reset your password. Click the button below to create a new password:</p>" +
                "<p style='text-align: center;'><a href='" + resetLink + "' class='button'>Reset Password</a></p>" +
                "<p>Or copy and paste this link into your browser:</p>" +
                "<p style='word-break: break-all; color: #667eea;'>" + resetLink + "</p>" +
                "<p><strong>This link will expire in 1 hour.</strong></p>" +
                "<p>If you didn't request this password reset, please ignore this email.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 SajiloKaam. All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildVerificationEmail(String verificationLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>SajiloKaam</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>Verify Your Email Address</h2>" +
                "<p>Thank you for signing up! Please verify your email address by clicking the button below:</p>" +
                "<p style='text-align: center;'><a href='" + verificationLink + "' class='button'>Verify Email</a></p>" +
                "<p>Or copy and paste this link into your browser:</p>" +
                "<p style='word-break: break-all; color: #667eea;'>" + verificationLink + "</p>" +
                "<p><strong>This link will expire in 24 hours.</strong></p>" +
                "<p>If you didn't create an account, please ignore this email.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 SajiloKaam. All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
