import google.generativeai as genai

# Configure the API key for authentication
genai.configure(api_key="")

# Initialize the generative model
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_code_suggestion(prompt, context):
    """
    Generate code suggestions using Google's Generative AI model.
    """
    try:
        # Combine prompt and context for better results
        full_input = f"{context.strip()}\n{prompt.strip()}"
        
        # Generate code based on the input
        response = model.generate_content(full_input)
        
        # Return the generated content
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
