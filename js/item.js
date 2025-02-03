document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    console.log('Item ID:', itemId); // Log the item ID

    if (itemId) {
        try {
            const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${itemId}`);
            const data = await response.json();
            console.log('Fetched data:', data); // Log the fetched data

            // Check if the fetched data is an array and access the first item
            const item = Array.isArray(data) ? data[0] : data;
            console.log('Item:', item); // Log the item

            // Check if the item has the expected properties
            if (item && item.partName && item.imagePath && item.price && item.category && item.condition && item.description && item.userId && item.likes !== undefined) {
                const itemDetailsContainer = document.getElementById('itemDetailsContainer');
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
            } else {
                console.error('Fetched item does not have the expected properties:', item);
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
        }
    } else {
        console.error('No item ID found in URL');
    }
});