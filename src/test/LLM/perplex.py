import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import math

# Load the pre-trained model and tokenizer
model_name = "gpt2"  # You can change to "gpt2-medium", "gpt2-large", etc.
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)

# Set the pad_token to the eos_token to handle padding correctly
tokenizer.pad_token = tokenizer.eos_token
model.eval()  # Set the model to evaluation mode

def calculate_perplexity(text):
    # Strip whitespace and validate that text is not empty
    text = text.strip()
    if not text:
        print("Error: Input text is empty. Please provide valid text.")
        return None

    # Tokenize and prepare the input with padding for batch compatibility
    encodings = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    
    # Ensure input tensor dimensions are as expected
    input_ids = encodings["input_ids"]
    attention_mask = encodings["attention_mask"] if "attention_mask" in encodings else None

    # Check if the input tensor has valid content
    if input_ids.size(1) == 0:
        print("Error: Tokenization resulted in an empty input. Please check your text.")
        return None

    # Calculate the loss (negative log likelihood)
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=input_ids)
        loss = outputs.loss.item()

    # Calculate perplexity
    perplexity = math.exp(loss)
    return perplexity

# Text to calculate perplexity on
text = ("The game began development in 2010 , carrying over a large portion of the work done on Valkyria Chronicles II . "
        "While it retained the standard features of the series , it also underwent multiple adjustments , such as making the game "
        "more forgiving for series newcomers . Character designer Raita Honjou and composer Hitoshi Sakimoto both returned from previous "
        "entries , along with Valkyria Chronicles II director Takeshi Ozawa . A large team of writers handled the script . "
        "The game 's opening theme was sung by May")

# Debugging: Print the input to verify it is non-empty after stripping
print(f"Debug: Received input - '{text}'")

perplexity = calculate_perplexity(text)

if perplexity is not None:
    print(f"Perplexity: {perplexity}")
