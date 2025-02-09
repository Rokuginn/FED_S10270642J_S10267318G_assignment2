const listingForm = document.getElementById('listingForm');
const listedItemsContainer = document.getElementById('listedItems');
const conditionButtons = document.querySelectorAll('.condition-btn');
const conditionInput = document.getElementById('condition');
const imageInput = document.getElementById('images');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewDefaultText = imagePreview.querySelector('.image-preview__default-text');
const uploadedFilesList = document.getElementById('uploadedFilesList');
let uploadedFiles = [];

const categoryMapping = {
    gpu: 'Graphics Processing Unit',
    cpu: 'Central Processing Unit',
    motherboard: 'Motherboard',
    ram: 'Random Access Memory',
    storage: 'Storage',
    psu: 'Power Supply Unit',
    case: 'Case'
};

conditionButtons.forEach(button => {
    button.addEventListener('click', () => {
        conditionButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        conditionInput.value = button.getAttribute('data-condition');
    });
});

imageInput.addEventListener('change', () => {
    const files = imageInput.files;
    if (files.length > 0 && uploadedFiles.length < 4) {
        // Clear default text when showing images
        imagePreviewDefaultText.style.display = 'none';
        
        // Add the new file
        const file = files[0];
        uploadedFiles.push(file);
        
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            // Create and show preview image
            const img = document.createElement('img');
            img.src = reader.result;
            img.classList.add('image-preview__image');
            img.style.display = 'block'; // Make sure the image is visible
            
            // Clear previous images in preview
            const previousImages = imagePreview.querySelectorAll('.image-preview__image');
            previousImages.forEach(prevImg => prevImg.remove());
            
            // Add new image to preview
            imagePreview.appendChild(img);

            // Add to uploaded files list
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${reader.result}" alt="Uploaded Image">
                <span>${file.name}</span>
                <button type="button" class="remove-image" onclick="removeImage(${uploadedFiles.length - 1})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            uploadedFilesList.appendChild(listItem);
        });

        reader.readAsDataURL(file);
    } else if (uploadedFiles.length >= 4) {
        alert('You can only upload up to 4 images.');
    }

    // Clear the input so the same file can be selected again if needed
    imageInput.value = '';
});

// Add function to remove images
function removeImage(index) {
    uploadedFiles.splice(index, 1);
    uploadedFilesList.innerHTML = '';
    
    // Rebuild the uploaded files list
    uploadedFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${reader.result}" alt="Uploaded Image">
                <span>${file.name}</span>
                <button type="button" class="remove-image" onclick="removeImage(${i})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            uploadedFilesList.appendChild(listItem);
        });
        reader.readAsDataURL(file);
    });

    // Update preview image
    if (uploadedFiles.length > 0) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const img = imagePreview.querySelector('.image-preview__image') || document.createElement('img');
            img.src = reader.result;
            img.classList.add('image-preview__image');
            img.style.display = 'block';
            if (!imagePreview.contains(img)) {
                imagePreview.appendChild(img);
            }
        });
        reader.readAsDataURL(uploadedFiles[0]);
    } else {
        // Show default text if no images
        imagePreview.querySelector('.image-preview__image')?.remove();
        imagePreviewDefaultText.style.display = 'block';
    }
}

// Make removeImage function globally available
window.removeImage = removeImage;

listingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
        alert('Please upload at least one image.');
        return;
    }

    const formData = new FormData(listingForm);
    const user = JSON.parse(localStorage.getItem('user')); // Get the logged-in user
    formData.append('userId', user._id); // Append userId to the form data

    uploadedFiles.forEach(file => {
        formData.append('images', file);
    });

    try {
        console.log('Submitting listing:', formData);
        const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing', {
            method: 'POST',
            body: formData
        });

        const responseText = await response.text(); // Get the raw response text
        console.log('Raw response:', responseText);

        const result = JSON.parse(responseText); // Parse the response text as JSON
        console.log('Listing submission result:', result);

        if (result.success) {
            alert('Listing submitted successfully!');
            listingForm.reset();
            uploadedFiles = [];
            uploadedFilesList.innerHTML = '';
            imagePreviewDefaultText.style.display = null;
            conditionButtons.forEach(btn => btn.classList.remove('selected'));
        } else {
            alert('Failed to submit listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting listing:', error);
        alert('Failed to submit listing: ' + error.message);
    }
});

function formatCondition(condition) {
    return condition
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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

function addListedItem(listing) {
    console.log('Adding listing:', listing);
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.setAttribute('data-id', listing._id); // Set the data-id attribute

    // Use the new getTimeAgo function
    const timeAgo = getTimeAgo(listing.date);

    // Use only the first image for the item card
    const firstImagePath = listing.imagePaths[0];
    const imageElement = `<img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${firstImagePath}" alt="${listing.partName}" class="item-image">`;

    // Get the full category name
    const fullCategoryName = categoryMapping[listing.category] || listing.category;

    itemCard.innerHTML = `
        <div class="listing-time">${timeAgo} ago</div>
        <div class="item-images">${imageElement}</div>
        <div class="item-card-content">
            <h3>${listing.partName}</h3>
            <p class="price">$${listing.price}</p>
            <p class="brand">Brand: ${listing.brand}</p> <!-- Display brand -->
            <p>Category: ${fullCategoryName}</p>
            <p>Condition: ${formatCondition(listing.condition)}</p>
            <button class="delete-btn" onclick="deleteListing('${listing._id}')">Delete</button>
        </div>
    `;
    listedItemsContainer.appendChild(itemCard);
}

async function deleteListing(listingId) {
    try {
        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            alert('Listing deleted successfully!');
            // Remove the item card from the DOM
            document.querySelector(`.item-card[data-id="${listingId}"]`).remove();
        } else {
            alert('Failed to delete listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing: ' + error.message);
    }
}

// Fetch and display existing listings on page load
async function fetchUserListings(userId) {
    const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${userId}`);
    const listings = await response.json();
    listings.forEach(listing => addListedItem(listing));
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        displayUserInfo(user.username); // Remove profilePicture parameter
        document.getElementById('logoutLink').textContent = 'Log out';
        document.getElementById('sellBtn').style.display = 'inline-block';
        fetchUserListings(user._id); // Fetch listings for the logged-in user
    }
});

// Function to display user information
function displayUserInfo(username) {
    const userInfo = document.getElementById('userInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');

    welcomeMessage.textContent = `Welcome, ${username}`;
    userInfo.style.display = 'flex';
}