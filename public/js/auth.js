// ==============================================================================
// CAMPUS LOST AND FOUND SYSTEM - MINI PROJECT
// Authentication Logic (Pure JavaScript)
// Handles Login, Registration, Session, and Navigation Bar Updates
// ==============================================================================

// Helper: Get currently logged-in user from localStorage
function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

// Helper: Show alert message inside an element
function showAlert(elementId, message, isSuccess = false) {
  const alertEl = document.getElementById(elementId);
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = 'alert show ' + (isSuccess ? 'alert-success' : 'alert-error');
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ------------------------------------------------------------------------------
// Navigation Bar Session Checker (Runs on all pages)
// ------------------------------------------------------------------------------
function updateNavigationAuth() {
  const navAuthEl = document.getElementById('nav-auth');
  if (!navAuthEl) return;

  const user = getCurrentUser();

  if (user) {
    // User is logged in
    navAuthEl.innerHTML = `
      <span style="font-size: 0.9rem; color: #cbd5e1;">
        👤 <strong>${escapeHtml(user.name)}</strong> (${user.role === 'admin' ? 'Admin' : escapeHtml(user.rollNo)})
      </span>
      <button onclick="handleLogout()" class="btn btn-outline btn-sm">Logout</button>
    `;
  } else {
    // User is a guest
    navAuthEl.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

// ------------------------------------------------------------------------------
// Handle User Logout
// ------------------------------------------------------------------------------
function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
}

// ------------------------------------------------------------------------------
// Handle Login Form Submission
// ------------------------------------------------------------------------------
async function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        showAlert('login-alert', 'Login successful! Redirecting...', true);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showAlert('login-alert', data.message || 'Login failed. Please check credentials.', false);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('login-alert', 'Server error. Please make sure server is running.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

// ------------------------------------------------------------------------------
// Handle Registration Form Submission
// ------------------------------------------------------------------------------
async function initRegisterPage() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const rollNo = document.getElementById('reg-roll').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
      showAlert('register-alert', 'Passwords do not match! Please check and retry.', false);
      return;
    }

    if (password.length < 6) {
      showAlert('register-alert', 'Password must be at least 6 characters long.', false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rollNo, email, phone, password })
      });

      const data = await response.json();

      if (data.success) {
        showAlert('register-alert', 'Account created! Redirecting to login...', true);
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } else {
        showAlert('register-alert', data.message || 'Registration failed.', false);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    } catch (error) {
      console.error('Register error:', error);
      showAlert('register-alert', 'Server connection error. Please try again.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

// ------------------------------------------------------------------------------
// Utility: Escape HTML to prevent XSS in rendering
// ------------------------------------------------------------------------------
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavigationAuth();
  initLoginPage();
  initRegisterPage();
});
