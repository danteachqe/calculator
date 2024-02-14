# Run this from the directory in which you saved your input images
# This script is adapted for PowerShell on Windows. Adjustments may be required for other platforms.

# Test that the first image is present
if (-Not (Test-Path "image0.jpeg")) {
    Write-Host "Could not find images in the current directory." -ForegroundColor Red
    exit 1
}

$API_KEY = "YOUR API KEY HERE"

# Convert the image to base64
$imageBase64 = [Convert]::ToBase64String((Get-Content -Path "image0.jpeg" -Encoding Byte))

# Construct the JSON payload
$jsonPayload = @"
{
  "contents": [
    {
      "parts": [
        {
          "text": "Describe what the people are doing in this image:\n"
        },
        {
          "inlineData": {
            "mimeType": "image/jpeg",
            "data": "$imageBase64"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.4,
    "topK": 32,
    "topP": 1,
    "maxOutputTokens": 4096,
    "stopSequences": []
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
"@

# Send the request to the API
$response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=$API_KEY" `
    -Method Post `
    -ContentType "application/json" `
    -Body $jsonPayload.Replace('$imageBase64', $imageBase64)

# Output the response
$response | ConvertTo-Json -Depth 10 | Write-Host
