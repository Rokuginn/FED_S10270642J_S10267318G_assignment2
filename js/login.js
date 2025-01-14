// Popup functionality
const signUpBtn = document.getElementById('signUpBtn'); // Updated selector
const loginPopup = document.getElementById('loginPopup');
const closeBtn = document.querySelector('.close-btn');

signUpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginPopup.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    loginPopup.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == loginPopup) {
        loginPopup.style.display = 'none';
    }
});

// Form submission
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        alert('Login successful!');
        loginPopup.style.display = 'none';
    } else {
        alert('Login failed!');
    }
});