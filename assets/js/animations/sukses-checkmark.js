/**
 * FILMKU - Success Checkmark Animation & Physics Confetti
 */

function initSuccessCheckmark() {
    const circle = document.querySelector('.sc-circle');
    const check = document.querySelector('.sc-check');
    const container = document.querySelector('.success-checkmark-container');

    if (!circle || !check || !container) return;

    // Get stroke lengths
    const circleLen = circle.getTotalLength();
    const checkLen = check.getTotalLength();

    // Initial state
    gsap.set(circle, { strokeDasharray: circleLen, strokeDashoffset: circleLen });
    gsap.set(check, { strokeDasharray: checkLen, strokeDashoffset: checkLen });
    gsap.set(container, { scale: 0.8, opacity: 0 });

    const tl = gsap.timeline();

    // 0. Initial pop-in
    tl.to(container, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' })
      // 1. Circle draw (0-400ms relative to here)
      .to(circle, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' }, '+=0')
      // 2. Checkmark draw (200-800ms -> starts halfway through circle)
      .to(check, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, '-=0.2')
      // 3. Circle + Checkmark glow (600-800ms)
      .to(container, { 
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)', 
          background: 'rgba(34, 197, 94, 0.1)',
          duration: 0.3 
      }, '-=0.3')
      // 4. Spring bounce (Option B)
      .to(container, {
          scale: 1.15,
          duration: 0.2,
          ease: 'power1.out'
      }, '-=0.3')
      .to(container, {
          scale: 0.95,
          duration: 0.2,
          ease: 'power1.inOut'
      })
      .to(container, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
          onComplete: createPhysicsConfetti
      });
}

function createPhysicsConfetti() {
    // If canvas-confetti library is available (Bonus: Physics simulation)
    if (typeof confetti === 'function') {
        const duration = 2000;
        const end = Date.now() + duration;
        // FILMKU Brand Colors: Red, Gold, Green, White
        const colors = ['#e50914', '#ffaa00', '#22c55e', '#ffffff'];

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    } else {
        // Fallback to custom DOM physics
        fallbackConfetti();
    }
}

function fallbackConfetti() {
    const colors = ['#e50914', '#ffaa00', '#22c55e', '#ffffff'];
    const container = document.getElementById('confetti') || document.body;
    
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'fixed';
        piece.style.width = '8px';
        piece.style.height = '8px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.zIndex = '9999';
        piece.style.pointerEvents = 'none';
        
        // Start from top center
        piece.style.left = '50vw';
        piece.style.top = '30vh';
        container.appendChild(piece);

        // Random velocities
        const vx = (Math.random() - 0.5) * 20;
        const vy = (Math.random() - 1) * 20 - 5;
        
        gsap.to(piece, {
            x: vx * 20,
            y: `+=${window.innerHeight}`,
            rotation: Math.random() * 720 - 360,
            duration: 2 + Math.random(),
            ease: 'power1.in',
            onComplete: () => piece.remove()
        });
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', initSuccessCheckmark);
