package com.freelancer.platform.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

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
    @Async
    public void sendInternCredentialsEmail(String toEmail, String name, String username, String password, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "WorkSphere HR & Onboarding");
            helper.setTo(toEmail);
            helper.setSubject("🎓 Welcome to WorkSphere Internship! Your Account Credentials inside");

            String displayRole = role != null ? role.replace("ROLE_", "") : "INTERN";

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%;">
                    <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a; padding: 40px 15px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #1e293b; border-radius: 24px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                                    <!-- Header Text -->
                                    <tr>
                                        <td style="padding: 36px 32px 10px 32px; color: #ffffff;">
                                            <h2 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Welcome aboard, %s!</h2>
                                            <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                                                Your WorkSphere Internship Portal account has been configured. Below are your official login credentials to access your assigned tasks, submit sprint deliverables, and track stipend progress.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Credentials Box -->
                                    <tr>
                                        <td style="padding: 24px 32px;">
                                            <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #111827; border: 1px dashed #6366f1; border-radius: 18px;">
                                                <tr>
                                                    <td style="padding: 22px 24px 14px 24px; font-size: 11px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 1.5px;">
                                                        YOUR OFFICIAL LOGIN CREDENTIALS
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 24px; border-bottom: 1px solid #1f2937;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                                <td align="left" style="font-size: 13px; color: #9ca3af; font-weight: 600;">Portal URL</td>
                                                                <td align="right">
                                                                    <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: #38bdf8; background-color: #1f2937; padding: 4px 10px; border-radius: 6px; border: 1px solid #374151;">https://worksphere-two.vercel.app/login</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 24px; border-bottom: 1px solid #1f2937;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                                <td align="left" style="font-size: 13px; color: #9ca3af; font-weight: 600;">Account Role</td>
                                                                <td align="right">
                                                                    <span style="font-size: 12px; font-weight: 800; color: #34d399; background-color: #064e3b; padding: 4px 12px; border-radius: 6px; border: 1px solid #059669;">%s</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 24px; border-bottom: 1px solid #1f2937;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                                <td align="left" style="font-size: 13px; color: #9ca3af; font-weight: 600;">Username</td>
                                                                <td align="right">
                                                                    <span style="font-size: 13px; font-family: monospace; font-weight: 800; color: #38bdf8; background-color: #1e3a8a; padding: 4px 12px; border-radius: 6px; border: 1px solid #1d4ed8;">%s</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 24px 20px 24px;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                                <td align="left" style="font-size: 13px; color: #9ca3af; font-weight: 600;">Password</td>
                                                                <td align="right">
                                                                    <span style="font-size: 14px; font-family: monospace; font-weight: 900; color: #f43f5e; background-color: #881337; padding: 4px 12px; border-radius: 6px; border: 1px solid #be123c;">%s</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- CTA Button -->
                                    <tr>
                                        <td align="center" style="padding: 0 32px 28px 32px;">
                                            <a href="https://worksphere-two.vercel.app/login" target="_blank" style="background: linear-gradient(90deg, #4f46e5 0%%, #06b6d4 100%%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 38px; border-radius: 14px; display: inline-block; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.5);">
                                                Log In to Intern Portal &rarr;
                                            </a>
                                        </td>
                                    </tr>

                                    <!-- Security Note -->
                                    <tr>
                                        <td style="padding: 0 32px 36px 32px;">
                                            <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #111827; border-left: 4px solid #f59e0b; border-radius: 8px;">
                                                <tr>
                                                    <td style="padding: 14px 18px; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                                                        <strong style="color: #f59e0b;">Security Note:</strong> Please log in and change your password after your first login for enhanced account security.
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td align="center" style="padding: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; background-color: #0f172a;">
                                            &copy; 2026 WorkSphere Platform. All rights reserved. <br/>
                                            Dispatched from worksphere.ac.in@gmail.com
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(name != null ? name : "User", displayRole, username, password);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[EMAIL SUCCESS] Credentials email dispatched successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to send credentials email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public boolean sendInternCredentialsEmailSync(String toEmail, String name, String username, String password, String role) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(senderEmail, "WorkSphere HR & Onboarding");
        helper.setTo(toEmail);
        helper.setSubject("🎓 Welcome to WorkSphere Internship! Your Account Credentials inside");

        String displayRole = role != null ? role.replace("ROLE_", "") : "INTERN";

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Arial, Helvetica, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a; padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden;">
                                <tr>
                                    <td align="center" style="padding: 32px 24px 20px 24px; border-bottom: 1px solid #334155; background-color: #0f172a;">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">WorkSphere</h1>
                                        <div style="font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">CONNECT • COLLABORATE • SUCCEED</div>
                                        <div style="display: inline-block; background-color: #312e81; border: 1px solid #6366f1; color: #a5b4fc; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 14px; text-transform: uppercase;">
                                            🎓 OFFICIAL ACCOUNT CREATED
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px; color: #f8fafc;">
                                        <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">Welcome aboard, %s!</h2>
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                                            Your WorkSphere account has been successfully configured in our database. You can now access your workspace, manage projects, and log in securely using your official login credentials below:
                                        </p>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a; border: 1px dashed #6366f1; border-radius: 14px; margin: 20px 0;">
                                            <tr>
                                                <td style="padding: 18px 20px 8px 20px; font-size: 11px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">
                                                    Your Verified Login Credentials
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 20px; border-bottom: 1px solid #1e293b;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Portal URL:</td>
                                                            <td align="right" style="font-size: 13px; font-family: monospace; font-weight: 700; color: #cbd5e1;">https://worksphere-two.vercel.app/login</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 20px; border-bottom: 1px solid #1e293b;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Account Role:</td>
                                                            <td align="right" style="font-size: 13px; font-weight: 700; color: #34d399;">%s</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 20px; border-bottom: 1px solid #1e293b;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Username / ID:</td>
                                                            <td align="right" style="font-size: 14px; font-family: monospace; font-weight: 800; color: #38bdf8;">%s</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 20px 16px 20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td align="left" style="font-size: 13px; color: #94a3b8; font-weight: 600;">Password:</td>
                                                            <td align="right" style="font-size: 15px; font-family: monospace; font-weight: 900; color: #f43f5e; background-color: #1e293b; padding: 4px 12px; border-radius: 6px; border: 1px solid #334155;">%s</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 20px 0;">
                                            <tr>
                                                <td align="center">
                                                    <a href="https://worksphere-two.vercel.app/login" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 36px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
                                                        Log In to WorkSphere Portal &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 24px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; background-color: #0f172a;">
                                        &copy; 2026 WorkSphere Platform. All rights reserved. <br/>
                                        Support: worksphere.ac.in@gmail.com
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(name != null ? name : "User", displayRole, username, password);

        helper.setText(htmlContent, true);
        mailSender.send(message);
        System.out.println("[EMAIL SUCCESS] Credentials email sent directly to: " + toEmail);
        return true;
    }
}
