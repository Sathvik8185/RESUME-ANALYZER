# RESUME-ANALYZER

A full-stack AI-powered Resume Analyzer that evaluates candidate resumes by comparing them with a given job description. The system extracts key information such as skills, experience, education, and relevant keywords, and generates a match score with AI-based feedback.

---

## 🚀 Features

- Resume vs Job Description matching
- AI-powered analysis using Gemini AI
- Match score generation
- Skill and keyword extraction
- User history storage
- Responsive frontend UI
- REST API based backend

---

## 🧱 Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Accessible & responsive UI

### Backend

- PHP
- REST APIs
- Composer
- MySQL (via setup script)

### AI

- Gemini AI integration

---

## 📂 Project Structure

RESUME-ANALYZER/
│
├── public/ # Backend entry point
├── src/ # Backend logic
├── config/ # Configuration files
├── vendor/ # Composer dependencies
├── cs/ # Frontend styles
├── js/ # Frontend scripts
├── index.html # Main UI
├── setup_db.php # Database setup
└── test-gemini.html # AI testing

yaml
Copy code

---

## ⚙️ How to Run

### 1️⃣ Backend

````bash
composer install
php setup_db.php
php -S localhost:8000 -t public
2️⃣ Frontend
Open index.html in browser
(or serve via Live Server)

📌 Notes
Ensure Gemini API key is configured properly

Backend must be running before using the analyzer

👨‍💻 Author
Rajesh Kumar Yadav
Full Stack Developer | AI & Web Enthusiast

yaml
Copy code

Now save it.

---

### Commit the README fix
```bash
git add README.md
git commit -m "Fix README and document full-stack integration"
````
