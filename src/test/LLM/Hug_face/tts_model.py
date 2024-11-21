from transformers import pipeline

# Load the question-answering pipeline
qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")

# Correct input format
result = qa_pipeline(question="What is Hugging Face?", context="Hugging Face is a platform for NLP.")
print(result)
