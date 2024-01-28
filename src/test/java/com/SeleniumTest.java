package com;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import io.github.bonigarcia.wdm.WebDriverManager;


public class SeleniumTest {

    private WebDriver driver;

    @BeforeEach
    public void setUp() {
        WebDriverManager.firefoxdriver().driverVersion("0.30.0").setup();
    
        FirefoxOptions options = new FirefoxOptions();
        options.setHeadless(true);
    
        driver = new FirefoxDriver(options);
        driver.manage().window().setSize(new Dimension(1313, 1080));
    }

    @Test
    public void testFlights() {
 
        // Test name: Flights
        // Step # | name | target | value
        // 1 | open | / |
        driver.get("https://blazedemo.com/");
 
        // 2 | setWindowSize | 1313x1080 |
        driver.manage().window().setSize(new Dimension(1313, 1080));
 
 
        // 3 | click | name=fromPort |
        driver.findElement(By.name("fromPort")).click();
 
 
        // 4 | select | name=fromPort | label=Boston
        {
            WebElement dropdown = driver.findElement(By.name("fromPort"));
            dropdown.findElement(By.xpath("//option[. = 'Boston']")).click();
        }
 
 
        // 5 | click | name=toPort |
        driver.findElement(By.name("toPort")).click();
 
 
        // 6 | select | name=toPort | label=New York
        {
            WebElement dropdown = driver.findElement(By.name("toPort"));
            dropdown.findElement(By.xpath("//option[. = 'New York']")).click();
        }
 
 
        // 7 | click | css=.btn-primary |
        driver.findElement(By.cssSelector(".btn-primary")).click();
 
 
        // 8 | click | css=tr:nth-child(1) .btn |
        driver.findElement(By.cssSelector("tr:nth-child(1) .btn")).click();
 
 
        // 9 | click | id=inputName |
        driver.findElement(By.id("inputName")).click();
 
 
        // 10 | type | id=inputName | Henok
        driver.findElement(By.id("inputName")).sendKeys("Henok");
 
 
        // 11 | type | id=address | 123 Manin Str
        driver.findElement(By.id("address")).sendKeys("123 Manin Str");
 
 
        // 12 | type | id=city | Atlanta
        driver.findElement(By.id("city")).sendKeys("Atlanta");
        // 13 | type | id=state | GA
        driver.findElement(By.id("state")).sendKeys("GA");
        // 14 | type | id=zipCode | 30324
        driver.findElement(By.id("zipCode")).sendKeys("30324");
        // 15 | click | id=cardType |
        driver.findElement(By.id("cardType")).click();
        // 16 | select | id=cardType | label=American Express
        {
            WebElement dropdown = driver.findElement(By.id("cardType"));
            dropdown.findElement(By.xpath("//option[. = 'American Express']")).click();
        }
        // 17 | click | id=creditCardNumber |
        driver.findElement(By.id("creditCardNumber")).click();
        // 18 | type | id=creditCardNumber | 1111222233334444
        driver.findElement(By.id("creditCardNumber")).sendKeys("1111222233334444");
        // 19 | click | id=creditCardYear |
        driver.findElement(By.id("creditCardYear")).click();
        // 20 | type | id=creditCardYear | 2020
        driver.findElement(By.id("creditCardYear")).sendKeys("2020");
        // 21 | click | id=nameOnCard |
        driver.findElement(By.id("nameOnCard")).click();
        // 22 | type | id=nameOnCard | Henok Jiru
        driver.findElement(By.id("nameOnCard")).sendKeys("Henok Jiru");
        // 23 | click | css=.btn-primary |
        driver.findElement(By.cssSelector(".btn-primary")).click();
        try {
    Thread.sleep(5000); // Sleep for 5 seconds (5000 milliseconds)
} catch (InterruptedException e) {
    e.printStackTrace();
}
    }
 
        @AfterEach
        public void tearDown() {
            if (driver != null) {
            driver.quit();
            }
        }
    }
 