from datasets import load_dataset
from transformers import AutoTokenizer

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained("./model")  # Use your downloaded tokenizer

# Load Bias in Bios dataset
print("Downloading Bias in Bios dataset...")
dataset = load_dataset("LabHC/bias_in_bios", split="train[:5000]")  # Use a subset for quick testing

# Inspect the dataset structure
print(f"Columns in the dataset: {dataset.column_names}")

# Tokenize the dataset
def tokenize_function(examples):
    return tokenizer(examples["hard_text"], truncation=True, padding="max_length", max_length=128)

print("Tokenizing dataset...")
tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Rename the profession column to labels for classification
tokenized_dataset = tokenized_dataset.rename_column("profession", "labels")
tokenized_dataset = tokenized_dataset.with_format("torch")  # Convert to PyTorch tensors

# Save the processed dataset
tokenized_dataset.save_to_disk("./data")
print("Tokenized dataset saved in ./data.")
