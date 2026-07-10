<?php
// ============================================================
//  FILMKU — Genre (Kategori)
// ============================================================
$page_title = 'Genre';
$active_nav = 'genre';
require_once __DIR__ . '/config/sparql.php';
require_once __DIR__ . '/includes/header.php';

// Daftar semua genre yang mungkin ada
$all_genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 
    'TV Movie', 'Thriller', 'War', 'Western'
];

// Ambil semua film
$films_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?film ?judul ?poster ?genre WHERE {
        ?film a f:Film ;
              f:judul ?judul .
        OPTIONAL { ?film f:poster_url ?poster . }
        OPTIONAL { ?film f:poster_film ?poster . }
        OPTIONAL { ?film f:genre ?genre . }
    }
");
$films_raw = get_bindings($films_result ?? []);

$categorized_films = [];
foreach ($all_genres as $g) {
    $categorized_films[$g] = [];
}

foreach ($films_raw as $film) {
    $uri = $film['film']['value'];
    $genres_string = $film['genre']['value'] ?? 'Lainnya';
    
    // Pisahkan berdasarkan koma untuk genre ganda
    $genres_array = array_map('trim', explode(',', $genres_string));
    
    foreach ($genres_array as $g) {
        // Jika genre ada dalam daftar, masukkan ke kategorinya
        if (isset($categorized_films[$g])) {
            $categorized_films[$g][$uri] = $film;
        } else {
            // Jika ada genre di luar daftar default, tambahkan juga
            if (!isset($categorized_films[$g])) {
                $categorized_films[$g] = [];
            }
            $categorized_films[$g][$uri] = $film;
        }
    }
}

// Opsional: Urutkan key array agar rapi sesuai abjad
ksort($categorized_films);
?>

<div class="home-layout">
    <div style="padding-top: 100px; padding-bottom: 40px; padding-left: 60px; padding-right: 60px;">
        <h1 style="color: white; font-size: 32px; margin-bottom: 10px;">Eksplorasi Berdasarkan Genre</h1>
        <p style="color: var(--text-secondary); margin-bottom: 40px; font-size: 15px;">Temukan film favorit Anda dari berbagai kategori yang tersedia.</p>
        
        <div class="movie-rails-container" style="padding: 0; margin-top: 20px;">
            <?php foreach ($categorized_films as $genre_title => $film_list): ?>
            <div class="movie-rail" style="margin-bottom: 40px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                    <h3 class="rail-title" style="margin:0; font-size: 20px;"><?= htmlspecialchars($genre_title) ?></h3>
                </div>
                
                <?php if (empty($film_list)): ?>
                    <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; text-align: center; color: var(--text-muted);">
                        Belum ada film.
                    </div>
                <?php else: ?>
                    <div class="rail-scroll-wrapper">
                        <button class="rail-nav-btn prev">‹</button>
                        <div class="rail-scroll-content">
                            <?php 
                            $aos_delay = 0;
                            foreach ($film_list as $film):
                                $uri     = $film['film']['value'];
                                $film_id = substr($uri, strrpos($uri, '#') + 1);
                                $judul   = $film['judul']['value'];
                                $poster  = $film['poster']['value'] ?? '';
                            ?>
                                <div class="rail-card" data-aos="fade-up" data-aos-delay="<?= $aos_delay ?>">
                                    <a href="/FILMKU_PHP/detail.php?film=<?= htmlspecialchars($film_id) ?>">
                                        <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="<?= htmlspecialchars($judul) ?>" class="lazy-img" loading="lazy" onload="this.classList.add('loaded')">
                                        <div class="card-overlay">
                                            <div class="card-title"><?= htmlspecialchars($judul) ?></div>
                                        </div>
                                    </a>
                                </div>
                            <?php 
                                $aos_delay += 100;
                            endforeach; ?>
                        </div>
                        <button class="rail-nav-btn next">›</button>
                    </div>
                <?php endif; ?>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<script>
// Logic for horizontal scroll buttons on rails
document.querySelectorAll('.rail-scroll-wrapper').forEach(wrapper => {
    const content = wrapper.querySelector('.rail-scroll-content');
    const btnPrev = wrapper.querySelector('.prev');
    const btnNext = wrapper.querySelector('.next');
    const scrollAmount = 600;

    if (btnPrev && btnNext && content) {
        btnPrev.addEventListener('click', () => {
            content.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        btnNext.addEventListener('click', () => {
            content.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
