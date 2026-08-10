package com.freelancer.platform.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    static {
        System.setProperty("java.net.preferIPv4Stack", "true");
        System.clearProperty("socksProxyHost");
        System.clearProperty("socksProxyPort");
    }

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:worksphere.ac.in@gmail.com}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send modern HTML OTP verification email
     */
    @Async
    public void sendOtpEmail(String toEmail, String name, String otp) {
        System.out.println("=================================================");
        System.out.println("⚡ [EMAIL OTP DISPATCH] To: " + toEmail + " | Name: " + name + " | OTP CODE: " + otp);
        System.out.println("=================================================");
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere Security");
            helper.setTo(toEmail);
            helper.setSubject("🔒 " + otp + " is your WorkSphere Verification Code");

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 15px; color: #f8fafc; }
                        .container { max-width: 550px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border-radius: 24px; border: 1px solid #334155; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                        .logo-box { text-align: center; margin-bottom: 28px; }
                        .logo-title { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #06b6d4, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
                        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
                        .greeting { font-size: 18px; font-weight: 600; color: #f1f5f9; margin-bottom: 12px; }
                        .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                        .otp-box { background: rgba(6, 182, 212, 0.08); border: 2px dashed #06b6d4; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0; }
                        .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #38bdf8; font-family: monospace; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4); margin-left: 12px; }
                        .otp-note { font-size: 11px; color: #64748b; margin-top: 8px; }
                        .security-tip { background-color: #1e293b; border-left: 4px solid #6366f1; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #cbd5e1; margin-top: 24px; }
                        .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo-box">
                            <div class="logo-title">WorkSphere</div>
                            <div class="tagline">CONNECT • COLLABORATE • SUCCEED</div>
                        </div>
                        <div class="greeting">Hello %s,</div>
                        <div class="text">Welcome to WorkSphere! To complete your registration and activate full access to your client dashboard, please enter the 6-digit verification code below:</div>
                        
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                            <div class="otp-note">Expires in 10 minutes • Do not share this code</div>
                        </div>

                        <div class="security-tip">
                            <strong>Security Reminder:</strong> WorkSphere staff will never ask for your OTP. If you did not request this email, please ignore it.
                        </div>

                        <div class="footer">
                            &copy; 2026 WorkSphere Platform. All rights reserved. <br/>
                            This is an automated message sent from worksphere.ac.in@gmail.com
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(name != null ? name : "User", otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[EMAIL SUCCESS] OTP Email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send OTP Email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error sending OTP Email: " + e.getMessage());
        }
    }

    /**
     * Send HTML Password Reset Email with OTP Verification Code
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere Security");
            helper.setTo(toEmail);
            helper.setSubject("🔑 " + otp + " is your WorkSphere Password Reset Code");

            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 15px; color: #f8fafc; }
                        .container { max-width: 550px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border-radius: 24px; border: 1px solid #334155; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                        .logo-box { text-align: center; margin-bottom: 28px; }
                        .logo-title { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #06b6d4, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
                        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
                        .greeting { font-size: 18px; font-weight: 600; color: #f1f5f9; margin-bottom: 12px; }
                        .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                        .otp-box { background: rgba(99, 102, 241, 0.08); border: 2px dashed #6366f1; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0; }
                        .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #818cf8; font-family: monospace; text-shadow: 0 0 20px rgba(129, 140, 248, 0.4); margin-left: 12px; }
                        .otp-note { font-size: 11px; color: #64748b; margin-top: 8px; }
                        .security-tip { background-color: #1e293b; border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #cbd5e1; margin-top: 24px; }
                        .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo-box">
                            <div class="logo-title">WorkSphere</div>
                            <div class="tagline">CONNECT • COLLABORATE • SUCCEED</div>
                        </div>
                        <div class="greeting">Hello %s,</div>
                        <div class="text">We received a request to reset your password for your WorkSphere account. Please use the 6-digit password reset verification code below:</div>
                        
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                            <div class="otp-note">Valid for 15 minutes • Do not share this code with anyone</div>
                        </div>

                        <div class="security-tip">
                            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support immediately.
                        </div>

                        <div class="footer">
                            &copy; 2026 WorkSphere Platform. All rights reserved.<br>
                            This is an automated security notification.
                        </div>
                    </div>
                </body>
                </html>
                """, name != null ? name : "User", otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[EMAIL SUCCESS] Password reset email sent successfully to " + toEmail + " with OTP: " + otp);
        } catch (MessagingException e) {
            System.err.println("[EMAIL ERROR] Failed to send password reset email to " + toEmail + ": " + e.getMessage());
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Unexpected error sending reset email: " + e.getMessage());
        }
    }

    /**
     * Send Order / Proposal Confirmation Email ("Thanks for Ordering!")
     */
    @Async
    public void sendOrderConfirmationEmail(String toEmail, String clientName, String projectTitle, Double budget, String category) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere Orders");
            helper.setTo(toEmail);
            helper.setSubject("🎉 Order Confirmed: " + projectTitle);

            String formattedBudget = budget != null ? String.format("$%.2f", budget) : "Custom Estimate";

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 15px; color: #f8fafc; }
                        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border-radius: 24px; border: 1px solid #334155; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 28px; }
                        .logo-title { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #06b6d4, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
                        .title-badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 16px; }
                        .card { background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; border-radius: 16px; padding: 24px; margin: 20px 0; }
                        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
                        .item-label { color: #94a3b8; }
                        .item-value { font-weight: 600; color: #f8fafc; }
                        .total-row { display: flex; justify-content: space-between; padding-top: 14px; font-size: 16px; font-weight: 700; color: #38bdf8; }
                        .next-steps { background-color: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin-top: 24px; font-size: 13px; color: #cbd5e1; }
                        .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-title">WorkSphere</div>
                            <div class="tagline">CONNECT • COLLABORATE • SUCCEED</div>
                            <div class="title-badge">✓ ORDER CONFIRMED</div>
                        </div>

                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Thank you for your order, %s!</div>
                        <div style="font-size: 14px; color: #94a3b8; line-height: 1.6;">We have successfully received your project request. Our engineering lead will review your specifications and begin development setup.</div>

                        <div class="card">
                            <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Project Summary</div>
                            <div class="item-row">
                                <span class="item-label">Project Title</span>
                                <span class="item-value">%s</span>
                            </div>
                            <div class="item-row">
                                <span class="item-label">Category</span>
                                <span class="item-value">%s</span>
                            </div>
                            <div class="item-row">
                                <span class="item-label">Tech Stack</span>
                                <span class="item-value">Java Spring Boot + MongoDB + React</span>
                            </div>
                            <div class="total-row">
                                <span>Total Estimated Budget</span>
                                <span>%s</span>
                            </div>
                        </div>

                        <div class="next-steps">
                            <strong>What happens next?</strong><br/>
                            1. You can track progress directly in your <strong>Client Workspace Dashboard</strong>.<br/>
                            2. Our developer will reach out via the workspace chat for any setup details.
                        </div>

                        <div class="footer">
                            &copy; 2026 WorkSphere Platform. All rights reserved. <br/>
                            Need support? Reply directly to worksphere.ac.in@gmail.com
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(clientName != null ? clientName : "Valued Client", projectTitle, category != null ? category : "Web Application", formattedBudget);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send Order Confirmation Email: " + e.getMessage());
        }
    }

    /**
     * Send Appointment Booking Confirmation Email
     */
    @Async
    public void sendAppointmentEmail(String toEmail, String clientName, String date, String time, String topic) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere Bookings");
            helper.setTo(toEmail);
            helper.setSubject("📅 Consultation Scheduled: " + (topic != null ? topic : "Strategy Session"));

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 15px; color: #f8fafc; }
                        .container { max-width: 550px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border-radius: 24px; border: 1px solid #334155; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                        .logo-box { text-align: center; margin-bottom: 24px; }
                        .logo-title { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #06b6d4, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
                        .booking-card { background: rgba(56, 189, 248, 0.08); border: 1px solid #38bdf8; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }
                        .calendar-date { font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 6px; }
                        .calendar-time { font-size: 16px; font-weight: 600; color: #cbd5e1; }
                        .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo-box">
                            <div class="logo-title">WorkSphere</div>
                            <div class="tagline">CONNECT • COLLABORATE • SUCCEED</div>
                        </div>

                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Call Confirmed, %s!</div>
                        <div style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Your 1-on-1 technical consultation call has been successfully scheduled.</div>

                        <div class="booking-card">
                            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">SCHEDULED TIME</div>
                            <div class="calendar-date">%s</div>
                            <div class="calendar-time">⏰ %s</div>
                            <div style="font-size: 13px; color: #94a3b8; margin-top: 12px;">Topic: %s</div>
                        </div>

                        <div style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">A Google Meet / Zoom link will be sent to your email 15 minutes before the meeting starts.</div>

                        <div class="footer">
                            &copy; 2026 WorkSphere Platform. All rights reserved. <br/>
                            Contact: worksphere.ac.in@gmail.com
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(clientName != null ? clientName : "Client", date, time, topic != null ? topic : "Project Discovery");

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send Appointment Email: " + e.getMessage());
        }
    }

    /**
     * Send Intern Account Credentials Email (Username & Password)
     */
    /**
     * Build stunning, state-of-the-art HTML email template for account & intern credentials
     */
    private String buildCredentialsHtml(String name, String username, String password, String role) {
        String displayRole = role != null ? role.replace("ROLE_", "") : "INTERN";
        String recipientName = (name != null && !name.isBlank()) ? name : username;

        String roleBadgeColor = "ADMIN".equalsIgnoreCase(displayRole) ? "#f43f5e" : 
                               ("INTERN".equalsIgnoreCase(displayRole) ? "#34d399" : "#38bdf8");
        String roleBadgeBg = "ADMIN".equalsIgnoreCase(displayRole) ? "#881337" : 
                            ("INTERN".equalsIgnoreCase(displayRole) ? "#064e3b" : "#1e3a8a");
        String roleBadgeBorder = "ADMIN".equalsIgnoreCase(displayRole) ? "#be123c" : 
                                ("INTERN".equalsIgnoreCase(displayRole) ? "#059669" : "#1d4ed8");

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>WorkSphere Account Credentials</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%;">
                <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0f19; padding: 40px 12px;">
                    <tr>
                        <td align="center">
                            <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background: #131c2e; border-radius: 28px; border: 1px solid #283654; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
                                
                                <!-- HEADER SECTION -->
                                <tr>
                                    <td align="center" style="padding: 40px 32px 28px 32px; background: linear-gradient(180deg, #17243c 0%%, #131c2e 100%%); border-bottom: 1px solid #283654;">
                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td align="center">
                                                    <div style="font-size: 32px; font-weight: 900; font-family: 'Segoe UI', Arial, sans-serif; color: #38bdf8; letter-spacing: -1px; margin-bottom: 4px;">
                                                        WorkSphere
                                                    </div>
                                                    <div style="font-size: 10px; font-weight: 800; color: #06b6d4; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 22px;">
                                                        CONNECT • COLLABORATE • SUCCEED
                                                    </div>
                                                    <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); border: 1px solid #6366f1; color: #a5b4fc; padding: 8px 22px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);">
                                                        ✨ OFFICIAL WORKSPACE ACCESS & CREDENTIALS
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- GREETING & INTRO -->
                                <tr>
                                    <td style="padding: 36px 36px 16px 36px;">
                                        <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                            Welcome aboard, <span style="color: #38bdf8;">%s</span>! 👋
                                        </h1>
                                        <p style="margin: 0 0 24px 0; font-size: 15px; color: #94a3b8; line-height: 1.7;">
                                            Your official account on the <strong>WorkSphere Platform</strong> has been initialized. Below are your secure login credentials to access your personalized workspace, submit deliverables, and communicate with your team.
                                        </p>
                                    </td>
                                </tr>

                                <!-- CREDENTIALS BOX -->
                                <tr>
                                    <td style="padding: 0 36px 28px 36px;">
                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090e1a; border: 1px dashed #6366f1; border-radius: 20px; overflow: hidden;">
                                            <tr>
                                                <td style="padding: 20px 24px 14px 24px; background: rgba(99, 102, 241, 0.08); border-bottom: 1px solid #1e293b;">
                                                    <span style="font-size: 11px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 1.5px;">
                                                        🔒 VERIFIED LOGIN CREDENTIALS
                                                    </span>
                                                </td>
                                            </tr>
                                            
                                            <!-- PORTAL URL -->
                                            <tr>
                                                <td style="padding: 14px 24px; border-bottom: 1px solid #1e293b;">
                                                    <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Workspace URL</td>
                                                            <td align="right">
                                                                <a href="https://worksphere-two.vercel.app/login" target="_blank" style="font-size: 12px; font-family: monospace; font-weight: 700; color: #38bdf8; text-decoration: none; background: #1e293b; padding: 6px 12px; border-radius: 8px; border: 1px solid #334155; display: inline-block;">
                                                                    worksphere-two.vercel.app/login
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- ROLE -->
                                            <tr>
                                                <td style="padding: 14px 24px; border-bottom: 1px solid #1e293b;">
                                                    <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Assigned Role</td>
                                                            <td align="right">
                                                                <span style="font-size: 11px; font-weight: 800; color: %s; background-color: %s; padding: 5px 14px; border-radius: 9999px; border: 1px solid %s; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                    %s
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- USERNAME -->
                                            <tr>
                                                <td style="padding: 14px 24px; border-bottom: 1px solid #1e293b;">
                                                    <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Username / ID</td>
                                                            <td align="right">
                                                                <span style="font-size: 14px; font-family: monospace; font-weight: 800; color: #38bdf8; background: #1e3a8a; padding: 5px 14px; border-radius: 8px; border: 1px solid #1d4ed8;">
                                                                    @%s
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- PASSWORD -->
                                            <tr>
                                                <td style="padding: 14px 24px 20px 24px;">
                                                    <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Account Password</td>
                                                            <td align="right">
                                                                <span style="font-size: 15px; font-family: monospace; font-weight: 900; color: #f43f5e; background: #881337; padding: 6px 16px; border-radius: 8px; border: 1px solid #be123c; letter-spacing: 1px;">
                                                                    %s
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- CALL TO ACTION BUTTON -->
                                <tr>
                                    <td align="center" style="padding: 0 36px 32px 36px;">
                                        <a href="https://worksphere-two.vercel.app/login" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%%, #06b6d4 100%%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 16px; padding: 16px 42px; border-radius: 16px; display: inline-block; box-shadow: 0 12px 24px -6px rgba(79, 70, 229, 0.5); letter-spacing: 0.3px;">
                                            Log In to WorkSphere Portal &rarr;
                                        </a>
                                    </td>
                                </tr>

                                <!-- HIGHLIGHTS GRID -->
                                <tr>
                                    <td style="padding: 0 36px 32px 36px;">
                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090e1a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px;">
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #cbd5e1;">
                                                    🚀 <strong>Assigned Deliverables:</strong> Access sprint tasks & submit project links.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #cbd5e1;">
                                                    💼 <strong>Stipend & Standups:</strong> Record daily attendance logs & check stipend status.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 13px; color: #cbd5e1;">
                                                    🎓 <strong>Completion Certificate:</strong> Issue & verify official completion certificate upon program completion.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- SECURITY NOTICE -->
                                <tr>
                                    <td style="padding: 0 36px 36px 36px;">
                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 16px 20px; font-size: 12px; color: #e2e8f0; line-height: 1.6;">
                                                    <strong style="color: #fbbf24;">Security Best Practice:</strong> Please log in using the credentials above and update your password under account settings after your initial login.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- FOOTER -->
                                <tr>
                                    <td align="center" style="padding: 24px 32px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; background-color: #090e1a;">
                                        &copy; 2026 <strong>WorkSphere Platform</strong>. All rights reserved. <br/>
                                        Official Mail Sender: <a href="mailto:worksphere.ac.in@gmail.com" style="color: #38bdf8; text-decoration: none;">worksphere.ac.in@gmail.com</a>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(
                recipientName,
                roleBadgeColor, roleBadgeBg, roleBadgeBorder, displayRole,
                username,
                password
            );
    }

    /**
     * Send Intern Account Credentials Email (Async)
     */
    @Async
    public void sendInternCredentialsEmail(String toEmail, String name, String username, String password, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere HR & Onboarding");
            helper.setTo(toEmail);
            helper.setSubject("🎓 Welcome to WorkSphere! Your Account Credentials inside");

            String htmlContent = buildCredentialsHtml(name, username, password, role);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[EMAIL SUCCESS] Async credentials email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to send async credentials email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send Intern Account Credentials Email (Synchronous with immediate status response)
     */
    public boolean sendInternCredentialsEmailSync(String toEmail, String name, String username, String password, String role) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(senderEmail, "WorkSphere HR & Onboarding");
        helper.setTo(toEmail);
        helper.setSubject("🎓 Welcome to WorkSphere! Your Account Credentials inside");

        String htmlContent = buildCredentialsHtml(name, username, password, role);

        helper.setText(htmlContent, true);
        mailSender.send(message);
        System.out.println("[EMAIL SUCCESS] Sync credentials email sent to: " + toEmail);
        return true;
    }

    /**
     * Send Homepage Contact Form Inquiry Email to Admin Inbox
     */
    @Async
    public void sendContactInquiryEmail(String visitorName, String visitorEmail, String subject, String messageText) {
        System.out.println("=================================================");
        System.out.println("⚡ [CONTACT INQUIRY DISPATCH] From: " + visitorName + " <" + visitorEmail + "> | Subject: " + subject);
        System.out.println("=================================================");
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere Inquiry Form");
            helper.setTo(senderEmail); // Admin inbox: worksphere.ac.in@gmail.com
            if (visitorEmail != null && visitorEmail.contains("@")) {
                helper.setReplyTo(visitorEmail);
            }
            helper.setSubject("📩 [Website Inquiry] " + (subject != null && !subject.isBlank() ? subject : "New Inquiry"));

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155;">
                        <h2 style="color: #38bdf8; margin-top: 0;">New Website Inquiry Received</h2>
                        <p><strong>From:</strong> %s (&lt;%s&gt;)</p>
                        <p><strong>Subject:</strong> %s</p>
                        <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;"/>
                        <p style="white-space: pre-wrap; line-height: 1.6; color: #cbd5e1;">%s</p>
                        <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;"/>
                        <p style="font-size: 11px; color: #64748b;">Reply directly to this email to respond to %s.</p>
                    </div>
                </body>
                </html>
                """.formatted(
                    visitorName != null ? visitorName : "Visitor", 
                    visitorEmail != null ? visitorEmail : "N/A", 
                    subject != null ? subject : "General Inquiry", 
                    messageText != null ? messageText : "", 
                    visitorEmail != null ? visitorEmail : "the sender"
                );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[EMAIL SUCCESS] Contact inquiry forwarded to admin inbox: " + senderEmail);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to deliver contact inquiry email: " + e.getMessage());
        }
    }
}
