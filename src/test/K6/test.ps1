# run-k6-cloud-test.ps1
$env:K6_CLOUD_TOKEN='your_api_token_here'
k6 cloud test-script.js