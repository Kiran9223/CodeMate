from flask import Flask, request, jsonify
from model import generate_code_suggestion

app = Flask(__name__)

@app.route('/suggest', methods=['POST'])
def suggest():
    data = request.get_json()
    prompt = data.get('prompt', '')
    context = data.get('context', '')
    response = generate_code_suggestion(prompt, context)
    return jsonify({'suggestion': response})

if __name__ == '__main__':
    app.run(port=5000, debug=True)