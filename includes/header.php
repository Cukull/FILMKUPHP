<?php
// ============================================================
//  FILMKU — Header Include (Navbar + HTML Head)
//  Dipanggil di awal setiap halaman PHP
//  Param: $page_title (string) — judul tab browser
//         $active_nav (string) — 'beranda'|'admin' untuk highlight menu
// ============================================================
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Guard: pastikan user sudah login, kecuali di halaman auth
$public_pages = ['login', 'register', 'index', 'detail'];
$current_page = basename($_SERVER['PHP_SELF'], '.php');

if (!in_array($current_page, $public_pages) && empty($_SESSION['user_name'])) {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

// Shorthand session vars
$user_name = $_SESSION['user_name'] ?? '';
$user_role = $_SESSION['current_role'] ?? 'user';
$user_initial = strtoupper(mb_substr($user_name, 0, 1));

$page_title  = $page_title  ?? 'FILMKU';
$active_nav  = $active_nav  ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title) ?> — FILMKU</title>
    <meta name="description" content="FILMKU — Platform pemesanan tiket bioskop modern berbasis Semantic Web.">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">

    <!-- AOS Animation CSS -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <!-- Main CSS -->
    <link rel="stylesheet" href="/FILMKU_PHP/static/css/style.css">
</head>
<body>

<!-- GSAP Splash Screen -->
<div id="filmku-loader">
    <div class="filmku-progress"></div>
    <div class="filmku-logo-text">
        <span>F</span><span>I</span><span>L</span><span>M</span><span>K</span><span>U</span>
    </div>
</div>

<div class="app-wrapper">

    <!-- Overlay untuk menutup sidebar jika diklik di luar -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Sidebar Kiri (Collapsible) -->
    <aside class="app-sidebar" id="appSidebar">
        <div class="sidebar-brand">
            <a href="/FILMKU_PHP/index.php">
                <img src="/FILMKU_PHP/static/images/logo.png" alt="FILMKU">
            </a>
        </div>

        <div class="sidebar-nav-group">
            <div class="sidebar-nav-title">Menu Utama</div>
            <nav class="sidebar-nav">
                <a href="/FILMKU_PHP/index.php" class="nav-link <?= ($active_nav === 'beranda') ? 'active' : '' ?>">
                    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Beranda
                </a>
                <a href="/FILMKU_PHP/community.php" class="nav-link <?= ($active_nav === 'community') ? 'active' : '' ?>">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Cine-Community
                </a>
                <a href="/FILMKU_PHP/genre.php" class="nav-link <?= ($active_nav === 'genre') ? 'active' : '' ?>">
                    <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                    Genre
                </a>
            </nav>
        </div>

        <?php if ($user_name && $user_role === 'admin'): ?>
        <div class="sidebar-nav-group">
            <div class="sidebar-nav-title">Admin Panel</div>
            <nav class="sidebar-nav">
                <a href="/FILMKU_PHP/admin/dashboard.php" class="nav-link <?= ($active_nav === 'admin') ? 'active' : '' ?>">
                    <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    Dashboard
                </a>
            </nav>
        </div>
        <?php endif; ?>
    </aside>

    <!-- Main Content Area -->
    <main class="app-main">

        <?php 
        $current_page = basename($_SERVER['PHP_SELF'], '.php');
        $is_transparent_page = in_array($current_page, ['index', 'detail']); 
        ?>
        <header class="app-header <?= $is_transparent_page ? 'header-transparent' : '' ?>">
            <div class="header-left">
                <!-- Hamburger Button -->
                <button class="menu-toggle-btn" id="sidebarToggle" aria-label="Toggle Menu">
                    <svg viewBox="0 0 24 24">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <!-- Mini Logo for Header -->
                <a href="/FILMKU_PHP/index.php" style="display: flex; align-items: center;">
                    <img src="/FILMKU_PHP/static/images/logo.png" alt="FILMKU" style="height: 30px; width: auto; filter: drop-shadow(0 0 10px rgba(229,9,20,0.5));">
                </a>

                <!-- Horizontal Navigation Menu (Catchplay+ Style) -->
                <nav class="header-nav" style="display: flex; gap: 24px; margin-left: 36px; align-items: center;">
                    <a href="/FILMKU_PHP/index.php" class="header-nav-link <?= ($current_page === 'index') ? 'active' : '' ?>" style="color: <?= ($current_page === 'index') ? '#fff' : 'rgba(255,255,255,0.6)' ?>; font-size: 13.5px; font-weight: <?= ($current_page === 'index') ? '700' : '600' ?>; text-decoration: none; transition: var(--transition);">Beranda</a>
                    <a href="/FILMKU_PHP/community.php" class="header-nav-link <?= ($current_page === 'community') ? 'active' : '' ?>" style="color: <?= ($current_page === 'community') ? '#fff' : 'rgba(255,255,255,0.6)' ?>; font-size: 13.5px; font-weight: <?= ($current_page === 'community') ? '700' : '600' ?>; text-decoration: none; transition: var(--transition);">Cine-Community</a>
                    <a href="/FILMKU_PHP/index.php#wishlist-section" class="header-nav-link" style="color: rgba(255,255,255,0.6); font-size: 13.5px; font-weight: 600; text-decoration: none; transition: var(--transition);">Wishlist</a>
                    <a href="/FILMKU_PHP/genre.php" class="header-nav-link <?= ($current_page === 'genre') ? 'active' : '' ?>" style="color: <?= ($current_page === 'genre') ? '#fff' : 'rgba(255,255,255,0.6)' ?>; font-size: 13.5px; font-weight: <?= ($current_page === 'genre') ? '700' : '600' ?>; text-decoration: none; transition: var(--transition);">Genre</a>
                </nav>
            </div>

            <div class="header-right" style="display:flex; align-items:center; gap:16px;">
                <!-- Search Bar -->
                <div class="search-container expandable-search">
                    <form action="/FILMKU_PHP/index.php" method="GET" style="position:relative;">
                        <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="liveSearchInput" name="q" class="search-input" placeholder="Cari judul film..." autocomplete="off" value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
                    </form>
                    <!-- Live Search Results -->
                    <div id="liveSearchResults" class="search-dropdown hidden"></div>
                </div>

                <?php if ($user_name): ?>
                    <!-- Profile Dropdown (Netflix-Style) -->
                    <div class="profile-dropdown" id="profileDropdown">
                        <button class="profile-dropdown-btn">
                            <div class="user-avatar"><?= htmlspecialchars($user_initial) ?></div>
                            <span class="user-name"><?= htmlspecialchars(ucfirst($user_name)) ?></span>
                            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="profile-dropdown-menu">
                            <div class="dropdown-header-info">
                                <div class="name"><?= htmlspecialchars(ucfirst($user_name)) ?></div>
                                <span class="badge-role <?= ($user_role === 'admin') ? 'badge-admin' : 'badge-user' ?>">
                                    <?= ($user_role === 'admin') ? 'Admin' : 'Penonton' ?>
                                </span>
                            </div>
                            
                            <?php if ($user_role === 'admin'): ?>
                                <a href="/FILMKU_PHP/admin/dashboard.php" class="dropdown-item">
                                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                                    Panel Admin
                                </a>
                                <div class="dropdown-divider"></div>
                            <?php endif; ?>

                            <a href="/FILMKU_PHP/index.php#wishlist-section" class="dropdown-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                Daftar Tontonan
                            </a>

                            <a href="/FILMKU_PHP/histori.php" class="dropdown-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                Histori Tiket
                            </a>
                            <div class="dropdown-divider"></div>

                            <a href="/FILMKU_PHP/logout.php" class="dropdown-item" style="color: #fc6060;">
                                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Keluar (Logout)
                            </a>
                        </div>
                    </div>
                <?php else: ?>
                    <a href="/FILMKU_PHP/login.php" class="btn-nav-login">Masuk</a>
                <?php endif; ?>
            </div>
        </header>
