import openai
import os
from sentence_transformers import SentenceTransformer, util

# Retrieve the OpenAI API key from an environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

if not openai.api_key:
    raise ValueError("OpenAI API key not found. Please set it in your environment variables.")

# Sentences for testing
sentences = [
    "The cat sat on the mat and stared at the window.",
    "The cat stared at the window while sitting on the mat.",
    "On the mat, the cat sat and stared at the window."
]

# Generate responses using OpenAI's API
responses = []
for sentence in sentences:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": sentence}]
    )
    responses.append(response['choices'][0]['message']['content'])

# Load a model for semantic similarity
similarity_model = SentenceTransformer('all-MiniLM-L6-v2')

# Calculate and print similarity scores
embeddings = similarity_model.encode(responses, convert_to_tensor=True)
similarity_scores = util.pytorch_cos_sim(embeddings, embeddings)

print("Semantic Similarity Scores between Responses:")
print(similarity_scores)
