from openai import OpenAI
import os
import numpy as np
from datasets import load_dataset
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Initialize OpenAI client
openai_api_key = os.environ.get('OPENAI_API_KEY')
if not openai_api_key:
    print("Error: OPENAI_API_KEY not found in environment variables.")
    exit(1)

client = OpenAI(api_key=openai_api_key)

def get_openai_response(prompt):
    """
    Sends a prompt to OpenAI's API using the updated OpenAI client and retrieves the response.
    """
    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        chat_response = completion.choices[0].message.content.strip()
        return chat_response
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def evaluate_sst2_first_50():
    """
    Evaluates the SST-2 task using the OpenAI API and computes metrics for the first 50 validation examples.
    """
    # Load the SST-2 dataset
    dataset = load_dataset("glue", "sst2")
    validation_set = dataset["validation"]

    # Ensure we are iterating over dictionaries (convert to a list of dictionaries)
    validation_examples = list(validation_set)

    # Store predictions and labels
    predictions = []
    labels = []

    # Evaluate only the first 50 examples
    for idx, example in enumerate(validation_examples[:50]):
        # Ensure 'sentence' is accessed correctly
        prompt = f"Classify the sentiment of the following sentence as positive or negative: \"{example['sentence']}\""

        # Get the model's prediction using OpenAI API
        response = get_openai_response(prompt)
        
        # Show prompt and response
        print(f"Prompt ({idx + 1}): {prompt}")
        print(f"Response: {response}")

        if response is not None:
            # Convert the response to a label (e.g., 0 or 1)
            if "positive" in response.lower():
                predictions.append(1)
            elif "negative" in response.lower():
                predictions.append(0)
            else:
                print(f"Unexpected response: {response}")
                predictions.append(-1)  # Placeholder for unknown responses
        else:
            predictions.append(-1)  # Handle API failures

        # Store the true label
        labels.append(example["label"])

    # Filter out invalid predictions
    valid_indices = [i for i, pred in enumerate(predictions) if pred != -1]
    valid_predictions = [predictions[i] for i in valid_indices]
    valid_labels = [labels[i] for i in valid_indices]

    # Compute evaluation metrics
    accuracy = accuracy_score(valid_labels, valid_predictions)
    precision = precision_score(valid_labels, valid_predictions, average="binary")
    recall = recall_score(valid_labels, valid_predictions, average="binary")
    f1 = f1_score(valid_labels, valid_predictions, average="binary")

    # Display results
    results = {
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1-Score": f1
    }
    for metric, value in results.items():
        print(f"{metric}: {value:.4f}")

    return results

# Run the evaluation for the first 50 SST-2 examples
if __name__ == "__main__":
    evaluate_sst2_first_50()
