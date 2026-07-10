<?php
// ============================================================
//  FILMKU — Register: Redirect ke halaman Auth terpadu
//  Form register kini ada di login.php (Dual-Panel Sliding)
// ============================================================
session_start();

if (!empty($_SESSION['user_name'])) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

// Redirect ke halaman auth terpadu dengan panel register terbuka
header('Location: /FILMKU_PHP/login.php?mode=register');
exit;

require_once __DIR__ . '/config/sparql.php';

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama     = trim($_POST['nama']     ?? '');
    $email    = trim($_POST['email']    ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($nama && $email && $password) {
        // Cek email duplikat
        $email_safe = addslashes($email);
        $cek = sparql_query("
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            ASK { ?x f:email_pengguna \"$email_safe\" }
        ");

        if (get_boolean($cek ?? [])) {
            $error = 'Email sudah terdaftar. Silakan gunakan email lain.';
        } else {
            $user_id = 'User_Reg_' . rand(1000, 9999);
            $nama_safe     = addslashes($nama);
            $password_safe = addslashes($password);

            $ok = sparql_update("
                PREFIX f: <" . ONTOLOGY_PREFIX . ">
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                INSERT DATA {
                    f:$user_id rdf:type f:Pengguna ;
                               f:nama_pengguna \"$nama_safe\" ;
                               f:email_pengguna \"$email_safe\" ;
                               f:password \"$password_safe\" ;
                               f:role_akses \"Penonton\" ;
                               f:status_aktif \"Aktif\" .
                }
            ");

            if ($ok) {
                header('Location: /FILMKU_PHP/login.php?registered=1');
                exit;
            } else {
                $error = 'Gagal menyimpan data ke server. Coba lagi.';
            }
        }
    } else {
        $error = 'Harap isi semua field.';
    }
}

// Ambil 1 film secara acak/pertama untuk backdrop
$bg_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?poster ?sinopsis ?genre WHERE {
        ?film a f:Film ;
              f:judul ?judul ;
              f:poster_film ?poster .
        OPTIONAL { ?film f:sinopsis ?sinopsis . }
        OPTIONAL { ?film f:genre ?genre . }
    } LIMIT 1
");
$bg_films = get_bindings($bg_result ?? []);
$bg_film = !empty($bg_films) ? $bg_films[0] : null;

$page_title = 'Daftar';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar — FILMKU</title>
    <meta name="description" content="Buat akun FILMKU baru secara gratis.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/FILMKU_PHP/static/css/style.css">
    
    <style>
    /* Styling khusus Catchplay+ Auth Page */
    .auth-bg-wrapper {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 1;
    }
    .auth-bg-image {
        width: 100%; height: 100%;
        object-fit: cover;
        filter: brightness(0.4) contrast(1.1);
    }
    .auth-bg-gradient {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(to right, rgba(8,8,16,0.95) 30%, rgba(8,8,16,0.7) 60%, rgba(8,8,16,0.4) 100%),
                    linear-gradient(to top, rgba(8,8,16,1) 0%, rgba(8,8,16,0.5) 50%, rgba(8,8,16,0) 100%);
    }
    
    .auth-overlay-content {
        position: relative;
        z-index: 5;
        min-height: 100vh;
        display: flex;
        align-items: center;
        padding: 0 80px;
        justify-content: space-between;
    }
    
    .auth-left-card {
        background: rgba(18, 18, 29, 0.95);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 40px;
        width: 420px;
        backdrop-filter: blur(15px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.6);
    }
    
    .auth-right-info {
        flex: 1;
        margin-left: 100px;
        max-width: 600px;
        color: #fff;
    }
    .auth-right-info h2 {
        font-family: 'Montserrat', sans-serif;
        font-size: 42px;
        font-weight: 900;
        margin-bottom: 12px;
    }
    .auth-right-info .meta {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 20px;
    }
    .auth-right-info p {
        font-size: 15px;
        line-height: 1.7;
        color: var(--text-secondary);
        font-style: italic;
    }
    
    .header-logo-top {
        position: absolute;
        top: 30px; left: 80px;
        z-index: 10;
    }
    .header-logo-top img {
        height: 38px;
    }
    
    @media (max-width: 900px) {
        .auth-right-info {
            display: none;
        }
        .auth-overlay-content {
            justify-content: center;
            padding: 0 20px;
        }
        .auth-left-card {
            width: 100%;
            max-width: 420px;
        }
        .header-logo-top {
            left: 20px;
        }
    }
    </style>
</head>
<body style="background: #080810;">

    <!-- Logo Kiri Atas -->
    <div class="header-logo-top">
        <a href="/FILMKU_PHP/index.php">
            <img src="/FILMKU_PHP/static/images/logo.png" alt="FILMKU">
        </a>
    </div>

    <!-- Background Backdrop (Catchplay-Style) -->
    <div class="auth-bg-wrapper">
        <img class="auth-bg-image" src="<?= $bg_film ? htmlspecialchars(get_poster_url($bg_film['poster']['value'])) : '/FILMKU_PHP/static/images/poster/default.jpg' ?>" alt="Backdrop">
        <div class="auth-bg-gradient"></div>
    </div>

    <div class="auth-overlay-content">
        
        <!-- Kiri: Floating Card -->
        <div class="auth-left-card">
            <h1 class="auth-title" style="font-size: 26px; margin-bottom: 20px; font-family: 'Montserrat', sans-serif;">Daftar Akun</h1>
            
            <?php if ($error): ?>
            <div class="alert-error" style="margin-bottom: 20px;">
                <span>⚠️</span>
                <?= htmlspecialchars($error) ?>
            </div>
            <?php endif; ?>

            <form action="/FILMKU_PHP/register.php" method="POST" id="regForm" novalidate>
                <div class="form-group">
                    <label for="nama" style="font-size:12px; color:var(--text-secondary);">Nama Lengkap</label>
                    <input
                        type="text"
                        id="nama"
                        name="nama"
                        class="form-control"
                        placeholder="Masukkan nama Anda"
                        value="<?= htmlspecialchars($_POST['nama'] ?? '') ?>"
                        required
                        style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.12);"
                    >
                </div>

                <div class="form-group">
                    <label for="email" style="font-size:12px; color:var(--text-secondary);">Alamat Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        class="form-control"
                        placeholder="contoh@email.com"
                        value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
                        required
                        style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.12);"
                    >
                </div>

                <div class="form-group">
                    <label for="password" style="font-size:12px; color:var(--text-secondary);">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        class="form-control"
                        placeholder="Masukkan password"
                        required
                        style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.12);"
                    >
                </div>

                <button type="submit" class="btn-primary" id="regBtn" style="width: 100%; padding: 12px; font-size:14px; background:var(--primary); font-weight:700;">
                    Daftar Sekarang
                </button>
            </form>

            <p class="auth-link-row" style="text-align: center; margin-top: 18px; font-size: 13px;">
                Sudah punya akun?
                <a href="/FILMKU_PHP/login.php" style="color: var(--primary); font-weight:700;">Masuk disini</a>
            </p>
        </div>

        <!-- Kanan: Film Info -->
        <div class="auth-right-info">
            <?php if ($bg_film): ?>
                <span class="hero-tag">🎬 POPULER HARI INI</span>
                <h2><?= htmlspecialchars($bg_film['judul']['value']) ?></h2>
                <div class="meta">⭐ 9.5  /  <?= htmlspecialchars($bg_film['genre']['value'] ?? 'Action') ?></div>
                <p>" <?= htmlspecialchars($bg_film['sinopsis']['value'] ?? 'Sinopsis film terpilih.') ?> " - Catatan Editor</p>
            <?php else: ?>
                <h2>FILMKU</h2>
                <p>Nikmati bioskop kelas dunia dari genggaman Anda.</p>
            <?php endif; ?>
        </div>

    </div>

    <script>
    document.getElementById('regForm').addEventListener('submit', function() {
        const btn = document.getElementById('regBtn');
        btn.textContent = '⏳ Menyimpan...';
        btn.disabled = true;
    });
    </script>

</body>
</html>
