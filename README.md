````markdown
# 160-Day DSA Odyssey  ✨    

🌐 **Live Demo**: [dsa-odssey-mobile.onrender.com](https://dsa-odssey-mobile.onrender.com/)         

Welcome to the **160-Day DSA Odyssey**, an interactive and visually stunning web application that chronicles a 160-day journey through the world of **Data Structures and Algorithms**.  

Explore problems as planets in a beautiful **3D galaxy**, view detailed notes, and get **AI-powered code solutions** on demand.

---

## 🚀 Key Features

- **Interactive 3D Visualization**: Journey through a spiral galaxy where each star represents a solved DSA problem. Built with **Three.js**.  
- **AI-Powered Code Solutions**: Integrated with the **Google Gemini API** to generate solutions in any programming language, complete with explanations.  
- **Detailed Problem Information**: Click any "planet" to view details, including difficulty, topics, personal notes, and links.  
- **Search & Filter**: Quickly find problems by name or topic.  
- **Responsive Design**: Sleek interface that works seamlessly on **desktop and mobile**.  
- **Dynamic Content**: Problems are rendered from `journeyData.json`, making updates simple.  

---

## 🛠️ Tech Stack

- **Backend**: Python (Flask)  
- **Frontend**: HTML, CSS, JavaScript (ES6 Modules)  
- **3D Graphics**: Three.js  
- **AI Integration**: Google Gemini API  
- **Deployment**: Deployed on **Render** ([live link](https://dsa-odssey-mobile.onrender.com/))  

---

## ⚙️ Setup and Installation

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/DSA-Odssey.git
cd DSA-Odssey
````

### 2. Create a Virtual Environment

```bash
# For Windows
python -m venv venv
venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the project root and add your Gemini API key:

```bash
GEMINI_API_KEY="YOUR_API_KEY_GOES_HERE"
```

> Replace with your actual API key from [Google AI Studio](https://ai.google.dev).

### 5. Run the Application

```bash
flask run
```

Now visit: 👉 [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 📖 How to Use

* **Explore the Galaxy**: Rotate, pan, and zoom the 3D scene with your mouse or touch.
* **View Problem Details**: Click any glowing star to open the sidebar with details.
* **AI Code Solutions**:

  1. Open a problem.
  2. Enter your desired language (Python, Java, C++, etc.).
  3. Click **Generate Solution**.
  4. A modal will display the code + explanation.

---

## 📁 Project Structure

```
.
├── app.py               # Main Flask app
├── Procfile             # For deployment (Heroku, Render, etc.)
├── requirements.txt     # Python dependencies
├── .env                 # API keys (not committed)
├── static/
│   ├── css/
│   │   └── style.css    # Stylesheet
│   ├── js/
│   │   └── main.js      # Three.js + UI logic
│   └── journeyData.json # DSA problems data
└── templates/
    └── index.html       # Main HTML
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Check out the [issues page](https://github.com/your-username/DSA-Odssey/issues).

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---

Created with ❤️ by **Khurram Rashid**

```

---

Do you want me to also create a **GitHub-style badge section** at the top (for Flask, Render deployment, Python version, etc.) to make your README look more professional?
```
