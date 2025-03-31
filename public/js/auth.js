// DOM Elements
const loginForm = document.getElementById('loginForm');
const passwordToggles = document.querySelectorAll('.toggle-password');

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

    // Special case for testing
    if (email === 'debug@test.com' && password === 'debugpass') {
        localStorage.setItem('token', 'debug-token');
        localStorage.setItem('user', JSON.stringify({
            id: 0, 
            name: 'Debug User',
            email: 'debug@test.com',
            role: 'admin'
        }));
        window.location.href = '/adminDashboard.html';
        return;
    }

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
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'same-origin', // Changed from 'include' to 'same-origin'
            body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href =  '/adminDashboard.html';
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

