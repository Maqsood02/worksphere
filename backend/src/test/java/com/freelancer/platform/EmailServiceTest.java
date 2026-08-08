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
        System.out.println("--- TESTING CREDENTIALS EMAIL DISPATCH TO maqsoodmd.ac.in@gmail.com ---");
        emailService.sendInternCredentialsEmailSync("maqsoodmd.ac.in@gmail.com", "Maqsood MD", "maqsood", "123456", "ROLE_INTERN");
        System.out.println("--- CREDENTIALS EMAIL TEST FINISHED ---");
    }
}
