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

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    console.log('Item ID:', itemId); // Log the item ID

    // Function to format the condition string
    function formatCondition(condition) {
        return condition
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    if (itemId) {
        try {
            const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${itemId}`);
            console.log('Response status:', response.status); // Log the response status
            const responseText = await response.text();
            console.log('Raw response text:', responseText); // Log the raw response text

            const item = JSON.parse(responseText);
            console.log('Fetched item:', item); // Log the fetched item

            // Fetch user information
            const userResponse = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${item.userId}`);
            const user = await userResponse.json();
            console.log('Fetched user:', user); // Log the fetched user

            // Check if the item has the expected properties
            if (item && item.partName && item.imagePaths && item.price && item.category && item.condition && item.description && item.userId && item.likes !== undefined) {
                const itemDetailsContainer = document.getElementById('itemDetailsContainer');
                console.log('Updating HTML with item details'); // Log before updating HTML

                const isFollowing = currentUser ? user.followers.includes(currentUser._id) : false;

                // Create image elements for all images
                const imageElements = item.imagePaths.map(imagePath => `
                    <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${imagePath}" alt="${item.partName}">
                `).join('');

                // Get the full category name
                const fullCategoryName = getCategoryFullName(item.category);

                // Update the seller-info section in the HTML template
                itemDetailsContainer.innerHTML = `
                    <div class="item-image-container">
                        ${imageElements}
                    </div>
                    <div class="item-details">
                        <h1>${item.partName}</h1>
                        <p class="price">$${item.price}</p>
                        
                        <div class="item-info">
                            <p><i class="fas fa-tag"></i> Brand: ${item.brand}</p>
                            <p><i class="fas fa-boxes"></i> Category: ${fullCategoryName}</p>
                            <p><i class="fas fa-star"></i> Condition: ${formatCondition(item.condition)}</p>
                            <p><i class="fas fa-heart"></i> ${item.likes} likes</p>
                        </div>

                        <div class="seller-info">
                            <img src="${user.profilePicture || 'Images/avatar-default.svg'}" alt="${user.username}">
                            <div class="seller-details">
                                <a href="account.html?id=${user._id}" class="seller-username">
                                    <h3>${user.username}</h3>
                                </a>
                                <p>${user.followers.length} followers</p>
                            </div>
                        </div>

                        ${currentUser && currentUser._id !== user._id ? `
                            <div class="action-buttons">
                                <a href="#" class="chat-button" data-seller-id="${user._id}">
                                    <i class="fas fa-comment"></i> Chat with Seller
                                </a>
                                <i class="fas fa-heart like-icon ${item.likedBy?.includes(currentUser._id) ? 'liked' : ''}" data-id="${item._id}"></i>
                            </div>
                        ` : ''}
                    </div>
                `;

                const itemDescriptionContainer = document.getElementById('itemDescriptionContainer');
                itemDescriptionContainer.innerHTML = `
                    <h2>Description</h2>
                    <p>${item.description}</p>
                `;
                console.log('HTML updated successfully'); // Log after updating HTML

                // Add event listener to the "Chat with Seller" button
                document.querySelector('.chat-button').addEventListener('click', async (event) => {
                    event.preventDefault();
                    const sellerId = event.currentTarget.getAttribute('data-seller-id'); // Change target to currentTarget
                    const userId = JSON.parse(localStorage.getItem('user'))._id;
                    const itemId = params.get('id');

                    console.log('Creating chat room with:', { userId, sellerId, itemId }); // Debug log

                    if (!sellerId || !userId) {
                        console.error('Missing required IDs:', { sellerId, userId });
                        return;
                    }

                    try {
                        const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/checkOrCreate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                userId, 
                                sellerId,
                                itemId
                            })
                        });

                        const result = await response.json();
                        console.log('Chat room creation result:', result); // Debug log

                        if (result.success) {
                            window.location.href = `chat.html?chatRoomId=${result.chatRoomId}&itemId=${itemId}&sellerId=${sellerId}`;
                        } else {
                            alert('Failed to create or find chat room: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Error creating or finding chat room:', error);
                        alert('Failed to create or find chat room: ' + error.message);
                    }
                });

                // Add event listeners for like and follow buttons
                const likeIcon = document.querySelector('.like-icon');
                const followButton = document.querySelector('.follow-button');

                // Update the like event listener
                likeIcon.addEventListener('click', async () => {
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    if (!currentUser) {
                        alert('Please log in to like items');
                        return;
                    }

                    try {
                        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${itemId}/like`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ userId: currentUser._id })
                        });

                        const result = await response.json();
                        if (result.success) {
                            likeIcon.classList.toggle('liked');
                            // Update the likes count in the item info
                            const likesText = document.querySelector('.item-info p:last-child');
                            likesText.innerHTML = `<i class="fas fa-heart"></i> ${result.likes} likes`;
                            
                            // Update liked state
                            if (result.likedBy?.includes(currentUser._id)) {
                                likeIcon.classList.add('liked');
                            } else {
                                likeIcon.classList.remove('liked');
                            }
                        }
                    } catch (error) {
                        console.error('Error toggling like:', error);
                    }
                });

                // Remove the entire follow button event listener section
                // Delete or comment out this block:
                /*
                followButton.addEventListener('click', async () => {
                    // ... entire follow button click handler code ...
                });
                */
            } else {
                console.error('Fetched item does not have the expected properties:', item);
                const itemDetailsContainer = document.getElementById('itemDetailsContainer');
                itemDetailsContainer.innerHTML = '<p>Item details are incomplete or missing.</p>';
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            const itemDetailsContainer = document.getElementById('itemDetailsContainer');
            itemDetailsContainer.innerHTML = '<p>Error fetching item details.</p>';
        }
    } else {
        console.error('No item ID found in URL');
        const itemDetailsContainer = document.getElementById('itemDetailsContainer');
        itemDetailsContainer.innerHTML = '<p>No item ID found in URL.</p>';
    }
});