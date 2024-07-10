from openai import OpenAI
import os
from deepeval.benchmarks import TruthfulQA  
from deepeval.benchmarks.modes import TruthfulQAMode

# Optionally, set the API key here if it's not set as an environment variable
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

client = OpenAI(api_key=api_key)  # Instantiate the client with the API key

# Define a model class that will be passed to the benchmark
class GPT35Model:
    def __init__(self, model_name="gpt-3.5-turbo"):
        self.model_name = model_name

    # This method must return a single string as an answer
    def generate(self, prompt):
        completion = client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        # Correctly access the message content
        if completion.choices and completion.choices[0].message:
            return completion.choices[0].message.content.strip()
        return "No response generated."

# Initialize your GPT-3.5 model
gpt35_model = GPT35Model()

# Define the benchmark with specific shots
benchmark = TruthfulQA(mode=TruthfulQAMode.MC1)

# Evaluate the GPT-3.5 model
try:
    # Pass the model instance directly if the benchmark is designed to handle such objects
    results = benchmark.evaluate(gpt35_model)
    if isinstance(results, float):
        print(f"Overall TruthfulQA Accuracy: {results}")
    else:
        print(f"Overall Score: {results.overall_score}")
except Exception as e:
    print(f"An error occurred during evaluation: {e}")
