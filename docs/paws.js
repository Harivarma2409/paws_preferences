const cardContainer = document.getElementById('cat-card-container');
const summarySection = document.getElementById('summary');
const likeCount = document.getElementById('like-count');
const likedGallery = document.getElementById('liked-cats');
const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');

let currentIndex = 0;
let cats = [];
let likedCats = [];
  
async function fetchUniqueCats(count = 15) {
    const fetchPromises = Array.from({ length: count }, async () => {
      const res = await fetch('https://cataas.com/cat?json=true');
      const data = await res.json();
      return `https://cataas.com/cat/${data.id}`;
    });
  
    cats = await Promise.all(fetchPromises);
  
    // ✅ Preload all cat images to speed up display
    cats.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  
    showNextCat(); // Show the first cat after all are preloaded
  }
  

function showNextCat() {
  cardContainer.innerHTML = '';

  if (currentIndex >= cats.length) {
    showSummary();
    return;
  }

  const card = document.createElement('div');
  card.className = 'cat-card';

  const img = document.createElement('img');
  img.src = cats[currentIndex];
  img.alt = 'Cute cat';

  card.appendChild(img);
  cardContainer.appendChild(card);

  addTouchHandlers(card);
}

function likeCurrentCat() {
    const likedUrl = cats[currentIndex];
    likedCats.push(likedUrl);
  
    // Preload the liked image immediately
    const preloadImg = new Image();
    preloadImg.src = likedUrl;
  
    currentIndex++;
    showNextCat();
  }  

function skipCurrentCat() {
  currentIndex++;
  showNextCat();
}

function addTouchHandlers(card) {
  let startX = 0;
  let isDragging = false;

  card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  card.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
  });

  card.addEventListener('touchend', (e) => {
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    handleSwipe(diffX, card);
  });
}

function handleSwipe(diffX, card) {
  if (diffX > 80) {
    likeCurrentCat();
  } else if (diffX < -80) {
    skipCurrentCat();
  } else {
    card.style.transform = '';
  }
}

// Button Clicks
likeBtn.addEventListener('click', likeCurrentCat);
dislikeBtn.addEventListener('click', skipCurrentCat);

function showSummary() {
    // Hide card + buttons
    cardContainer.style.display = 'none';
    likeBtn.style.display = 'none';
    dislikeBtn.style.display = 'none';
  
    // Show loader first
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
  
    // Delay 2 seconds before showing summary
    setTimeout(() => {
      loader.classList.add('hidden');
      summarySection.classList.remove('hidden');
      likeCount.textContent = likedCats.length;
  
      likedGallery.innerHTML = ''; // Just in case reload
      likedCats.forEach(catUrl => {
        const img = document.createElement('img');
        img.src = catUrl;
        img.alt = 'Liked cat';
        likedGallery.appendChild(img);
      });
    }, 2000);
  }
  

// Initialize
fetchUniqueCats();
