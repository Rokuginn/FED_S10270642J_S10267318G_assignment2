// Hero Slider functionality
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelector('.slide-dots');
const prevBtn = document.querySelector('.prev-slide');
const nextBtn = document.querySelector('.next-slide');
let currentSlide = 0;

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dots.appendChild(dot);
});

// Show first slide
slides[0].classList.add('active');

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    document.querySelectorAll('.dot')[currentSlide].classList.remove('active');
    
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.dot')[currentSlide].classList.add('active');
}

// Navigation
prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// Auto advance
let autoAdvance = setInterval(() => goToSlide(currentSlide + 1), 5000);

// Filtering functionality
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        filterSlides(category);
    });
});

function filterSlides(category) {
    clearInterval(autoAdvance); // Stop auto-advance when filtering
    let filteredSlides = 0;
    slides.forEach((slide, index) => {
        const slideCategory = slide.getAttribute('data-category');
        if (slideCategory === category) {
            slide.style.display = 'flex';
            if (filteredSlides === 0) {
                goToSlide(index);
            }
            filteredSlides++;
        } else {
            slide.style.display = 'none';
        }
    });
    if (filteredSlides === 0) {
        // If no slides match the filter, show a message or handle accordingly
        console.log('No slides match the selected category.');
    } else {
        autoAdvance = setInterval(() => goToSlide(currentSlide + 1), 5000); // Restart auto-advance
    }
}
