import sacrebleu

# Define the reference sentence(s) as a single string
reference = "Heute gehe ich zur Schule."

# Define the candidate sentence (hypothesis)
hypothesis = "heute gehe ich in der Schule"

# Compute the BLEU score
bleu = sacrebleu.sentence_bleu(hypothesis, [reference])

# Print the BLEU score
print(f"BLEU score: {bleu.score:.2f}")
