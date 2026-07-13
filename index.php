<?php
// ============================================================
//  FILMKU — Beranda (Daftar Film)
// ============================================================
$page_title = 'Beranda';
$active_nav = 'beranda';
require_once __DIR__ . '/config/sparql.php';
require_once __DIR__ . '/includes/header.php';

// Inisialisasi super admin jika DB kosong
inisialisasi_super_admin();

// 1. Ambil semua film dari Jena Fuseki
$films_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?film ?judul ?poster ?genre ?sinopsis ?trailer ?durasi ?kategoriSection WHERE {
        ?film a f:Film ;
              f:judul ?judul .
        OPTIONAL { ?film f:poster_url ?poster . }
        OPTIONAL { ?film f:poster_film ?poster . }
        OPTIONAL { ?film f:sinopsis ?sinopsis . }
        OPTIONAL { ?film f:genre ?genre . }
        OPTIONAL { ?film f:trailer_film ?trailer . }
        OPTIONAL { ?film f:durasi ?durasi . }
        OPTIONAL { ?film f:kategoriSection ?kategoriSection . }
    }
");
$search_query = trim($_GET['q'] ?? '');

$films_raw = get_bindings($films_result ?? []);

$hero_films = [];
$categories = [];

if ($search_query) {
    $search_results = [];
    foreach ($films_raw as $film) {
        $judul = $film['judul']['value'] ?? '';
        $uri = $film['film']['value'];
        if (stripos($judul, $search_query) !== false) {
            $search_results[$uri] = $film;
        }
    }
    if (!empty($search_results)) {
        $categories["Hasil Pencarian: " . htmlspecialchars($search_query)] = $search_results;
    } else {
        $categories["Hasil Pencarian: " . htmlspecialchars($search_query)] = [];
    }
} else {
    foreach ($films_raw as $film) {
        $kat = $film['kategoriSection']['value'] ?? '';
        if (!$kat) $kat = 'Lainnya';
        
        $uri = $film['film']['value'];
        
        if ($kat === 'Sorotan Layar Utama') {
            $hero_films[$uri] = $film;
        } else {
            if (!isset($categories[$kat])) {
                $categories[$kat] = [];
            }
            $categories[$kat][$uri] = $film;
        }
    }
}

// ── Acak Urutan Film Setiap Refresh (True Random) ──
if (!$search_query) {
    foreach ($categories as $kat => &$films_in_kat) {
        // shuffle() PHP menggunakan PRNG bawaan yang berbeda setiap request
        $arr = array_values($films_in_kat);
        shuffle($arr);
        $films_in_kat = $arr;
    }
    unset($films_in_kat); // Putus referensi
}

// Query Watchlist (Wishlist)
$watchlist_films = [];
if (!empty($_SESSION['user_name'])) {
    $user_name_safe = addslashes($_SESSION['user_name']);
    $res_wl = sparql_query("
        PREFIX f: <" . ONTOLOGY_PREFIX . ">
        SELECT ?film ?judul ?poster ?durasi WHERE {
            ?userURI a f:Pengguna ; f:nama_pengguna \"$user_name_safe\" ; f:menyimpanWatchlist ?film .
            ?film f:judul ?judul .
            OPTIONAL { ?film f:poster_url ?poster . }
            OPTIONAL { ?film f:poster_film ?poster . }
            OPTIONAL { ?film f:durasi ?durasi . }
        }
    ");
    $wl_raw = get_bindings($res_wl ?? []);
    foreach ($wl_raw as $w) {
        $uri = $w['film']['value'];
        $watchlist_films[$uri] = $w;
    }
}
?>

<div class="home-layout">

    <!-- 🔥 Hero Slideshow Banner (Netflix/Vidio Carousel) 🔥 -->
    <?php if (!empty($hero_films)): ?>
    <div class="hero-slider-container" id="heroSlider">
        <?php 
        $slide_idx = 0;
        foreach ($hero_films as $f_film): 
            $uri_f = $f_film['film']['value'];
            $id_f  = substr($uri_f, strrpos($uri_f, '#') + 1);
            $poster_f = $f_film['poster']['value'];
            $judul_f  = $f_film['judul']['value'];
            $genre_f  = $f_film['genre']['value'] ?? 'Action';
            $sinopsis_f = $f_film['sinopsis']['value'] ?? 'Saksikan film layar lebar terbaik minggu ini hanya di FILMKU.';
            $trailer_url = $f_film['trailer']['value'] ?? '';
            $durasi_f = $f_film['durasi']['value'] ?? '120 Menit';
        ?>
        <div class="hero-slide <?= ($slide_idx === 0) ? 'active' : '' ?>" 
             data-index="<?= $slide_idx ?>" 
             data-trailer-url="<?= htmlspecialchars($trailer_url) ?>">
            
            <div class="hero-backdrop">
                <img src="<?= htmlspecialchars(get_poster_url($poster_f)) ?>" alt="Backdrop">
            </div>

            <!-- YouTube Video Backdrop Container -->
            <div class="youtube-player-bg" id="yt-player-<?= $slide_idx ?>"></div>
            
            <!-- Vignette overlay above video player -->
            <div class="hero-gradient"></div>
            
            <div class="hero-slide-content-wrapper">
                <div class="hero-content">
                    <h1 class="hero-title-large"><?= htmlspecialchars($judul_f) ?></h1>
                    
                    <div class="hero-meta">
                        <span class="meta-item">⭐ 9.5</span>
                        <span class="meta-item"><?= htmlspecialchars($durasi_f) ?></span>
                        <span class="meta-item" style="border: 1px solid var(--text-secondary); padding: 1px 6px; border-radius:3px;">13+</span>
                        <span class="meta-item" style="color:var(--text-secondary);"><?= htmlspecialchars($genre_f) ?></span>
                    </div>
                    
                    <p class="hero-desc"><?= htmlspecialchars($sinopsis_f) ?></p>
                    
                    <div class="hero-actions">
                        <a href="/FILMKU_PHP/detail.php?film=<?= urlencode($id_f) ?>" class="btn-play magnetic-btn" data-magnetic>
                            <span class="magnetic-text">Pesan Tiket</span>
                        </a>
                        <button class="btn-wishlist-circle" title="Wishlist">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px; height:16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Speaker float toggle right (Catchplay+ Style) -->
            <?php if ($trailer_url): ?>
            <div class="hero-right-controls" style="position: absolute; bottom: 76px; right: 200px; z-index: 30;">
                <button class="btn-mute-toggle" data-index="<?= $slide_idx ?>" data-muted="true" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(8,8,16,0.6); border: 1px solid var(--border-subtle); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition);">
                    <svg class="mute-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                    <svg class="unmute-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; display: none;"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
            </div>
            <?php endif; ?>
        </div>
        <?php 
        $slide_idx++;
        endforeach; 
        ?>

        <!-- Slider Arrows -->
        <button class="hero-slider-arrow prev" id="heroPrev">‹</button>
        <button class="hero-slider-arrow next" id="heroNext">›</button>

        <!-- Slider Dots -->
        <div class="hero-dots" id="heroDots">
            <?php for ($i = 0; $i < $slide_idx; $i++): ?>
            <span class="hero-dot <?= ($i === 0) ? 'active' : '' ?>" data-slide="<?= $i ?>"></span>
            <?php endfor; ?>
        </div>
    </div>
    <?php else: ?>
    <div class="hero-full-banner" style="background:var(--bg-surface);">
        <div class="hero-content">
            <h1>Selamat Datang di FILMKU</h1>
            <p>Belum ada film di database.</p>
        </div>
    </div>
    <?php endif; ?>

    <!-- ── Baris Film Horizontal (Catchplay-Style Layouts) ── -->
    <div class="movie-rails-container">
        
        <!-- Section Daftar Tontonan Saya (Wishlist) -->
        <div id="wishlist-section" style="scroll-margin-top: 100px;">
        <?php if (!empty($watchlist_films)): ?>
        <div class="movie-rail">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <h3 class="rail-title" style="margin:0; color: #ff4081;">⭐ Wishlist</h3>
                <a href="#" style="color:var(--text-muted); font-size:12px; font-weight:700;">Selengkapnya...</a>
            </div>
            
            <div class="rail-scroll-wrapper">
                <button class="rail-nav-btn prev">‹</button>
                <div class="rail-scroll-content">
                    <?php 
                    $aos_delay = 0;
                    foreach ($watchlist_films as $film):
                        $uri     = $film['film']['value'];
                        $film_id = substr($uri, strrpos($uri, '#') + 1);
                        $judul   = $film['judul']['value'];
                        $poster  = $film['poster']['value'];
                    ?>
                        <a href="/FILMKU_PHP/detail.php?film=<?= urlencode($film_id) ?>" class="movie-card" data-aos="fade-up" data-aos-delay="<?= $aos_delay ?>">
                            <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="<?= htmlspecialchars($judul) ?>" class="movie-poster lazy-img" loading="lazy" onload="this.classList.add('loaded')" onerror="this.onerror=null; this.src='https://placehold.co/200x300/12121d/cbd5e1?text=No+Poster'">
                            <div class="overlay-info">
                                <h3 class="movie-title"><?= htmlspecialchars($judul) ?></h3>
                                <div class="movie-meta">
                                    <span class="movie-duration">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        120 Menit
                                    </span>
                                    <span class="movie-format">2D / IMAX</span>
                                </div>
                                <div class="movie-actions">
                                    <div class="btn-movie-action btn-buy cta-button-magnetic" data-magnetic="true"><span class="magnetic-text">Pesan</span></div>
                                </div>
                            </div>
                        </a>
                    <?php 
                        $aos_delay += 100;
                    endforeach; ?>
                </div>
                <button class="rail-nav-btn next">›</button>
            </div>
        </div>
        <?php endif; ?>
        </div>
        
        <?php foreach ($categories as $genre_title => $film_list): ?>
        <?php if (!empty($film_list)): ?>
        <div class="movie-rail">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <h3 class="rail-title" style="margin:0;"><?= htmlspecialchars($genre_title) ?></h3>
                <a href="#" style="color:var(--text-muted); font-size:12px; font-weight:700;">Lanjut...</a>
            </div>
            
            <div class="rail-scroll-wrapper">
                <button class="rail-nav-btn prev">‹</button>
                <div class="rail-scroll-content">
                    <?php 
                    $rank = 1;
                    $aos_delay = 0;
                    foreach ($film_list as $film):
                        $uri     = $film['film']['value'];
                        $film_id = substr($uri, strrpos($uri, '#') + 1);
                        $judul   = $film['judul']['value'];
                        $poster  = $film['poster']['value'];
                    ?>
                        <?php if ($genre_title === "Tangga Teratas Box Office"): ?>
                            <div class="rail-card-wrapper" data-aos="fade-up" data-aos-delay="<?= $aos_delay ?>">
                                <div class="rail-card-number"><?= $rank++ ?></div>
                                <a href="/FILMKU_PHP/detail.php?film=<?= urlencode($film_id) ?>" class="movie-card">
                                    <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="<?= htmlspecialchars($judul) ?>" class="movie-poster lazy-img" loading="lazy" onload="this.classList.add('loaded')" onerror="this.onerror=null; this.src='https://placehold.co/200x300/12121d/cbd5e1?text=No+Poster'">
                                    <div class="overlay-info">
                                        <h3 class="movie-title"><?= htmlspecialchars($judul) ?></h3>
                                        <div class="movie-meta">
                                            <span class="movie-duration">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                120 Menit
                                            </span>
                                            <span class="movie-format">2D / IMAX</span>
                                        </div>
                                        <div class="movie-actions">
                                            <div class="btn-movie-action btn-buy cta-button-magnetic" data-magnetic="true"><span class="magnetic-text">Pesan</span></div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        <?php else: ?>
                            <a href="/FILMKU_PHP/detail.php?film=<?= urlencode($film_id) ?>" class="movie-card" data-aos="fade-up" data-aos-delay="<?= $aos_delay ?>">
                                <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="<?= htmlspecialchars($judul) ?>" class="movie-poster lazy-img" loading="lazy" onload="this.classList.add('loaded')" onerror="this.onerror=null; this.src='https://placehold.co/200x300/12121d/cbd5e1?text=No+Poster'">
                                <div class="overlay-info">
                                    <h3 class="movie-title"><?= htmlspecialchars($judul) ?></h3>
                                    <div class="movie-meta">
                                        <span class="movie-duration">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            120 Menit
                                        </span>
                                        <span class="movie-format">2D / IMAX</span>
                                    </div>
                                    <div class="movie-actions">
                                        <div class="btn-movie-action btn-buy cta-button-magnetic" data-magnetic="true"><span class="magnetic-text">Pesan</span></div>
                                    </div>
                                </div>
                            </a>
                        <?php endif; ?>
                    <?php 
                        $aos_delay += 100;
                    endforeach; ?>
                </div>
                <button class="rail-nav-btn next">›</button>
            </div>
        </div>
        <?php endif; ?>
        <?php endforeach; ?>

    </div>

    <!-- ── Why FILMKU & FAQ Sections (Netflix-Style) ── -->
    <section class="netflix-promo-section">
        <h3 class="promo-title" data-aos="fade-up">Mengapa Harus FILMKU?</h3>
        <div class="promo-grid">
            <div class="promo-card" data-aos="fade-up" data-aos-delay="0">
                <div>
                    <h4>Tonton Di Mana Saja</h4>
                    <p>Akses pemesanan dan jadwal film bioskop favoritmu kapan saja melalui HP, tablet, maupun laptop.</p>
                </div>
                <!-- TV Icon SVG -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="15" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="18" x2="12" y2="21"></line></svg>
            </div>
            
            <div class="promo-card" data-aos="fade-up" data-aos-delay="100">
                <div>
                    <h4>Pilih Kursi Real-Time</h4>
                    <p>Rasakan kemudahan memilih kursi bioskop ternyaman secara instan dengan peta studio interaktif.</p>
                </div>
                <!-- Seat/Armchair Icon SVG -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 10V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"></path><path d="M3 10v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M12 14h.01"></path></svg>
            </div>
            
            <div class="promo-card" data-aos="fade-up" data-aos-delay="200">
                <div>
                    <h4>Semantic Database</h4>
                    <p>Semua informasi film, jadwal tayang, dan transaksi dikelola aman menggunakan teknologi Apache Jena Fuseki.</p>
                </div>
                <!-- Database/Server Icon SVG -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>
            </div>
            
            <div class="promo-card" data-aos="fade-up" data-aos-delay="300">
                <div>
                    <h4>Daftar Akun Instan</h4>
                    <p>Daftarkan akun penonton Anda secara gratis untuk menyimpan riwayat pesanan tiket bioskop Anda.</p>
                </div>
                <!-- User Icon SVG -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
        </div>

        <!-- FAQ Container -->
        <div class="faq-section">
            <h3 class="promo-title" style="text-align: center; margin-bottom: 30px;" data-aos="fade-up">Tanya Jawab (FAQ)</h3>
            <div class="faq-container">
                
                <div class="faq-item" data-aos="fade-up" data-aos-delay="0">
                    <button class="faq-question">
                        <span>Apa itu FILMKU?</span>
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <div class="faq-answer">
                        FILMKU adalah platform pemesanan tiket bioskop digital modern. Aplikasi ini dikembangkan menggunakan teknologi Semantic Web (RDF dan SPARQL) dengan database Apache Jena Fuseki untuk menyajikan integrasi data film, studio, dan kursi secara terstruktur dan efisien.
                    </div>
                </div>

                <div class="faq-item" data-aos="fade-up" data-aos-delay="100">
                    <button class="faq-question">
                        <span>Bagaimana cara memesan tiket film?</span>
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <div class="faq-answer">
                        Caranya sangat mudah! Anda cukup memilih film yang ingin ditonton dari halaman Beranda, pilih tanggal dan jam tayang di halaman Detail Film, lalu masuk (login) ke akun Anda untuk memilih nomor kursi dan menyelesaikan pembayaran. Tiket digital Anda akan diterbitkan secara otomatis setelah pembayaran sukses.
                    </div>
                </div>

                <div class="faq-item" data-aos="fade-up" data-aos-delay="200">
                    <button class="faq-question">
                        <span>Apakah saya harus membuat akun untuk melihat film?</span>
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <div class="faq-answer">
                        Tidak. Anda dapat bebas menjelajahi katalog film terbaru, mencari genre film, dan melihat jadwal tayang tanpa harus masuk atau mendaftar terlebih dahulu. Anda hanya diwajibkan masuk (login) ketika ingin memesan kursi di halaman transaksi.
                    </div>
                </div>

                <div class="faq-item" data-aos="fade-up" data-aos-delay="300">
                    <button class="faq-question">
                        <span>Bagaimana cara membatalkan pemesanan tiket?</span>
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <div class="faq-answer">
                        Untuk saat ini, tiket yang telah dibeli dan dikonfirmasi pembayarannya bersifat final dan tidak dapat dibatalkan atau dijadwalkan ulang. Harap pastikan kembali judul film, jam tayang, dan nomor kursi Anda sebelum melakukan pembayaran.
                    </div>
                </div>

                <div class="faq-item" data-aos="fade-up" data-aos-delay="400">
                    <button class="faq-question">
                        <span>Di mana saya bisa menukarkan tiket fisik?</span>
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <div class="faq-answer">
                        Setelah pembayaran berhasil, Anda akan menerima tiket digital yang berisi kode QR dan nomor transaksi unik. Anda dapat menukarkannya menjadi tiket fisik di loket tiket bioskop atau melalui mesin penukaran tiket mandiri sebelum jam pemutaran film dimulai.
                    </div>
                </div>

            </div>
        </div>
    </section>

</div>

<script>
// Logic for horizontal scroll buttons on rails
document.querySelectorAll('.rail-scroll-wrapper').forEach(wrapper => {
    const content = wrapper.querySelector('.rail-scroll-content');
    const btnPrev = wrapper.querySelector('.prev');
    const btnNext = wrapper.querySelector('.next');
    const scrollAmount = 600; // Adjust based on card size

    btnPrev.addEventListener('click', () => {
        content.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
        content.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Hide/show buttons based on scroll position
    content.addEventListener('scroll', () => {
        btnPrev.style.opacity = content.scrollLeft > 0 ? '1' : '0';
        btnNext.style.opacity = (content.scrollLeft + content.clientWidth >= content.scrollWidth - 10) ? '0' : '1';
    });
    
    // Initial trigger
    content.dispatchEvent(new Event('scroll'));
});

// FAQ Accordion Toggle Logic
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items first
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // If it wasn't active, open it
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ── Hero Slideshow & YouTube Auto-play Trailer ──
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const btnPrev = document.getElementById('heroPrev');
    const btnNext = document.getElementById('heroNext');
    let currentSlide = 0;
    let slideInterval = null;
    let trailerTimer = null;

    if (slides.length === 0) return;

    function getYouTubeId(url) {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }

    function stopTrailer(slide) {
        slide.classList.remove('video-playing');
        const playerBg = slide.querySelector('.youtube-player-bg');
        if (playerBg) playerBg.innerHTML = ''; // Hapus iframe
    }

    function playTrailer(slide) {
        const url = slide.getAttribute('data-trailer-url');
        const ytId = getYouTubeId(url);
        if (!ytId) return;

        const playerBg = slide.querySelector('.youtube-player-bg');
        if (playerBg) {
            // Inject iframe video YouTube background with API enabled
            playerBg.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&modestbranding=1&fs=0&autohide=1&enablejsapi=1" 
                        allow="autoplay; encrypted-media" 
                        tabindex="-1"
                        aria-hidden="true">
                </iframe>
            `;
            slide.classList.add('video-playing');
        }
    }

    function showSlide(index) {
        // Hentikan video & timer di slide sebelumnya
        stopTrailer(slides[currentSlide]);
        clearTimeout(trailerTimer);

        // Reset class active
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        // Reset button state ke Muted (Hening) karena reload video baru
        document.querySelectorAll('.btn-mute-toggle').forEach(btn => {
            btn.setAttribute('data-muted', 'true');
            const muteIcon = btn.querySelector('.mute-svg');
            const unmuteIcon = btn.querySelector('.unmute-svg');
            if (muteIcon) muteIcon.style.display = 'block';
            if (unmuteIcon) unmuteIcon.style.display = 'none';
        });

        // Set slide baru
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');

        // Mulai timer idle (3 detik) untuk memutar trailer secara otomatis
        trailerTimer = setTimeout(() => {
            playTrailer(slides[currentSlide]);
        }, 3000); // 3 detik didiamkan
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Event listeners
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            prevSlide();
        });
        btnNext.addEventListener('click', () => {
            nextSlide();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
        });
    });

    // Mute/Unmute toggle handler menggunakan postMessage YT API
    document.querySelectorAll('.btn-mute-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.getAttribute('data-index');
            const slide = slides[idx];
            const iframe = slide.querySelector('.youtube-player-bg iframe');
            if (!iframe) return;

            const isMuted = btn.getAttribute('data-muted') !== 'false';
            const muteIcon = btn.querySelector('.mute-svg');
            const unmuteIcon = btn.querySelector('.unmute-svg');
            
            if (isMuted) {
                // Unmute
                iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'unMute'}), '*');
                btn.setAttribute('data-muted', 'false');
                if (muteIcon) muteIcon.style.display = 'none';
                if (unmuteIcon) unmuteIcon.style.display = 'block';
            } else {
                // Mute
                iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'mute'}), '*');
                btn.setAttribute('data-muted', 'true');
                if (muteIcon) muteIcon.style.display = 'block';
                if (unmuteIcon) unmuteIcon.style.display = 'none';
            }
        });
    });

    // Inisialisasi awal — tanpa auto-slide, user kontrol penuh
    showSlide(0);

    // ── ScrollTrigger: Auto-Pause Video saat Hero Keluar dari Layar ──
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#heroSlider',
            start: 'top bottom',
            end: 'bottom top',

            // Hero masuk pandangan → putar video trailer slide aktif
            onEnterBack: () => {
                const activeSlide = document.querySelector('.hero-slide.active');
                if (activeSlide) {
                    const url = activeSlide.getAttribute('data-trailer-url');
                    if (url) setTimeout(() => playTrailer(activeSlide), 1000);
                }
            },

            // Hero keluar pandangan → matikan semua iframe → bebaskan CPU
            onLeave: () => {
                document.querySelectorAll('.hero-slide').forEach(slide => stopTrailer(slide));
                clearTimeout(trailerTimer);
            },

            onLeaveBack: () => {
                document.querySelectorAll('.hero-slide').forEach(slide => stopTrailer(slide));
                clearTimeout(trailerTimer);
            },
        });
    }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
