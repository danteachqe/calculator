import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  vus: 10,
  duration: '30s',
};
export default function () {
  // First request
  http.get('https://test.k6.io/browser.php');

  // Second request
  http.get('https://test.k6.io/contacts.php');

  // Third request
  http.get('https://test.k6.io/news.php');

  sleep(1);
}