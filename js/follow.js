// Follow/Unfollow functionality
const followBtn = document.getElementById('followBtn');
const unfollowBtn = document.getElementById('unfollowBtn');

followBtn.addEventListener('click', async () => {
    const following = followBtn.getAttribute('data-username');
    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/follow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ follower: 'currentUser', following }) // Replace 'currentUser' with the actual logged-in user
    });

    const result = await response.json();
    if (result.success) {
        alert('Followed successfully!');
    } else {
        alert('Follow failed!');
    }
});

unfollowBtn.addEventListener('click', async () => {
    const following = unfollowBtn.getAttribute('data-username');
    const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/unfollow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ follower: 'currentUser', following }) // Replace 'currentUser' with the actual logged-in user
    });

    const result = await response.json();
    if (result.success) {
        alert('Unfollowed successfully!');
    } else {
        alert('Unfollow failed!');
    }
});