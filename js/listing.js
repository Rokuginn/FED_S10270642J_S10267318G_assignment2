const listingForm = document.getElementById('listingForm');
const listedItemsContainer = document.getElementById('listedItems');
const conditionButtons = document.querySelectorAll('.condition-btn');
const conditionInput = document.getElementById('condition');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewImage = imagePreview.querySelector('.image-preview__image');
const imagePreviewDefaultText = imagePreview.querySelector('.image-preview__default-text');

conditionButtons.forEach(button => {
    button.addEventListener('click', () => {
        conditionButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        conditionInput.value = button.getAttribute('data-condition');
    });
});

imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();

        imagePreviewDefaultText.style.display = 'none';
        imagePreviewImage.style.display = 'block';

        reader.addEventListener('load', () => {
            imagePreviewImage.setAttribute('src', reader.result);
        });

        reader.readAsDataURL(file);
    } else {
        imagePreviewDefaultText.style.display = null;
        imagePreviewImage.style.display = null;
        imagePreviewImage.setAttribute('src', '');
    }
});

listingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(listingForm);
    const user = JSON.parse(localStorage.getItem('user')); // Get the logged-in user
    formData.append('userId', user._id); // Append userId to the form data

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
            addListedItem(result.listing);
            imagePreviewDefaultText.style.display = null;
            imagePreviewImage.style.display = null;
            imagePreviewImage.setAttribute('src', '');
            conditionButtons.forEach(btn => btn.classList.remove('selected'));
        } else {
            alert('Failed to submit listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting listing:', error);
        alert('Failed to submit listing: ' + error.message);
    }
});

function addListedItem(listing) {
    console.log('Adding listing:', listing);
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.innerHTML = `
        <img src="${listing.imagePath}" alt="${listing.partName}" class="item-image">
        <h3>${listing.partName}</h3>
        <p>Category: ${listing.category}</p>
        <p>Condition: ${listing.condition}</p>
        <p>Price: $${listing.price}</p>
        <p>${listing.description}</p>
    `;
    listedItemsContainer.appendChild(itemCard);
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
        document.getElementById('signUpBtn').textContent = 'Log out';
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