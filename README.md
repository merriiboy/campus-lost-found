# 🎓 Campus Lost & Found System
**A Simple, Full-Stack Student Mini-Project**  
*Built with: Pure HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and MongoDB*  
*Copyright: merin@2026*

---

## 📌 Project Overview
The **Campus Lost & Found System** is a web-based portal developed for college campuses to help students, faculty, and campus security report, search, and recover lost personal belongings (such as ID cards, notebooks, calculators, keys, phones, bags, etc.).

Unlike complicated modern frameworks that generate thousands of lines of machine code, this project is crafted strictly as a **clean, humanized student mini-project**:
1. **Frontend**: Pure **HTML5**, standard **CSS3** (no Tailwind, no Bootstrap), and **Vanilla JavaScript** (no React, no TypeScript, no build tools).
2. **Backend**: Lightweight **Node.js** with **Express.js** handling RESTful API routes.
3. **Database**: **MongoDB Atlas** (Cloud Database) with an automatic fallback to local MongoDB.
4. **Single Server**: The entire project runs on a single standard port: **`http://localhost:3001`**.

---

## 🌟 Key Features
- **User Authentication**:
  - Student Registration with full validation (Name, College Email, Roll Number, Phone, Password).
  - Secure Login with password hashing using **bcryptjs**.
  - Client-side session management using browser `localStorage`.
- **Lost & Found Reporting**:
  - **Report Lost Item**: Record title, category, location lost, date lost, description, and contact info.
  - **Report Found Item**: Record title, category, location found, where to collect the item (e.g. Campus Security / Department Office), and reporter details.
- **Live Search & Filter**:
  - Filter items dynamically by status (**All**, **Lost**, **Found**, **Returned**).
  - Search items by keyword or location in real-time without reloading the page.
- **Claim & Return Workflow**:
  - Mark any recovered item as "Returned" by recording who received it and the return date.
- **Real-time Live Statistics**:
  - Auto-updating counter dashboard showing Total Items, Lost Count, Found Count, and successfully Returned Count.
- **Responsive & Clean UI**:
  - Clean card-based design with mobile responsiveness and interactive notification toasts.

---

## 🗂️ Project File Structure
The project is organized in a simple, intuitive directory layout that is easy to explain:

```
campus-lost-found-main/
│
├── models/                     # Mongoose Database Models
│   ├── User.js                 # User schema (Name, Email, RollNo, Phone, Password)
│   └── Item.js                 # Item schema (Title, Category, Type, Location, Status)
│
├── public/                     # Static Frontend Files (Served directly by Express)
│   ├── css/
│   │   └── style.css           # Pure custom CSS styling and responsive layout
│   ├── js/
│   │   ├── app.js              # Main UI logic (search, filters, submit forms, return modal)
│   │   └── auth.js             # Authentication logic (login, register, logout, navbar state)
│   ├── index.html              # Home page: Dashboard, Stats & Item listings
│   ├── login.html              # Student / Staff Login page
│   └── register.html           # New student registration page
│
├── .env                        # Environment variables (PORT=3000, MONGO_URI)
├── .env.example                # Example environment file template
├── package.json                # Project dependencies and startup script
├── server.js                   # Main Express server and REST API endpoints
├── start.bat                   # 1-Click Windows shortcut to launch the app
└── README.md                   # Complete documentation & Viva Q&A Guide
```

---

## ⚙️ Prerequisites & Installation

### 1. Requirements
- **Node.js** (v16 or higher) installed on your system.
- An internet connection for MongoDB Atlas Cloud Database (or a local MongoDB service).

### 2. Setup Dependencies
Open a command prompt in the project root and run:
```bash
npm install
```
*Dependencies installed:*
- `express`: Fast, minimal web framework for Node.js.
- `mongoose`: Elegant MongoDB object modeling for Node.js.
- `bcryptjs`: Secure library for hashing and verifying passwords.
- `cors`: Middleware to enable Cross-Origin Resource Sharing.
- `dotenv`: Loads environment variables from a `.env` file.

---

## 🚀 Running the Project

### Method A: One-Click Windows Launcher
Simply double-click the `start.bat` file in the project folder.

### Method B: Terminal Command
Run the start script:
```bash
npm start
```
Or directly using Node:
```bash
node server.js
```

### 🌐 Open in Browser
Visit:
```
http://localhost:3001
```

---

## 🔐 Default Admin / Demo Credentials
An initial administrator account and demo campus items are automatically seeded into the database on first run:
- **Email**: `admin@campus.edu`
- **Password**: `admin@12345`

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Register a new user (hashes password with bcrypt) |
| `POST` | `/api/login` | Authenticate user and return user profile |
| `GET` | `/api/stats` | Fetch real-time count of total, lost, found, and returned items |
| `GET` | `/api/items` | Fetch all lost & found items (supports `?search=` and `?type=`) |
| `POST` | `/api/items` | Report a new lost or found item |
| `PUT` | `/api/items/:id/return` | Mark an item as returned with returnee details |
| `DELETE` | `/api/items/:id` | Delete an item by ID (Admin / Reporter) |

---

## 🎓 Viva Voce & Guide Interview Preparation Guide

This section contains common technical and conceptual questions college professors, project guides, and external examiners ask during project evaluations, along with clear, student-friendly answers.

### Q1: Why did you choose HTML, CSS, JavaScript, and Node.js for this project?
> **Answer**:  
> "I chose standard HTML5, CSS3, Vanilla JavaScript, and Node.js with Express because they form the foundational core of full-stack web development. Using vanilla technologies avoids heavy, black-box bundlers and complex abstraction layers. Every line of code is clear, lightweight, and directly controls DOM manipulation and server routing, making the application fast, reliable, and easy to maintain."

### Q2: How does the client communicate with the server?
> **Answer**:  
> "The frontend uses the modern JavaScript native `fetch()` API to make asynchronous HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) to the Express backend REST endpoints. Data is exchanged in lightweight JSON format. The browser updates the DOM dynamically based on the server's response without requiring a full page refresh."

### Q3: What is Express.js and what role does it play?
> **Answer**:  
> "Express.js is a lightweight web framework running on top of Node.js. In this project, Express performs two main jobs:
> 1. It serves our static frontend files (`index.html`, `login.html`, `style.css`, etc.) using `express.static('public')`.
> 2. It defines the REST API routes (`/api/items`, `/api/login`, etc.) and processes JSON request bodies using `express.json()` middleware."

### Q4: How is user password security handled?
> **Answer**:  
> "Passwords are never saved as plain text. When a student registers, we use `bcryptjs` with salt rounds (`bcrypt.hash(password, 10)`) to create a one-way cryptographic hash. During login, `bcrypt.compare()` compares the entered password with the stored hash to authenticate the user securely."

### Q5: What is MongoDB and Mongoose, and why use a NoSQL database?
> **Answer**:  
> "MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON documents. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It allows us to define structured schemas (like `UserSchema` and `ItemSchema`) with data types, defaults, and validation rules before saving to MongoDB."

### Q6: What happens if the internet connection or MongoDB Atlas is offline?
> **Answer**:  
> "In `server.js`, we implemented graceful connection handling. The server first attempts to connect to the cloud MongoDB Atlas cluster specified in `.env`. If the cloud connection fails or times out, it automatically tries connecting to a local MongoDB instance (`mongodb://localhost:27017/campus-lost-found`), ensuring the application can still run offline."

### Q7: How does user session persistence work on the frontend?
> **Answer**:  
> "When the user logs in successfully, the server sends back the user's profile info (name, email, roll number, role). The frontend stores this object in browser `localStorage` under the key `currentUser`. On page load, `auth.js` checks `localStorage` to display the user's name in the navigation bar and toggle between 'Login' and 'Logout' buttons."

### Q8: How does the search and filter mechanism work?
> **Answer**:  
> "The frontend listens for user input in the search bar and tab clicks on the filter buttons. It constructs query parameters (e.g. `/api/items?type=lost&search=calculator`) and requests filtered data from the server. The server uses Mongoose `$regex` with the case-insensitive option (`$options: 'i'`) to find matching records and returns them in descending order by date."

---

## 📄 License & Attribution
Developed for academic mini-project submission.  
© 2026 Merin. All Rights Reserved.
