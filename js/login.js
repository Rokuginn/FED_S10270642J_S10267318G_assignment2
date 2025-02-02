document.addEventListener('DOMContentLoaded', () => {
    // Form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            console.log('Submitting login request:', { username, password });

            try {
                const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();
                console.log('Login response:', result);
                if (result.success) {
                    localStorage.setItem('user', JSON.stringify({ _id: result.userId, username: result.username }));
                    alert('Login successful!');
                    // Redirect to loading page
                    window.location.href = 'loading.html';
                } else {
                    alert('Login failed: ' + result.message);
                    window.location.href = 'login.html'; // Redirect back to login page on failure
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('Login failed: ' + error.message);
                window.location.href = 'login.html'; // Redirect back to login page on error
            }
        });
    } else {
        console.error('Login form not found');
    }

    // Registration functionality
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            console.log('Submitting registration request:', { username, email, password });

            try {
                const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const result = await response.json();
                console.log('Registration response:', result);
                if (result.success) {
                    alert('Registration successful!');
                    window.location.href = 'login.html'; // Redirect to login page after successful registration
                } else {
                    alert('Registration failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('Registration failed: ' + error.message);
            }
        });
    }

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
    const defaultOpen = document.getElementById('defaultOpen');
    if (defaultOpen) {
        defaultOpen.click();
    }

    // Function to display user information
    function displayUserInfo(username) {
        const userInfo = document.getElementById('userInfo');
        const welcomeMessage = document.getElementById('welcomeMessage');

        welcomeMessage.textContent = `Welcome, ${username}`;

        userInfo.style.display = 'flex';
    }

    // Function to handle user logout
    function logoutUser() {
        // Clear user information
        const userInfo = document.getElementById('userInfo');
        const welcomeMessage = document.getElementById('welcomeMessage');

        welcomeMessage.textContent = '';

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
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        displayUserInfo(user.username);
        signUpBtn.textContent = 'Log out';
        sellBtn.style.display = 'inline-block';
    }

    const profilePicture = document.getElementById('profilePicture');
    const profilePicturePopup = document.getElementById('profilePicturePopup');
    const profilePictureCloseBtn = profilePicturePopup.querySelector('.close-btn');
    const profilePictureForm = document.getElementById('profilePictureForm');

    profilePicture.addEventListener('click', () => {
        profilePicturePopup.style.display = 'block';
    });

    profilePictureCloseBtn.addEventListener('click', () => {
        profilePicturePopup.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == profilePicturePopup) {
            profilePicturePopup.style.display = 'none';
        }
    });
    //Scrapped Profile Picture Update Functionality
    profilePictureForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profilePictureForm);
        const user = JSON.parse(localStorage.getItem('user')); // Get the logged-in user
        formData.append('userId', user._id); // Append userId to the form data

        try {
            const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/updateProfilePicture', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                alert('Profile picture updated successfully!');
                profilePicture.src = result.profilePicture;
                localStorage.setItem('user', JSON.stringify({ ...user, profilePicture: result.profilePicture }));
                profilePicturePopup.style.display = 'none';
            } else {
                alert('Failed to update profile picture: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating profile picture:', error);
            alert('Failed to update profile picture: ' + error.message);
        }
    });
});