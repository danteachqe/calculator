import os
import json
import openai
import csv
from typing import List
from tqdm import tqdm
from tenacity import retry, wait_exponential, stop_after_attempt

# ==============================
# Configuration
# ==============================

# **WARNING:** Embedding API keys directly in code is insecure.
# Ensure this script is stored securely and not shared publicly.

# Retrieve OpenAI API key from environment variable
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found in environment variables.")

# Dataset Details
DATASET_PATH = r"C:\Cursuri\CURSURI\Quality Engineering\code\src\test\LLM\dataset\gpqa\dataset\gpqa_modified.csv"  # Updated path to use the provided dataset location

# OpenAI Model Configuration
MODEL_NAME = 'gpt-4'  # You can change this to 'gpt-3.5-turbo' or another model if preferred
TEMPERATURE = 0  # Set to 0 for deterministic outputs

# Evaluation Configuration
NUM_SAMPLES = 1  # Number of samples to generate per question
USE_SEMANTIC_SIMILARITY = False  # Set to True to use semantic similarity for evaluation
SEMANTIC_SIMILARITY_THRESHOLD = 0.8  # Threshold for semantic similarity (if used)

# Number of questions to limit the evaluation
QUESTION_LIMIT = 5  # Only test the first 5 questions

# ==============================
# Step 1: Load and Parse the GPQA Dataset
# ==============================

def load_gpqa_dataset_csv(dataset_path: str) -> List[dict]:
    """
    Loads the GPQA dataset from a CSV file.

    Args:
        dataset_path (str): Path to the dataset file.

    Returns:
        List[dict]: List of tasks, each containing 'question', 'correct_answer', and 'possible_answers'.
    """
    tasks = []
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file not found at '{dataset_path}'. Please check the filename and path.")
    
    print(f"Loading dataset from '{dataset_path}'...")
    with open(dataset_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader):
            if i >= QUESTION_LIMIT:
                break  # Stop after reading the first 5 questions

            question = row.get('Question')
            correct_answer = row.get('Correct Answer')  # Column B holds the correct answer
            possible_answers = [
                row.get('Correct Answer'),  # Column B
                row.get('Possible Answer 1'),  # Column C
                row.get('Possible Answer 2'),  # Column D
                row.get('Possible Answer 3'),  # Column E
            ]

            if not question or not correct_answer or any(ans is None for ans in possible_answers):
                print(f"A row is missing data. Skipping row {i + 1}.")
                continue
            
            tasks.append({
                "question": question.strip(),
                "correct_answer": correct_answer.strip(),
                "possible_answers": [ans.strip() for ans in possible_answers]
            })
    
    print(f"Loaded {len(tasks)} tasks from the dataset.")
    return tasks

# ==============================
# Step 2: Define the GPTModel Class
# ==============================

class GPTModel:
    """
    A class to interact with the OpenAI API for generating responses.
    """

    def __init__(self, model_name: str = "gpt-4", api_key: str = ''):
        self.model_name = model_name
        if not api_key:
            raise ValueError("OpenAI API key must be provided.")
        openai.api_key = api_key

    @retry(wait=wait_exponential(multiplier=1, min=4, max=10), stop=stop_after_attempt(5))
    def generate(self, prompt: str) -> str:
        """
        Generates a response for a given prompt using the OpenAI API.

        Args:
            prompt (str): The input prompt/question.

        Returns:
            str: The generated response.
        """
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=TEMPERATURE  # Set to 0 for deterministic output
            )
            if response.choices and response.choices[0].message:
                return response.choices[0].message.content.strip()
            return "No response generated."
        except openai.error.RateLimitError as e:
            print(f"Rate limit exceeded: {e}. Retrying...")
            raise
        except openai.error.OpenAIError as e:
            print(f"OpenAI API error: {e}")
            raise

    def generate_samples(self, prompt: str, k: int = 1) -> List[str]:
        """
        Generates multiple samples for a given prompt.

        Args:
            prompt (str): The input prompt/question.
            k (int): Number of samples to generate.

        Returns:
            List[str]: List of generated responses.
        """
        # Add the print statement to display the prompt and response
        print(f"\nPrompt sent to GPT: {prompt}\n")
        responses = [self.generate(prompt) for _ in range(k)]
        for response in responses:
            print(f"Response from GPT: {response}\n")
        return responses

# ==============================
# Step 3: Implement the Evaluation Logic
# ==============================

def evaluate_model(model: GPTModel, tasks: List[dict], k: int = 1):
    """
    Evaluates the model against the GPQA tasks.

    Args:
        model (GPTModel): The GPTModel instance.
        tasks (List[dict]): List of tasks from the GPQA dataset.
        k (int): Number of samples to generate per task.

    Returns:
        float: The overall accuracy of the model.
    """
    correct = 0
    total = len(tasks)

    for task in tqdm(tasks, desc="Evaluating GPQA"):
        question = task.get('question')
        correct_answer = task.get('correct_answer')  # Always the correct answer from column B
        possible_answers = task.get('possible_answers')

        if not question or not correct_answer or not possible_answers:
            print("Task missing required fields. Skipping.")
            continue

        # Formulate the prompt with all possible answers
        formatted_prompt = f"Question: {question}\nPossible answers:\n"
        for i, ans in enumerate(possible_answers, start=1):
            formatted_prompt += f"{i}. {ans}\n"
        formatted_prompt += "Please select the correct answer by indicating the answer number."

        try:
            samples = model.generate_samples(formatted_prompt, k=k)
        except Exception as e:
            print(f"Error generating samples for question: {question}\nError: {e}")
            continue

        match_found = False
        for sample in samples:
            # Now, instead of comparing by index, we directly check if the correct answer is mentioned in the response.
            if correct_answer in sample:  # Direct comparison with the correct answer (column B)
                match_found = True
                break

        if match_found:
            correct += 1

    accuracy = correct / total if total > 0 else 0
    print(f"\nEvaluation Completed.\nTotal Tasks: {total}\nCorrect Predictions: {correct}\nAccuracy: {accuracy:.2%}")
    return accuracy

# ==============================
# Step 4: Main Execution Flow
# ==============================

def main():
    # Step 1: Load the Dataset from Local CSV
    try:
        tasks = load_gpqa_dataset_csv(DATASET_PATH)
    except FileNotFoundError as e:
        print(e)
        return
    except Exception as e:
        print(f"An unexpected error occurred while loading the dataset: {e}")
        return

    # Step 2: Initialize the GPT Model
    try:
        model = GPTModel(model_name=MODEL_NAME, api_key=OPENAI_API_KEY)
    except ValueError as e:
        print(e)
        return
    except Exception as e:
        print(f"An unexpected error occurred while initializing the model: {e}")
        return

    # Step 3: Evaluate the Model
    print("\nStarting Evaluation...\n")
    try:
        accuracy = evaluate_model(
            model=model,
            tasks=tasks,
            k=NUM_SAMPLES
        )
        print(f"\nFinal GPQA Accuracy: {accuracy:.2%}")
    except Exception as e:
        print(f"An unexpected error occurred during evaluation: {e}")
        return

if __name__ == "__main__":
    main()
