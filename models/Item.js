// ==============================================================================
// Item Model (Mongoose Schema)
// Stores reports for both "Lost" and "Found" campus items
// ==============================================================================

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // Type: either 'Lost' (reported by owner) or 'Found' (reported by finder)
  type: {
    type: String,
    enum: ['Lost', 'Found'],
    required: true
  },

  // Item Title (e.g., 'Blue Notebook', 'Scientific Calculator')
  title: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },

  // Category
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Books & Stationery',
      'ID & Cards',
      'Wallets & Bags',
      'Keys',
      'Clothing',
      'Accessories',
      'Others'
    ],
    default: 'Others'
  },

  // Detailed Description of item
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },

  // Date Lost or Found
  date: {
    type: String,
    required: [true, 'Date is required']
  },

  // Location where item was lost or found
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },

  // Where to collect (mainly used for Found items, e.g. "Security Desk", "Admin Office")
  collectFrom: {
    type: String,
    trim: true,
    default: 'Admin Reception / Security Desk'
  },

  // Person who reported the item
  reporterName: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true
  },
  reporterRoll: {
    type: String,
    trim: true,
    default: ''
  },
  reporterPhone: {
    type: String,
    trim: true,
    default: ''
  },
  reporterEmail: {
    type: String,
    trim: true,
    default: ''
  },

  // Status: 'Active' (unresolved) or 'Returned' (handed back to owner)
  status: {
    type: String,
    enum: ['Active', 'Returned'],
    default: 'Active'
  },

  // Return / Handover Information (filled when marked returned)
  returnedToName: {
    type: String,
    default: ''
  },
  returnedToRoll: {
    type: String,
    default: ''
  },
  returnedDate: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', itemSchema);
