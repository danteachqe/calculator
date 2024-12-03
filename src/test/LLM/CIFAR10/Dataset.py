from datasets import load_dataset

# Download and load the CIFAR-10 dataset
dataset = load_dataset("cifar10")

# Inspect the dataset structure
print(dataset)
