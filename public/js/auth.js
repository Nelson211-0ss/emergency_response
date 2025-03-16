// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginSwitch = document.getElementById('loginSwitch');
const signupSwitch = document.getElementById('signupSwitch');
const passwordToggles = document.querySelectorAll('.toggle-password');

// Show/Hide Forms
function showLogin() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    loginSwitch.classList.add('active');
    signupSwitch.classList.remove('active');
    document.querySelector('.auth-header h2').textContent = 'Welcome Back';
    document.querySelector('.auth-header p').textContent = 'Access your emergency response account';
}

function showSignup() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    loginSwitch.classList.remove('active');
    signupSwitch.classList.add('active');
    document.querySelector('.auth-header h2').textContent = 'Create Account';
    document.querySelector('.auth-header p').textContent = 'Join our emergency response platform';
}

// Event Listeners
loginSwitch.addEventListener('click', showLogin);
signupSwitch.addEventListener('click', showSignup);

// Password Visibility Toggle
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        const input = e.target.closest('.input-with-icon').querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(input, message) {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function clearErrors(form) {
    form.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
    form.querySelectorAll('.error-message').forEach(msg => msg.remove());
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(loginForm);

    const email = loginForm.querySelector('#loginEmail').value;
    const password = loginForm.querySelector('#loginPassword').value;
    const rememberMe = loginForm.querySelector('#rememberMe').checked;

    let hasError = false;

    if (!validateEmail(email)) {
        showError(loginForm.querySelector('#loginEmail'), 'Please enter a valid email address');
        hasError = true;
    }

    if (!validatePassword(password)) {
        showError(loginForm.querySelector('#loginPassword'), 'Password must be at least 8 characters');
        hasError = true;
    }

    if (hasError) return;

    const submitButton = loginForm.querySelector('.auth-submit');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await response.json();

        if (response.ok) {
            // Successful login
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html'; // Redirect to dashboard
        } else {
            showError(loginForm.querySelector('#loginEmail'), data.message || 'Invalid email or password');
        }
    } catch (error) {
        showError(loginForm.querySelector('#loginEmail'), 'An error occurred. Please try again later.');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(signupForm);

    const email = signupForm.querySelector('#signupEmail').value;
    const password = signupForm.querySelector('#signupPassword').value;
    const confirmPassword = signupForm.querySelector('#confirmPassword').value;
    const agreeTerms = signupForm.querySelector('#agreeTerms').checked;

    let hasError = false;

    if (!validateEmail(email)) {
        showError(signupForm.querySelector('#signupEmail'), 'Please enter a valid email address');
        hasError = true;
    }

    if (!validatePassword(password)) {
        showError(signupForm.querySelector('#signupPassword'), 'Password must be at least 8 characters');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showError(signupForm.querySelector('#confirmPassword'), 'Passwords do not match');
        hasError = true;
    }

    if (!agreeTerms) {
        showError(signupForm.querySelector('#agreeTerms'), 'You must agree to the Terms of Service');
        hasError = true;
    }

    if (hasError) return;

    const submitButton = signupForm.querySelector('.auth-submit');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Successful signup
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html'; // Redirect to dashboard
        } else {
            showError(signupForm.querySelector('#signupEmail'), data.message || 'Error creating account');
        }
    } catch (error) {
        showError(signupForm.querySelector('#signupEmail'), 'An error occurred. Please try again later.');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

// Social Authentication
document.querySelector('.social-auth-btn.google').addEventListener('click', () => {
    // Replace with your Google OAuth endpoint
    window.location.href = '/api/auth/google';
});

document.querySelector('.social-auth-btn.facebook').addEventListener('click', () => {
    // Replace with your Facebook OAuth endpoint
    window.location.href = '/api/auth/facebook';
});

// Initialize
showLogin(); // Show login form by default 