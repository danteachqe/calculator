from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Define the model name and number of labels
model_name = "roberta-base"  # Change to your desired model


# Download model and tokenizer
print(f"Downloading model: {model_name}")
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Save the model and tokenizer
model.save_pretrained("./model")
tokenizer.save_pretrained("./model")
print("Model and tokenizer saved in ./model.")
