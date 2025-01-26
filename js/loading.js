document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
    } else {
        // Delay before navigating to the next page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000); // Adjust the delay time (in milliseconds) as needed
    }
});