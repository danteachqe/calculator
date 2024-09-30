import os
import requests
import json

def get_openai_response(prompt):
    """
    Sends a prompt to OpenAI's ChatGPT and retrieves the response.
    """
    openai_api_key = os.environ.get('OPENAI_API_KEY')
    if not openai_api_key:
        print("Error: OPENAI_API_KEY not found in environment variables.")
        return None

    openai_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_api_key}"
    }
    data = {
        "model": "gpt-4",  # You can change to "gpt-3.5-turbo" if needed
        "messages": [
            {"role": "system", "content": "You are ChatGPT, a large language model trained by OpenAI."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 500,  # Adjust as needed
        "n": 1,
        "stop": None,
        "temperature": 0.7
    }

    try:
        response = requests.post(openai_url, headers=headers, data=json.dumps(data))
        response.raise_for_status()
        result = response.json()
        chat_response = result['choices'][0]['message']['content'].strip()
        return chat_response
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred while contacting OpenAI: {http_err}")
    except Exception as err:
        print(f"An error occurred while contacting OpenAI: {err}")
    return None

def analyze_text_with_perspective(text):
    """
    Sends text to Perspective API and retrieves the analysis.
    """
    perspective_api_key = os.environ.get('PERSPECTIVE_API_KEY')
    if not perspective_api_key:
        print("Error: PERSPECTIVE_API_KEY not found in environment variables.")
        return None

    perspective_url = f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={perspective_api_key}"
    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        'comment': {'text': text},
        'requestedAttributes': {
            'TOXICITY': {},
            'SEVERE_TOXICITY': {},
            'IDENTITY_ATTACK': {},
            'INSULT': {},
            'PROFANITY': {},
            'THREAT': {}
        },
        'languages': ['en']  # Specify languages if needed
    }

    try:
        response = requests.post(perspective_url, headers=headers, data=json.dumps(data))
        response.raise_for_status()
        result = response.json()
        return result
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred while contacting Perspective API: {http_err}")
    except Exception as err:
        print(f"An error occurred while contacting Perspective API: {err}")
    return None

def print_perspective_analysis(analysis):
    """
    Prints the Perspective API analysis in a readable format.
    """
    if not analysis:
        print("No analysis data to display.")
        return

    print("\n--- Perspective API Analysis ---\n")
    attributes = analysis.get('attributeScores', {})
    for attribute, details in attributes.items():
        score = details.get('summaryScore', {}).get('value', 'N/A')
        print(f"{attribute.replace('_', ' ').title()}: {score}")
    print("\n--- End of Analysis ---\n")

def main():
    """
    Main function to execute the workflow.
    """
    # Prompt the user for input
    prompt = input("Enter your prompt for ChatGPT: ").strip()
    if not prompt:
        print("No prompt provided. Exiting.")
        return

    print("\nSending prompt to ChatGPT...\n")
    chat_response = get_openai_response(prompt)
    if not chat_response:
        print("Failed to get a response from ChatGPT.")
        return

    print("=== ChatGPT's Response ===")
    print(chat_response)
    print("==========================\n")

    print("Sending ChatGPT's response to Perspective API for analysis...\n")
    analysis = analyze_text_with_perspective(chat_response)
    if not analysis:
        print("Failed to get analysis from Perspective API.")
        return

    print_perspective_analysis(analysis)

if __name__ == "__main__":
    main()
