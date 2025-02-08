// Define the category mapping
const categoryMapping = {
    gpu: 'Graphics Processing Unit',
    cpu: 'Central Processing Unit',
    motherboard: 'Motherboard',
    ram: 'Random Access Memory',
    storage: 'Storage',
    psu: 'Power Supply Unit',
    case: 'Case'
};

function getCategoryFullName(category) {
    return categoryMapping[category] || category;
}

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
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    // Add debug logging
    console.log('Date comparison:', {
        now: now.toISOString(),
        listingDate: date.toISOString(),
        diffTime,
        diffDays,
        diffHours,
        diffMinutes
    });

    if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
    } else {
        return 'Just now';
    }
}

// Hero Slider functionality
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelector('.slide-dots');
const prevBtn = document.querySelector('.prev-slide');
const nextBtn = document.querySelector('.next-slide');
let currentSlide = 0;

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dots.appendChild(dot);
});

// Show first slide
slides[0].classList.add('active');

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    document.querySelectorAll('.dot')[currentSlide].classList.remove('active');
    
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.dot')[currentSlide].classList.add('active');
}

// Navigation
prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// Auto advance
let autoAdvance = setInterval(() => goToSlide(currentSlide + 1), 5000);

async function fetchAllListings() {
    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings');
    const listings = await response.json();
    return listings;
}

async function fetchForYouItems() {
    const listings = await fetchAllListings();
    const forYouItemsContainer = document.getElementById('forYouItems');
    listings.forEach(listing => addListedItem(forYouItemsContainer, listing));
}

async function fetchTrendingItems() {
    try {
        const listings = await fetchAllListings();
        const trendingItemsContainer = document.getElementById('trendingItems');
        
        // Sort by likes in descending order and take top 6
        const trendingItems = listings
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 6);
        
        console.log('Trending items:', trendingItems); // Debug log
        trendingItemsContainer.innerHTML = ''; // Clear container
        for (const listing of trendingItems) {
            await addListedItem(trendingItemsContainer, listing);
        }
    } catch (error) {
        console.error('Error fetching trending items:', error);
    }
}

async function fetchRecentReleaseItems() {
    try {
        const listings = await fetchAllListings();
        const recentReleaseItemsContainer = document.getElementById('recentReleaseItems');
        
        // Sort by date in descending order and take top 6
        const recentReleaseItems = listings
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6);
        
        console.log('Recent items:', recentReleaseItems); // Debug log
        recentReleaseItemsContainer.innerHTML = ''; // Clear container
        for (const listing of recentReleaseItems) {
            await addListedItem(recentReleaseItemsContainer, listing);
        }
    } catch (error) {
        console.error('Error fetching recent items:', error);
    }
}

async function likeListing(listingId) {
    try {
        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}/like`, {
            method: 'POST'
        });
        const result = await response.json();
        if (result.success) {
            const likesElement = document.querySelector(`.item-card[data-id="${listingId}"] .likes`);
            likesElement.textContent = `${result.likes} likes`;
        } else {
            alert('Failed to like listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error liking listing:', error);
        alert('Failed to like listing: ' + error.message);
    }
}

async function unlikeListing(listingId) {
    const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}/unlike`, {
        method: 'POST'
    });
    const result = await response.json();
    if (result.success) {
        const likesElement = document.getElementById(`likes-${listingId}`);
        likesElement.textContent = result.likes;
    } else {
        alert('Failed to unlike the listing');
    }
}

function formatCondition(condition) {
    return condition
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function addListedItem(container, listing) {
    console.log('Adding listing:', listing);
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.setAttribute('data-id', listing._id); // Set the data-id attribute

    // Calculate how long ago the listing was created
    const listingDate = new Date(listing.date);
    const now = new Date();
    const timeDiff = Math.abs(now - listingDate);
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Fetch user information
    const userResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${listing.userId}`);
    const user = await userResponse.json();

    // Check if the current user has liked the listing
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const hasLiked = listing.likedBy.includes(currentUser._id);

    // Use only the first image for the item card
    const firstImagePath = listing.imagePaths[0];
    const imageUrl = `https://fed-s10270642j-s10267318g-assignment2.onrender.com${firstImagePath}`;

    // Get the full category name
    const fullCategoryName = getCategoryFullName(listing.category);

    // Display Item Card
    itemCard.innerHTML = `
        <a href="item.html?id=${listing._id}" class="item-card-link">
            <div class="listing-time">${getTimeAgo(listing.date)} ago</div>
            <img src="${imageUrl}" alt="${listing.partName}" class="item-image">
            <div class="item-card-content">
                <h3>${listing.partName}</h3>
                <div class="user-info">
                    <p class="user-name">Listed by: ${user.username}</p>
                </div>
                <p class="price">$${listing.price}</p>
                <p>Category: ${fullCategoryName}</p>
                <p>Condition: ${formatCondition(listing.condition)}</p>
                <p class="likes">${listing.likes} likes</p>
                <button class="like-btn ${hasLiked ? 'liked' : ''}"><i class="fas fa-heart"></i></button>
            </div>
        </a>
    `;
    container.appendChild(itemCard);

    // Add event listener to the like button to prevent redirection
    const likeButton = itemCard.querySelector('.like-btn');
    likeButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default action of the anchor tag
        event.stopPropagation(); // Stop the event from propagating to the parent elements
        toggleLike(listing._id, likeButton, event);
    });
}

async function toggleLike(listingId, button, event) {
    event.stopPropagation(); // Stop the event from propagating to the parent elements
    const currentUser = JSON.parse(localStorage.getItem('user'));
    try {
        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser._id })
        });
        const result = await response.json();
        if (result.success) {
            // Update like counts for all elements with the same listing ID
            const likesElements = document.querySelectorAll(`.item-card[data-id="${listingId}"] .likes`);
            likesElements.forEach(likesElement => {
                likesElement.textContent = `${result.likes} likes`;
            });

            // Toggle the like button class for all elements with the same listing ID
            const likeButtons = document.querySelectorAll(`.item-card[data-id="${listingId}"] .like-btn`);
            likeButtons.forEach(likeButton => {
                likeButton.classList.toggle('liked');
            });
        } else {
            alert('Failed to like/unlike listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error liking/unliking listing:', error);
        alert('Failed to like/unlike listing: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchForYouItems();
    fetchTrendingItems();
    fetchRecentReleaseItems();
});
