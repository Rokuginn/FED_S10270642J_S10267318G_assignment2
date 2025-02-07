document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    } else if (user) {
        updateUserInterface(user);
        startPointsUpdateInterval();
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
        mokePoints.textContent = userData.mokePoints || '0';
        userInfo.style.display = 'flex';
        sellBtn.style.display = 'block';
        logoutLink.style.display = 'block';

        // Add this to update points display whenever the interface is updated
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${userData._id}`)
            .then(response => response.json())
            .then(user => {
                if (user.mokePoints !== userData.mokePoints) {
                    userData.mokePoints = user.mokePoints;
                    localStorage.setItem('user', JSON.stringify(userData));
                    mokePoints.textContent = user.mokePoints;
                }
            })
            .catch(error => console.error('Error fetching updated user data:', error));
    } else {
        userInfo.style.display = 'none';
        sellBtn.style.display = 'none';
        logoutLink.style.display = 'none';
    }
}

// Add this function to periodically update points
function startPointsUpdateInterval() {
    setInterval(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            updateUserInterface(userData);
        }
    }, 5000); // Update every 5 seconds
}