from flask import Flask, render_template, jsonify, url_for, request
from dotenv import load_dotenv
import json
import os
import re
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Gemini AI Setup ---
# The API key is now loaded from the .env file
API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_API_KEY = "AIzaSyBZ_Mea6_FaJVcWTYhc4r1OAlGzjdQIkxw"
# A simple check to ensure the API key is loaded.
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")

# Configure the Gemini API client
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def parse_ai_response(text):
    """
    Parses the AI response to separate code from the explanation.
    Assumes the code is within markdown-style triple backticks.
    """
    # Regex to find a code block, allowing for optional language identifier
    code_match = re.search(r"```(?:\w+\n)?(.*?)```", text, re.DOTALL)
    
    if code_match:
        # Extract the code from the first capturing group
        code = code_match.group(1).strip()
        # The explanation is everything outside the matched code block
        explanation = text.replace(code_match.group(0), "").strip()
        return code, explanation
    else:
        # If no markdown code block is found, treat the whole text as an explanation
        return None, text

# Main route to serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')

# API route to serve the journey data
@app.route('/api/journey-data')
def get_journey_data():
    # Construct the full path to the JSON file
    json_path = os.path.join(app.static_folder, 'journeyData.json')
    # Open and load the JSON file
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Return the data as a JSON response
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
        # Construct a detailed prompt for the AI
        prompt = (f"Provide a code solution for the problem '{problem_name}' in {language}. "
                  "The code solution should have the best possible time and space complexity. "
                  "Enclose the code in a single markdown code block. Following the code, "
                  "give a brief, well-formatted explanation of the code, including its time and space complexity.")

        # Call the Gemini API
        response = model.generate_content(prompt)
        
        # Parse the response to separate code and explanation
        code, explanation = parse_ai_response(response.text)

        # Return the structured data
        return jsonify({"code_solution": code, "explanation": explanation})

    except Exception as e:
        # Handle potential errors from the API call
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

    