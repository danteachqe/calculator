package com;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculatorControllerCalculationTests {

    @Test
    public void testAdd() {
        CalculationRequest request = new CalculationRequest(2, 3, "add");
        double expected = 5;

        CalculatorController controller = new CalculatorController();
        CalculationResult result = controller.calculate(request);

        assertEquals(expected, result.getResult(), 0.001);
    }

    @Test
    public void testSubtract() {
        CalculationRequest request = new CalculationRequest(5, 2, "subtract");
        double expected = 3;

        CalculatorController controller = new CalculatorController();
        CalculationResult result = controller.calculate(request);

        assertEquals(expected, result.getResult(), 0.001);
    }

    @Test
    public void testSubtractnegative() {
        CalculationRequest request = new CalculationRequest(0, 2, "subtract");
        double expected = -2;

        CalculatorController controller = new CalculatorController();
        CalculationResult result = controller.calculate(request);

        assertEquals(expected, result.getResult(), 0.001);
    }

    @Test
    public void testMultiply() {
        CalculationRequest request = new CalculationRequest(4, 3, "multiply");
        double expected = 12;

        CalculatorController controller = new CalculatorController();
        CalculationResult result = controller.calculate(request);

        assertEquals(expected, result.getResult(), 0.001);
    }

    //@Test
    public void testDivide() {
        CalculationRequest request = new CalculationRequest(10, 5, "divide");
        double expected = 2;

        CalculatorController controller = new CalculatorController();
        CalculationResult result = controller.calculate(request);

        assertEquals(expected, result.getResult(), 0.001);
    }

    @Test
    public void testArea() {
        CalculationRequest request = new CalculationRequest(10, 5, "area");
        double expected = 25;

        CalculatorController controller = new CalculatorController();
        CalculationResult result = controller.calculate(request);

        assertEquals(expected, result.getResult(), 0.001);
    }

       @Test
    public void testInvalidOperation() {
        CalculationRequest request = new CalculationRequest(2, 3, "invalid");

        CalculatorController controller = new CalculatorController();

        try {
            controller.calculate(request);
        } catch (IllegalArgumentException ex) {
            assertEquals("Invalid operation", ex.getMessage());
        }
    }
}
