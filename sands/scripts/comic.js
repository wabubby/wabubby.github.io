// scripts.js
function showModal(modalNumber) {
    // Hide all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');

    // Show the selected modal
    const selectedModal = document.getElementById(`modal${modalNumber}`);
    if (selectedModal) {
        selectedModal.style.display = 'flex';
    }
}

function closeModal() {
    // Hide all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

const hasVisited = localStorage.getItem('hasVisited');

if (!hasVisited) {
    // Initially show the first modal
    window.onload = () => {
        showModal(1);
    };
}

// first entry check
localStorage.setItem('hasVisited', true);