/**
 * FILMKU - E-Ticket 3D Flip Animation
 */

let flipTimeout;
let flipAudio;

function initCardFlip() {
    const scene = document.querySelector('.eticket-scene');
    if (!scene) return;

    // Optional: Preload a whoosh sound for flip effect (Bonus)
    // Using a subtle public domain swoosh
    flipAudio = new Audio('https://www.myinstants.com/media/sounds/swoosh.mp3');
    flipAudio.volume = 0.3;

    // Click to toggle
    scene.addEventListener('click', toggleCardFlip);

    // Auto-flip reveal after 2.5s 
    // (Wait for text reveal and confetti to settle)
    flipTimeout = setTimeout(() => {
        if (!scene.classList.contains('flipped')) {
            toggleCardFlip();
        }
    }, 2800);
}

function toggleCardFlip() {
    const scene = document.querySelector('.eticket-scene');
    if (!scene) return;

    // Play sound if allowed
    try {
        flipAudio.currentTime = 0;
        flipAudio.play().catch(e => { /* Ignore autoplay block */ });
    } catch(e) {}

    // Add or remove flipped class
    scene.classList.toggle('flipped');

    // If user clicked manually early, cancel the auto-flip to avoid double flipping
    if (flipTimeout) {
        clearTimeout(flipTimeout);
        flipTimeout = null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCardFlip);
