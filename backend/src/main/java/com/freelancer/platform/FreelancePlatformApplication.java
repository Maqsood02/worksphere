package com.freelancer.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FreelancePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreelancePlatformApplication.class, args);
    }
}
