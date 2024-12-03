import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments, DataCollatorWithPadding
from datasets import load_dataset
import evaluate

# 1. Load the BERT-base model and tokenizer
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

# 2. Load the GLUE dataset (e.g., SST-2 for sentiment analysis)
task = "sst2"  # Change this for other GLUE tasks (e.g., 'mrpc', 'qqp')
dataset = load_dataset("glue", task)

# 3. Preprocess the dataset
def preprocess_function(examples):
    return tokenizer(examples["sentence"], truncation=True, padding="max_length", max_length=128)

encoded_dataset = dataset.map(preprocess_function, batched=True)

# 4. Load evaluation metric using `evaluate`
metric = evaluate.load("glue", task)

# 5. Define a function to compute the metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = logits.argmax(axis=1)
    return metric.compute(predictions=predictions, references=labels)

# 6. Create a DataCollator for dynamic padding
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# 7. Prepare evaluation arguments
training_args = TrainingArguments(
    output_dir="./results",
    per_device_eval_batch_size=64,
    logging_dir="./logs",
    do_train=False,  # No training
    do_eval=True,    # Only evaluation
)

# 8. Initialize Trainer for evaluation
trainer = Trainer(
    model=model,
    args=training_args,
    eval_dataset=encoded_dataset["validation"],
    compute_metrics=compute_metrics,
    data_collator=data_collator,  # Use data collator instead of tokenizer
)

# 9. Evaluate the model on the validation set
results = trainer.evaluate()

# DEBUG: Print all metrics returned by the evaluation
print("Evaluation Results:", results)

# 10. Filter GLUE-specific metrics
# Exclude metrics unrelated to GLUE (e.g., runtime, loss)
excluded_metrics = ["eval_loss", "eval_runtime", "eval_samples_per_second", "eval_steps_per_second", "eval_model_prepare_time"]
glue_metrics = {k: v for k, v in results.items() if k not in excluded_metrics}

# Convert GLUE metrics to a DataFrame for visualization
results_df = pd.DataFrame.from_dict(glue_metrics, orient="index", columns=["Value"])
results_df.reset_index(inplace=True)
results_df.columns = ["Metric", "Value"]

# DEBUG: Ensure DataFrame is populated correctly
print("Filtered Results for Graph:", results_df)

# 11. Plot the GLUE metrics
plt.figure(figsize=(10, 6))
sns.barplot(x="Metric", y="Value", data=results_df, palette="viridis")
plt.title(f"GLUE Evaluation Results for Task: {task.upper()}", fontsize=16)
plt.xlabel("Metrics", fontsize=14)
plt.ylabel("Values", fontsize=14)
plt.xticks(rotation=45, fontsize=12)
plt.tight_layout()
plt.show()
