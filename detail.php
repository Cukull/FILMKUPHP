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
    SELECT ?judul ?poster ?sinopsis ?durasi ?genre ?rating ?tanggal ?jam ?studio ?trailer ?rotten ?meta WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL { f:$film_id_safe f:poster_film ?poster . }
        OPTIONAL { f:$film_id_safe f:sinopsis    ?sinopsis . }
        OPTIONAL { f:$film_id_safe f:durasi      ?durasi . }
        OPTIONAL { f:$film_id_safe f:genre       ?genre . }
        OPTIONAL { f:$film_id_safe f:rating_film ?rating . }
        OPTIONAL { f:$film_id_safe f:trailer_film ?trailer . }
        OPTIONAL { f:$film_id_safe f:ratingRottenTomatoes ?rotten . }
        OPTIONAL { f:$film_id_safe f:ratingMetacritic ?meta . }
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
$rt_db     = $film['rotten']['value']   ?? null;
$meta_db   = $film['meta']['value']     ?? null;

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
$omdb_rt = $rt_db ?? 'N/A';
$omdb_mc = $meta_db ?? 'N/A';

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
            
            // Konversi Rating TMDB (skala 10) menjadi % untuk Rotten Tomatoes & Metacritic sebagai placeholder visual jika di DB kosong
            $tmdb_score = $search_data['results'][0]['vote_average'];
            if (!$rt_db) $omdb_rt = round($tmdb_score * 10) . '%';
            if (!$meta_db) $omdb_mc = round($tmdb_score * 10);
            
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

// ── Cinema Info Metadata ────────────────────────────────────

// Durasi: "120 menit" / "120" / "2h 0m" → "2j 0m"
function format_durasi_cinema($d) {
    $d = trim($d);
    // Sudah format "Xj Ym" atau "Xh Ym"
    if (preg_match('/(\d+)\s*[jh]\s*(\d+)\s*m/i', $d, $m)) return $m[1].'j '.$m[2].'m';
    // Menit saja: "120 menit" / "120"
    $min = (int) preg_replace('/[^0-9]/', '', $d);
    if ($min <= 0) return $d;
    return floor($min/60).'j '.($min%60).'m';
}
$durasi_fmt = format_durasi_cinema($durasi);

// Format tayang: kumpulkan studio unik dari jadwal_grouped
$studios_flat = [];
foreach ($jadwal_grouped as $sesi)
    foreach ($sesi as $s) $studios_flat[] = strtolower($s['studio']);

$formats_avail = [];
if (array_filter($studios_flat, fn($s) => str_contains($s,'imax')))            $formats_avail[] = ['label'=>'IMAX',        'bg'=>'#0ea5e9','fg'=>'#fff'];
if (array_filter($studios_flat, fn($s) => str_contains($s,'dolby')))           $formats_avail[] = ['label'=>'Dolby Atmos', 'bg'=>'#8b5cf6','fg'=>'#fff'];
if (array_filter($studios_flat, fn($s) => str_contains($s,'premiere')||str_contains($s,'premier')))
                                                                                 $formats_avail[] = ['label'=>'Premiere',    'bg'=>'#f59e0b','fg'=>'#000'];
if (array_filter($studios_flat, fn($s) => preg_match('/studio|\b2d\b/', $s))) $formats_avail[] = ['label'=>'2D',          'bg'=>'rgba(255,255,255,0.1)','fg'=>'#fff'];
if (empty($formats_avail))                                                       $formats_avail[] = ['label'=>'2D',          'bg'=>'rgba(255,255,255,0.1)','fg'=>'#fff'];

// Jadwal range
$tgl_labels   = array_keys($jadwal_grouped);
$jadwal_range = !empty($tgl_labels)
    ? $tgl_labels[0] . ' &ndash; ' . end($tgl_labels)
    : 'Lihat jadwal';

// Rating usia (berdasarkan genre)
$gl = strtolower($genre);
if (str_contains($gl,'horror')||str_contains($gl,'thriller')) {
    $rating_usia = '17+'; $usia_bg = '#ef4444'; $usia_fg = '#fff';
} elseif (str_contains($gl,'animation')||str_contains($gl,'family')||str_contains($gl,'comedy')) {
    $rating_usia = 'SU';  $usia_bg = '#22c55e'; $usia_fg = '#fff';
} else {
    $rating_usia = '13+'; $usia_bg = '#f97316'; $usia_fg = '#fff';
}

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
                <a href="#pilihJadwal" class="btn-play cta-button-magnetic" data-magnetic="true" style="background: var(--primary); font-weight:700; font-size: 11.5px; padding: 8px 18px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; height: 34px;">
                    <span class="magnetic-text">Pilih Sesi Tayang</span>
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

            <div id="synopsisContainer" class="synopsis" style="margin-top: 10px; position: relative; max-width: 900px; overflow: hidden;">
                <?php if (strlen($sinopsis) > 160): ?>
                    <p id="synopsisShort" style="font-size: 13.5px; line-height: 1.65; color: #cbd5e1; font-weight: 500; margin-bottom: 0;">
                        <?= htmlspecialchars(mb_strimwidth($sinopsis, 0, 160)) ?>... 
                        <span id="moreTrigger" style="color: #fff; font-weight: 800; cursor: pointer; text-decoration: none; margin-left: 5px;">MORE</span>
                    </p>
                    <p id="synopsisFull" style="display: none; font-size: 13.5px; line-height: 1.65; color: #cbd5e1; font-weight: 500; margin-bottom: 0;">
                        <?= htmlspecialchars($sinopsis) ?>
                        <span id="lessTrigger" style="color: #fff; font-weight: 800; cursor: pointer; text-decoration: none; margin-left: 5px;">LESS</span>
                    </p>
                <?php else: ?>
                    <p style="font-size: 13.5px; line-height: 1.65; color: #cbd5e1; font-weight: 500; margin-bottom: 0;">
                        <?= htmlspecialchars($sinopsis) ?>
                    </p>
                <?php endif; ?>
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

<!-- ══════════════════════════════════════════════════════
     CINEMA INFO STRIP — Info ringkas "bioskop-ready"
     ══════════════════════════════════════════════════════ -->
<style>
.cinema-info-section {
    /* In grid layout, no max-width/margin needed – handled by wrapper */
    width: 100%;
}
.cinema-info-title {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.cinema-info-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
}

/* Grid info cards: 2 kolom eksplisit */
.cinema-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

/* Layout wrapper: info (kiri) + booking (kanan) */
.detail-layout-grid {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: 28px;
    max-width: 1240px;
    margin: 20px auto 0;
    padding: 0 40px;
    align-items: start;
}

/* Past showtime chips */
.chip-time.past {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
    position: relative;
}
.chip-time.past .ct-time {
    text-decoration: line-through;
    color: rgba(255,255,255,0.35);
}
.chip-time.past::after {
    content: 'Sudah lewat';
    position: absolute;
    bottom: 5px;
    left: 50%; transform: translateX(-50%);
    font-size: 8px;
    font-weight: 700;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.3px;
    white-space: nowrap;
}
.info-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px 16px;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
    overflow: hidden;
}
.info-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(229,9,20,0.04) 0%, transparent 60%);
    pointer-events: none;
}
.info-card:hover {
    border-color: rgba(229,9,20,0.25);
    background: rgba(229,9,20,0.04);
}
.info-card-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
}
.info-card-value {
    font-size: 13.5px;
    font-weight: 700;
    color: #fff;
    line-height: 1.4;
}

/* Format badges */
.format-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 2px;
}
.format-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.3px;
    line-height: 1;
}

/* Rating usia badge */
.rating-usia-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -0.5px;
}

/* Jadwal range style */
.jadwal-range {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
    line-height: 1.5;
}
.jadwal-range strong {
    color: var(--primary);
    font-weight: 800;
}

/* Durasi row */
.durasi-display {
    display: flex;
    align-items: baseline;
    gap: 3px;
}
.durasi-num  { font-size: 22px; font-weight: 900; color: #fff; }
.durasi-unit { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.45); }

/* Bahasa flags */
.lang-flag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
}
.lang-flag + .lang-flag { margin-top: 4px; }
.flag-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>

<!-- ══ MAIN LAYOUT GRID: Info (left) + Booking (right) ══ -->
<div class="detail-layout-grid">

<section class="cinema-info-section" aria-label="Informasi Penayangan">
    <div class="cinema-info-title">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Info Penayangan
    </div>

    <div class="cinema-info-grid">

        <!-- Format Tayang -->
        <div class="info-card">
            <div class="info-card-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="2" y="2" width="20" height="20" rx="2"/>
                    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>
                </svg>
                Format
            </div>
            <div class="format-badges">
                <?php foreach ($formats_avail as $f): ?>
                <span class="format-badge"
                      style="background:<?= $f['bg'] ?>;color:<?= $f['fg'] ?>">
                    <?= htmlspecialchars($f['label']) ?>
                </span>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Rating Usia -->
        <div class="info-card" style="display:flex;align-items:center;gap:14px;">
            <div style="flex:1;">
                <div class="info-card-label">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Rating Usia
                </div>
                <div class="info-card-value" style="color:<?= $usia_bg ?>;">
                    <?= htmlspecialchars($rating_usia) ?>
                    <span style="font-size:11px;color:rgba(255,255,255,0.3);font-weight:500;margin-left:3px;">
                        <?php
                        $usia_label = match($rating_usia) {
                            '17+' => 'Dewasa',
                            'SU'  => 'Semua Umur',
                            default => 'Remaja'
                        };
                        echo $usia_label;
                        ?>
                    </span>
                </div>
            </div>
            <div class="rating-usia-badge"
                 style="background:<?= $usia_bg ?>20;border:2px solid <?= $usia_bg ?>;color:<?= $usia_bg ?>;">
                <?= htmlspecialchars($rating_usia) ?>
            </div>
        </div>

        <!-- Durasi -->
        <div class="info-card">
            <div class="info-card-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                Durasi
            </div>
            <?php
            // Parse kembali untuk split angka & satuan
            preg_match('/(\d+)j(?:\s*(\d+)m)?/', $durasi_fmt, $dp);
            $d_jam = $dp[1] ?? '';
            $d_min = $dp[2] ?? '';
            ?>
            <?php if ($d_jam !== ''): ?>
            <div class="durasi-display">
                <span class="durasi-num"><?= $d_jam ?></span><span class="durasi-unit">j</span>
                <?php if ($d_min !== ''): ?>
                <span class="durasi-num" style="margin-left:4px;"><?= $d_min ?></span><span class="durasi-unit">m</span>
                <?php endif; ?>
            </div>
            <?php else: ?>
            <div class="info-card-value"><?= htmlspecialchars($durasi_fmt) ?></div>
            <?php endif; ?>
        </div>

        <!-- Bahasa -->
        <div class="info-card">
            <div class="info-card-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Bahasa
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-top:2px;">
                <div class="lang-flag">
                    <span class="flag-dot" style="background:#3b82f6;"></span>
                    Inggris
                </div>
                <div class="lang-flag" style="opacity:0.55;">
                    <span class="flag-dot" style="background:#ef4444;"></span>
                    Indonesia (Dub)
                </div>
            </div>
        </div>

        <!-- Subtitle -->
        <div class="info-card">
            <div class="info-card-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Subtitle
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-top:2px;">
                <div class="lang-flag">
                    <span class="flag-dot" style="background:#ef4444;"></span>
                    Indonesia
                </div>
                <div class="lang-flag" style="opacity:0.55;">
                    <span class="flag-dot" style="background:#3b82f6;"></span>
                    English
                </div>
            </div>
        </div>

        <!-- Jadwal Tayang -->
        <div class="info-card" style="grid-column: span 2;">
            <div class="info-card-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Jadwal Tayang
            </div>
            <div class="jadwal-range">
                <?= $jadwal_range ?>
                <span style="display:inline-flex;align-items:center;gap:4px;margin-left:10px;
                            background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);
                            color:#22c55e;font-size:10px;font-weight:700;padding:2px 8px;
                            border-radius:100px;letter-spacing:0.4px;">
                    <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;
                                 box-shadow:0 0 6px #22c55e;animation:pulse-dot 1.5s infinite;"></span>
                    SEDANG TAYANG
                </span>
            </div>
        </div>

    </div><!-- /cinema-info-grid -->
</section><!-- /cinema-info-section -->

<style>
@keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.4); }
}
</style>

<div class="detail-content" style="padding-top: 0;" id="pilihJadwal">

    <!-- Booking Card – redesigned -->
    <div class="booking-card" style="margin-bottom: 40px;">

        <!-- ── Pilih Tanggal ── -->
        <div class="booking-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Pilih Tanggal Tayang
        </div>
        <div class="date-chips-row">
            <?php if (empty($jadwal_grouped)): ?>
            <p style="color:var(--text-muted); font-size:14px; font-style:italic;">Belum ada jadwal tayang untuk film ini.</p>
            <?php else: ?>
            <?php $first_tgl = true; $idx = 0; foreach ($jadwal_grouped as $tgl => $list):
                // Parse: "Hari Ini, 11 Jul" → day="Hari Ini", num="11", mon="Jul"
                $parts    = explode(', ', $tgl, 2);
                $day_name = $parts[0] ?? $tgl;
                $date_str = $parts[1] ?? '';
                $dp       = explode(' ', $date_str);
                $day_num  = $dp[0] ?? '';
                $month    = $dp[1] ?? '';
            ?>
            <div class="chip-date <?= $first_tgl ? 'active' : '' ?>"
                 onclick="selectDate(this, <?= $idx ?>)"
                 data-tgl="<?= htmlspecialchars($tgl) ?>"
                 data-is-today="<?= $first_tgl ? '1' : '0' ?>">
                
                <span class="cd-day"><?= htmlspecialchars($day_name) ?></span>
                <span class="cd-num"><?= htmlspecialchars($day_num) ?></span>
                <span class="cd-mon"><?= htmlspecialchars($month) ?></span>
            </div>
            <?php $first_tgl = false; $idx++; endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- ── Pilih Jam ── -->
        <div style="height:1px;background:rgba(255,255,255,0.06);margin:8px 0 22px;"></div>
        <div class="booking-card-title" style="margin-top:0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Pilih Jam Sesi &amp; Lokasi Studio
        </div>
        <div class="time-chips-row">
            <?php $first_outer = true; $idx = 0; foreach ($jadwal_grouped as $tgl => $list):
                foreach ($list as $sesi):
                    $date_class  = 'date-group-' . $idx;
                    $show_class  = $first_outer ? '' : 'hidden';
                    $active_cls  = ($first_outer && $sesi === $list[0]) ? 'active' : '';

                    // ── Studio type for badge color ──
                    $studio_lc   = strtolower($sesi['studio']);
                    $studio_type = str_contains($studio_lc, 'imax') ? 'imax'
                                 : (str_contains($studio_lc, 'premiere') || str_contains($studio_lc, 'premier') ? 'premiere' : 'regular');

                    // ── Seat Availability (pseudo-random by jam + studio) ──
                    $total_seats  = 40;
                    $jam_hour     = (int) explode(':', $sesi['jam'])[0];
                    // Semakin sore/malam → makin penuh
                    $base_pct = match(true) {
                        $jam_hour <= 13 => 82,  // pagi  → banyak tersedia
                        $jam_hour <= 16 => 58,  // siang → sedang
                        $jam_hour <= 19 => 32,  // sore  → cukup penuh
                        default         => 14,  // malam → hampir penuh
                    };
                    // Sedikit variasi deterministik berdasarkan nama studio
                    $studio_mod  = (abs(crc32($sesi['studio'])) % 18) - 9;   // -9 … +9
                    $avail_pct   = max(5, min(95, $base_pct + $studio_mod));
                    $avail_seats = (int) round($total_seats * $avail_pct / 100);

                    if ($avail_pct >= 50) {
                        $avail_cls   = 'banyak';
                        $avail_label = 'Banyak Tersedia';
                    } elseif ($avail_pct >= 22) {
                        $avail_cls   = 'sedang';
                        $avail_label = 'Tersisa ' . $avail_seats . ' kursi';
                    } else {
                        $avail_cls   = 'terbatas';
                        $avail_label = 'Hampir Penuh!';
                    }
            ?>
            <div class="chip-time schedule-time schedule-time <?= $active_cls ?> <?= $show_class ?> <?= $date_class ?>"
                 onclick="selectTime(this, '<?= htmlspecialchars($sesi['jam']) ?>')"
                 data-studio="<?= htmlspecialchars($sesi['studio']) ?>"
                 data-studio-type="<?= $studio_type ?>">
                <span class="ct-time"><?= htmlspecialchars($sesi['jam']) ?></span>
                <span class="ct-studio"><?= htmlspecialchars($sesi['studio']) ?></span>
                <span class="seat-avail <?= $avail_cls ?>">
                    <span class="seat-avail-dot"></span>
                    <?= $avail_label ?>
                </span>
            </div>
            <?php endforeach; $first_outer = false; $idx++; endforeach; ?>
        </div>

    </div><!-- /booking-card -->

    <!-- OLD inline CTA removed – now using sticky bar below -->
    <div style="height: 80px;"></div><!-- spacer for sticky bar -->

</div><!-- /.detail-content -->
</div><!-- /.detail-layout-grid -->

<!-- ══════════════════════════════════════════════════════
     STICKY BAR — Konfirmasi & Pesan Tiket (fixed bottom)
     ══════════════════════════════════════════════════════ -->
<div class="detail-sticky-bar" id="detailStickyBar" aria-label="Pesan Tiket">
    <div class="detail-sticky-info">
        <div class="detail-sticky-film"><?= htmlspecialchars($judul) ?></div>
        <div class="detail-sticky-session" id="stickySession">
            Pilih tanggal &amp; jam tayang
        </div>
    </div>
    <a href="javascript:void(0)" id="btnPesanSticky"
       class="btn-pesan-sticky disabled cta-button-magnetic" data-magnetic="true"
       onclick="validateAndGo(event)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span class="magnetic-text">Konfirmasi &amp; Pesan Tiket</span>
    </a>
</div>

<script>
let tanggalTerpilih = '';
let jamTerpilih     = '';
let studioTerpilih  = '';
const filmId = '<?= htmlspecialchars($film_id) ?>';

// ── Update sticky bar session label ──
function updateStickyBar() {
    const bar     = document.getElementById('detailStickyBar');
    const sess    = document.getElementById('stickySession');
    const btnS    = document.getElementById('btnPesanSticky');

    if (tanggalTerpilih && jamTerpilih) {
        const url = `/FILMKU_PHP/kursi.php?film=${encodeURIComponent(filmId)}&tanggal=${encodeURIComponent(tanggalTerpilih)}&jam=${encodeURIComponent(jamTerpilih)}`;
        if (sess) sess.innerHTML = `<span>${tanggalTerpilih}</span> &nbsp;·&nbsp; <span>${jamTerpilih}</span>${studioTerpilih ? ' &nbsp;·&nbsp; ' + studioTerpilih : ''}`;
        if (btnS) { btnS.href = url; btnS.classList.remove('disabled'); }
        if (bar)  bar.classList.add('visible');
    } else {
        if (sess) sess.innerHTML = 'Pilih tanggal &amp; jam tayang';
        if (btnS) { btnS.href = 'javascript:void(0)'; btnS.classList.add('disabled'); }
        // Tetap visible setelah section booking terlihat
    }
}

function selectDate(el, idx) {
    document.querySelectorAll('.chip-date').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    tanggalTerpilih = el.dataset.tgl || el.textContent.trim().replace('TODAY','').trim();

    document.querySelectorAll('.chip-time').forEach(c => {
        c.classList.remove('active');
        c.classList.add('hidden');
    });
    const target = document.querySelectorAll('.date-group-' + idx);
    target.forEach((c, i) => {
        c.classList.remove('hidden');
        if (i === 0) {
            c.classList.add('active');
            jamTerpilih    = c.querySelector('.ct-time')?.textContent.trim() || c.textContent.trim().split(' ')[0];
            studioTerpilih = c.dataset.studio || '';
            updateStudio(studioTerpilih);
        }
    });
    disablePastTimes();
    updateStickyBar();
}

function selectTime(el, jam) {
    document.querySelectorAll('.chip-time').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    jamTerpilih    = jam;
    studioTerpilih = el.dataset.studio || '';
    updateStudio(studioTerpilih);
    updateStickyBar();
}

function updateStudio(studio) {
    studio = studio || '';
    studioTerpilih = studio;
    const activeStudio = document.getElementById('activeStudio');
    const activeStudioBadge = document.getElementById('activeStudioBadge');
    if (activeStudio) activeStudio.textContent = studio;
    if (activeStudioBadge) activeStudioBadge.textContent = studio;
}

function updateBtn() { updateStickyBar(); }

function validateAndGo(e) {
    e.preventDefault(); // selalu cegah default <a> agar tidak double-navigate
    if (!tanggalTerpilih || !jamTerpilih) {
        // Highlight booking card agar user tahu pilih dulu
        const bc = document.querySelector('.booking-card');
        if (bc) {
            bc.scrollIntoView({ behavior: 'smooth', block: 'center' });
            bc.style.outline = '2px solid var(--primary)';
            bc.style.outlineOffset = '4px';
            setTimeout(() => { bc.style.outline = ''; bc.style.outlineOffset = ''; }, 1500);
        }
    } else {
        window.location.assign(`/FILMKU_PHP/kursi.php?film=${encodeURIComponent(filmId)}&tanggal=${encodeURIComponent(tanggalTerpilih)}&jam=${encodeURIComponent(jamTerpilih)}`);
    }
}

// ── Disable past showtimes (today only) ──
function disablePastTimes() {
    const activeDateChip = document.querySelector('.chip-date.active');
    const isToday = activeDateChip?.dataset.isToday === '1';

    // Tanggal bukan hari ini: pastikan semua chip aktif kembali
    if (!isToday) {
        document.querySelectorAll('.chip-time:not(.hidden)').forEach(c => {
            c.classList.remove('past');
            const jam = c.querySelector('.ct-time')?.textContent.trim() || '';
            c.setAttribute('onclick', `selectTime(this,'${jam}')`);
        });
        return;
    }

    const now    = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let firstValidChip = null;

    document.querySelectorAll('.chip-time').forEach(chip => {
        const timeText = chip.querySelector('.ct-time')?.textContent.trim() || '';
        const [h, m]   = timeText.split(':').map(Number);
        const chipMin  = h * 60 + (m || 0);

        if (chipMin <= nowMin) {
            chip.classList.add('past');
            chip.setAttribute('onclick', 'return false;');
        } else {
            chip.classList.remove('past');
            chip.setAttribute('onclick', `selectTime(this,'${timeText}')`);
            if (!chip.classList.contains('hidden') && !firstValidChip) firstValidChip = chip;
        }
    });

    // Jika waktu aktif sudah lewat, auto-pilih yang pertama valid
    const activeTime = document.querySelector('.chip-time.active:not(.hidden)');
    if (activeTime?.classList.contains('past')) {
        activeTime.classList.remove('active');
        if (firstValidChip) {
            firstValidChip.classList.add('active');
            jamTerpilih    = firstValidChip.querySelector('.ct-time')?.textContent.trim() || '';
            studioTerpilih = firstValidChip.dataset.studio || '';
            updateStudio(studioTerpilih);
        } else {
            jamTerpilih = '';
            studioTerpilih = '';
        }
        updateStickyBar();
    }
}

// Auto-init chip pertama & Setup background trailer video (Catchplay+ Style)
document.addEventListener('DOMContentLoaded', () => {
    const firstDate = document.querySelector('.chip-date.active');
    const firstTime = document.querySelector('.chip-time.active');
    if (firstDate) {
        tanggalTerpilih = firstDate.dataset.tgl || firstDate.textContent.replace('TODAY','').trim();
    }
    if (firstTime) {
        jamTerpilih    = firstTime.querySelector('.ct-time')?.textContent.trim() || firstTime.textContent.trim();
        studioTerpilih = firstTime.dataset.studio || '';
        updateStudio(studioTerpilih);
    }
    updateStickyBar();
    disablePastTimes(); // cek jam sudah lewat untuk hari ini

    // ── Sticky bar: muncul saat section booking terlihat ──
    const bookingSection = document.querySelector('.booking-card');
    const stickyBar = document.getElementById('detailStickyBar');
    if (bookingSection && stickyBar) {
        const stickyObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) stickyBar.classList.add('visible');
            });
        }, { threshold: 0.1 });
        stickyObserver.observe(bookingSection);
    }

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

    let videoLoaded = false;

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
            videoLoaded = true;
        }
    }, 3000);

    // ── AUTO-PAUSE saat hero scroll keluar viewport ──
    const videoPauseObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!videoLoaded) return;
            const iframe = document.querySelector('#detailsYtPlayer iframe');
            if (!iframe) return;
            const fn = entry.isIntersecting ? 'playVideo' : 'pauseVideo';
            try {
                iframe.contentWindow.postMessage(
                    JSON.stringify({ event: 'command', func: fn, args: [] }), '*'
                );
            } catch(err) {}
        });
    }, { threshold: 0.15 });
    videoPauseObserver.observe(hero);

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

<script src="/FILMKU_PHP/assets/js/animations/jadwal-cards.js"></script>
<script src="/FILMKU_PHP/assets/js/animations/synopsis-expand.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initJadwalCardsAnimation === 'function') {
        initJadwalCardsAnimation();
    }
    if (typeof initSynopsisExpand === 'function') {
        initSynopsisExpand();
    }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
