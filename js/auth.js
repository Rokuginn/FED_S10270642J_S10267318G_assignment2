document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    } else if (user) {
        console.log('Profile Picture Path:', user.profilePicture); // Add this line to verify the path
        displayUserInfo(user);
        document.getElementById('logoutLink').style.display = 'block';
        document.getElementById('sellBtn').style.display = 'block';
        displayNavbarProfilePicture(user.profilePicture);
    }
});

function displayUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const profilePicture = document.getElementById('profilePicture');

    welcomeMessage.textContent = `Welcome, ${user.username}`;
    profilePicture.src = user.profilePicture || '/uploads/default-profile-picture.jpg';

    userInfo.style.display = 'flex';
}

function displayNavbarProfilePicture(profilePicturePath) {
    const navbarProfilePicture = document.getElementById('profilePicture');
    navbarProfilePicture.src = profilePicturePath || '/uploads/default-profile-picture.jpg';
}

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