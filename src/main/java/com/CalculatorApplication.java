package com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Collections;
import org.owasp.encoder.Encode;

@SpringBootApplication
public class CalculatorApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CalculatorApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", "8080"));
        app.run(args);  
    // Example of using org.owasp.encoder to encode user input
    String userInput = "<script>alert('XSS attack!');</script>";
    String encodedInput = Encode.forHtml(userInput);
    System.out.println(encodedInput);     //coment
    }
}