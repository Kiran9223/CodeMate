from transformers import AutoModelForCausalLM, AutoTokenizer

# Load the model and tokenizer
model_name = "EleutherAI/gpt-neo-125M"  # Replace with your model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Set the padding token to the EOS token if it's not already set
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

def clean_generated_code(code):
    """
    Remove repetitive or nonsensical lines from generated code.
    """
    lines = code.split("\n")
    unique_lines = []
    for line in lines:
        if line.strip() and line not in unique_lines:
            unique_lines.append(line)
    return "\n".join(unique_lines)

def generate_code_suggestion(prompt, context):
    full_input = f"{context.strip()}\n{prompt.strip()}"
    inputs = tokenizer(full_input, return_tensors="pt", padding=True, truncation=True)

    outputs = model.generate(
        inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_length=100,
        temperature=0.5,
        top_k=30,
        top_p=0.85,
        repetition_penalty=1.5,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )

    raw_suggestion = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return clean_generated_code(raw_suggestion)
