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
    const listings = await fetchAllListings();
    const trendingItemsContainer = document.getElementById('trendingItems');
    const trendingItems = listings.sort((a, b) => b.likes - a.likes).slice(0, 5); // Assuming 'likes' is a property of listing
    trendingItems.forEach(listing => addListedItem(trendingItemsContainer, listing));
}

async function fetchRecentReleaseItems() {
    const listings = await fetchAllListings();
    const recentReleaseItemsContainer = document.getElementById('recentReleaseItems');
    const recentReleaseItems = listings.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // Assuming 'date' is a property of listing
    recentReleaseItems.forEach(listing => addListedItem(recentReleaseItemsContainer, listing));
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

    // Display Item Card
    const imageUrl = `https://fed-s10270642j-s10267318g-assignment2.onrender.com${listing.imagePath}`;
    itemCard.innerHTML = `
        <a href="item.html?id=${listing._id}" class="item-card-link">
            <div class="listing-time">${daysAgo} days ago</div>
            <img src="${imageUrl}" alt="${listing.partName}" class="item-image">
            <div class="item-card-content">
                <h3>${listing.partName}</h3>
                <div class="user-info">
                    <p class="user-name">Listed by: ${user.username}</p>
                </div>
                <p class="price">$${listing.price}</p>
                <p>Category: ${listing.category}</p>
                <p>Condition: ${formatCondition(listing.condition)}</p>
                <p class="likes">${listing.likes} likes</p>
                <button class="like-btn ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${listing._id}', this)"><i class="fas fa-heart"></i></button>
            </div>
        </a>
    `;
    container.appendChild(itemCard);
}

async function toggleLike(listingId, button) {
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
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        displayUserInfo(user.username, user.profilePicture);
        document.getElementById('logoutLink').textContent = 'Log out';
        document.getElementById('sellBtn').style.display = 'inline-block';
        fetchUserListings(user._id); // Fetch listings for the logged-in user
    }
});

// Function to display user information
function displayUserInfo(username, profilePicturePath) {
    const userInfo = document.getElementById('userInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const profilePicture = document.getElementById('profilePicture');

    welcomeMessage.textContent = `Welcome, ${username}`;
    profilePicture.src = profilePicturePath;

    userInfo.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchForYouItems();
    fetchTrendingItems();
    fetchRecentReleaseItems();
});
