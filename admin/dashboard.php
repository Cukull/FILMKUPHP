<?php
// ============================================================
//  FILMKU — Admin Dashboard
// ============================================================
$page_title = 'Dashboard Admin';
$active_nav = 'admin';

// Gunakan path absolut untuk require agar tidak error saat dipanggil dari subfolder
require_once __DIR__ . '/../config/sparql.php';

session_start();
if (empty($_SESSION['user_name']) || $_SESSION['current_role'] !== 'admin') {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

// Hitung total film
$res_film = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT (COUNT(?film) AS ?total) WHERE { ?film a f:Film . }
");
$total_film = get_bindings($res_film ?? [])[0]['total']['value'] ?? 0;

// Hitung total kursi terjual
$res_kursi = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT (COUNT(?kursi) AS ?total) WHERE { 
        ?kursi a f:Kursi ; 
               f:status \"Terisi\" . 
    }
");
$total_kursi = get_bindings($res_kursi ?? [])[0]['total']['value'] ?? 0;

// Hitung total user
$res_user = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT (COUNT(?user) AS ?total) WHERE { ?user a f:Pengguna . }
");
$total_user = get_bindings($res_user ?? [])[0]['total']['value'] ?? 0;

// Include header dari root
require_once __DIR__ . '/../includes/header.php';
?>

<div class="main-layout" style="padding-top: 40px;">
    <!-- Sidebar Admin -->
    <aside class="sidebar-right" style="width: 250px;">
        <div class="sidebar-card" style="padding: 10px 0;">
            <div style="padding: 10px 20px; font-weight: 800; font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Menu Admin</div>
            <a href="/FILMKU_PHP/admin/dashboard.php" class="nav-link active" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid var(--primary);">
                📊 Ringkasan
            </a>
            <a href="/FILMKU_PHP/admin/kelola_film.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                🎬 Kelola Film
            </a>
            <a href="/FILMKU_PHP/admin/kelola_kategori_fnb.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                🏷️ Kelola Kategori F&B
            </a>
            <a href="/FILMKU_PHP/admin/kelola_fnb.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                🍿 Kelola Menu F&B
            </a>
        </div>
    </aside>

    <!-- Konten Dashboard -->
    <div class="content-area">
        <h1 class="section-title-main" style="margin-bottom: 8px;">Dashboard Admin</h1>
        <p style="color: var(--text-muted); margin-bottom: 28px;">Selamat datang kembali, Admin. Berikut adalah ringkasan data FILMKU.</p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <!-- Card Film -->
            <div class="sidebar-card" style="display:flex; align-items:center; gap:20px;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); display:flex; align-items:center; justify-content:center; font-size: 24px;">
                    🎬
                </div>
                <div>
                    <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Total Film</div>
                    <div style="font-size: 28px; font-weight: 900; color: var(--text-primary);"><?= $total_film ?></div>
                </div>
            </div>

            <!-- Card Kursi Terjual -->
            <div class="sidebar-card" style="display:flex; align-items:center; gap:20px;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); display:flex; align-items:center; justify-content:center; font-size: 24px;">
                    🎟️
                </div>
                <div>
                    <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Kursi Terjual</div>
                    <div style="font-size: 28px; font-weight: 900; color: var(--text-primary);"><?= $total_kursi ?></div>
                </div>
            </div>

            <!-- Card Pengguna -->
            <div class="sidebar-card" style="display:flex; align-items:center; gap:20px;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display:flex; align-items:center; justify-content:center; font-size: 24px;">
                    👥
                </div>
                <div>
                    <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Pengguna</div>
                    <div style="font-size: 28px; font-weight: 900; color: var(--text-primary);"><?= $total_user ?></div>
                </div>
            </div>
        </div>

        <div class="sidebar-card">
            <div class="sidebar-card-title">💡 Tindakan Cepat</div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">Anda dapat menambah, mengubah, atau menghapus film yang sedang tayang.</p>
            <a href="/FILMKU_PHP/admin/kelola_film.php" class="btn-primary" style="display: inline-block; width: auto; padding: 10px 24px;">
                ⚙️ Pergi ke Kelola Film
            </a>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
