import openai
from deepeval.benchmarks import TruthfulQA
from deepeval.benchmarks.modes import TruthfulQAMode
import os

# Load the API key from an environment variable
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

openai.api_key = api_key

# Define a model class that will be passed to the benchmark
class GPT4Model:
    def __init__(self, model_name="gpt-4"):
        self.model_name = model_name

    # This method must return a single string as an answer
    def generate(self, prompt):
        response = openai.ChatCompletion.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message['content'].strip()

# Initialize your GPT-4 model
gpt4_model = GPT4Model()

# Define the benchmark with specific shots
benchmark = TruthfulQA(mode=TruthfulQAMode.MC2)

# Evaluate the GPT-4 model
try:
    # Pass the model instance directly if the benchmark is designed to handle such objects
    results = benchmark.evaluate(gpt4_model)
    print(f"Overall Score: {results.overall_score}")
except Exception as e:
    print(f"An error occurred during evaluation: {e}")
