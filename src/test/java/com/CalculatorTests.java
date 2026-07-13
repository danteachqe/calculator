package com;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CalculatorTests {

    @LocalServerPort
    private int port;

    @BeforeEach
    public void setUp() {
        RestAssured.port = port;
    }

    @Test
    public void testAddition() {
        given()
            .contentType("application/json")
            .body("{ \"operation\": \"add\", \"number1\": 10, \"number2\": 20 }")
        .when()
            .post("/calculate")
        .then()
            .statusCode(200)
            .body("result", is(30.0F));
    }
}
