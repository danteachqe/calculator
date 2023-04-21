package com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Collections;

@SpringBootApplication
public class CalculatorApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CalculatorApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", "80"));
        app.run(args);  
    }
}