import os
import torch
import requests
import json
from transformers import GPT2LMHeadModel, GPT2Tokenizer, GenerationConfig

def generate_response_gpt2(prompt, max_new_tokens=50):
    """
    Generates a continuation of the given prompt using GPT-2 with optimized settings for sentence completion.
    
    Parameters:
    - prompt (str): The incomplete sentence to be completed.
    - max_new_tokens (int): Maximum number of tokens to generate beyond the prompt.
    
    Returns:
    - response (str): The completed sentence.
    """
    try:
        # Load pre-trained GPT-2 model and tokenizer
        tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        model = GPT2LMHeadModel.from_pretrained('gpt2')
        
        # Since GPT-2 doesn't have a pad token, set it to eos_token to avoid warnings
        tokenizer.pad_token = tokenizer.eos_token
        model.config.pad_token_id = model.config.eos_token_id
        
        # Encode the input prompt
        inputs = tokenizer.encode(prompt, return_tensors='pt')
        
        # Ensure the model is in evaluation mode
        model.eval()
        
        # Move model and inputs to GPU if available
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        inputs = inputs.to(device)
        
        # Define generation configuration using GenerationConfig
        generation_config = GenerationConfig(
            max_new_tokens=max_new_tokens,   # Number of tokens to generate beyond the prompt
            temperature=0.7,                 # Lower temperature for less randomness
            top_p=0.9,                       # Nucleus sampling
            top_k=50,                        # Top-k sampling
            no_repeat_ngram_size=2,          # Prevent repeating n-grams
            do_sample=True,                  # Enable sampling
            num_return_sequences=1,          # Number of sequences to generate
            eos_token_id=tokenizer.eos_token_id,  # Ensure generation stops at EOS
        )
        
        # Generate text using the model with the specified configuration
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                generation_config=generation_config
            )
        
        # Decode the generated tokens to text
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract the continuation by removing the prompt from the generated text
        if generated_text.startswith(prompt):
            response = generated_text[len(prompt):].strip()
        else:
            response = generated_text.strip()
        
        return response
    
    except Exception as err:
        print(f"An error occurred while generating text with GPT-2: {err}")
        return None

def analyze_text_with_perspective(text):
    """
    Sends text to Perspective API and retrieves the analysis.
    
    Parameters:
    - text (str): The text to be analyzed.
    
    Returns:
    - result (dict): The JSON response from Perspective API containing analysis scores.
    """
    perspective_api_key = os.environ.get('PERSPECTIVE_API_KEY')
    if not perspective_api_key:
        print("Error: PERSPECTIVE_API_KEY not found in environment variables.")
        return None

    perspective_url = f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={perspective_api_key}"
    headers = {'Content-Type': 'application/json'}
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
        'languages': ['en']
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
    
    Parameters:
    - analysis (dict): The JSON response from Perspective API.
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
    Continuously prompts the user for input, generates completions, and analyzes them.
    """
    while True:
        # Prompt the user for input
        prompt = input("Enter your incomplete sentence (or type 'exit' to quit): ").strip()
        if not prompt or prompt.lower() == 'exit':
            print("Exiting.")
            break

        # Generate response with GPT-2
        print("\nGenerating response with GPT-2...\n")
        generated_response = generate_response_gpt2(prompt)
        if not generated_response:
            print("Failed to generate a response with GPT-2.\n")
            continue

        # Display GPT-2's response
        print("=== GPT-2's Completion ===")
        print(generated_response)
        print("===========================\n")

        # Analyze the generated response with Perspective API
        print("Sending GPT-2's response to Perspective API for analysis...\n")
        analysis = analyze_text_with_perspective(generated_response)
        if not analysis:
            print("Failed to get analysis from Perspective API.\n")
            continue

        # Display the analysis results
        print_perspective_analysis(analysis)

if __name__ == "__main__":
    main()
