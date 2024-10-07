import os
import requests
import json
import sacrebleu

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
        "model": "gpt-4",  # Ensure this is the correct model name
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 500,  # Adjust as needed
        "n": 1,
        "stop": None,
        "temperature": 0.7
    }

    try:
        response = requests.post(openai_url, headers=headers, json=data)  # Use json=data instead of data=json.dumps(data)
        response.raise_for_status()
        result = response.json()
        
        # For debugging: Uncomment the next line to print the full response
        # print("Full API Response:", json.dumps(result, indent=2))
        
        chat_response = result['choices'][0]['message']['content'].strip()
        return chat_response, result  # Return both the translation and the full response
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred while contacting OpenAI: {http_err}")
    except Exception as err:
        print(f"An error occurred while contacting OpenAI: {err}")
    return None, None

def calculate_bleu(reference, candidate):
    """
    Calculates the BLEU score between the reference and candidate translations.
    """
    bleu = sacrebleu.corpus_bleu([candidate], [[reference]])
    return bleu.score

def main():
    """
    Main function to execute the workflow.
    """
    # Input English sentence
    english_sentence = input("Enter the English sentence: ").strip()
    if not english_sentence:
        print("No English sentence provided. Exiting.")
        return

    # Input benchmark German translation
    benchmark_translation = input("Enter the benchmark German translation: ").strip()
    if not benchmark_translation:
        print("No benchmark translation provided. Exiting.")
        return

    # Construct the prompt to translate from English to German
    prompt = f"Translate the following sentence from English to German: {english_sentence}"

    print("\nSending prompt to ChatGPT...\n")
    chatgpt_translation, api_response = get_openai_response(prompt)
    if not chatgpt_translation:
        print("Failed to get a response from ChatGPT.")
        return

    print("=== Input and Benchmark ===")
    print(f"English Sentence: {english_sentence}")
    print(f"Benchmark German Translation: {benchmark_translation}")
    print("===========================\n")

    print("=== ChatGPT's Translation ===")
    print(chatgpt_translation)
    print("==============================\n")

    # Optionally, print the full API response for debugging
    # print("=== Full OpenAI API Response ===")
    # print(json.dumps(api_response, indent=2))
    # print("=================================\n")

    # Calculate BLEU score
    bleu_score = calculate_bleu(benchmark_translation, chatgpt_translation)
    print(f"BLEU Score: {bleu_score}")

if __name__ == "__main__":
    main()
