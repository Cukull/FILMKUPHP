// FILMKU - Success Transition Animations

// Option C: Zoom + Fade (Premium)
function transitionToSuccess(targetUrl) {
    const body = document.body;
    
    // Create overlay for fade out
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0a0a0f';
    overlay.style.zIndex = '10000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.6s ease-in-out';
    
    // Wrap body contents to scale them
    const wrap = document.createElement('div');
    while (body.firstChild) {
        wrap.appendChild(body.firstChild);
    }
    body.appendChild(wrap);
    body.appendChild(overlay);
    
    wrap.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease';
    wrap.style.transformOrigin = 'center center';
    
    // Trigger animations
    requestAnimationFrame(() => {
        wrap.style.transform = 'scale(0.92)';
        wrap.style.opacity = '0';
        overlay.style.opacity = '1';
    });
    
    // Wait for exit animation to finish before redirecting
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 800);
}

// Entry Animation for sukses.php
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('sukses.php')) {
        // Initial state
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.95)';
        document.body.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease';
        document.body.style.transformOrigin = 'center top';
        
        // Trigger entry animation
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
            document.body.style.transform = 'scale(1)';
        });
        
        // Bonus: Confetti
        const confettiScript = document.createElement('script');
        confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        confettiScript.onload = () => {
            setTimeout(() => {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#ff4444', '#ffaa00', '#ffffff', '#e50914']
                });
            }, 500); // Trigger after entry zoom
        };
        document.head.appendChild(confettiScript);
    }
});
