import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '15s', target: 100 },
    { duration: '15s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': [
      `avg<=${__ENV.AVG_THRESHOLD}`,
      `p(90)<=${__ENV.P90_THRESHOLD}`
    ]
  },
};

export default function () {
  const payload = JSON.stringify({ operation: 'divide', number1: 5, number2: 9 });
  const headers = { 'Content-Type': 'application/json' };
  const response = http.post(__ENV.TEST_URL, payload, { headers });
  check(response, { 'is status 200': r => r.status === 200 });
}
