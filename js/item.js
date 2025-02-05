document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
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
            if (item && item.partName && item.imagePath && item.price && item.category && item.condition && item.description && item.userId && item.likes !== undefined) {
                const itemDetailsContainer = document.getElementById('itemDetailsContainer');
                console.log('Updating HTML with item details'); // Log before updating HTML
                itemDetailsContainer.innerHTML = `
                    <div class="item-image-container">
                        <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${item.imagePath}" alt="${item.partName}">
                    </div>
                    <div class="item-details">
                        <h1>${item.partName}</h1>
                        <p class="price">$${item.price}</p>
                        <p class="brand">Brand: ${item.brand}</p> <!-- Display brand -->
                        <p class="category">Category: ${item.category}</p>
                        <p class="condition">Condition: ${formatCondition(item.condition)}</p>
                        <p class="listed-by">Listed by: ${user.username}</p>
                        <p class="likes">${item.likes} likes</p>
                    </div>
                    <div class="user-info-container">
                        <h2>${user.username}</h2>
                        <p>Followers: ${user.followers}</p>
                        <a href="#" class="chat-button">Chat with Seller</a>
                        <div class="make-offer">
                            <h2>Make an Offer</h2>
                            <input type="number" placeholder="Enter your offer price">
                            <button>Submit Offer</button>
                        </div>
                    </div>
                `;
                const itemDescriptionContainer = document.getElementById('itemDescriptionContainer');
                itemDescriptionContainer.innerHTML = `
                    <h2>Description</h2>
                    <p>${item.description}</p>
                `;
                console.log('HTML updated successfully'); // Log after updating HTML
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