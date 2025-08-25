// This file contains p5.js canvas functions
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(random(255),random(255),random(255));
}

// Sidebar functionality
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
});
