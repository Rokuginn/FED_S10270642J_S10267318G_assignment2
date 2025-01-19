const searchBtn = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');

searchBtn.addEventListener('click', () => {
    if (searchBar.style.width === '0px' || searchBar.style.width === '') {
        searchBar.style.width = '300px';
        searchInput.style.display = 'block';
        searchInput.focus();
    } else {
        searchBar.style.width = '0';
        searchInput.style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    if (!searchBtn.contains(e.target) && !searchBar.contains(e.target)) {
        searchBar.style.width = '0';
        searchInput.style.display = 'none';
    }
});