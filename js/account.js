document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        displayUserInfo(user);
        fetchUserListings(user._id);
    }

    const uploadProfilePictureBtn = document.getElementById('uploadProfilePictureBtn');
    uploadProfilePictureBtn.addEventListener('click', uploadProfilePicture);

    const uploadProfilePictureInput = document.getElementById('uploadProfilePicture');
    uploadProfilePictureInput.addEventListener('change', previewProfilePicture);

    const updateDealMethodBtn = document.getElementById('updateDealMethodBtn');
    updateDealMethodBtn.addEventListener('click', updateDealMethod);
});

function displayUserInfo(user) {
    const accountUsername = document.getElementById('accountUsername');
    const accountEmail = document.getElementById('accountEmail');
    const accountDealMethod = document.getElementById('accountDealMethod');
    const accountProfilePicture = document.getElementById('accountProfilePicture');
    const navbarProfilePicture = document.getElementById('profilePicture');

    accountUsername.textContent = user.username;
    accountEmail.textContent = user.email;
    accountDealMethod.textContent = user.dealMethod || 'Not specified';
    accountProfilePicture.src = user.profilePicture || 'path/to/default-profile-picture.jpg';
    navbarProfilePicture.src = user.profilePicture || 'path/to/default-profile-picture.jpg';
}

function previewProfilePicture() {
    const uploadProfilePictureInput = document.getElementById('uploadProfilePicture');
    const file = uploadProfilePictureInput.files[0];
    const profileImagePreview = document.getElementById('profileImagePreview');
    const profileImagePreviewImage = profileImagePreview.querySelector('.image-preview__image');
    const profileImagePreviewDefaultText = profileImagePreview.querySelector('.image-preview__default-text');

    if (file) {
        const reader = new FileReader();
        profileImagePreviewDefaultText.style.display = 'none';
        profileImagePreviewImage.style.display = 'block';

        reader.addEventListener('load', () => {
            profileImagePreviewImage.setAttribute('src', reader.result);
        });

        reader.readAsDataURL(file);
    } else {
        profileImagePreviewDefaultText.style.display = null;
        profileImagePreviewImage.style.display = null;
        profileImagePreviewImage.setAttribute('src', '');
    }
}

async function fetchUserListings(userId) {
    const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${userId}`);
    const listings = await response.json();
    const userListingsContainer = document.getElementById('userListings');
    listings.forEach(listing => addListedItem(userListingsContainer, listing));
}

function addListedItem(container, listing) {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    itemCard.setAttribute('data-id', listing._id);

    const imageElements = listing.imagePaths.map(imagePath => `<img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${imagePath}" alt="${listing.partName}" class="item-image">`).join('');

    itemCard.innerHTML = `
        <div class="item-images">${imageElements}</div>
        <div class="item-card-content">
            <h3>${listing.partName}</h3>
            <p class="brand">Brand: ${listing.brand}</p>
            <p class="price">$${listing.price}</p>
            <p>Category: ${listing.category}</p>
            <p>Condition: ${formatCondition(listing.condition)}</p>
            <button class="delete-btn" onclick="deleteListing('${listing._id}')">Delete</button>
        </div>
    `;
    container.appendChild(itemCard);
}

async function uploadProfilePicture() {
    const uploadProfilePictureInput = document.getElementById('uploadProfilePicture');
    const file = uploadProfilePictureInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('newProfilePicture', file);
    const user = JSON.parse(localStorage.getItem('user'));
    formData.append('userId', user._id);

    try {
        const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/updateProfilePicture', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert('Profile picture updated successfully!');
            document.getElementById('accountProfilePicture').src = result.profilePicture;
            document.getElementById('profilePicture').src = result.profilePicture;
            user.profilePicture = result.profilePicture;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            alert('Failed to update profile picture: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Failed to update profile picture: ' + error.message);
    }
}

async function updateDealMethod() {
    const dealMethodInput = document.getElementById('dealMethod');
    const dealMethod = dealMethodInput.value.trim();
    if (!dealMethod) {
        alert('Please enter a deal method.');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${user._id}/dealMethod`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dealMethod })
        });

        const result = await response.json();
        if (result.success) {
            alert('Deal method updated successfully!');
            document.getElementById('accountDealMethod').textContent = dealMethod;
            user.dealMethod = dealMethod;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            alert('Failed to update deal method: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating deal method:', error);
        alert('Failed to update deal method: ' + error.message);
    }
}

function formatCondition(condition) {
    return condition
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function deleteListing(listingId) {
    try {
        const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listings/${listingId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            alert('Listing deleted successfully!');
            document.querySelector(`.item-card[data-id="${listingId}"]`).remove();
        } else {
            alert('Failed to delete listing: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing: ' + error.message);
    }
}