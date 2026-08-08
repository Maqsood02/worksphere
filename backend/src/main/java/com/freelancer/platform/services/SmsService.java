package com.freelancer.platform.services;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private final EmailService emailService;

    public SmsService(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Send Phone SMS OTP verification code
     */
    @Async
    public void sendSmsOtp(String phoneNumber, String userEmail, String name, String phoneOtp) {
        System.out.println("=================================================");
        System.out.println("📲 [SMS GATEWAY SERVICE] Sending Phone OTP");
        System.out.println("   Recipient Phone: " + phoneNumber);
        System.out.println("   SMS Passcode   : " + phoneOtp);
        System.out.println("=================================================");

        // Also send Phone OTP notification to client's email inbox as an SMS-to-Email bridge
        if (userEmail != null && !userEmail.isBlank()) {
            emailService.sendOtpEmail(userEmail, name + " (Phone SMS Code: " + phoneOtp + ")", phoneOtp);
        }
    }
}
