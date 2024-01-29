# Read values from JSON file
$Config = Get-Content -Path "config.json" | ConvertFrom-Json
$Env:TEST_URL = $Config.TEST_URL
$Env:AVG_THRESHOLD = $Config.AVG_THRESHOLD
$Env:P90_THRESHOLD = $Config.P90_THRESHOLD

# Run k6 test script
k6 run perfttest_file.js
