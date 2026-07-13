/**
 * Jadwal Cards Animations for FILMKU
 * Requires GSAP
 */

function initJadwalCardsAnimation() {
    const cards = document.querySelectorAll('.schedule-time');
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Unselect all other cards
            cards.forEach(c => {
                c.classList.remove('selected');
            });

            // Select clicked card
            this.classList.add('selected');
        });
    });
}
