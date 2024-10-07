import os
import sacrebleu
from openai import OpenAI

# Optionally, set the API key here if it's not set as an environment variable
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

client = OpenAI(api_key=api_key)  # Instantiate the client with the API key

class GPT35Model:
    def __init__(self, model_name="gpt-3.5-turbo"):
        self.model_name = model_name

    def generate(self, prompt):
        completion = client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        if completion.choices and completion.choices[0].message:
            return completion.choices[0].message.content.strip()
        return "No response generated."

def calculate_bleu(reference, candidate):
    bleu = sacrebleu.corpus_bleu([candidate], [[reference]])
    return bleu.score

def main():
    # Input English sentence
    english_sentence = input("Enter the English sentence: ")
    
    # Input benchmark German translation
    benchmark_translation = input("Enter the benchmark German translation: ")

    # Get ChatGPT translation
    gpt35_model = GPT35Model()
    prompt = f"Translate the following sentence from English to German: {english_sentence}"
    chatgpt_translation = gpt35_model.generate(prompt)
    print(f"ChatGPT Translation: {chatgpt_translation}")

    # Calculate BLEU score
    bleu_score = calculate_bleu(benchmark_translation, chatgpt_translation)
    print(f"BLEU Score: {bleu_score}")

if __name__ == "__main__":
    main()