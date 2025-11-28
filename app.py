from flask import Flask, render_template, jsonify, request
import json
import os
import re
import google.generativeai as genai

app = Flask(__name__)

# --- Gemini AI Setup ---
# --- Gemini AI Setup (Secure: Load from Render Environment Variable) ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ Missing GEMINI_API_KEY environment variable in Render settings.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

def parse_ai_response(text):
    """
    Parses the AI response to separate code from the explanation.
    Assumes the code is within markdown-style triple backticks.
    """
    code_match = re.search(r"```(?:\w+\n)?(.*?)```", text, re.DOTALL)
    
    if code_match:
        code = code_match.group(1).strip()
        explanation = text.replace(code_match.group(0), "").strip()
        return code, explanation
    else:
        return None, text


# Main route to serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')


# API route to serve the journey data
@app.route('/api/journey-data')
def get_journey_data():
    json_path = os.path.join(app.static_folder, 'journeyData.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)


# --- API route for Gemini AI ---
@app.route('/api/get-code', methods=['POST'])
def get_code_solution():
    data = request.get_json()
    problem_name = data.get('problem_name')
    language = data.get('language')

    if not problem_name or not language:
        return jsonify({"error": "Problem name and language are required."}), 400

    try:
        prompt = (f"Provide a code solution for the problem '{problem_name}' in {language}. "
                  "The code solution should have the best possible time and space complexity. "
                  "Enclose the code in a single markdown code block. Following the code, "
                  "give a brief, well-formatted explanation of the code, including its time and space complexity.")

        response = model.generate_content(prompt)

        code, explanation = parse_ai_response(response.text)

        return jsonify({"code_solution": code, "explanation": explanation})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
