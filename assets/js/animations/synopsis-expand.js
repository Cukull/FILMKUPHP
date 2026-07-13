/**
 * Synopsis Expand/Collapse Animation for FILMKU
 * Requires GSAP
 */

function initSynopsisExpand() {
    const container = document.getElementById('synopsisContainer');
    const shortEl = document.getElementById('synopsisShort');
    const fullEl = document.getElementById('synopsisFull');
    const moreBtn = document.getElementById('moreTrigger');
    const lessBtn = document.getElementById('lessTrigger');
    
    if (!container || !shortEl || !fullEl || !moreBtn || !lessBtn) return;
    
    // Set container overflow hidden so animating height clips the content
    container.style.overflow = 'hidden';
    
    moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Measure short height
        const startHeight = shortEl.offsetHeight;
        
        // Swap visibility to measure full height
        shortEl.style.display = 'none';
        fullEl.style.display = 'block';
        
        const targetHeight = fullEl.offsetHeight;
        
        // Set container height to start height to prepare for animation
        gsap.set(container, { height: startHeight });
        
        // Animate to target height
        gsap.to(container, { 
            height: targetHeight, 
            duration: 0.5, 
            ease: "power2.out",
            onComplete: () => {
                // Clear inline height so it naturally resizes on window resize
                container.style.height = 'auto';
            }
        });
    });
    
    lessBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Current full height
        const startHeight = fullEl.offsetHeight;
        
        // Briefly show short to measure it
        fullEl.style.display = 'none';
        shortEl.style.display = 'block';
        const targetHeight = shortEl.offsetHeight;
        
        // Revert to full to start animation
        shortEl.style.display = 'none';
        fullEl.style.display = 'block';
        
        gsap.set(container, { height: startHeight });
        
        gsap.to(container, {
            height: targetHeight,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                // Swap back to short permanently
                fullEl.style.display = 'none';
                shortEl.style.display = 'block';
                container.style.height = 'auto';
                
                // Smooth scroll back up to the synopsis if it's pushed up
                const rect = container.getBoundingClientRect();
                if (rect.top < 100) {
                    window.scrollBy({
                        top: rect.top - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}
