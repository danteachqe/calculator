import openai
import os

# Load the API key from an environment variable
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

openai.api_key = api_key

class GPT4ChatModel:
    def __init__(self):
        self.model_name = "gpt-4"

    def generate(self, messages):
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,  # Use model here for chat-based API
                messages=messages
            )
            return response.choices[0].message['content'].strip()
        except Exception as e:
            return f"An error occurred: {e}"

# Initialize your GPT-4 model
gpt4_chat_model = GPT4ChatModel()

# Example usage
messages = [{"role": "user", "content": "What is the future of AI?"}]
print(gpt4_chat_model.generate(messages))
