document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Ensure the following field is defined
    if (!currentUser.following) {
        currentUser.following = [];
    }

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id') || currentUser._id;
    console.log('Current User ID:', currentUser._id); // Debugging
    console.log('Viewing User ID:', userId); // Debugging

    try {
        const userResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${userId}`);
        const userData = await userResponse.json();
        console.log('User Data:', userData); // Debugging

        document.getElementById('username').textContent = userData.username;
        document.getElementById('description').textContent = userData.description || 'No description provided.';
        document.getElementById('dealMethod').querySelector('span').textContent = userData.dealMethod || 'Online';
        document.getElementById('location').querySelector('span').textContent = userData.location || ''; // Update location display
        document.getElementById('followersCount').textContent = userData.followers.length;
        document.getElementById('followingCount').textContent = userData.following.length;

        if (userId === currentUser._id) {
            document.getElementById('descriptionInput').value = userData.description || '';
            document.getElementById('dealMethodInput').value = userData.dealMethod || 'Online';
            document.getElementById('locationInput').value = userData.location || '';
            document.getElementById('settingsBtn').style.display = 'block';

            document.getElementById('settingsBtn').addEventListener('click', () => {
                const settingsContainer = document.getElementById('settingsContainer');
                settingsContainer.style.display = settingsContainer.style.display === 'none' ? 'block' : 'none';
            });

            document.getElementById('saveBtn').addEventListener('click', async () => {
                const description = document.getElementById('descriptionInput').value;
                const dealMethod = document.getElementById('dealMethodInput').value;
                const location = document.getElementById('locationInput').value;

                try {
                    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/updateProfile', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId, description, dealMethod, location })
                    });
                    const result = await response.json();
                    if (result.success) {
                        document.getElementById('description').textContent = description;
                        document.getElementById('dealMethod').querySelector('span').textContent = dealMethod;
                        document.getElementById('location').querySelector('span').textContent = location; // Update location display
                        alert('Profile updated successfully!');
                    } else {
                        alert('Failed to update profile: ' + result.message);
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('Failed to update profile: ' + error.message);
                }
            });
        } else {
            document.getElementById('descriptionInput').style.display = 'none';
            document.getElementById('dealMethodInput').style.display = 'none';
            document.getElementById('locationInput').style.display = 'none';
            document.getElementById('saveBtn').style.display = 'none';
            document.getElementById('settingsBtn').style.display = 'none';

            const followBtn = document.getElementById('followBtn');
            const unfollowBtn = document.getElementById('unfollowBtn');

            console.log('Current User Following:', currentUser.following); // Debugging

            if (currentUser.following.includes(userId)) {
                unfollowBtn.style.display = 'block';
            } else {
                followBtn.style.display = 'block';
            }

            followBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/follow', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ followerId: currentUser._id, followingId: userId })
                    });
                    const result = await response.json();
                    if (result.success) {
                        followBtn.style.display = 'none';
                        unfollowBtn.style.display = 'block';
                        document.getElementById('followersCount').textContent = parseInt(document.getElementById('followersCount').textContent) + 1;
                        currentUser.following.push(userId); // Update local following list
                        localStorage.setItem('user', JSON.stringify(currentUser)); // Update localStorage
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error following user:', error);
                }
            });

            unfollowBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/unfollow', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ followerId: currentUser._id, followingId: userId })
                    });
                    const result = await response.json();
                    if (result.success) {
                        followBtn.style.display = 'block';
                        unfollowBtn.style.display = 'none';
                        document.getElementById('followersCount').textContent = parseInt(document.getElementById('followersCount').textContent) - 1;
                        currentUser.following = currentUser.following.filter(id => id !== userId); // Update local following list
                        localStorage.setItem('user', JSON.stringify(currentUser)); // Update localStorage
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error unfollowing user:', error);
                }
            });
        }

        const listingsResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${userId}`);
        const listings = await listingsResponse.json();
        console.log('Listings:', listings); // Debugging

        let totalLikes = 0;
        const accountListingsContainer = document.getElementById('accountListings');
        accountListingsContainer.innerHTML = ''; // Clear any existing content

        listings.forEach(listing => {
            totalLikes += listing.likes;
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.setAttribute('data-id', listing._id);

            const firstImagePath = listing.imagePaths[0];
            const imageUrl = `https://fed-s10270642j-s10267318g-assignment2.onrender.com${firstImagePath}`;

            itemCard.innerHTML = `
                <img src="${imageUrl}" alt="${listing.partName}" class="item-image">
                <div class="item-card-content">
                    <h3>${listing.partName}</h3>
                    <p class="price">$${listing.price}</p>
                    <p class="likes">${listing.likes} likes</p>
                </div>
            `;
            accountListingsContainer.appendChild(itemCard);
        });

        document.getElementById('totalLikes').textContent = totalLikes;
    } catch (error) {
        console.error('Error fetching account information:', error);
    }
});