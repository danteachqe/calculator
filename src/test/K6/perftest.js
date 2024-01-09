import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  stages: [
    // Phase 1: 400 requests/second for 60 seconds
    { duration: '20s', target: 100 },

    // Phase 2: 700 requests/second for 20 seconds
    { duration: '20s', target: 500 },

    // Phase 3: 300 requests/second for the remaining time (80 seconds)
    { duration: '15s', target: 1800 },

    { duration: '15s', target: 500 },

    { duration: '10s', target: 0 },
  ],
};

export default function () {
  // Define the request payload
  let payload = JSON.stringify({
    operation: 'divide', // Change the operation as needed
    number1: 5, // Change the numbers as needed
    number2: 9,
  });

  // Set the request headers
  let headers = {
    'Content-Type': 'application/json',
  };

  // Send the POST request to your local web service on port 8080
  let response = http.post('https://playground1.azurewebsites.net/calculate', payload, { headers: headers });

  // Check for a successful response (HTTP status code 200)
  check(response, {
    'is status 200': (r) => r.status === 200,
  });

  // Sleep for a short duration between requests (adjust as needed)
  sleep(0.1); // Sleep for 100 milliseconds
}
