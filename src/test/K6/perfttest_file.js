import http from 'k6/http';
import { check } from 'k6';
import { readFileSync } from 'fs';

// Simplified function to parse threshold values from the .txt file
function getThresholds() {
  const fileContent = readFileSync('./threshold_values.txt', 'utf8');
  const lines = fileContent.split('\n');
  const avg = lines.find(line => line.startsWith('avg:')).split(':')[1].trim();
  const p90 = lines.find(line => line.startsWith('p90:')).split(':')[1].trim();
  return { avg, p90 };
}

const { avg, p90 } = getThresholds();

export let options = {
  stages: [
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '15s', target: 100 },
    { duration: '15s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': [`avg<=${avg}`, `p(90)<=${p90}`]
  },
};

export default function () {
  const payload = JSON.stringify({ operation: 'divide', number1: 5, number2: 9 });
  const headers = { 'Content-Type': 'application/json' };
  const response = http.post('https://playground1.azurewebsites.net/calculate', payload, { headers });
  check(response, { 'is status 200': r => r.status === 200 });
}
