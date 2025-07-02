// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const apiKey = "luufh8wqKIaG70dg1UXKivzxmfUR8s7or1Mf0mQD";

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get references to the button and gallery
const getImagesBtn = document.querySelector('button');
const gallery = document.getElementById('gallery');

// ===== Random Space Fact Section =====
// Array of fun space facts
const spaceFacts = [
  "Did you know? A day on Venus is longer than its year!",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second!",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? One million Earths could fit inside the Sun.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? Space is completely silent.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? The Sun’s mass takes up 99.86% of the solar system.",
  "Did you know? The International Space Station travels at 28,000 km/h.",
  "Did you know? Jupiter has 95 known moons!"
];

// Pick a random fact
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Create and insert the fact section above the gallery
const factSection = document.createElement('div');
factSection.className = 'space-fact';
factSection.innerHTML = `<strong>🚀 Did You Know?</strong> <span>${randomFact}</span>`;
const container = document.querySelector('.container');
container.insertBefore(factSection, gallery);

// Modal elements (will be created later)
let modal = null;

// Listen for button click to fetch images
getImagesBtn.addEventListener('click', () => {
  // Get the selected dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🔄</div><p>Loading space photos…</p></div>`;

  // Fetch images from NASA's APOD API
  fetchImages(startDate, endDate);
});

// Function to fetch images from NASA's APOD API
function fetchImages(startDate, endDate) {
  // Use your API key from secrets.js
  // The API URL for a date range
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Filter out any items that are not images (e.g., videos)
      const images = data.filter(item => item.media_type === 'image');
      showGallery(images);
    })
    .catch(error => {
      gallery.innerHTML = `<div class="placeholder"><p>Sorry, something went wrong. Please try again!</p></div>`;
      console.error(error);
    });
}

// Function to display the gallery (updated to handle videos)
function showGallery(items) {
  if (items.length === 0) {
    gallery.innerHTML = `<div class="placeholder"><p>No images or videos found for this date range.</p></div>`;
    return;
  }

  // Create gallery items for both images and videos
  gallery.innerHTML = items.map((item, idx) => {
    if (item.media_type === 'image') {
      return `
        <div class="gallery-item" data-idx="${idx}">
          <img src="${item.url}" alt="${item.title}" />
          <p><strong>${item.title}</strong></p>
          <p>${item.date}</p>
        </div>
      `;
    } else if (item.media_type === 'video') {
      // For videos, show a thumbnail if available, otherwise a video icon, and a link
      let videoThumb = item.thumbnail_url || 'https://img.icons8.com/ios-filled/100/000000/youtube-play.png';
      return `
        <div class="gallery-item" data-idx="${idx}">
          <a href="${item.url}" target="_blank" class="video-link">
            <img src="${videoThumb}" alt="Video: ${item.title}" class="video-thumb" />
            <div class="video-badge">▶ Video</div>
          </a>
          <p><strong>${item.title}</strong></p>
          <p>${item.date}</p>
        </div>
      `;
    }
  }).join('');

  // Add click event to each gallery item to open modal (only for images)
  document.querySelectorAll('.gallery-item').forEach(itemDiv => {
    const idx = itemDiv.getAttribute('data-idx');
    if (items[idx].media_type === 'image') {
      itemDiv.addEventListener('click', (e) => {
        // Prevent modal if clicking a video link
        if (e.target.closest('a')) return;
        showModal(items[idx]);
      });
    }
  });
}

// Function to show modal with image or video details
function showModal(item) {
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.className = 'modal-overlay';
  let mediaContent = '';
  if (item.media_type === 'image') {
    mediaContent = `<img src="${item.hdurl || item.url}" alt="${item.title}" class="modal-img" />`;
  } else if (item.media_type === 'video') {
    // Embed YouTube or show link for other videos
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      // Extract YouTube video ID
      let videoId = item.url.split('v=')[1] || item.url.split('youtu.be/')[1];
      if (videoId && videoId.includes('&')) videoId = videoId.split('&')[0];
      mediaContent = `<div class="modal-video-wrap"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="modal-video"></iframe></div>`;
    } else {
      mediaContent = `<a href="${item.url}" target="_blank" class="modal-video-link">Watch Video</a>`;
    }
  }
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      ${mediaContent}
      <h2>${item.title}</h2>
      <p><em>${item.date}</em></p>
      <p>${item.explanation}</p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').onclick = closeModal;
  modal.onclick = function(e) {
    if (e.target === modal) closeModal();
  };
}

// Function to close modal
function closeModal() {
  if (modal) {
    modal.remove();
    modal = null;
  }
}
