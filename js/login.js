// Popup functionality
const signUpBtn = document.getElementById('signUpBtn'); // Updated selector
const loginPopup = document.getElementById('loginPopup');
const closeBtn = document.querySelector('.close-btn');
const sellBtn = document.getElementById('sellBtn'); // Added selector for Sell button

signUpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (signUpBtn.textContent === 'Log out') {
        if (confirm('Are you sure you want to log out?')) {
            logoutUser();
        }
    } else {
        loginPopup.style.display = 'block';
    }
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

    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/login', {
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
        displayUserInfo(result.username, result.profilePicture);
        signUpBtn.textContent = 'Log out';
        sellBtn.style.display = 'inline-block';
        localStorage.setItem('user', JSON.stringify({ _id: result.userId, username: result.username, profilePicture: result.profilePicture }));
    } else {
        alert('Login failed!');
    }
});

// Registration functionality
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    if (result.success) {
        alert('Registration successful!');
        loginPopup.style.display = 'none';
        displayUserInfo(result.username, result.profilePicture); // Use the response data
        signUpBtn.textContent = 'Log out'; // Change button text to 'Log out'
        sellBtn.style.display = 'inline-block'; // Show the Sell button
        localStorage.setItem('user', JSON.stringify({ _id: result.userId, username: result.username, profilePicture: result.profilePicture })); // Store user info in localStorage
    } else {
        alert('Registration failed: ' + result.message);
    }
});

// Tab functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// Open the default tab
document.getElementById('defaultOpen').click();

// Function to display user information
function displayUserInfo(username, profilePicturePath) {
    const userInfo = document.getElementById('userInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const profilePicture = document.getElementById('profilePicture');

    welcomeMessage.textContent = `Welcome, ${username}`;
    profilePicture.src = profilePicturePath;

    userInfo.style.display = 'flex';
}

// Function to handle user logout
function logoutUser() {
    // Clear user information
    const userInfo = document.getElementById('userInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const profilePicture = document.getElementById('profilePicture');

    welcomeMessage.textContent = '';
    profilePicture.src = '';

    userInfo.style.display = 'none';
    signUpBtn.textContent = 'SignUp'; // Change button text back to 'SignUp'
    sellBtn.style.display = 'none'; // Hide the Sell button
    localStorage.removeItem('user'); // Remove user info from localStorage
    alert('Logged out successfully!');
}

// Add event listener to the Sell button
sellBtn.addEventListener('click', () => {
    window.location.href = 'listing.html';
});

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        displayUserInfo(user.username, user.profilePicture);
        signUpBtn.textContent = 'Log out';
        sellBtn.style.display = 'inline-block';
    }
});