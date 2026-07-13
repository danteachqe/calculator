package com;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CalculatorControllerCalculationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testAdd() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":2,\"number2\":3,\"operation\":\"add\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value(5.0));
    }

    @Test
    public void testSubtract() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":5,\"number2\":2,\"operation\":\"subtract\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value(3.0));
    }

    @Test
    public void testSubtractNegative() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":0,\"number2\":2,\"operation\":\"subtract\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value(-2.0));
    }

    @Test
    public void testMultiply() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":4,\"number2\":3,\"operation\":\"multiply\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value(12.0));
    }

    @Test
    public void testDivide() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":10,\"number2\":5,\"operation\":\"divide\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value(2.0));
    }

    @Test
    public void testDivideByZero() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":10,\"number2\":0,\"operation\":\"divide\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void testArea() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":10,\"number2\":5,\"operation\":\"area\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result").value(25.0));
    }

    @Test
    public void testInvalidOperation() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":2,\"number2\":3,\"operation\":\"invalid\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void testMissingOperation() throws Exception {
        mockMvc.perform(post("/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"number1\":2,\"number2\":3}"))
            .andExpect(status().isBadRequest());
    }
}
