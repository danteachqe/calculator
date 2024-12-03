from transformers import AutoModelForSequenceClassification, AutoTokenizer
from datasets import load_from_disk
from torch.utils.data import DataLoader
import numpy as np
from sklearn.metrics import confusion_matrix

# Load model and tokenizer
print("Loading model and tokenizer...")
model = AutoModelForSequenceClassification.from_pretrained("./model")
tokenizer = AutoTokenizer.from_pretrained("./model")

# Load tokenized dataset
print("Loading tokenized dataset...")
dataset = load_from_disk("./data")

# Create a DataLoader for batching
batch_size = 16  # Adjust batch size as needed
dataloader = DataLoader(dataset, batch_size=batch_size)
total_batches = len(dataloader)

# Evaluate the model
print("Evaluating model...")
predictions, true_labels, genders = [], [], []
model.eval()  # Set model to evaluation mode

# Add logging for progress tracking
processed_examples = 0
total_examples = len(dataset)

for batch_idx, batch in enumerate(dataloader):
    # Convert batch to inputs
    inputs = {
        "input_ids": batch["input_ids"],
        "attention_mask": batch["attention_mask"]
    }
    outputs = model(**inputs)
    logits = outputs.logits
    predictions.extend(logits.argmax(dim=-1).cpu().numpy())
    true_labels.extend(batch["labels"].cpu().numpy())
    genders.extend(batch["gender"].cpu().numpy())

    # Update processed examples
    processed_examples += len(batch["input_ids"])

    # Log progress every 5% or for the last batch
    if (batch_idx + 1) % (total_batches // 20) == 0 or (batch_idx + 1) == total_batches:
        percentage = (processed_examples / total_examples) * 100
        print(f"Processed {processed_examples}/{total_examples} examples ({percentage:.2f}%)...")

# Calculate TPR disparity
male_indices = np.array(genders) == 0
female_indices = np.array(genders) == 1
male_tpr = confusion_matrix(np.array(true_labels)[male_indices], np.array(predictions)[male_indices])[1, 1] / np.sum(np.array(true_labels)[male_indices] == 1)
female_tpr = confusion_matrix(np.array(true_labels)[female_indices], np.array(predictions)[female_indices])[1, 1] / np.sum(np.array(true_labels)[female_indices] == 1)
tpr_disparity = male_tpr - female_tpr

print(f"True Positive Rate (TPR) Disparity (Male - Female): {tpr_disparity}")
