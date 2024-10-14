import os
import requests
import json
from datasets import load_dataset
from tqdm import tqdm
import string
from collections import Counter
import re

def get_openai_response(question, model="gpt-4", max_tokens=150, temperature=0.3):
    """
    Sends a prompt to OpenAI's ChatGPT and retrieves the response.
    """
    openai_api_key = os.environ.get('OPENAI_API_KEY')
    if not openai_api_key:
        print("Error: OPENAI_API_KEY not found in environment variables.")
        return None

    # Debugging: Print the length of the API key to confirm it's set
    print(f"DEBUG: OpenAI API Key is set. Length: {len(openai_api_key)} characters.")

    openai_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_api_key}"
    }
    data = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that provides concise and accurate answers to questions. Provide only the answer without any additional explanations."
            },
            {
                "role": "user",
                "content": f"Provide a single, concise answer to the following question without any additional explanation.\n\nQuestion: {question}"
            }
        ],
        "max_tokens": max_tokens,
        "n": 1,
        "stop": ["\n", "Question:"],
        "temperature": temperature
    }

    try:
        response = requests.post(openai_url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        chat_response = result['choices'][0]['message']['content'].strip()
        return chat_response
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred while contacting OpenAI: {http_err}")
    except Exception as err:
        print(f"An error occurred while contacting OpenAI: {err}")
    return None

def normalize_text(s):
    """
    Lowercases, removes punctuation (except hyphens and en-dashes), removes articles, and extra whitespace from a string.
    """
    s = s.lower()
    s = re.sub(r'\b(a|an|the)\b', ' ', s)  # Remove articles
    s = re.sub(r'[^a-z0-9\s\-–]', '', s)   # Remove punctuation except hyphens and en-dashes
    s = re.sub(r'\s+', ' ', s).strip()     # Remove extra whitespace
    return s

def exact_match_score(prediction, ground_truth):
    """
    Computes the Exact Match score.
    """
    return int(normalize_text(prediction) == normalize_text(ground_truth))

def f1_score(prediction, ground_truth):
    """
    Computes the F1 score between the prediction and ground truth.
    """
    pred_tokens = normalize_text(prediction).split()
    gt_tokens = normalize_text(ground_truth).split()

    common = Counter(pred_tokens) & Counter(gt_tokens)
    num_same = sum(common.values())

    if num_same == 0:
        return 0

    precision = num_same / len(pred_tokens)
    recall = num_same / len(gt_tokens)
    f1 = 2 * precision * recall / (precision + recall)
    return f1 * 100  # Convert to percentage

def load_squad_dataset(split='validation'):
    """
    Loads the SQuAD v1.1 dataset.
    Available splits: 'train', 'validation'
    """
    try:
        dataset = load_dataset("squad", split=split)
        return dataset
    except Exception as e:
        print(f"Error loading SQuAD dataset: {e}")
        return None

def main():
    """
    Main function to execute the benchmarking workflow.
    """
    # Load SQuAD dataset
    print("Loading SQuAD v1.1 dataset...")
    squad_dataset = load_squad_dataset(split='validation')  # Using 'validation' split for quicker benchmarking
    if not squad_dataset:
        print("Failed to load SQuAD dataset. Exiting.")
        return

    # Inspect the first sample
    first_sample = squad_dataset[0]
    print("\nFirst sample type:", type(first_sample))
    print("First sample content:", json.dumps(first_sample, indent=2))

    # For demonstration, limit to first N questions to manage API usage
    N = 10  # Adjusted to process only the first 10 questions
    print(f"\nBenchmarking on the first {N} questions of the SQuAD validation set.\n")

    # Select the first N samples using 'select'
    try:
        selected_dataset = squad_dataset.select(range(N))
    except Exception as e:
        print(f"Error selecting first {N} samples: {e}")
        return

    total_questions = N
    exact_matches = 0
    f1_scores = []
    results = []

    for idx, sample in enumerate(tqdm(selected_dataset, total=N, desc="Processing Questions"), start=1):
        # Check if sample is a dictionary
        if not isinstance(sample, dict):
            print(f"Sample {idx} is not a dict. It is a {type(sample)}. Skipping.")
            continue

        question = sample.get("question", "")
        reference_answers = sample.get("answers", {}).get("text", [])

        if not question or not reference_answers:
            print(f"Sample {idx} is missing 'question' or 'answers'. Skipping.")
            continue

        prompt = f"Provide a single, concise answer to the following question without any additional explanation.\n\nQuestion: {question}"

        chatgpt_answer = get_openai_response(question)

        if chatgpt_answer is None:
            print(f"Failed to get a response for question {idx}. Skipping.")
            continue

        # Evaluate Exact Match (if any reference answer matches)
        em = any(exact_match_score(chatgpt_answer, gt) for gt in reference_answers)
        exact_matches += em

        # Evaluate F1 Score (use the maximum F1 score across all reference answers)
        f1 = max(f1_score(chatgpt_answer, gt) for gt in reference_answers)
        f1_scores.append(f1)

        # Store results
        results.append({
            'Question': question,
            'Reference_Answers': reference_answers,
            'ChatGPT_Answer': chatgpt_answer,
            'Exact_Match': em,
            'F1_Score': f1
        })

        # Print detailed results for each question
        print(f"=== Question {idx} ===")
        print(f"Question: {question}")
        print(f"Reference Answers: {reference_answers}")
        print(f"ChatGPT Answer: {chatgpt_answer}")
        print(f"Exact Match: {'✔️' if em else '❌'}")
        print(f"F1 Score: {f1:.2f}\n")

    # Calculate overall metrics
    accuracy = (exact_matches / total_questions) * 100
    average_f1 = sum(f1_scores) / len(f1_scores) if f1_scores else 0.0

    print("\n=== Benchmark Results ===")
    print(f"Total Questions: {total_questions}")
    print(f"Exact Matches: {exact_matches}")
    print(f"Accuracy (Exact Match): {accuracy:.2f}%")
    print(f"Average F1 Score: {average_f1:.2f}")
    print("========================\n")

    # Optional: Save results to a JSON or CSV file
    # Uncomment the following lines to save to JSON
    # with open('benchmark_results.json', 'w', encoding='utf-8') as f:
    #     json.dump(results, f, ensure_ascii=False, indent=2)

    # Uncomment the following lines to save to CSV
    # import csv
    # with open('benchmark_results.csv', 'w', newline='', encoding='utf-8') as csvfile:
    #     fieldnames = ['Question', 'Reference_Answers', 'ChatGPT_Answer', 'Exact_Match', 'F1_Score']
    #     writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    #
    #     writer.writeheader()
    #     for row in results:
    #         writer.writerow(row)

if __name__ == "__main__":
    main()
