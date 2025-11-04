# 📝 Collaborative Text Editor

A real-time collaborative text editor built with **MERN Stack**, **Socket.io**, and **JWT authentication**.  
Includes live editing, document sharing with permissions, and AI-powered writing assistance.

---

## 🚀 Features

- 👥 Real-time collaboration using **Socket.io**
- 🔐 Authentication with **JWT**
- 🗂️ Create, edit, and auto-save documents
- 🤝 Share documents (Viewer / Editor roles)
- 🧠 AI Assistant (Enhance, Summarize, Suggest)
- 💾 Auto-save every 30 seconds
- 📱 Responsive UI built with React + Bootstrap

---

## 🧑‍💻 Tech Stack
**Frontend:** React, React-Quill, Axios, Bootstrap  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Realtime:** Socket.io  
**AI Integration:** Google Generative AI / Gemini  
**Auth:** JWT

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sohel3441/Collaborative-Text-Editor.git
cd <Collaborative-Text-Editor>

2️⃣ Install Dependencies

Backend
cd server
npm install

Frontend
cd client
npm install


3️⃣ Environment Variables

Create .env files in both folders.

Backend .env

PORT=5000
MONGODB_URI=mongodb+srv://shaikhsohel113441_db_user:yqm2DDg78uU6Vn4Q@collabrative-editor.glirz5e.mongodb.net/?appName=Collabrative-Editor
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=mySuperSecretKey123!
GEMINI_API_KEY=AIzaSyAklbNcAspE64kJ2jSbROdrK4nIUvwWp_E


Frontend .env

VITE_API_BASE=http://localhost:5000/api


4️⃣ Run the App

Backend
npm run dev

Frontend
npm run dev


👤 Author

Shaikh Sohel
📧 shaikhsohel13441@gmail.com
