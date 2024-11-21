from transformers import pipeline

classifier = pipeline("sentiment-analysis")

res = classifier(" I love to code in python with pytorch")

print (res)