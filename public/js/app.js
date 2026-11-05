// ==============================================================================
// Application JavaScript (app.js)
// Simple Student Project Code for Item Listing, Reporting, and Returning
// ==============================================================================

let currentReturnId = null;

// 1. Tab Switching Function
function switchTab(tabId) {
  // Update Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById('btn-tab-' + tabId);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Nav Links
  document.querySelectorAll('.tab-link').forEach(link => {
    link.classList.remove('active');
  });

  // Update Tab Sections
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.remove('active');
  });
  const activeSection = document.getElementById('tab-' + tabId);
  if (activeSection) activeSection.classList.add('active');

  // If viewing items, reload data
  if (tabId === 'browse') {
    fetchStats();
    fetchItems();
  }
}

// 2. Fetch Live Statistics
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success && data.stats) {
      document.getElementById('stat-lost').textContent = data.stats.totalLost;
      document.getElementById('stat-found').textContent = data.stats.totalFound;
      document.getElementById('stat-returned').textContent = data.stats.totalReturned;
    }
  } catch (err) {
    console.log('Error fetching stats:', err);
  }
}

// 3. Fetch and Display Items
async function fetchItems() {
  const container = document.getElementById('items-list');
  if (!container) return;

  const searchVal = document.getElementById('search-input').value.trim();
  const typeVal = document.getElementById('filter-type').value;
  const catVal = document.getElementById('filter-category').value;

  // Build query parameters
  const params = new URLSearchParams();
  if (typeVal === 'Lost' || typeVal === 'Found') {
    params.append('type', typeVal);
    params.append('status', 'Active');
  } else if (typeVal === 'Returned') {
    params.append('status', 'Returned');
  }
  if (catVal !== 'All') {
    params.append('category', catVal);
  }
  if (searchVal) {
    params.append('search', searchVal);
  }

  container.innerHTML = '<div class="empty-box">Loading items from database...</div>';

  try {
    const res = await fetch('/api/items?' + params.toString());
    const data = await res.json();

    if (!data.success || !data.items || data.items.length === 0) {
      container.innerHTML = '<div class="empty-box">No items found matching the selected filter.</div>';
      return;
    }

    // Render cards
    container.innerHTML = data.items.map(item => {
      const isReturned = item.status === 'Returned';
      const isLost = item.type === 'Lost';
      const badgeClass = isReturned ? 'badge-returned' : (isLost ? 'badge-lost' : 'badge-found');
      const badgeLabel = isReturned ? 'RETURNED' : (isLost ? 'LOST' : 'FOUND');

      return `
        <div class="item-card">
          <div class="card-top">
            <h3>${item.title}</h3>
            <span class="badge ${badgeClass}">${badgeLabel}</span>
          </div>

          <span class="badge-category">${item.category || 'General'}</span>
          <p class="description">${item.description}</p>

          <div class="item-meta">
            <div><strong>Date:</strong> ${item.date}</div>
            <div><strong>Location:</strong> ${item.location}</div>
            ${item.collectFrom ? `<div><strong>Collect From:</strong> ${item.collectFrom}</div>` : ''}
            <div><strong>Reported By:</strong> ${item.reporterName} ${item.reporterRoll ? `(${item.reporterRoll})` : ''}</div>
            ${item.reporterPhone ? `<div><strong>Phone:</strong> ${item.reporterPhone}</div>` : ''}
            ${isReturned ? `
              <div style="grid-column: 1 / -1; color: #27ae60; font-weight: bold;">
                Handed over to: ${item.returnedToName} ${item.returnedToRoll ? `(${item.returnedToRoll})` : ''} on ${item.returnedDate || 'N/A'}
              </div>
            ` : ''}
          </div>

          <div class="card-bottom">
            <span style="color: #888;">Item ID: #${item._id.substring(item._id.length - 6).toUpperCase()}</span>
            ${!isReturned ? `
              <button class="btn btn-sm btn-success" onclick="openReturnModal('${item._id}', '${item.title.replace(/'/g, "\\'")}')">
                Mark as Returned
              </button>
            ` : `
              <span style="color: #27ae60; font-weight: bold;">✓ Claimed &amp; Returned</span>
            `}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-box">Failed to load items from server.</div>';
  }
}

// 4. Submit Lost Item
async function submitLostItem(e) {
  e.preventDefault();

  const payload = {
    type: 'Lost',
    title: document.getElementById('lost-title').value.trim(),
    category: document.getElementById('lost-category').value,
    date: document.getElementById('lost-date').value,
    location: document.getElementById('lost-location').value.trim(),
    description: document.getElementById('lost-desc').value.trim(),
    reporterName: document.getElementById('lost-name').value.trim(),
    reporterRoll: document.getElementById('lost-roll').value.trim(),
    reporterPhone: document.getElementById('lost-phone').value.trim(),
    reporterEmail: document.getElementById('lost-email').value.trim()
  };

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showAlert('lost-alert', 'Lost item report submitted successfully!', true);
      document.getElementById('form-lost').reset();
      setTimeout(() => {
        document.getElementById('lost-alert').style.display = 'none';
        switchTab('browse');
      }, 1200);
    } else {
      showAlert('lost-alert', data.message || 'Error submitting report.', false);
    }
  } catch (err) {
    showAlert('lost-alert', 'Server error. Please check server connection.', false);
  }
}

// 5. Submit Found Item
async function submitFoundItem(e) {
  e.preventDefault();

  const payload = {
    type: 'Found',
    title: document.getElementById('found-title').value.trim(),
    category: document.getElementById('found-category').value,
    date: document.getElementById('found-date').value,
    location: document.getElementById('found-location').value.trim(),
    collectFrom: document.getElementById('found-collect').value.trim(),
    description: document.getElementById('found-desc').value.trim(),
    reporterName: document.getElementById('found-name').value.trim(),
    reporterPhone: document.getElementById('found-phone').value.trim()
  };

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showAlert('found-alert', 'Found item report submitted successfully!', true);
      document.getElementById('form-found').reset();
      setTimeout(() => {
        document.getElementById('found-alert').style.display = 'none';
        switchTab('browse');
      }, 1200);
    } else {
      showAlert('found-alert', data.message || 'Error submitting report.', false);
    }
  } catch (err) {
    showAlert('found-alert', 'Server error. Please check server connection.', false);
  }
}

// 6. Return / Handover Modal Logic
function openReturnModal(id, title) {
  currentReturnId = id;
  document.getElementById('modal-item-title').textContent = title;
  document.getElementById('return-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('return-student-name').value = '';
  document.getElementById('return-student-roll').value = '';
  document.getElementById('return-remarks').value = '';

  document.getElementById('return-modal').classList.add('active');
}

function closeReturnModal() {
  document.getElementById('return-modal').classList.remove('active');
  currentReturnId = null;
}

async function confirmReturn(e) {
  e.preventDefault();
  if (!currentReturnId) return;

  const returnedToName = document.getElementById('return-student-name').value.trim();
  const returnedToRoll = document.getElementById('return-student-roll').value.trim();
  const returnedDate = document.getElementById('return-date').value;
  const remarks = document.getElementById('return-remarks').value.trim();

  try {
    const res = await fetch('/api/items/' + currentReturnId + '/return', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnedToName, returnedToRoll, returnedDate, remarks })
    });
    const data = await res.json();

    if (data.success) {
      alert(data.message);
      closeReturnModal();
      fetchStats();
      fetchItems();
    } else {
      alert(data.message || 'Failed to update item.');
    }
  } catch (err) {
    alert('Server communication error.');
  }
}

// 7. Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  fetchItems();

  // Pre-fill logged in student info if available
  const user = getUser();
  if (user) {
    const lostName = document.getElementById('lost-name');
    if (lostName) lostName.value = user.name || '';
    const lostRoll = document.getElementById('lost-roll');
    if (lostRoll) lostRoll.value = user.rollNo || '';
    const lostPhone = document.getElementById('lost-phone');
    if (lostPhone) lostPhone.value = user.phone || '';
    const lostEmail = document.getElementById('lost-email');
    if (lostEmail) lostEmail.value = user.email || '';

    const foundName = document.getElementById('found-name');
    if (foundName) foundName.value = user.name || '';
    const foundPhone = document.getElementById('found-phone');
    if (foundPhone) foundPhone.value = user.phone || '';
  }

  // Pre-set today's date
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('lost-date')) document.getElementById('lost-date').value = today;
  if (document.getElementById('found-date')) document.getElementById('found-date').value = today;

  // Search & Filter change events
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', fetchItems);

  const filterType = document.getElementById('filter-type');
  if (filterType) filterType.addEventListener('change', fetchItems);

  const filterCategory = document.getElementById('filter-category');
  if (filterCategory) filterCategory.addEventListener('change', fetchItems);
});
