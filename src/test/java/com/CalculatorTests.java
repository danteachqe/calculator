package com;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class CalculatorTests {

        public void testAddition() {
        given()
                .contentType("application/json")
                .body("{ \"operation\": \"add\", \"number1\": 10, \"number2\": 20 }")
        .when()
                .post("http://localhost:80/calculate")
        .then()
                .statusCode(200)
                .body("result", is(30.0F))
                .statusCode(200)
                .time(lessThan(500L));
    }

    public static void main(String[] args) {
        CalculatorTests tests = new CalculatorTests();
        tests.testAddition();
    }
}