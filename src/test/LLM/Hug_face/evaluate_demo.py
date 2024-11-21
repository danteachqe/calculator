import evaluate

# Load the metrics
accuracy_metric = evaluate.load("accuracy")
f1_metric = evaluate.load("f1")
precision_metric = evaluate.load("precision")
recall_metric = evaluate.load("recall")

# Define predictions and references
predictions = [0, 1, 1, 0, 1]
references = [0, 1, 0, 0, 1]

# Compute the accuracy
accuracy_result = accuracy_metric.compute(predictions=predictions, references=references)
print("Accuracy:", accuracy_result)

# Compute the F1 score
f1_result = f1_metric.compute(predictions=predictions, references=references, average="binary")
print("F1 Score:", f1_result)

# Compute the precision
precision_result = precision_metric.compute(predictions=predictions, references=references, average="binary")
print("Precision:", precision_result)

# Compute the recall
recall_result = recall_metric.compute(predictions=predictions, references=references, average="binary")
print("Recall:", recall_result)
