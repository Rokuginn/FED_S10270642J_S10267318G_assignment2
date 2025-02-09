document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const followingItems = document.getElementById('followingItems');
    const likedItems = document.getElementById('likedItems');

    async function fetchFollowingListings() {
        try {
            // First, get the current user's following list
            const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${currentUser._id}`);
            const userData = await response.json();
            
            // Debug log - check if we have following data
            console.log('Current user data:', userData);
            
            if (!userData.following || userData.following.length === 0) {
                followingItems.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Follow other users to see their listings here</p>
                    </div>`;
                return;
            }

            // Get all listings
            const listings = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings');
            const allListings = await listings.json();
            
            // Debug log - check all listings
            console.log('All listings:', allListings);

            // Get current time and 24 hours ago
            const now = new Date();
            const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

            // Filter listings
            const followingListings = allListings.filter(listing => {
                // Debug log - check each listing being filtered
                console.log('Checking listing:', {
                    listingId: listing._id,
                    userId: listing.userId,
                    date: listing.date,
                    isFollowed: userData.following.includes(listing.userId),
                    isRecent: new Date(listing.date) >= twentyFourHoursAgo
                });

                const listingDate = new Date(listing.date);
                // Check if the listing's userId is in the following array
                const isFollowed = userData.following.some(followedUser => 
                    followedUser._id === listing.userId || followedUser === listing.userId
                );
                const isRecent = listingDate >= twentyFourHoursAgo;

                return isFollowed && isRecent;
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            // Debug log - check filtered listings
            console.log('Filtered listings:', followingListings);

            if (followingListings.length === 0) {
                followingItems.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <p>No new listings from your following in the last 24 hours</p>
                    </div>`;
                return;
            }

            displayListings(followingListings, followingItems, false);

        } catch (error) {
            console.error('Error fetching following listings:', error);
            followingItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading recent listings</p>
                </div>`;
        }
    }

    async function fetchLikedListings() {
        try {
            const listings = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings');
            const allListings = await listings.json();
            
            const likedListings = allListings.filter(listing => 
                listing.likedBy && listing.likedBy.includes(currentUser._id)
            );

            if (likedListings.length === 0) {
                likedItems.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <p>No liked items yet</p>
                    </div>`;
                return;
            }

            displayListings(likedListings, likedItems, true);
        } catch (error) {
            console.error('Error fetching liked listings:', error);
        }
    }

    function displayListings(listings, container, isLikedSection = false) {
        container.innerHTML = '';
        // Sort listings by date in descending order
        const sortedListings = [...listings].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedListings.forEach(async listing => {
            const user = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${listing.userId}`).then(res => res.json());
            
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.innerHTML = `
                <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${listing.imagePaths[0]}" 
                     alt="${listing.partName}" 
                     class="item-image">
                <div class="item-details">
                    <div class="item-header">
                        <h3>${listing.partName}</h3>
                        ${isLikedSection ? `
                            <button class="unlike-btn" data-id="${listing._id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        ` : ''}
                    </div>
                    <p>Listed by: ${user.username}</p>
                    <p class="price">$${listing.price}</p>
                    <p>${listing.likes || 0} likes</p>
                    <p class="timestamp">${getTimeAgo(listing.date)} ago</p>
                </div>
            `;

            // Add click event for the card
            itemCard.addEventListener('click', (e) => {
                // If clicking the unlike button, don't navigate
                if (e.target.closest('.unlike-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                window.location.href = `item.html?id=${listing._id}`;
            });

            // Add unlike functionality if in liked section
            if (isLikedSection) {
                const unlikeBtn = itemCard.querySelector('.unlike-btn');
                unlikeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listing._id}/like`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ userId: currentUser._id })
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            // Remove the item card with animation
                            itemCard.style.opacity = '0';
                            itemCard.style.transform = 'translateX(20px)';
                            setTimeout(() => {
                                itemCard.remove();
                                // If no more items, show empty state
                                if (container.children.length === 0) {
                                    container.innerHTML = `
                                        <div class="empty-state">
                                            <i class="fas fa-heart"></i>
                                            <p>No liked items yet</p>
                                        </div>`;
                                }
                            }, 300);
                        }
                    } catch (error) {
                        console.error('Error unliking item:', error);
                        alert('Failed to unlike item. Please try again.');
                    }
                });
            }

            container.appendChild(itemCard);
        });
    }

    function getTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diff = now - past;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
    }

    // Initial load
    fetchFollowingListings();
    fetchLikedListings();
});