package com.freelancer.platform;

import com.freelancer.platform.services.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void testSendEmailService() throws Exception {
        System.out.println("--- TESTING EMAIL SERVICE OVER PORT 465 SMTPS ---");
        emailService.sendOtpEmail("worksphere.ac.in@gmail.com", "WorkSphere Tester", "123456");
        System.out.println("--- EMAIL SERVICE TEST FINISHED ---");
    }
}
