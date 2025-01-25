document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    } else if (user) {
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('welcomeMessage').textContent = `Welcome, ${user.username}`;
        document.getElementById('logoutLink').style.display = 'block';
        document.getElementById('sellBtn').style.display = 'block';
    }
});

document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});