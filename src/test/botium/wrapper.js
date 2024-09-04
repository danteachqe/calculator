const axios = require('axios');

// Load environment variables from .env file if using dotenv
// require('dotenv').config();

async function sendToChatGPT(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.");
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',  // or 'gpt-4' if you have access
        messages: [{ role: 'user', content: prompt }],
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    return response.data.choices[0].message.content;
}

sendToChatGPT('Hello, how are you?').then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
