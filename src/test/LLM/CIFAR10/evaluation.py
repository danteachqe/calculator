# Install required libraries if not already installed
# Uncomment and run these lines if necessary
# !pip install transformers datasets torch torchvision scikit-learn matplotlib seaborn

import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from datasets import load_dataset
import torchvision.transforms as transforms
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

# Load the CIFAR-10 dataset
dataset = load_dataset("cifar10")

# Use a pre-trained model from Hugging Face
model_name_or_path = "google/mobilenet_v2_1.0_224"  # Pre-trained MobileNetV2

# Load the image processor and model
image_processor = AutoImageProcessor.from_pretrained(model_name_or_path)
model = AutoModelForImageClassification.from_pretrained(model_name_or_path)

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

# Apply the preprocessing to the test dataset
test_dataset = dataset['test'].with_transform(preprocess_images)

# Define a data collator
def collate_fn(batch):
    pixel_values = torch.stack([example['pixel_values'] for example in batch])
    labels = torch.tensor([example['labels'] for example in batch])
    return {'pixel_values': pixel_values, 'labels': labels}

# Create a DataLoader for the test dataset
from torch.utils.data import DataLoader
test_dataloader = DataLoader(test_dataset, batch_size=8, collate_fn=collate_fn)

# Set model to evaluation mode
model.eval()

# Move model to appropriate device (CPU in this case)
device = torch.device('cpu')
model.to(device)

# Disable gradient calculation for evaluation
# Update this part in the evaluation loop
with torch.no_grad():
    all_preds = []
    all_labels = []

    for batch in test_dataloader:
        pixel_values = batch['pixel_values'].to(device)
        labels = batch['labels'].to(device)
        outputs = model(pixel_values=pixel_values)
        logits = outputs.logits

        # Reduce logits to top 10 for comparison with CIFAR-10 classes
        top_10_logits = logits[:, :10]
        predictions = torch.argmax(top_10_logits, dim=-1)

        all_preds.extend(predictions.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())


# Compute accuracy
accuracy = accuracy_score(all_labels, all_preds)
print(f"Accuracy on the CIFAR-10 test set (non-fine-tuned): {accuracy*100:.2f}%")

# Generate classification report
# report = classification_report(all_labels, all_preds, target_names=dataset['test'].features['label'].names)
# print("Classification Report:")
# print(report)

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
plt.title('Confusion Matrix (Non-Fine-Tuned Model)')
plt.show()
