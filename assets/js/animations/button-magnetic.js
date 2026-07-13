/**
 * Magnetic Button Animation for FILMKU
 * Requires GSAP
 */

function initMagneticButton() {
    // Select all buttons that match the requested class or data attribute
    const magneticButtons = document.querySelectorAll('.cta-button-magnetic, [data-magnetic="true"], [data-magnetic]');
    
    magneticButtons.forEach(btn => {
        // Ensure cursor is pointer
        btn.style.cursor = 'pointer';
        
        // Ensure the button is positioned relative for transform accuracy
        btn.style.display = 'inline-block';
        btn.style.transformOrigin = 'center';

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate mouse position relative to button center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // 20% pull intensity
            const xMove = x * 0.2;
            const yMove = y * 0.2;

            // GSAP Animation for hover (magnetic pull + glow + scale)
            gsap.to(btn, {
                x: xMove,
                y: yMove,
                scale: 1.05,
                boxShadow: '0 0 30px rgba(255, 68, 68, 0.6)',
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });
            
            // Optional parallax for inner text if class .magnetic-text exists
            const innerText = btn.querySelector('.magnetic-text');
            if (innerText) {
                gsap.to(innerText, {
                    x: xMove * 1.5,
                    y: yMove * 1.5,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }
        });

        btn.addEventListener('mouseleave', () => {
            // Revert back with elastic ease
            gsap.to(btn, {
                x: 0,
                y: 0,
                scale: 1,
                boxShadow: '0 0 0px rgba(255, 68, 68, 0)', 
                duration: 0.4,
                ease: 'elastic.out(1, 0.3)',
                overwrite: 'auto'
            });
            
            const innerText = btn.querySelector('.magnetic-text');
            if (innerText) {
                gsap.to(innerText, {
                    x: 0,
                    y: 0,
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.3)',
                    overwrite: 'auto'
                });
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticButton);
} else {
    initMagneticButton();
}
