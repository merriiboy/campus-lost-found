# Campus Lost and Found Management System

A web-based portal developed to manage and streamline lost and found items across a college campus. The system allows students and staff to report lost personal belongings, register found items, and coordinate returns securely.

---

## 📌 Project Overview

In a busy college campus, students and staff frequently misplace personal belongings such as ID cards, calculators, notebooks, bags, and electronic accessories. The **Campus Lost and Found Management System** provides a centralized digital platform to:
- Report lost belongings with location and contact details.
- Post found items with designated collection points.
- Search and filter records by item category, status, and keywords.
- Mark items as returned once collected by their rightful owners.
- Generate and print structured summary reports.

---

## 🛠️ Technology Stack

| Component | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript | Clean, responsive user interface with client-side form validation |
| **Backend** | Node.js (Core `http` module) | Lightweight server handling HTTP routing and session management |
| **Database** | MongoDB | Document database for storing student records and item data |
| **Security** | Node.js `crypto` module | Salted cryptographic password hashing (`crypto.scryptSync`) |

---

## ✨ Features

1. **User Authentication & Profiles:**
   - Student self-registration with roll number, email, and contact number.
   - Secure login session management using HTTP cookies.
   - Built-in administrator account for overall campus monitoring.

2. **Lost & Found Reporting:**
   - Categorized reporting (Electronics, Books & Stationery, ID & Cards, Bags, Keys, etc.).
   - Date, campus location, and description tracking.
   - Designated collection points for found items (e.g. Security Desk, Library Counter).

3. **Feed & Real-Time Filtering:**
   - Filter items by status: *All*, *Lost*, *Found*, or *Returned*.
   - Live search by keyword, item title, or location.

4. **Return Tracking:**
   - One-click status update marking an item as returned with the collector's name and return date.

5. **Printable Reports:**
   - One-click report generation with a dedicated print view (`window.print()`) for campus administration and notice boards.

---

## 🗂️ Project Structure

```
campus-lost-found/
├── public/
│   ├── index.html         # Welcome landing page
│   ├── register.html      # Student registration form
│   ├── login.html         # Student and Administrator login form
│   ├── style.css          # Primary stylesheet
│   └── script.js          # Client-side validation and print handling
├── package.json           # Project metadata and dependencies
├── server.js              # HTTP server and database logic
├── start.bat              # Windows startup script
└── README.md              # Project documentation
```

---

## 🚀 Installation & Running the Project

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 16 or later recommended)
- Web browser (Chrome, Edge, or Firefox)

### Steps to Run

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/merriiboy/campus-lost-found.git
   cd campus-lost-found
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```
   *(or `node server.js`)*

4. **Access the Application:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

*(On Windows, you can also launch the application directly by double-clicking `start.bat`)*

---

## 🔐 Default Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | `admin123` |

*New students can also be registered directly through the registration page.*

---

## 👤 Author & Academic Details

- **Project:** Campus Lost and Found Management System
- **Developer:** Merin
- **Course:** Computer Science & Electronics
- **Academic Year:** 2026
