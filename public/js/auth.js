// ==============================================================================
// Authentication JavaScript (auth.js)
// Simple Student Project Code for Login, Registration & Session
// ==============================================================================

// Helper: Get logged-in user from browser storage
function getUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

// Helper: Display success/error alert message
function showAlert(elementId, message, isSuccess) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = 'alert ' + (isSuccess ? 'alert-success' : 'alert-error');
}

// Update navbar with logged-in student details
function updateNavbar() {
  const slot = document.getElementById('nav-auth-slot');
  if (!slot) return;

  const user = getUser();
  if (user) {
    slot.innerHTML = `
      <span style="color: #ecf0f1; font-size: 0.9rem;">
        👤 <strong>${user.name}</strong> (${user.rollNo || user.role})
      </span>
      <button onclick="handleLogout()" class="btn btn-sm btn-secondary" style="margin-left: 8px;">Logout</button>
    `;
  } else {
    slot.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-primary">Login</a>
      <a href="register.html" class="btn btn-sm btn-secondary" style="margin-left: 5px;">Register</a>
    `;
  }
}

// Handle User Logout
function handleLogout() {
  if (confirm('Do you want to log out?')) {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
}

// Handle Login Form Submission
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      showAlert('login-alert', 'Login successful! Redirecting...', true);
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showAlert('login-alert', data.message || 'Invalid email or password.', false);
    }
  } catch (err) {
    showAlert('login-alert', 'Server error. Please ensure server is running.', false);
  }
}

// Handle Registration Form Submission
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const rollNo = document.getElementById('reg-roll').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPass = document.getElementById('reg-confirm').value;

  if (password !== confirmPass) {
    showAlert('register-alert', 'Passwords do not match!', false);
    return;
  }

  if (password.length < 6) {
    showAlert('register-alert', 'Password must be at least 6 characters.', false);
    return;
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rollNo, email, phone, password })
    });
    const data = await res.json();

    if (data.success) {
      showAlert('register-alert', 'Registration successful! Redirecting to login...', true);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      showAlert('register-alert', data.message || 'Registration failed.', false);
    }
  } catch (err) {
    showAlert('register-alert', 'Server error during registration.', false);
  }
}

// Initialize navbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);
