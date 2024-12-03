# Install required libraries if not already installed
# You can uncomment and run these lines if necessary
# !pip install transformers datasets torch torchvision evaluate

import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification, TrainingArguments, Trainer
from datasets import load_dataset
import torchvision.transforms as transforms
import numpy as np

# Load the CIFAR-10 dataset
dataset = load_dataset("cifar10")

# Choose a pre-trained model suitable for CPU training
model_name_or_path = 'google/mobilenet_v2_1.0_224'  # MobileNetV2 is lightweight and CPU-friendly

# Load the image processor and model
image_processor = AutoImageProcessor.from_pretrained(model_name_or_path)
model = AutoModelForImageClassification.from_pretrained(
    model_name_or_path,
    num_labels=10,  # CIFAR-10 has 10 classes
    id2label={str(i): label for i, label in enumerate(dataset['train'].features['label'].names)},
    label2id={label: str(i) for i, label in enumerate(dataset['train'].features['label'].names)},
    ignore_mismatched_sizes=True  # Add this parameter
)

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize images to 224x224
    transforms.ToTensor(),
    transforms.Normalize(mean=image_processor.image_mean, std=image_processor.image_std)
])

# Preprocessing function to apply transformations
def preprocess_images(examples):
    examples['pixel_values'] = [transform(image.convert("RGB")) for image in examples['img']]
    examples['labels'] = examples['label']
    return examples

# Apply the preprocessing to the dataset
prepared_dataset = dataset.with_transform(preprocess_images)

# Define a data collator
def collate_fn(batch):
    pixel_values = torch.stack([example['pixel_values'] for example in batch])
    labels = torch.tensor([example['labels'] for example in batch])
    return {'pixel_values': pixel_values, 'labels': labels}

# Set up training arguments
training_args = TrainingArguments(
    output_dir='./results',
    per_device_train_batch_size=8,  # Adjust batch size as per your CPU memory
    per_device_eval_batch_size=8,
    num_train_epochs=3,  # You can increase this for better performance
    evaluation_strategy="epoch",
    save_strategy="epoch",
    logging_strategy="steps",
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    save_total_limit=1,
    remove_unused_columns=False,  # Needed when using with_transform
)

# Define a compute_metrics function for evaluation
from evaluate import load
metric = load("accuracy")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)

# Initialize the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=prepared_dataset['train'],
    eval_dataset=prepared_dataset['test'],
    compute_metrics=compute_metrics,
    data_collator=collate_fn,
)

# Start training
trainer.train()

# Evaluate the model
eval_results = trainer.evaluate()
print(f"Accuracy on the CIFAR-10 test set: {eval_results['eval_accuracy']*100:.2f}%")

# Additional evaluation logic
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Generate predictions on the test dataset
all_preds = []
all_labels = []

# Iterate over the test dataset using the Trainer's prediction method
predictions = trainer.predict(prepared_dataset['test'])
logits, labels = predictions.predictions, predictions.label_ids

# Convert logits to predicted class indices
all_preds = np.argmax(logits, axis=-1)
all_labels = labels

# Compute accuracy
accuracy = accuracy_score(all_labels, all_preds)
print(f"Accuracy on the CIFAR-10 test set (post-evaluation): {accuracy*100:.2f}%")

# Generate classification report
report = classification_report(all_labels, all_preds, target_names=dataset['test'].features['label'].names)
print("Classification Report:")
print(report)

# Generate confusion matrix
cm = confusion_matrix(all_labels, all_preds)

# Plot confusion matrix
plt.figure(figsize=(10, 7))
sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=dataset['test'].features['label'].names,
    yticklabels=dataset['test'].features['label'].names
)
plt.xlabel('Predicted')
plt.ylabel('True')
plt.title('Confusion Matrix')
plt.show()
