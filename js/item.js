document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    console.log('Item ID:', itemId); // Log the item ID

    if (itemId) {
        try {
            const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${itemId}`);
            console.log('Response status:', response.status); // Log the response status
            const responseText = await response.text();
            console.log('Raw response text:', responseText); // Log the raw response text

            const item = JSON.parse(responseText);
            console.log('Fetched item:', item); // Log the fetched item

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
                        <p class="category">Category: ${item.category}</p>
                        <p class="condition">Condition: ${item.condition}</p>
                        <p class="description">${item.description}</p>
                        <p class="listed-by">Listed by: ${item.userId}</p>
                        <p class="likes">${item.likes} likes</p>
                    </div>
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