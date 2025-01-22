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
    const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}/like`, {
        method: 'POST'
    });
    const result = await response.json();
    if (result.success) {
        const likesElement = document.getElementById(`likes-${listingId}`);
        likesElement.textContent = result.likes;
    } else {
        alert('Failed to like the listing');
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

function addListedItem(container, listing) {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.innerHTML = `
        <img src="${listing.imagePath}" alt="${listing.partName}" class="item-image">
        <h3>${listing.partName}</h3>
        <p>Category: ${listing.category}</p>
        <p>Condition: ${listing.condition}</p>
        <p>Price: $${listing.price}</p>
        <p>${listing.description}</p>
        <p>Likes: <span id="likes-${listing._id}">${listing.likes}</span></p>
        <button onclick="likeListing('${listing._id}')">Like</button>
        <button onclick="unlikeListing('${listing._id}')">Unlike</button>
    `;
    container.appendChild(itemCard);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchForYouItems();
    fetchTrendingItems();
    fetchRecentReleaseItems();
});
