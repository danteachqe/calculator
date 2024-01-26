package com.rest;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import org.junit.jupiter.api.Test;

public class CalculatorTests {
        @Test
        public void testAddition() {
        given()
                .header("Connection", "close")
                .contentType("application/json")
                .body("{ \"operation\": \"add\", \"number1\": 10, \"number2\": 20 }")
        .when()
                .post("http://playground1.azurewebsites.net/calculate")
        .then()
                .statusCode(200)
                .body("result", is(30.0F));
                //.time(lessThan(500L));
    }
   
    @Test
    public void testDivide() {
    given()
            .header("Connection", "close")
            .contentType("application/json")
            .body("{ \"operation\": \"divide\", \"number1\": 10, \"number2\": 10 }")
    .when()
            .post("http://playground1.azurewebsites.net/calculate")
    .then()
            .statusCode(200)
            .body("result", is(1.0F));
            //.time(lessThan(500L));
} 

@Test
public void testMultiply() {
given()
        .header("Connection", "close")
        .contentType("application/json")
        .body("{ \"operation\": \"multiply\", \"number1\": 10, \"number2\": 20 }")
.when()
        .post("http://playground1.azurewebsites.net/calculate")
.then()
        .statusCode(200)
        .body("result", is(200.0F));
        //.time(lessThan(500L));
}
//     public static void main(String[] args) {
//         CalculatorTests tests = new CalculatorTests();
//         tests.testAddition();
//     }
}