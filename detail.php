<?php
// ============================================================
//  FILMKU — Detail Film & Pilih Sesi Tayang
// ============================================================
$page_title = 'Detail Film';
$active_nav = 'beranda';
require_once __DIR__ . '/config/sparql.php';

$film_id = trim($_GET['film'] ?? '');
if (!$film_id) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $film_id));

// Query detail film + semua jadwal-nya
$result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?poster ?sinopsis ?durasi ?genre ?rating ?tanggal ?jam ?studio ?trailer WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL { f:$film_id_safe f:poster_film ?poster . }
        OPTIONAL { f:$film_id_safe f:sinopsis    ?sinopsis . }
        OPTIONAL { f:$film_id_safe f:durasi      ?durasi . }
        OPTIONAL { f:$film_id_safe f:genre       ?genre . }
        OPTIONAL { f:$film_id_safe f:rating_film ?rating . }
        OPTIONAL { f:$film_id_safe f:trailer_film ?trailer . }
        OPTIONAL {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:tanggal ?tanggal ;
                    f:jam     ?jam ;
                    f:studio  ?studio .
        }
    }
");

$rows = get_bindings($result ?? []);
if (empty($rows)) {
    http_response_code(404);
    echo '<h2 style="color:white;text-align:center;padding:60px">Film tidak ditemukan (404)</h2>';
    exit;
}

$film      = $rows[0];
$poster    = $film['poster']['value']   ?? 'default.jpg';
$judul     = $film['judul']['value']    ?? 'Tanpa Judul';
$sinopsis  = $film['sinopsis']['value'] ?? 'Sinopsis belum tersedia.';
$durasi    = $film['durasi']['value']   ?? 'N/A';
$genre     = $film['genre']['value']    ?? 'N/A';
$rating    = $film['rating']['value']   ?? 'N/A';
$trailer   = $film['trailer']['value']  ?? '';

// Cek apakah ada di watchlist user
$is_wishlist = false;
if (session_status() === PHP_SESSION_NONE) session_start();
if (!empty($_SESSION['user_name'])) {
    $user_name_safe = addslashes($_SESSION['user_name']);
    $res_user = sparql_query("PREFIX f: <" . ONTOLOGY_PREFIX . "> SELECT ?userURI WHERE { ?userURI a f:Pengguna ; f:nama_pengguna \"$user_name_safe\" . } LIMIT 1");
    $bindings_user = get_bindings($res_user ?? []);
    if (!empty($bindings_user)) {
        $user_uri_full = "<" . $bindings_user[0]['userURI']['value'] . ">";
        $res_check = sparql_query("PREFIX f: <" . ONTOLOGY_PREFIX . "> ASK { $user_uri_full f:menyimpanWatchlist f:$film_id_safe . }");
        $is_wishlist = get_boolean($res_check ?? []);
    }
}

// Kelompokkan jadwal per tanggal
$jadwal_grouped = [];
foreach ($rows as $row) {
    if (isset($row['tanggal'], $row['jam'])) {
        $tgl = $row['tanggal']['value'];
        $jam = $row['jam']['value'];
        $std = $row['studio']['value'] ?? 'Studio 1';
        if (!isset($jadwal_grouped[$tgl])) $jadwal_grouped[$tgl] = [];
        $jadwal_grouped[$tgl][] = ['jam' => $jam, 'studio' => $std];
    }
}

// --- OVERRIDE: Dynamic Real-time Jadwal Generator ---
$jadwal_grouped = [];
$hari_id = ['Sun' => 'Min', 'Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab', 'Thu' => 'Kam', 'Fri' => 'Jum', 'Sat' => 'Sab'];
$bulan_id = ['Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Ags', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'];

for ($i = 0; $i < 5; $i++) {
    $ts = strtotime("+$i days");
    $day_en = date('D', $ts);
    $month_en = date('M', $ts);
    $date_num = date('d', $ts);
    
    if ($i == 0) {
        $label = "Hari Ini, $date_num " . $bulan_id[$month_en];
    } elseif ($i == 1) {
        $label = "Besok, $date_num " . $bulan_id[$month_en];
    } else {
        $label = $hari_id[$day_en] . ", $date_num " . $bulan_id[$month_en];
    }
    
    // Generate random/mock showtimes for realism
    $jadwal_grouped[$label] = [
        ['jam' => '13:00', 'studio' => 'Studio 1'],
        ['jam' => '15:15', 'studio' => 'Studio 2'],
        ['jam' => '17:30', 'studio' => 'Studio 1'],
        ['jam' => '19:45', 'studio' => 'Premiere'],
        ['jam' => '21:15', 'studio' => 'Studio 3']
    ];
}
// ---------------------------------------------------

$page_title = $judul;

// --- TMDB API FETCH (LIVE DATA) ---
$tmdb_api_key = 'b34956eaa87450c0f9dd7817a69dc555'; // API Key milik Anda
$search_judul = preg_replace('/\s*\(\d{4}\)$/', '', $judul);
$tmdb_search_url = "https://api.themoviedb.org/3/search/movie?api_key=" . $tmdb_api_key . "&query=" . urlencode($search_judul) . "&language=id-ID";

// Nilai Default (Fallback)
$omdb_director = 'N/A';
$omdb_writer = 'N/A';
$omdb_actors = 'N/A';
$omdb_rt = 'N/A';
$omdb_mc = 'N/A';

// Menarik data dari TMDB menggunakan cURL
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tmdb_search_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $search_resp = curl_exec($ch);
    
    if ($search_resp) {
        $search_data = json_decode($search_resp, true);
        if (!empty($search_data['results'][0]['id'])) {
            $movie_id = $search_data['results'][0]['id'];
            
            // Konversi Rating TMDB (skala 10) menjadi % untuk Rotten Tomatoes & Metacritic sebagai placeholder visual
            $tmdb_score = $search_data['results'][0]['vote_average'];
            $omdb_rt = round($tmdb_score * 10) . '%';
            $omdb_mc = round($tmdb_score * 10);
            
            // Ambil data Sutradara, Penulis, dan Pemeran (Credits)
            curl_setopt($ch, CURLOPT_URL, "https://api.themoviedb.org/3/movie/" . $movie_id . "/credits?api_key=" . $tmdb_api_key);
            $credits_resp = curl_exec($ch);
            if ($credits_resp) {
                $credits_data = json_decode($credits_resp, true);
                
                $directors = [];
                $writers = [];
                $tmdb_cast_crew = []; // Visual Cast Array
                
                if (!empty($credits_data['crew'])) {
                    foreach ($credits_data['crew'] as $crew) {
                        if ($crew['job'] === 'Director') {
                            $directors[] = $crew['name'];
                            // Hanya masukkan max 2 sutradara ke UI profil
                            if (count(array_filter($tmdb_cast_crew, fn($c) => $c['role'] === 'Sutradara')) < 2) {
                                $tmdb_cast_crew[] = [
                                    'name'    => $crew['name'],
                                    'role'    => 'Sutradara',
                                    'image'   => !empty($crew['profile_path']) ? 'https://image.tmdb.org/t/p/w185' . $crew['profile_path'] : 'https://via.placeholder.com/150x150/1a1a2e/ffffff?text=' . urlencode(substr($crew['name'], 0, 1)),
                                    'tmdb_id' => $crew['id'] ?? null,
                                ];
                            }
                        }
                        if ($crew['job'] === 'Screenplay' || $crew['job'] === 'Writer') {
                            $writers[] = $crew['name'];
                        }
                    }
                }
                if (!empty($directors)) $omdb_director = implode(', ', array_slice($directors, 0, 2));
                if (!empty($writers)) $omdb_writer = implode(', ', array_slice($writers, 0, 2));

                // Ambil juga TMDB ID sutradara pertama untuk JSON-LD
                $director_tmdb_id = null;
                foreach ($tmdb_cast_crew as $c) {
                    if ($c['role'] === 'Sutradara' && !empty($c['tmdb_id'])) {
                        $director_tmdb_id = $c['tmdb_id'];
                        break;
                    }
                }

                $actors = [];
                if (!empty($credits_data['cast'])) {
                    foreach (array_slice($credits_data['cast'], 0, 8) as $cast) {
                        $actors[] = $cast['name'];
                        $tmdb_cast_crew[] = [
                            'name'    => $cast['name'],
                            'role'    => $cast['character'] ?: 'Pemeran',
                            'image'   => !empty($cast['profile_path']) ? 'https://image.tmdb.org/t/p/w185' . $cast['profile_path'] : 'https://via.placeholder.com/150x150/1a1a2e/ffffff?text=' . urlencode(substr($cast['name'], 0, 1)),
                            'tmdb_id' => $cast['id'] ?? null,
                        ];
                    }
                }
                if (!empty($actors)) $omdb_actors = implode(', ', array_slice($actors, 0, 4));
            }
        }
    }
    curl_close($ch);
}

// Helper: URL profil TMDB untuk orang (person)
function get_tmdb_person_link($tmdb_id, $name) {
    if ($tmdb_id) {
        return 'https://www.themoviedb.org/person/' . intval($tmdb_id) . '-' . rawurlencode(strtolower(str_replace(' ', '-', trim($name))));
    }
    // Fallback ke pencarian TMDB berdasarkan nama
    return 'https://www.themoviedb.org/search/person?query=' . urlencode(trim($name));
}

// Helper: URL pencarian IMDb berdasarkan nama
function get_imdb_search_link($name) {
    return 'https://www.imdb.com/find?q=' . urlencode(trim($name)) . '&s=nm';
}

// Helper: URL Wikidata Search
function get_wikidata_link($name) {
    return 'https://www.wikidata.org/wiki/Special:Search?search=' . urlencode(trim($name));
}

// Persiapkan Array Aktor untuk JSON-LD (dengan sameAs multi-platform)
$json_ld_actors = [];
foreach (($tmdb_cast_crew ?? []) as $person) {
    if ($person['role'] === 'Sutradara') continue; // sutradara ditangani terpisah
    $json_ld_actors[] = [
        '@type'  => 'Person',
        'name'   => $person['name'],
        'sameAs' => [
            get_tmdb_person_link($person['tmdb_id'] ?? null, $person['name']),
            get_imdb_search_link($person['name']),
            get_wikidata_link($person['name']),
        ],
    ];
}

// JSON-LD untuk director
$director_name = $omdb_director ?? 'N/A';
$json_ld_director = [
    '@type'  => 'Person',
    'name'   => $director_name,
    'sameAs' => [
        get_tmdb_person_link($director_tmdb_id ?? null, $director_name),
        get_imdb_search_link($director_name),
        get_wikidata_link($director_name),
    ],
];

require_once __DIR__ . '/includes/header.php';
?>

<!-- ── Hero Full Banner (Catchplay+ Details style) ── -->
<div class="hero-full-banner" id="detailsHero" style="height: 650px; position: relative;" data-trailer-url="<?= htmlspecialchars($trailer) ?>">
    <div class="hero-backdrop">
        <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="Backdrop" style="object-position: center 20%;">
    </div>
    
    <!-- YouTube Video Backdrop Container -->
    <div class="youtube-player-bg" id="detailsYtPlayer"></div>

    <div class="hero-gradient" style="z-index: 3;"></div>
    
    <div class="hero-slide-content-wrapper" style="z-index: 10; position: absolute; bottom: 30px; left: 60px; height: auto; padding: 0; width: calc(100% - 120px); align-items: flex-end;">
        <div class="hero-content" style="max-width: 950px;">
            <h1 class="hero-title-large" style="margin-bottom: 8px; font-size: 24px; font-weight:800;"><?= htmlspecialchars($judul) ?></h1>
            
            <div class="hero-actions" style="margin-bottom: 14px; gap: 8px; align-items: center;">
                <a href="#pilihJadwal" class="btn-play" style="background: var(--primary); font-weight:700; font-size: 11.5px; padding: 8px 18px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; height: 34px;">
                    Pilih Sesi Tayang
                </a>
                <button id="btnWatchlist" class="btn-watchlist <?= $is_wishlist ? 'active' : '' ?>" data-film="<?= htmlspecialchars($film_id_safe) ?>" title="Wishlist" style="margin-left: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <button class="btn-wishlist-circle" title="Bagikan ke Facebook" style="width: 34px; height: 34px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </button>
                <button class="btn-wishlist-circle" title="Salin Tautan" onclick="navigator.clipboard.writeText(window.location.href); alert('Link film disalin!');" style="width: 34px; height: 34px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
            </div>

            <div class="hero-meta" style="margin-bottom: 10px; font-size:11px;">
                <span class="meta-item" style="color:var(--yellow); font-weight:700;" title="IMDb Rating">⭐ <?= htmlspecialchars($rating) ?> / 10</span>
                <?php if ($omdb_rt !== 'N/A'): ?>
                <span class="meta-item" style="color:#ff4444; font-weight:700;" title="Rotten Tomatoes">🍅 <?= htmlspecialchars($omdb_rt) ?></span>
                <?php endif; ?>
                <?php if ($omdb_mc !== 'N/A'): ?>
                <span class="meta-item" style="color:#66cc33; font-weight:700;" title="Metacritic">Ⓜ️ <?= htmlspecialchars($omdb_mc) ?></span>
                <?php endif; ?>
                <span class="meta-item">⏱️ <?= htmlspecialchars($durasi) ?></span>
                <span class="meta-item" style="border: 1px solid var(--border-subtle); padding: 1px 6px; border-radius:3px;">HD</span>
                <span class="meta-item" style="color:var(--text-secondary);"><?= htmlspecialchars($genre) ?></span>
            </div>

            <div id="synopsisContainer" style="margin-top: 10px;">
                <p id="synopsisShort" style="font-size: 13.5px; line-height: 1.65; color: #cbd5e1; max-width: 900px; margin-bottom: 0; font-weight: 500;">
                    <?= htmlspecialchars(mb_strimwidth($sinopsis, 0, 160)) ?>... <span id="moreTrigger" style="color: #fff; font-weight: 800; cursor: pointer; text-decoration: none; margin-left: 5px;">MORE</span>
                </p>
                <p id="synopsisFull" style="display: none; font-size: 13.5px; line-height: 1.65; color: #cbd5e1; max-width: 900px; margin-bottom: 0; font-weight: 500;">
                    <?= htmlspecialchars($sinopsis) ?>
                </p>
            </div>
        </div>
    </div>

    <!-- Speaker float toggle right (Catchplay+ Style) -->
    <?php if ($trailer): ?>
    <div class="hero-right-controls" style="position: absolute; bottom: 76px; right: 60px; z-index: 30;">
        <button class="btn-mute-toggle" id="detailMuteBtn" data-muted="true" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(8,8,16,0.6); border: 1px solid var(--border-subtle); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition);">
            <!-- Minimal Mute speaker SVG icon -->
            <svg class="mute-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            <!-- Minimal Unmute speaker SVG icon -->
            <svg class="unmute-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; display: none;"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        </button>
    </div>
    <?php endif; ?>
</div>

<div class="detail-content" style="padding-top: 40px;" id="pilihJadwal">

</div> <!-- close detail-content temporarily -->

<!-- Full width Cast & Crew Rail -->
<div class="cast-rail-wrapper" style="position: relative; width: 100%; background: transparent; padding: 20px 0 40px 0; margin-top: -20px; margin-bottom: 40px;">
    <h3 style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 20px; font-family: 'Outfit', sans-serif; margin-left: 40px;">Aktor & Kru</h3>
    
    <!-- Navigation Arrows -->
    <button id="slideLeftBtn" style="position: absolute; left: 10px; top: 60%; transform: translateY(-50%); z-index: 10; background: none; border: none; color: #cbd5e1; cursor: pointer; display: none; padding: 10px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    
    <div class="cast-scroll-content" id="castScrollArea" style="display: flex; gap: 24px; overflow-x: auto; padding: 0 40px; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none;">
        <?php if (!empty($tmdb_cast_crew)): ?>
            <?php foreach ($tmdb_cast_crew as $person): ?>
            <?php
                // Bangun URL utama: ke halaman profil TMDB
                $person_tmdb_url  = get_tmdb_person_link($person['tmdb_id'] ?? null, $person['name']);
                $person_imdb_url  = get_imdb_search_link($person['name']);
                $person_wikidata_url = get_wikidata_link($person['name']);
            ?>
            <div class="cast-item" style="flex: 0 0 100px; text-decoration: none; text-align: center; display: block;">
                <!-- Foto → link ke TMDB biography -->
                <a href="<?= htmlspecialchars($person_tmdb_url) ?>" target="_blank" rel="noopener noreferrer" title="Lihat profil <?= htmlspecialchars($person['name']) ?> di TMDB">
                    <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin-bottom: 10px; border: 2px solid rgba(255,255,255,0.1); margin-left: auto; margin-right: auto; transition: border-color 0.2s;">
                        <img src="<?= htmlspecialchars($person['image']) ?>" alt="<?= htmlspecialchars($person['name']) ?>" class="lazy-img" loading="lazy" onload="this.classList.add('loaded')" style="width: 100%; height: 100%; object-fit: cover; background: #1a1a2e;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a2e/ffffff?text=?';">
                    </div>
                </a>
                <div style="font-size: 13px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 4px;"><?= htmlspecialchars($person['name']) ?></div>
                <div style="font-size: 12px; font-weight: 500; color: #94a3b8; margin-bottom: 8px;"><?= htmlspecialchars(mb_strimwidth($person['role'], 0, 18, '...')) ?></div>

            </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p style="font-size: 14px; color: var(--text-muted); margin-left:40px;">Data aktor belum tersedia.</p>
        <?php endif; ?>
    </div>

    <button id="slideRightBtn" style="position: absolute; right: 10px; top: 60%; transform: translateY(-50%); z-index: 10; background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 10px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
</div>

<style>
    .cast-scroll-content::-webkit-scrollbar { display: none; }
    .cast-item:hover { transform: scale(1.08); }
</style>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        const scrollArea = document.getElementById("castScrollArea");
        const leftBtn = document.getElementById("slideLeftBtn");
        const rightBtn = document.getElementById("slideRightBtn");

        function updateArrows() {
            // Hide left arrow if at start
            leftBtn.style.display = scrollArea.scrollLeft <= 0 ? "none" : "block";
            // Hide right arrow if at end
            const maxScrollLeft = scrollArea.scrollWidth - scrollArea.clientWidth;
            rightBtn.style.display = scrollArea.scrollLeft >= maxScrollLeft - 1 ? "none" : "block";
        }

        scrollArea.addEventListener("scroll", updateArrows);
        window.addEventListener("resize", updateArrows);

        // Initial check
        setTimeout(updateArrows, 100);

        leftBtn.addEventListener("click", () => {
            scrollArea.scrollBy({ left: -400, behavior: 'smooth' });
        });

        rightBtn.addEventListener("click", () => {
            scrollArea.scrollBy({ left: 400, behavior: 'smooth' });
        });
    });
</script>

<div class="detail-content" style="padding-top: 0;" id="pilihJadwal">

    <!-- Booking Card -->
    <div class="booking-card" style="margin-bottom: 40px; background: rgba(18, 18, 29, 0.6); border: 1px solid var(--border-subtle); padding: 30px; border-radius: var(--radius-md);">
        <div class="booking-card-title" style="font-family:'Outfit',sans-serif; font-size:18px; font-weight:800; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Pilih Tanggal Tayang
        </div>
        <div class="date-chips-row">
            <?php if (empty($jadwal_grouped)): ?>
            <p style="color:var(--text-muted); font-size:14px; font-style:italic;">Belum ada jadwal tayang untuk film ini.</p>
            <?php else: ?>
            <?php $first_tgl = true; $idx = 0; foreach ($jadwal_grouped as $tgl => $list): ?>
            <div class="chip-date <?= $first_tgl ? 'active' : '' ?>"
                 onclick="selectDate(this, <?= $idx ?>)">
                <?= htmlspecialchars($tgl) ?>
            </div>
            <?php $first_tgl = false; $idx++; endforeach; ?>
            <?php endif; ?>
        </div>

        <div class="booking-card-title" style="font-family:'Outfit',sans-serif; font-size:18px; font-weight:800; margin-top:30px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Pilih Jam Sesi & Lokasi Studio
        </div>
        <div class="time-chips-row">
            <?php $first_outer = true; $idx = 0; foreach ($jadwal_grouped as $tgl => $list): ?>
            <?php $first_inner = true; foreach ($list as $sesi):
                $date_class = 'date-group-' . $idx;
                $show_class = $first_outer ? '' : 'hidden';
                $active_cls = ($first_outer && $first_inner) ? 'active' : '';
            ?>
            <div class="chip-time <?= $active_cls ?> <?= $show_class ?> <?= $date_class ?>"
                 onclick="selectTime(this, '<?= htmlspecialchars($sesi['jam']) ?>')"
                 data-studio="<?= htmlspecialchars($sesi['studio']) ?>">
                <?= htmlspecialchars($sesi['jam']) ?> (<?= htmlspecialchars($sesi['studio']) ?>)
            </div>
            <?php $first_inner = false; endforeach; $first_outer = false; $idx++; endforeach; ?>
        </div>
    </div>


    <!-- CTA / Pesan Tiket -->
    <div class="cta-bar" style="text-align: center; margin: 40px 0 60px;">
        <a href="javascript:void(0)" id="btnPesan" class="btn-cta" onclick="validateAndGo(event)" style="padding: 16px 50px; font-size:16px; font-weight:800; letter-spacing:0.5px; background: var(--primary); border-radius: var(--radius-sm); color:#fff; box-shadow: var(--shadow-glow);">
            Konfirmasi & Pesan Tiket
        </a>
    </div>

</div><!-- /.detail-content -->

<script>
let tanggalTerpilih = '';
let jamTerpilih     = '';
const filmId = '<?= htmlspecialchars($film_id) ?>';

function selectDate(el, idx) {
    document.querySelectorAll('.chip-date').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    tanggalTerpilih = el.textContent.trim();

    // Tampilkan jam sesuai tanggal
    document.querySelectorAll('.chip-time').forEach(c => {
        c.classList.remove('active');
        c.classList.add('hidden');
    });
    const target = document.querySelectorAll('.date-group-' + idx);
    target.forEach((c, i) => {
        c.classList.remove('hidden');
        if (i === 0) {
            c.classList.add('active');
            jamTerpilih = c.textContent.trim().split(' ')[0];
            updateStudio(c.dataset.studio);
        }
    });
    updateBtn();
}

function selectTime(el, jam) {
    document.querySelectorAll('.chip-time').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    jamTerpilih = jam;
    updateStudio(el.dataset.studio);
    updateBtn();
}

function updateStudio(studio) {
    studio = studio || 'Studio 1';
    const activeStudio = document.getElementById('activeStudio');
    const activeStudioBadge = document.getElementById('activeStudioBadge');
    if (activeStudio) activeStudio.textContent = studio;
    if (activeStudioBadge) activeStudioBadge.textContent = studio;
}

function updateBtn() {
    const btn = document.getElementById('btnPesan');
    if (tanggalTerpilih && jamTerpilih) {
        btn.href = `/FILMKU_PHP/kursi.php?film=${encodeURIComponent(filmId)}&tanggal=${encodeURIComponent(tanggalTerpilih)}&jam=${encodeURIComponent(jamTerpilih)}`;
    }
}

function validateAndGo(e) {
    if (!tanggalTerpilih || !jamTerpilih) {
        e.preventDefault();
        alert('Silakan pilih Tanggal Tayang dan Jam Sesi terlebih dahulu!');
    }
}

// Auto-init chip pertama & Setup background trailer video (Catchplay+ Style)
document.addEventListener('DOMContentLoaded', () => {
    const firstDate = document.querySelector('.chip-date.active');
    const firstTime = document.querySelector('.chip-time.active');
    if (firstDate) tanggalTerpilih = firstDate.textContent.trim();
    if (firstTime) {
        jamTerpilih = firstTime.textContent.trim();
        updateStudio(firstTime.dataset.studio);
    }
    updateBtn();

    // ── YouTube Trailer Player for Detail Page ──
    const hero = document.getElementById('detailsHero');
    if (!hero) return;

    const url = hero.getAttribute('data-trailer-url');
    if (!url) return;

    function getYouTubeId(url) {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }

    const ytId = getYouTubeId(url);
    if (!ytId) return;

    // Tunggu 3 detik sebelum autoplay video trailer
    setTimeout(() => {
        const playerBg = document.getElementById('detailsYtPlayer');
        if (playerBg) {
            playerBg.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&modestbranding=1&fs=0&autohide=1&enablejsapi=1" 
                        allow="autoplay; encrypted-media" 
                        tabindex="-1"
                        aria-hidden="true">
                </iframe>
            `;
            hero.classList.add('video-playing');
        }
    }, 3000);

    // Mute/Unmute toggle handler
    const muteBtn = document.getElementById('detailMuteBtn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const iframe = document.querySelector('#detailsYtPlayer iframe');
            if (!iframe) return;

            const isMuted = muteBtn.getAttribute('data-muted') !== 'false';
            const muteIcon = muteBtn.querySelector('.mute-svg');
            const unmuteIcon = muteBtn.querySelector('.unmute-svg');

            if (isMuted) {
                // Unmute
                iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'unMute'}), '*');
                muteBtn.setAttribute('data-muted', 'false');
                if (muteIcon) muteIcon.style.display = 'none';
                if (unmuteIcon) unmuteIcon.style.display = 'block';
            } else {
                // Mute
                iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'mute'}), '*');
                muteBtn.setAttribute('data-muted', 'true');
                if (muteIcon) muteIcon.style.display = 'block';
                if (unmuteIcon) unmuteIcon.style.display = 'none';
            }
        });
    }

    // click event expand MORE synopsis
    const moreTrigger = document.getElementById('moreTrigger');
    if (moreTrigger) {
        moreTrigger.addEventListener('click', () => {
            const shortEl = document.getElementById('synopsisShort');
            const fullEl = document.getElementById('synopsisFull');
            if (shortEl) shortEl.style.display = 'none';
            if (fullEl) fullEl.style.display = 'block';
        });
    }

    // Toggle Watchlist AJAX
    const btnWatchlist = document.getElementById('btnWatchlist');
    if (btnWatchlist) {
        btnWatchlist.addEventListener('click', () => {
            const filmId = btnWatchlist.getAttribute('data-film');
            const isActive = btnWatchlist.classList.contains('active');
            const action = isActive ? 'remove' : 'add';

            const formData = new FormData();
            formData.append('action', action);
            formData.append('film_id', filmId);

            fetch('/FILMKU_PHP/api_watchlist.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    btnWatchlist.classList.toggle('active');
                } else if (data.message === 'Belum login') {
                    alert('Silakan login terlebih dahulu untuk menambahkan ke Wishlist.');
                    window.location.href = '/FILMKU_PHP/login.php';
                } else {
                    console.error(data.message);
                }
            })
            .catch(err => console.error(err));
        });
    }
});
</script>

<!-- JSON-LD Semantic SEO (Schema.org Movie + Person sameAs) -->
<script type="application/ld+json">
<?= json_encode([
    '@context'        => 'https://schema.org',
    '@type'           => 'Movie',
    'name'            => $judul,
    'image'           => get_poster_url($poster),
    'description'     => $sinopsis,
    'director'        => $json_ld_director,
    'actor'           => $json_ld_actors,
    'aggregateRating' => [
        '@type'       => 'AggregateRating',
        'ratingValue' => $rating,
        'bestRating'  => '10',
        'ratingCount' => '1500',
    ],
], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) ?>
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
