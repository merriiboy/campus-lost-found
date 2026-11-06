// ==============================================================================
// Campus Lost and Found Management System
// This server uses basic Node.js HTTP and MongoDB methods from the class notes.
// Author: Merin (merin@2026)
// ==============================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MongoClient, ObjectId } = require("mongodb");

// MongoDB Connection String (Atlas Cloud / Local Fallback)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://merinkarukappallil_db_user:b8QVf72pLW7Vhs1N@cluster0.nyyxbcy.mongodb.net/campusLostFoundDB?retryWrites=true&w=majority";
const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/campusLostFoundDB";

let client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
let users;
let items;

// A simple in-memory list of logged-in user sessions.
const sessions = new Map();

// Convert special characters before displaying database text in HTML.
function safeText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Read the form values sent by the browser.
function readFormData(req) {
    return new Promise(function (resolve) {
        let body = "";
        req.on("data", function (chunk) {
            body = body + chunk.toString();
        });
        req.on("end", function () {
            resolve(new URLSearchParams(body));
        });
    });
}

// Send an HTML, CSS or JavaScript file to the browser.
function sendFile(res, fileName, contentType) {
    const filePath = path.join(__dirname, "public", fileName);
    fs.readFile(filePath, function (error, data) {
        if (error) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("File not found");
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}

// Show a simple message page.
function showMessage(res, message, link, linkText) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Campus Lost & Found</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header>
                <h1>Campus Lost and Found System</h1>
            </header>
            <div class="form-box">
                <h2>${safeText(message)}</h2>
                <p><a href="${link}">${linkText}</a></p>
            </div>
            <footer>
                <p>Campus Lost and Found System • merin@2026</p>
            </footer>
        </body>
        </html>
    `);
}

// Find the logged-in user using the session cookie.
function getLoggedInUser(req) {
    const cookie = req.headers.cookie || "";
    const parts = cookie.split(";");
    for (let i = 0; i < parts.length; i++) {
        const item = parts[i].trim();
        if (item.startsWith("studentSession=")) {
            const sessionId = item.substring("studentSession=".length);
            return sessions.get(sessionId);
        }
    }
    return null;
}

// Create a simple password hash using Node.js built-in crypto.
function makePasswordHash(password, salt) {
    return crypto.scryptSync(password, salt, 64).toString("hex");
}

// Render the dashboard HTML with Lost and Found items.
async function showDashboard(res, user, filterType = "All", searchKeyword = "") {
    const student = await users.findOne({ email: user.email }) || { name: "User", email: user.email, rollNo: "", phone: "" };

    // Fetch counts for summary boxes
    const totalLost = await items.countDocuments({ type: "Lost", status: "Active" });
    const totalFound = await items.countDocuments({ type: "Found", status: "Active" });
    const totalReturned = await items.countDocuments({ status: "Returned" });

    // Build query filter
    const query = {};
    if (filterType === "Lost" || filterType === "Found") {
        query.type = filterType;
        query.status = "Active";
    } else if (filterType === "Returned") {
        query.status = "Returned";
    }

    if (searchKeyword && searchKeyword.trim() !== "") {
        const keyword = searchKeyword.trim();
        query.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { location: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } }
        ];
    }

    const allItems = await items.find(query).sort({ _id: -1 }).toArray();

    let itemRows = "";
    for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const isReturned = item.status === "Returned";
        const badgeClass = isReturned ? "badge-returned" : (item.type === "Lost" ? "badge-lost" : "badge-found");
        const badgeLabel = isReturned ? "RETURNED" : (item.type === "Lost" ? "LOST" : "FOUND");

        let actionCell = "";
        if (!isReturned) {
            actionCell = `
                <form action="/item/return" method="POST" style="display:inline-block; margin-bottom:5px;">
                    <input type="hidden" name="id" value="${item._id}">
                    <input name="returnedTo" placeholder="Collected by (Name)" required style="width:140px; padding:6px; font-size:12px;">
                    <button type="submit" style="padding:6px 10px; font-size:12px; background-color:#27ae60;">Mark Returned</button>
                </form>
            `;
        } else {
            actionCell = `<span style="color:#27ae60; font-weight:bold; font-size:13px;">✓ Returned to ${safeText(item.returnedTo)}</span><br>`;
        }

        actionCell += `
            <form action="/item/delete" method="POST" style="display:inline-block; margin-top:4px;">
                <input type="hidden" name="id" value="${item._id}">
                <button type="submit" style="padding:5px 10px; font-size:12px; background-color:#c0392b;">Delete</button>
            </form>
        `;

        itemRows += `
            <tr>
                <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
                <td><b>${safeText(item.title)}</b><br><small style="color:#666;">${safeText(item.category)}</small></td>
                <td>${safeText(item.date)}<br><small style="color:#666;">${safeText(item.location)}</small></td>
                <td>${safeText(item.description)} ${item.collectFrom ? `<br><small><b>Collect From:</b> ${safeText(item.collectFrom)}</small>` : ""}</td>
                <td>${safeText(item.reporterName)}<br><small>${safeText(item.reporterRoll || "")} ${item.contactPhone ? `• ${safeText(item.contactPhone)}` : ""}</small></td>
                <td>${actionCell}</td>
            </tr>
        `;
    }

    if (itemRows === "") {
        itemRows = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#666;">No items found matching the selected filter.</td></tr>`;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Campus Lost & Found - Dashboard</title>
            <link rel="stylesheet" href="/style.css">
            <script src="/script.js" defer></script>
        </head>
        <body>
            <header>
                <h1>Campus Lost and Found System</h1>
                <p>Welcome, ${safeText(student.name)} ${student.rollNo ? `(${safeText(student.rollNo)})` : ""}</p>
                <p class="no-print"><a href="/logout" style="color:white; font-weight:bold;">Logout</a></p>
            </header>

            <!-- Action Row -->
            <div class="section-box no-print" style="margin-bottom:0;">
                <div class="button-row">
                    <button onclick="printReport()">Print Report / Save as PDF</button>
                </div>
            </div>

            <!-- Statistics Summary Section -->
            <div class="section-box">
                <h2>Campus Status Summary</h2>
                <div class="stats-row">
                    <div class="stat-item">
                        <h3 style="color:#d9534f;">${totalLost}</h3>
                        <p>Active Lost Items</p>
                    </div>
                    <div class="stat-item">
                        <h3 style="color:#0275d8;">${totalFound}</h3>
                        <p>Active Found Items</p>
                    </div>
                    <div class="stat-item">
                        <h3 style="color:#5cb85c;">${totalReturned}</h3>
                        <p>Returned to Owners</p>
                    </div>
                </div>
            </div>

            <!-- Report an Item Form -->
            <div class="section-box no-print">
                <h2>Report a Lost or Found Item</h2>
                <form action="/item/add" method="POST">
                    <label>Report Type</label>
                    <select name="type" required>
                        <option value="Lost">Lost Item (I lost something)</option>
                        <option value="Found">Found Item (I found something)</option>
                    </select>

                    <label>Item Name</label>
                    <input name="title" required placeholder="e.g. Scientific Calculator fx-991, Blue Notebook">

                    <label>Category</label>
                    <select name="category" required>
                        <option value="Electronics">Electronics</option>
                        <option value="Books & Stationery" selected>Books &amp; Stationery</option>
                        <option value="ID & Cards">ID &amp; Cards</option>
                        <option value="Wallets & Bags">Wallets &amp; Bags</option>
                        <option value="Keys">Keys</option>
                        <option value="Others">Others</option>
                    </select>

                    <label>Date Lost or Found</label>
                    <input type="date" name="date" required value="${new Date().toISOString().split("T")[0]}">

                    <label>Location on Campus</label>
                    <input name="location" required placeholder="e.g. Science Block Room 204, Library 1st Floor">

                    <label>Where can the owner collect it? (For Found Items)</label>
                    <input name="collectFrom" placeholder="e.g. Security Desk, Dept Office, Library Counter">

                    <label>Description</label>
                    <textarea name="description" placeholder="Color, brand, distinguishing marks..."></textarea>

                    <label>Your Contact Phone</label>
                    <input type="tel" name="contactPhone" value="${safeText(student.phone || "")}" placeholder="e.g. 9876543210">

                    <button type="submit">Submit Item Report</button>
                </form>
            </div>

            <!-- Items Table Section -->
            <div class="section-box">
                <h2>Campus Lost &amp; Found Feed</h2>

                <!-- Search and Filter Controls -->
                <form action="/dashboard" method="GET" class="filter-bar no-print">
                    <select name="filter">
                        <option value="All" ${filterType === "All" ? "selected" : ""}>All Items</option>
                        <option value="Lost" ${filterType === "Lost" ? "selected" : ""}>Lost Only</option>
                        <option value="Found" ${filterType === "Found" ? "selected" : ""}>Found Only</option>
                        <option value="Returned" ${filterType === "Returned" ? "selected" : ""}>Returned Only</option>
                    </select>

                    <input type="text" name="search" value="${safeText(searchKeyword)}" placeholder="Search by name, location, or keyword...">

                    <button type="submit">Filter</button>
                    ${filterType !== "All" || searchKeyword !== "" ? `<a href="/dashboard" class="button-link" style="background-color:#95a5a6; padding:10px 14px;">Reset</a>` : ""}
                </form>

                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Item Name</th>
                            <th>Date &amp; Location</th>
                            <th>Description</th>
                            <th>Reported By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>
            </div>

            <footer class="no-print">
                <p>Campus Lost and Found System • Student Mini Project • merin@2026</p>
            </footer>
        </body>
        </html>
    `);
}

// Main HTTP Server
const server = http.createServer(async function (req, res) {
    try {
        const pageUrl = new URL(req.url, "http://localhost:3000");
        const user = getLoggedInUser(req);

        // Serve Static Files
        if (req.method === "GET" && pageUrl.pathname === "/") {
            return sendFile(res, "index.html", "text/html");
        }
        if (req.method === "GET" && pageUrl.pathname === "/register.html") {
            return sendFile(res, "register.html", "text/html");
        }
        if (req.method === "GET" && pageUrl.pathname === "/login.html") {
            return sendFile(res, "login.html", "text/html");
        }
        if (req.method === "GET" && pageUrl.pathname === "/style.css") {
            return sendFile(res, "style.css", "text/css");
        }
        if (req.method === "GET" && pageUrl.pathname === "/script.js") {
            return sendFile(res, "script.js", "text/javascript");
        }

        // Register a new student
        if (req.method === "POST" && pageUrl.pathname === "/register") {
            const form = await readFormData(req);
            const name = (form.get("name") || "").trim();
            const rollNo = (form.get("rollNo") || "").trim();
            const phone = (form.get("phone") || "").trim();
            const email = (form.get("email") || "").trim().toLowerCase();
            const password = form.get("password") || "";

            if (name === "" || email === "" || password.length < 4) {
                return showMessage(res, "Please enter valid details. Password must have at least 4 characters.", "/register.html", "Go back");
            }

            const oldUser = await users.findOne({ email: email });
            if (oldUser) {
                return showMessage(res, "This email is already registered.", "/login.html", "Go to Login");
            }

            const salt = crypto.randomBytes(16).toString("hex");
            const passwordHash = makePasswordHash(password, salt);

            await users.insertOne({
                name: name,
                rollNo: rollNo,
                phone: phone,
                email: email,
                passwordHash: passwordHash,
                salt: salt,
                role: "student"
            });

            return showMessage(res, "Registration successful. You can now login.", "/login.html", "Login now");
        }

        // Login an existing student or admin
        if (req.method === "POST" && pageUrl.pathname === "/login") {
            const form = await readFormData(req);
            const email = (form.get("email") || "").trim().toLowerCase();
            const password = form.get("password") || "";

            const student = await users.findOne({ email: email });
            if (!student) {
                return showMessage(res, "Invalid email or password.", "/login.html", "Try again");
            }

            const enteredHash = makePasswordHash(password, student.salt);
            if (enteredHash !== student.passwordHash) {
                return showMessage(res, "Invalid email or password.", "/login.html", "Try again");
            }

            const sessionId = crypto.randomBytes(16).toString("hex");
            sessions.set(sessionId, { email: student.email });

            res.writeHead(302, {
                "Set-Cookie": "studentSession=" + sessionId + "; HttpOnly; SameSite=Lax; Path=/",
                "Location": "/dashboard"
            });
            return res.end();
        }

        // Show the Dashboard after login
        if (req.method === "GET" && pageUrl.pathname === "/dashboard") {
            if (!user) {
                res.writeHead(302, { Location: "/login.html" });
                return res.end();
            }
            const filterType = pageUrl.searchParams.get("filter") || "All";
            const searchKeyword = pageUrl.searchParams.get("search") || "";
            return showDashboard(res, user, filterType, searchKeyword);
        }

        // Add a Lost or Found item
        if (req.method === "POST" && pageUrl.pathname === "/item/add") {
            if (!user) {
                res.writeHead(302, { Location: "/login.html" });
                return res.end();
            }
            const form = await readFormData(req);
            const student = await users.findOne({ email: user.email }) || {};

            const type = form.get("type") || "Lost";
            const title = (form.get("title") || "").trim();
            const category = form.get("category") || "Others";
            const date = form.get("date") || new Date().toISOString().split("T")[0];
            const location = (form.get("location") || "").trim();
            const collectFrom = (form.get("collectFrom") || "").trim();
            const description = (form.get("description") || "").trim();
            const contactPhone = (form.get("contactPhone") || student.phone || "").trim();

            if (title === "") {
                return showMessage(res, "Item name is required.", "/dashboard", "Back to Dashboard");
            }

            await items.insertOne({
                type: type,
                title: title,
                category: category,
                date: date,
                location: location,
                collectFrom: collectFrom,
                description: description,
                reporterName: student.name || "Student",
                reporterRoll: student.rollNo || "",
                reporterEmail: user.email,
                contactPhone: contactPhone,
                status: "Active",
                returnedTo: "",
                returnedDate: ""
            });

            res.writeHead(302, { Location: "/dashboard" });
            return res.end();
        }

        // Mark an item as Returned
        if (req.method === "POST" && pageUrl.pathname === "/item/return") {
            if (!user) {
                res.writeHead(302, { Location: "/login.html" });
                return res.end();
            }
            const form = await readFormData(req);
            const id = form.get("id");
            const returnedTo = (form.get("returnedTo") || "").trim();
            const today = new Date().toISOString().split("T")[0];

            if (ObjectId.isValid(id) && returnedTo !== "") {
                await items.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            status: "Returned",
                            returnedTo: returnedTo,
                            returnedDate: today
                        }
                    }
                );
            }

            res.writeHead(302, { Location: "/dashboard" });
            return res.end();
        }

        // Delete an item
        if (req.method === "POST" && pageUrl.pathname === "/item/delete") {
            if (!user) {
                res.writeHead(302, { Location: "/login.html" });
                return res.end();
            }
            const form = await readFormData(req);
            const id = form.get("id");

            if (ObjectId.isValid(id)) {
                await items.deleteOne({ _id: new ObjectId(id) });
            }

            res.writeHead(302, { Location: "/dashboard" });
            return res.end();
        }

        // Logout
        if (req.method === "GET" && pageUrl.pathname === "/logout") {
            const cookie = req.headers.cookie || "";
            const parts = cookie.split(";");
            for (let i = 0; i < parts.length; i++) {
                const item = parts[i].trim();
                if (item.startsWith("studentSession=")) {
                    const sessionId = item.substring("studentSession=".length);
                    sessions.delete(sessionId);
                }
            }
            res.writeHead(302, {
                "Set-Cookie": "studentSession=; Max-Age=0; Path=/",
                "Location": "/login.html"
            });
            return res.end();
        }

        // Page not found
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Page not found");

    } catch (error) {
        console.log("Server error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Something went wrong. Check the terminal.");
    }
});

// Seed initial admin and demo items if collections are empty
async function seedInitialData() {
    try {
        const adminUser = await users.findOne({ email: "admin@campus.edu" });
        if (!adminUser) {
            const salt = crypto.randomBytes(16).toString("hex");
            const passwordHash = makePasswordHash("admin123", salt);
            await users.insertOne({
                name: "Administrator",
                rollNo: "ADMIN01",
                phone: "9876543210",
                email: "admin@campus.edu",
                passwordHash: passwordHash,
                salt: salt,
                role: "admin"
            });
            console.log("✔ Created default admin user: admin@campus.edu / admin123");
        }

        const count = await items.countDocuments();
        if (count === 0) {
            await items.insertMany([
                {
                    type: "Found",
                    title: "Casio Scientific Calculator fx-991EX",
                    category: "Electronics",
                    date: "2026-11-02",
                    location: "Central Library, 1st Floor",
                    collectFrom: "Library Reception Desk",
                    description: "Black calculator found on reading desk.",
                    reporterName: "Library Staff",
                    reporterRoll: "STAFF01",
                    reporterEmail: "admin@campus.edu",
                    contactPhone: "9123456780",
                    status: "Active",
                    returnedTo: "",
                    returnedDate: ""
                },
                {
                    type: "Lost",
                    title: "Blue Spiral Notebook",
                    category: "Books & Stationery",
                    date: "2026-11-01",
                    location: "Main Science Block, Room 204",
                    collectFrom: "Science Dept Office",
                    description: "Notes for Data Structures with blue cover.",
                    reporterName: "Meriin K Joseph",
                    reporterRoll: "26CSEL40",
                    reporterEmail: "merin@campus.edu",
                    contactPhone: "9876543210",
                    status: "Active",
                    returnedTo: "",
                    returnedDate: ""
                },
                {
                    type: "Lost",
                    title: "Student Identity Card",
                    category: "ID & Cards",
                    date: "2026-10-30",
                    location: "Campus Cafeteria",
                    collectFrom: "Main Security Desk",
                    description: "College ID card in blue lanyard.",
                    reporterName: "Rahul Sharma",
                    reporterRoll: "24BCS015",
                    reporterEmail: "rahul@campus.edu",
                    contactPhone: "9876501234",
                    status: "Returned",
                    returnedTo: "Rahul Sharma",
                    returnedDate: "2026-11-03"
                }
            ]);
            console.log("✔ Seeded starter Lost & Found items");
        }
    } catch (e) {
        console.log("Seeding note:", e.message);
    }
}

// Connect to MongoDB first, then start the server.
async function startServer() {
    try {
        console.log("Connecting to MongoDB Atlas Database...");
        await client.connect();
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.log("Could not connect to Cloud MongoDB, trying local MongoDB fallback...");
        client = new MongoClient(LOCAL_MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        console.log("Local MongoDB connected successfully");
    }

    const db = client.db("campusLostFoundDB");
    users = db.collection("users");
    items = db.collection("items");

    await seedInitialData();

    // Run on Port 3000
    const PORT = process.env.PORT || 3000;

    server.on("error", function (err) {
        console.log("Server error:", err.message);
    });

    server.listen(PORT, function () {
        console.log(`Website running at http://localhost:${PORT}`);
    });
}

startServer().catch(function (error) {
    console.log("Could not connect to MongoDB");
    console.log(error);
});
