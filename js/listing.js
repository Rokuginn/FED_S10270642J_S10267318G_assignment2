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
    const file = imageInput.files[0];
    if (file && uploadedFiles.length < 4) {
        uploadedFiles.push(file);
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            const img = document.createElement('img');
            img.src = reader.result;
            img.classList.add('image-preview__image');
            imagePreview.appendChild(img);

            const listItem = document.createElement('li');
            listItem.innerHTML = `<img src="${reader.result}" alt="Uploaded Image"> ${file.name}`;
            uploadedFilesList.appendChild(listItem);
        });

        reader.readAsDataURL(file);
    } else {
        alert('You can only upload up to 4 images.');
    }

    imageInput.value = ''; // Clear the input so the same file can be selected again if needed
});

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

function addListedItem(listing) {
    console.log('Adding listing:', listing);
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.setAttribute('data-id', listing._id); // Set the data-id attribute

    // Calculate how long ago the listing was created
    const listingDate = new Date(listing.date);
    const now = new Date();
    const timeDiff = Math.abs(now - listingDate);
    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Use only the first image for the item card
    const firstImagePath = listing.imagePaths[0];
    const imageElement = `<img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${firstImagePath}" alt="${listing.partName}" class="item-image">`;

    // Get the full category name
    const fullCategoryName = categoryMapping[listing.category] || listing.category;

    itemCard.innerHTML = `
        <div class="listing-time">${daysAgo} days ago</div>
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