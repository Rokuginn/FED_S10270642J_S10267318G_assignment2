document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize following array if it doesn't exist
    if (!currentUser.following) {
        currentUser.following = [];
    }

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id') || currentUser._id;

    // Add validation for userId
    if (!userId) {
        console.error('No user ID available');
        return;
    }

    try {
        // Fetch user data
        const userResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${userId}`);
        if (!userResponse.ok) {
            throw new Error(`HTTP error! status: ${userResponse.status}`);
        }
        const userData = await userResponse.json();

        // Validate user data
        if (!userData || !userData._id) {
            console.error('Invalid user data received');
            return;
        }

        // Update profile information
        document.getElementById('username').textContent = userData.username || 'Unknown User';
        document.getElementById('description').textContent = userData.description || 'No description provided.';
        document.getElementById('dealMethod').textContent = userData.dealMethod || 'Online';
        document.getElementById('location').textContent = userData.location || 'Not specified';
        document.getElementById('followersCount').textContent = userData.followers?.length || 0;
        document.getElementById('followingCount').textContent = userData.following?.length || 0;

        // Check if viewing own profile
        const isOwnProfile = userId === currentUser._id;

        if (isOwnProfile) {
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
                        document.getElementById('dealMethod').textContent = dealMethod;
                        document.getElementById('location').textContent = location; // Update location display
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
            // Hide settings controls
            document.getElementById('descriptionInput').style.display = 'none';
            document.getElementById('dealMethodInput').style.display = 'none';
            document.getElementById('locationInput').style.display = 'none';
            document.getElementById('saveBtn').style.display = 'none';
            document.getElementById('settingsBtn').style.display = 'none';

            const followBtn = document.getElementById('followBtn');
            const unfollowBtn = document.getElementById('unfollowBtn');

            // Check if current user is following this profile using userData.followers
            const isFollowing = Array.isArray(userData.followers) && 
                userData.followers.some(followerId => followerId === currentUser._id);

            // Update button visibility based on follow state
            followBtn.style.display = isFollowing ? 'none' : 'block';
            unfollowBtn.style.display = isFollowing ? 'block' : 'none';

            // Update the follow button event listener
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
                        // Update button visibility
                        followBtn.style.display = 'none';
                        unfollowBtn.style.display = 'block';
                        // Update followers count
                        const currentCount = parseInt(document.getElementById('followersCount').textContent);
                        document.getElementById('followersCount').textContent = currentCount + 1;
                    } else {
                        // If already following, update UI to show unfollow button
                        if (result.message === 'Already following') {
                            followBtn.style.display = 'none';
                            unfollowBtn.style.display = 'block';
                        } else {
                            alert(result.message);
                        }
                    }
                } catch (error) {
                    console.error('Error following user:', error);
                }
            });

            // Update the unfollow button event listener
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
                        // Update button visibility
                        followBtn.style.display = 'block';
                        unfollowBtn.style.display = 'none';
                        // Update followers count
                        const currentCount = parseInt(document.getElementById('followersCount').textContent);
                        document.getElementById('followersCount').textContent = currentCount - 1;
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error unfollowing user:', error);
                }
            });
        }

        // Fetch listings
        const listingsResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${userId}`);
        const listings = await listingsResponse.json();

        // Update listings display
        let totalLikes = 0;
        const accountListingsContainer = document.getElementById('accountListings');
        accountListingsContainer.innerHTML = ''; // Clear existing content

        listings.forEach(listing => {
            totalLikes += listing.likes || 0;
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.setAttribute('data-id', listing._id);

            const firstImagePath = listing.imagePaths[0];
            const imageUrl = `https://fed-s10270642j-s10267318g-assignment2.onrender.com${firstImagePath}`;

            itemCard.innerHTML = `
                <a href="item.html?id=${listing._id}" class="item-card-link">
                    <div class="listing-time">${getTimeAgo(listing.date)} ago</div>
                    <img src="${imageUrl}" alt="${listing.partName}" class="item-image">
                    <div class="item-card-content">
                        <h3>${listing.partName}</h3>
                        <p class="price">$${listing.price}</p>
                        <p>Brand: ${listing.brand}</p>
                        <p>Category: ${getCategoryFullName(listing.category)}</p>
                        <p>Condition: ${formatCondition(listing.condition)}</p>
                        <p class="likes">${listing.likes || 0} likes</p>
                    </div>
                </a>
                ${userId === currentUser._id ? 
                    `<button class="delete-btn" onclick="deleteListing('${listing._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>` : ''
                }
            `;
            accountListingsContainer.appendChild(itemCard);
        });

        // Update total likes
        document.getElementById('totalLikes').textContent = totalLikes;

    } catch (error) {
        console.error('Error fetching account information:', error);
        // Add user-friendly error message
        document.getElementById('username').textContent = 'Error loading profile';
        document.getElementById('description').textContent = 'Could not load user information';
    }
});

// Helper functions
function getTimeAgo(dateString) {
    if (!dateString) return '0 hours';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '0 hours';
    }

    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Add debug logging
    console.log('Date comparison:', {
        now: now.toISOString(),
        listingDate: date.toISOString(),
        diffTime,
        diffDays,
        diffHours
    });

    if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    }
}

function formatCondition(condition) {
    if (!condition) return 'Not specified';
    return condition
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getCategoryFullName(category) {
    const categoryMapping = {
        gpu: 'Graphics Card',
        cpu: 'Processor',
        motherboard: 'Motherboard',
        ram: 'RAM',
        storage: 'Storage',
        psu: 'Power Supply',
        case: 'Case'
    };
    return categoryMapping[category] || category;
}

// Delete listing function
async function deleteListing(listingId) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.success) {
            document.querySelector(`.item-card[data-id="${listingId}"]`).remove();
            alert('Listing deleted successfully!');
        } else {
            alert('Failed to delete listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing: ' + error.message);
    }
}