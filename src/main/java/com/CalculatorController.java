package com;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalculatorController {

    @PostMapping("/calculate")
    public CalculationResult calculate(@RequestBody CalculationRequest request) {
        String operation = request.getOperation();
        double number1 = request.getNumber1();
        double number2 = request.getNumber2();
        double result;

        if (operation == null) {
            throw new IllegalArgumentException("Invalid operation");
        }

        switch (operation) {
            case "add":
                result = number1 + number2;
                break;
            case "subtract":
                result = number1 - number2;
                break;
            case "multiply":
                result = number1 * number2;
                break;
            case "divide":
                if (number2 == 0) {
                    throw new IllegalArgumentException("Cannot divide by zero");
                }
                result = number1 / number2;
                break;
            case "area":
                result = 0.5 * number1 * number2;
                break;
            default:
                throw new IllegalArgumentException("Invalid operation");
        }

        return new CalculationResult(result);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleInvalidRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
