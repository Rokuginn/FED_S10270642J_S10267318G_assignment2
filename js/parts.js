document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('parts-search');
    const categoryCards = document.querySelectorAll('.category-card');
    const partsGrid = document.getElementById('parts-grid');
    let allParts = [];
    let activeCategory = 'all';

    // Fetch all parts from your API
    async function fetchParts() {
        try {
            const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings');
            const data = await response.json();
            console.log('Fetched parts:', data); // Debug log
            allParts = data;
            updateCategoryCounts();
            filterAndDisplayParts();
        } catch (error) {
            console.error('Error fetching parts:', error);
        }
    }

    // Update updateCategoryCounts function
    function updateCategoryCounts() {
        const counts = {
            all: 0
        };
        
        allParts.forEach(part => {
            counts[part.category] = (counts[part.category] || 0) + 1;
            counts.all++; // Increment total count
        });

        console.log('Category counts:', counts);

        categoryCards.forEach(card => {
            const category = card.dataset.category;
            const countElement = card.querySelector('.category-count');
            countElement.textContent = counts[category] || 0;
        });
    }

    // Filter and display parts
    function filterAndDisplayParts() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredParts = allParts.filter(part => {
            const matchesSearch = part.partName.toLowerCase().includes(searchTerm) ||
                                part.brand.toLowerCase().includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || part.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        console.log('Filtered parts:', filteredParts); // Debug log
        displayParts(filteredParts);
    }

    // Update the displayParts function
    async function displayParts(parts) {
        if (parts.length === 0) {
            partsGrid.innerHTML = '<div class="no-results">No items found</div>';
            return;
        }

        partsGrid.innerHTML = await Promise.all(parts.map(async part => {
            // Debug log to check the date format
            console.log('Part created at:', part.createdAt);

            // Fetch user information
            const userResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${part.userId}`);
            const user = await userResponse.json();

            return `
                <div class="item-card">
                    <a href="item.html?id=${part._id}" class="item-card-link">
                        <div class="listing-time">${getTimeAgo(part.createdAt)} ago</div>
                        <img src="${part.imagePaths[0].startsWith('http') ? part.imagePaths[0] : 'https://fed-s10270642j-s10267318g-assignment2.onrender.com' + part.imagePaths[0]}" 
                             alt="${part.partName}" 
                             onerror="this.src='Images/placeholder.jpg'">
                        <div class="item-card-content">
                            <h3>${part.partName}</h3>
                            <div class="user-info">
                                <p class="user-name">Listed by: ${user.username}</p>
                            </div>
                            <p class="price">$${part.price}</p>
                            <p>Brand: ${part.brand}</p>
                            <p>Condition: ${formatCondition(part.condition)}</p>
                            <p class="likes">${part.likes || 0} likes</p>
                        </div>
                    </a>
                    <button class="like-btn ${part.isLiked ? 'liked' : ''}" data-id="${part._id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;
        })).then(results => results.join(''));

        // Add event listeners for like buttons
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const listingId = button.dataset.id;
                await toggleLike(listingId, button);
            });
        });
    }

    // Add the toggleLike function
    async function toggleLike(listingId, button) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            alert('Please log in to like items');
            return;
        }

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
                // Update like count
                const likesElement = button.parentElement.querySelector('.likes');
                likesElement.textContent = `${result.likes} likes`;
                // Toggle liked state
                button.classList.toggle('liked');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    // Add helper function for condition formatting
    function formatCondition(condition) {
        // Add case category formatting if needed
        if (condition === 'case') {
            return 'PC Case';
        }
        
        return condition
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Update the getTimeAgo function
    function getTimeAgo(dateString) {
        if (!dateString) return 'Just now';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Recently';
        }

        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffDays > 0) {
            return diffDays === 1 ? '1 day' : `${diffDays} days`;
        } else if (diffHours > 0) {
            return diffHours === 1 ? '1 hour' : `${diffHours} hours`;
        } else if (diffMinutes > 0) {
            return diffMinutes === 1 ? '1 minute' : `${diffMinutes} minutes`;
        } else {
            return 'Just now';
        }
    }

    // Event Listeners
    searchInput.addEventListener('input', filterAndDisplayParts);

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            activeCategory = card.dataset.category;
            filterAndDisplayParts();
        });
    });

    // Set "All" category as active by default
    const allCategoryCard = document.querySelector('[data-category="all"]');
    if (allCategoryCard) {
        allCategoryCard.classList.add('active');
    }

    // Initial load
    fetchParts();
});