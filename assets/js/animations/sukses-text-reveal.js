/**
 * FILMKU - Success Title Letter-by-Letter Reveal (No External Libraries)
 */

function initTextReveal() {
    const titleElement = document.querySelector('.success-title');
    if (!titleElement) return;

    // Get text content and clear element
    const text = titleElement.innerText || titleElement.textContent;
    titleElement.innerHTML = '';
    
    // Manually split into letters and wrap in spans
    const chars = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ') {
            titleElement.appendChild(document.createTextNode(' '));
        } else {
            const span = document.createElement('span');
            span.innerText = char;
            span.className = 'char';
            span.style.display = 'inline-block';
            titleElement.appendChild(span);
            chars.push(span);
        }
    }

    // Now it's safe to show the container
    gsap.set(titleElement, { opacity: 1 });
    
    // Set initial state for all characters
    gsap.set(chars, { 
        opacity: 0, 
        y: 30, 
        scale: 0.8,
        color: '#ffffff' // Default start color
    });

    // We will trigger the animation after the checkmark finishes (approx 800ms)
    setTimeout(() => {
        // FILMKU Bonus: Rainbow / Brand color alternating effect
        const brandColors = ['#22c55e', '#ffaa00', '#e50914', '#ffffff'];

        gsap.to(chars, {
            duration: 0.6,
            opacity: 1,
            y: 0,
            scale: 1,
            // Cycle through brand colors for a cool premium effect
            color: (i) => brandColors[i % brandColors.length],
            stagger: {
                each: 0.04,
                from: "start"
            },
            ease: 'back.out(2)', // Add a nice bounce (Bonus)
            onComplete: () => {
                // Optional: After the rainbow reveal, transition smoothly back to solid green
                gsap.to(chars, {
                    color: '#22c55e',
                    duration: 1.5,
                    stagger: 0.02,
                    ease: 'power2.inOut'
                });
            }
        });
    }, 850);
}

// Ensure it runs after DOM loads
document.addEventListener('DOMContentLoaded', initTextReveal);
