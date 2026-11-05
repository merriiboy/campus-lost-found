// ==============================================================================
// CAMPUS LOST AND FOUND SYSTEM - MINI PROJECT
// Main Server File (Node.js & Express)
// Running on: http://localhost:3000
// ==============================================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import Mongoose Models
const User = require('./models/User');
const Item = require('./models/Item');

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 3000;

// Prevent server crash from unexpected errors
process.on('uncaughtException', (err) => {
  console.error('Server Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('Server Unhandled Rejection:', reason);
});

// ------------------------------------------------------------------------------
// Middleware Configuration
// ------------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------------------------
// Database Connection (MongoDB Atlas Cloud / Local Fallback)
// ------------------------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-lost-found';
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/campus-lost-found';

async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB Database...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✔ Connected to MongoDB successfully!');
    await seedInitialData();
  } catch (error) {
    console.warn('⚠️ Cloud MongoDB connection failed or timed out:', error.message);
    console.log('Trying local MongoDB fallback (' + LOCAL_MONGODB_URI + ')...');
    try {
      await mongoose.connect(LOCAL_MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('✔ Connected to local MongoDB successfully!');
      await seedInitialData();
    } catch (localError) {
      console.error('❌ Could not connect to local MongoDB either:', localError.message);
      console.log('Server will continue running. Check your internet or MongoDB service.');
    }
  }
}

// ------------------------------------------------------------------------------
// Initial Data Seeder (Default Admin & Starter Items)
// ------------------------------------------------------------------------------
async function seedInitialData() {
  try {
    // 1. Ensure default Admin user exists
    const adminExists = await User.findOne({ email: 'admin@campus.edu' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin@12345', 10);
      await User.create({
        name: 'Administrator',
        email: 'admin@campus.edu',
        rollNo: 'ADMIN001',
        phone: '9876543210',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✔ Created default Admin user (admin@campus.edu / admin@12345)');
    }

    // 2. Ensure initial items exist for demonstration if database is empty
    const itemsCount = await Item.countDocuments();
    if (itemsCount === 0) {
      const sampleItems = [
        {
          type: 'Lost',
          title: 'Blue Spiral Notebook',
          category: 'Books & Stationery',
          description: 'Class notes for Data Structures with blue cover.',
          date: '2026-11-01',
          location: 'Main Science Block, Room 204',
          collectFrom: 'Admin Office',
          reporterName: 'Meriin K Joseph',
          reporterRoll: '26CSEL40',
          reporterPhone: '9876543210',
          reporterEmail: 'merin@campus.edu',
          status: 'Active'
        },
        {
          type: 'Found',
          title: 'Casio Scientific Calculator (fx-991EX)',
          category: 'Electronics',
          description: 'Black calculator found on the front desk.',
          date: '2026-11-02',
          location: 'Central Library, 1st Floor',
          collectFrom: 'Library Reception Counter',
          reporterName: 'Library Staff',
          reporterRoll: 'STAFF102',
          reporterPhone: '9123456780',
          reporterEmail: 'library@campus.edu',
          status: 'Active'
        },
        {
          type: 'Lost',
          title: 'Student Identity Card',
          category: 'ID & Cards',
          description: 'College ID card in a blue lanyard.',
          date: '2026-10-30',
          location: 'Campus Cafeteria',
          collectFrom: 'Security Desk',
          reporterName: 'Rahul Sharma',
          reporterRoll: '24BCS015',
          reporterPhone: '9876501234',
          reporterEmail: 'rahul.s@campus.edu',
          status: 'Returned',
          returnedToName: 'Rahul Sharma',
          returnedToRoll: '24BCS015',
          returnedDate: '2026-11-03',
          remarks: 'Verified ID photo at Help Desk.'
        }
      ];

      await Item.insertMany(sampleItems);
      console.log('✔ Seeded starter sample items for demonstration!');
    }
  } catch (err) {
    console.error('Data seeding note:', err.message);
  }
}

// ------------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------------------------------------------------

// 1. User Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, rollNo, phone, password } = req.body;

    // Validation
    if (!name || !email || !rollNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, roll number, and password are required.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Hash the password with bcrypt for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user record
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      rollNo: rollNo.trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: 'student'
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! You can now log in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        rollNo: newUser.rollNo,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// 2. User Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or user not found.'
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ------------------------------------------------------------------------------
// ITEM ROUTES (LOST & FOUND)
// ------------------------------------------------------------------------------

// 3. Statistics Route - Live item counts
app.get('/api/stats', async (req, res) => {
  try {
    const totalLost = await Item.countDocuments({ type: 'Lost', status: 'Active' });
    const totalFound = await Item.countDocuments({ type: 'Found', status: 'Active' });
    const totalReturned = await Item.countDocuments({ status: 'Returned' });

    res.json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        totalReturned,
        totalAll: totalLost + totalFound + totalReturned
      }
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
});

// 4. Get All Items with Filtering & Search
app.get('/api/items', async (req, res) => {
  try {
    const { type, status, category, search } = req.query;

    const query = {};

    // Filter by type ('Lost' or 'Found')
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by status ('Active' or 'Returned')
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query (matches title, location, or reporter)
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { location: regex },
        { description: regex },
        { reporterName: regex }
      ];
    }

    // Sort newest first
    const items = await Item.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Fetch Items Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items.' });
  }
});

// 5. Report a New Lost or Found Item
app.post('/api/items', async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      date,
      location,
      collectFrom,
      reporterName,
      reporterRoll,
      reporterPhone,
      reporterEmail
    } = req.body;

    // Basic Validation
    if (!type || !title || !description || !date || !location || !reporterName) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Title, Description, Date, Location, and Your Name).'
      });
    }

    // Create item
    const newItem = await Item.create({
      type,
      title: title.trim(),
      category: category || 'Others',
      description: description.trim(),
      date: date.trim(),
      location: location.trim(),
      collectFrom: collectFrom ? collectFrom.trim() : 'Admin Reception',
      reporterName: reporterName.trim(),
      reporterRoll: reporterRoll ? reporterRoll.trim() : '',
      reporterPhone: reporterPhone ? reporterPhone.trim() : '',
      reporterEmail: reporterEmail ? reporterEmail.trim() : '',
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: `${type} item report submitted successfully!`,
      item: newItem
    });
  } catch (error) {
    console.error('Create Item Error:', error);
    res.status(500).json({ success: false, message: 'Failed to report item.' });
  }
});

// 6. Mark Item as Returned / Handed Over
app.put('/api/items/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { returnedToName, returnedToRoll, returnedDate, remarks } = req.body;

    if (!returnedToName) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name (who collected the item) is required.'
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        status: 'Returned',
        returnedToName: returnedToName.trim(),
        returnedToRoll: returnedToRoll ? returnedToRoll.trim() : '',
        returnedDate: returnedDate || new Date().toISOString().split('T')[0],
        remarks: remarks ? remarks.trim() : 'Handed over to rightful owner'
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.json({
      success: true,
      message: `"${updatedItem.title}" has been successfully marked as Returned!`,
      item: updatedItem
    });
  } catch (error) {
    console.error('Return Item Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update item status.' });
  }
});

// 7. Delete an Item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.json({
      success: true,
      message: 'Item record deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Item Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
});

// ------------------------------------------------------------------------------
// Start Server
// ------------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  🎓 Campus Lost & Found System (Mini Project)      `);
  console.log(`  Server running at: http://localhost:${PORT}        `);
  console.log('====================================================\n');
  
  // Connect to Database
  connectToDatabase();
});
