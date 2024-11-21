from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification


# Load a custom tokenizer
custom_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Load a compatible model
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")

# Create the pipeline with both model and tokenizer
classifier = pipeline("sentiment-analysis", model=model, tokenizer=custom_tokenizer)

# Run the classifier
res = classifier(" I love to code in python with pytorch")
print(res)

