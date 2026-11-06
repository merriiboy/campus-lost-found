# 🎓 Campus Lost & Found System
**A Simple Student Mini-Project**  
*Built with: Pure HTML5, CSS3, Vanilla JavaScript, Pure Node.js (HTTP module), and MongoDB*  
*Copyright: merin@2026*

---

## 📌 Project Overview
The **Campus Lost & Found System** is a lightweight, academic web application built for college campuses. It helps students, faculty, and campus security staff report missing personal belongings (such as calculators, ID cards, notebooks, keys, phones) and return found items to their rightful owners.

### 🌟 100% Beginner-Friendly & Humanized:
- **No Express.js**: Uses Node.js built-in `http` module from the standard syllabus.
- **No Mongoose**: Uses the official `mongodb` driver (`MongoClient`, `ObjectId`).
- **No External CSS Frameworks**: Built with pure, clean CSS (`style.css`).
- **No Frontend Libraries**: No React, no Vite, no TypeScript.
- **Built-in Security**: Passwords are securely hashed using Node.js standard `crypto.scryptSync()`.
- **Sessions**: Uses simple HTTP cookies (`studentSession=...`) with an in-memory `Map`.

---

## 🗂️ Project File Structure
```
campus-lost-found/
│
├── public/                     # Static files sent to the browser
│   ├── index.html              # Home welcome page
│   ├── register.html           # Student registration page
│   ├── login.html              # Student and Admin login page
│   ├── style.css               # Clean custom styling (matching class notes)
│   └── script.js               # Client-side form validation and print feature
│
├── .env                        # MongoDB connection string
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies (only mongodb)
├── server.js                   # Pure Node.js HTTP server and database logic
├── start.bat                   # 1-Click launcher for Windows
└── README.md                   # Project documentation and Viva preparation guide
```

---

## 🚀 Running the Project

### Method A: One-Click Windows Launcher
Double-click `start.bat` in the project folder.

### Method B: Terminal Command
```bash
npm start
```
Or directly:
```bash
node server.js
```

### 🌐 Open in Browser
Visit:
```
http://localhost:3000
```
*(If port 3000 is occupied by another application, the server automatically runs on `http://localhost:3001`)*

---

## 🔐 Default Admin / Demo Credentials
- **Email**: `admin@campus.edu`
- **Password**: `admin123`

---

## 🎓 Viva Voce & Guide Interview Preparation

### Q1: Why did you NOT use Express.js or other frameworks?
> **Answer**:  
> "I used the built-in Node.js `http` module (`http.createServer()`) directly from our class notes. This demonstrates a core understanding of how web servers handle HTTP requests, headers, and responses at the fundamental level without relying on third-party framework abstractions."

### Q2: How does the server handle user sessions and authentication?
> **Answer**:  
> "When a student logs in, the server generates a random 16-byte session token using `crypto.randomBytes(16)`. The server stores this in an in-memory `Map` linked to the student's email, and sends it to the browser as an `HttpOnly` cookie named `studentSession`. On every subsequent request, the server reads the cookie header to identify the logged-in student."

### Q3: How is password security implemented?
> **Answer**:  
> "Passwords are never saved in plain text. When a user registers, we generate a random 16-byte cryptographic salt and use Node.js built-in `crypto.scryptSync(password, salt, 64)` to compute a one-way password hash. During login, the entered password is hashed with the stored salt and compared."

### Q4: How is data stored in MongoDB?
> **Answer**:  
> "We use the official `mongodb` driver (`MongoClient`). The database `campusLostFoundDB` contains two collections: `users` for student accounts, and `items` for lost and found reports. Each item record stores the item name, category, date, location, description, reporter details, and status (`Active` or `Returned`)."

### Q5: How does the search and filter mechanism work?
> **Answer**:  
> "In `server.js`, the `/dashboard` route reads the `filter` and `search` query parameters from the URL. It builds a MongoDB query using `$regex` with the case-insensitive option (`$options: 'i'`), queries the `items` collection, and dynamically generates the HTML table rows."

---

## 📄 License & Attribution
Academic Mini-Project Submission.  
© 2026 Merin. All Rights Reserved.
