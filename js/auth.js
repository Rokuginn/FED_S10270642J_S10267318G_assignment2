document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    } else if (user) {
        updateUserInterface(user);
    }
});

document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// To log user out when browser is closed or navigated away from the site
window.addEventListener('beforeunload', (event) => {
    const currentUrl = new URL(window.location.href);
    const nextUrl = new URL(event.target.activeElement.href);

    if (currentUrl.origin !== nextUrl.origin) {
        localStorage.removeItem('user');
    }
});

function updateUserInterface(userData) {
    const userInfo = document.getElementById('userInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const mokePoints = document.getElementById('mokePoints');
    const sellBtn = document.getElementById('sellBtn');
    const logoutLink = document.getElementById('logoutLink');

    if (userData) {
        welcomeMessage.textContent = `Welcome, ${userData.username}`;
        mokePoints.textContent = userData.mokePoints || 0;
        userInfo.style.display = 'flex';
        sellBtn.style.display = 'block';
        logoutLink.style.display = 'block';
    } else {
        userInfo.style.display = 'none';
        sellBtn.style.display = 'none';
        logoutLink.style.display = 'none';
    }
}