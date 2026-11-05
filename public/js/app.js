// ==============================================================================
// CAMPUS LOST AND FOUND SYSTEM - MINI PROJECT
// Main Application Logic (Pure JavaScript)
// Handles Item Display, Searching, Reporting, and Handover / Return Modals
// ==============================================================================

// Global State
let currentTab = 'browse';
let activeTypeFilter = 'All';
let activeCategoryFilter = 'All';
let currentSearchTerm = '';
let currentReturnItemId = null;

// ------------------------------------------------------------------------------
// Tab Switching
// ------------------------------------------------------------------------------
function switchTab(tabId) {
  currentTab = tabId;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });

  // If switched to browse tab, refresh list and stats
  if (tabId === 'browse') {
    fetchStats();
    fetchItems();
  }
}

// ------------------------------------------------------------------------------
// Fetch Live Statistics
// ------------------------------------------------------------------------------
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
    console.error('Failed to load stats:', err);
  }
}

// ------------------------------------------------------------------------------
// Fetch & Render Items
// ------------------------------------------------------------------------------
async function fetchItems() {
  const grid = document.getElementById('items-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <p>⏳ Loading items from database...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (activeTypeFilter === 'Lost' || activeTypeFilter === 'Found') {
      params.append('type', activeTypeFilter);
      params.append('status', 'Active');
    } else if (activeTypeFilter === 'Returned') {
      params.append('status', 'Returned');
    }

    if (activeCategoryFilter !== 'All') {
      params.append('category', activeCategoryFilter);
    }

    if (currentSearchTerm.trim()) {
      params.append('search', currentSearchTerm.trim());
    }

    const res = await fetch(`/api/items?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      renderItems(data.items);
    } else {
      grid.innerHTML = `<div class="empty-state"><p>❌ Failed to load items.</p></div>`;
    }
  } catch (err) {
    console.error('Fetch items error:', err);
    grid.innerHTML = `<div class="empty-state"><p>❌ Connection error. Please check server.</p></div>`;
  }
}

// Render item cards
function renderItems(items) {
  const grid = document.getElementById('items-grid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No Items Found</h3>
        <p>No lost or found items match your current filter. Try selecting "All" or a different category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const isReturned = item.status === 'Returned';
    const isLost = item.type === 'Lost';
    
    // Choose appropriate badge
    let badgeClass = isReturned ? 'badge-returned' : (isLost ? 'badge-lost' : 'badge-found');
    let badgeText = isReturned ? 'RETURNED' : (isLost ? 'LOST ITEM' : 'FOUND ITEM');

    return `
      <div class="item-card">
        <div>
          <div class="card-header">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>

          <span class="badge-category">${escapeHtml(item.category || 'Others')}</span>
          <p class="card-desc">${escapeHtml(item.description)}</p>

          <div class="card-details">
            <div class="detail-row">
              <span>📅</span>
              <strong>Date:</strong> ${escapeHtml(item.date)}
            </div>
            <div class="detail-row">
              <span>📍</span>
              <strong>Location:</strong> ${escapeHtml(item.location)}
            </div>
            ${item.type === 'Found' && item.collectFrom ? `
              <div class="detail-row">
                <span>🏢</span>
                <strong>Collect From:</strong> ${escapeHtml(item.collectFrom)}
              </div>
            ` : ''}
            <div class="detail-row">
              <span>👤</span>
              <strong>Reported By:</strong> ${escapeHtml(item.reporterName)} ${item.reporterRoll ? `(${escapeHtml(item.reporterRoll)})` : ''}
            </div>
            ${item.reporterPhone ? `
              <div class="detail-row">
                <span>📞</span>
                <strong>Contact:</strong> ${escapeHtml(item.reporterPhone)}
              </div>
            ` : ''}
            ${item.reporterEmail ? `
              <div class="detail-row">
                <span>✉️</span>
                <strong>Email:</strong> ${escapeHtml(item.reporterEmail)}
              </div>
            ` : ''}
            ${isReturned ? `
              <div class="detail-row" style="color: #047857; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #a7f3d0;">
                <span>✅</span>
                <strong>Handed Over To:</strong> ${escapeHtml(item.returnedToName)} ${item.returnedToRoll ? `(${escapeHtml(item.returnedToRoll)})` : ''} on ${escapeHtml(item.returnedDate || 'N/A')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="card-footer">
          <span style="font-size: 0.78rem; color: #94a3b8;">
            ID: #${item._id.substring(item._id.length - 6).toUpperCase()}
          </span>
          ${!isReturned ? `
            <button class="btn btn-outline btn-sm" onclick="openReturnModal('${item._id}', '${escapeHtml(item.title)}')">
              ✔ Mark as Returned
            </button>
          ` : `
            <span style="font-size: 0.85rem; font-weight: 600; color: #059669;">
              ✓ Handover Completed
            </span>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// ------------------------------------------------------------------------------
// Form Submissions: Report Lost Item
// ------------------------------------------------------------------------------
function initReportForms() {
  // Pre-fill user contact info if logged in
  const user = getCurrentUser();

  const lostForm = document.getElementById('form-report-lost');
  if (lostForm) {
    if (user) {
      document.getElementById('lost-reporter-name').value = user.name || '';
      document.getElementById('lost-reporter-roll').value = user.rollNo || '';
      document.getElementById('lost-reporter-phone').value = user.phone || '';
      document.getElementById('lost-reporter-email').value = user.email || '';
    }

    // Set today as default date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('lost-date').value = today;

    lostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = lostForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const payload = {
        type: 'Lost',
        title: document.getElementById('lost-title').value.trim(),
        category: document.getElementById('lost-category').value,
        date: document.getElementById('lost-date').value,
        location: document.getElementById('lost-location').value.trim(),
        description: document.getElementById('lost-description').value.trim(),
        reporterName: document.getElementById('lost-reporter-name').value.trim(),
        reporterRoll: document.getElementById('lost-reporter-roll').value.trim(),
        reporterPhone: document.getElementById('lost-reporter-phone').value.trim(),
        reporterEmail: document.getElementById('lost-reporter-email').value.trim(),
      };

      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          showAlert('lost-form-alert', '✔ Lost item report submitted successfully!', true);
          lostForm.reset();
          setTimeout(() => {
            document.getElementById('lost-form-alert').style.display = 'none';
            switchTab('browse');
          }, 1500);
        } else {
          showAlert('lost-form-alert', data.message || 'Failed to submit report.', false);
        }
      } catch (err) {
        console.error(err);
        showAlert('lost-form-alert', 'Network error. Please try again.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Lost Item Report';
      }
    });
  }

  // Found Form
  const foundForm = document.getElementById('form-report-found');
  if (foundForm) {
    if (user) {
      document.getElementById('found-reporter-name').value = user.name || '';
      document.getElementById('found-reporter-phone').value = user.phone || '';
    }

    // Set today as default date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('found-date').value = today;

    foundForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = foundForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const payload = {
        type: 'Found',
        title: document.getElementById('found-title').value.trim(),
        category: document.getElementById('found-category').value,
        date: document.getElementById('found-date').value,
        location: document.getElementById('found-location').value.trim(),
        collectFrom: document.getElementById('found-collect-from').value.trim(),
        description: document.getElementById('found-description').value.trim(),
        reporterName: document.getElementById('found-reporter-name').value.trim(),
        reporterPhone: document.getElementById('found-reporter-phone').value.trim(),
        reporterEmail: document.getElementById('found-reporter-email').value.trim(),
      };

      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          showAlert('found-form-alert', '✔ Found item report submitted successfully!', true);
          foundForm.reset();
          setTimeout(() => {
            document.getElementById('found-form-alert').style.display = 'none';
            switchTab('browse');
          }, 1500);
        } else {
          showAlert('found-form-alert', data.message || 'Failed to submit report.', false);
        }
      } catch (err) {
        console.error(err);
        showAlert('found-form-alert', 'Network error. Please try again.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Found Item Report';
      }
    });
  }
}

// ------------------------------------------------------------------------------
// Handover / Return Modal Logic
// ------------------------------------------------------------------------------
function openReturnModal(itemId, itemName) {
  currentReturnItemId = itemId;
  document.getElementById('modal-item-name').textContent = itemName;

  // Set today as default return date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-return-date').value = today;
  document.getElementById('modal-recipient-name').value = '';
  document.getElementById('modal-recipient-roll').value = '';
  document.getElementById('modal-remarks').value = '';

  const modal = document.getElementById('return-modal');
  modal.classList.add('active');
}

function closeReturnModal() {
  const modal = document.getElementById('return-modal');
  modal.classList.remove('active');
  currentReturnItemId = null;
}

async function handleConfirmReturn(e) {
  e.preventDefault();
  if (!currentReturnItemId) return;

  const recipientName = document.getElementById('modal-recipient-name').value.trim();
  const recipientRoll = document.getElementById('modal-recipient-roll').value.trim();
  const returnDate = document.getElementById('modal-return-date').value;
  const remarks = document.getElementById('modal-remarks').value.trim();

  if (!recipientName) {
    alert('Please enter the name of the student who collected the item.');
    return;
  }

  const submitBtn = document.getElementById('btn-confirm-return');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const res = await fetch(`/api/items/${currentReturnItemId}/return`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnedToName: recipientName,
        returnedToRoll: recipientRoll,
        returnedDate: returnDate,
        remarks: remarks
      })
    });

    const data = await res.json();
    if (data.success) {
      alert(`Success: ${data.message}`);
      closeReturnModal();
      fetchStats();
      fetchItems();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect to server.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Mark as Returned';
  }
}

// ------------------------------------------------------------------------------
// Search & Filter Event Handlers
// ------------------------------------------------------------------------------
function initFilters() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      fetchItems();
    });
  }

  const typeSelect = document.getElementById('filter-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      activeTypeFilter = e.target.value;
      fetchItems();
    });
  }

  const categorySelect = document.getElementById('filter-category');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      activeCategoryFilter = e.target.value;
      fetchItems();
    });
  }
}

// ------------------------------------------------------------------------------
// Initialize App on DOM Load
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  fetchItems();
  initReportForms();
  initFilters();

  // Tab button listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Modal return form listener
  const returnForm = document.getElementById('form-confirm-return');
  if (returnForm) {
    returnForm.addEventListener('submit', handleConfirmReturn);
  }
});
