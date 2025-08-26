// This file contains p5.js canvas functions
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(random(255),random(255),random(255));
}

// Sidebar functionality and sound effects
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.webring-sidebar');
  const toggleButton = document.querySelector('.floating-toggle');
  
  if (toggleButton) {
    toggleButton.addEventListener('click', function() {
      if (sidebar.style.display === 'none') {
        sidebar.style.display = 'block';
        document.body.style.paddingLeft = '220px';
      } else {
        sidebar.style.display = 'none';
        document.body.style.paddingLeft = '20px';
      }
    });
  }

  // Sound effect for link clicks
  const clickSound = new Audio('click.mp3');
  
  // Add click sound to all links
  const allLinks = document.querySelectorAll('a, area');
  
  allLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Play the click sound
      clickSound.currentTime = 0; // Reset to start
      clickSound.play();
      
      // For external links, don't prevent default (let them open normally)
      const href = this.getAttribute('href');
      if (this.target === '_blank' || (href && (href.includes('://') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')))) {
        // External links will proceed normally after sound plays
        return;
      }
      
      // For internal links, prevent default and navigate after sound plays
      e.preventDefault();
      setTimeout(() => {
        window.location.href = this.href;
      }, 150);
    });
  });
});
