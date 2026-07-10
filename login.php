<?php
// ============================================================
//  FILMKU — Auth Page (Login + Register, Dual-Panel Sliding)
// ============================================================
session_start();

if (!empty($_SESSION['user_name'])) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

require_once __DIR__ . '/config/sparql.php';

$login_error      = '';
$register_error   = '';
$register_success = '';

// ── Proses Login ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'login') {
    $email    = trim($_POST['email']    ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($email && $password) {
        $es = addslashes($email);
        $ps = addslashes($password);
        $r  = sparql_query("
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            SELECT ?nama ?role WHERE {
                ?u a f:Pengguna ;
                   f:email_pengguna \"$es\" ;
                   f:password \"$ps\" ;
                   f:nama_pengguna ?nama ;
                   f:role_akses ?role .
            }
        ");
        $b = get_bindings($r ?? []);
        if (!empty($b)) {
            $_SESSION['user_name']    = $b[0]['nama']['value'];
            $_SESSION['current_role'] = in_array($b[0]['role']['value'], ['Super Admin','Admin']) ? 'admin' : 'user';
            header('Location: /FILMKU_PHP/index.php');
            exit;
        } else {
            $login_error = 'Email atau password salah.';
        }
    } else {
        $login_error = 'Harap isi semua field.';
    }
}

// ── Proses Register ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'register') {
    $nama     = trim($_POST['reg_nama']     ?? '');
    $email    = trim($_POST['reg_email']    ?? '');
    $password = trim($_POST['reg_password'] ?? '');

    if ($nama && $email && $password) {
        $es = addslashes($email);
        $cek = sparql_query("PREFIX f: <" . ONTOLOGY_PREFIX . "> ASK { ?x f:email_pengguna \"$es\" }");
        if (get_boolean($cek ?? [])) {
            $register_error = 'Email sudah terdaftar.';
        } else {
            $uid = 'User_Reg_' . rand(10000, 99999);
            $ns  = addslashes($nama);
            $pws = addslashes($password);
            $ok  = sparql_update("
                PREFIX f: <" . ONTOLOGY_PREFIX . ">
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                INSERT DATA {
                    f:$uid rdf:type f:Pengguna ;
                           f:nama_pengguna \"$ns\" ;
                           f:email_pengguna \"$es\" ;
                           f:password \"$pws\" ;
                           f:role_akses \"Penonton\" ;
                           f:status_aktif \"Aktif\" .
                }
            ");
            $register_success = $ok ? 'Akun berhasil dibuat! Silakan login.' : '';
            if (!$ok) $register_error = 'Gagal menyimpan, coba lagi.';
        }
    } else {
        $register_error = 'Harap isi semua field.';
    }
}

$open_register = (isset($_GET['mode']) && $_GET['mode'] === 'register') || !empty($register_error);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk & Daftar — FILMKU</title>
    <meta name="description" content="Login atau buat akun FILMKU untuk memesan tiket bioskop.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/FILMKU_PHP/static/css/style.css">

<style>
/* ============================================================
   AUTH PAGE — Dual Panel Sliding Card
   Struktur:
     Container (900px × 580px, overflow:hidden)
     ├─ .panel-form.left  → Form LOGIN  (0–450px, absolute)
     ├─ .panel-form.right → Form REGISTER (450–900px, absolute)
     └─ .panel-overlay    → Panel merah (geser kiri↔kanan via GSAP)
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #080810;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
    overflow: hidden;
}

/* ── Background WebGL Layer ── */
#side-rays-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: #080810;
}
.auth-vignette {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
        radial-gradient(ellipse 80% 60% at 60% 50%, transparent 0%, rgba(8,8,16,0.65) 100%),
        linear-gradient(to bottom, rgba(8,8,16,0.5) 0%, rgba(8,8,16,0.2) 100%);
}

/* ── Header: Hanya logo gambar, tidak ada teks duplikat ── */
.auth-header-logo {
    position: fixed;
    top: 24px;
    left: 36px;
    z-index: 200;
    text-decoration: none;
    display: block;
    line-height: 0;
}
.auth-header-logo img {
    height: 42px;           /* Diperbesar dari sebelumnya */
    width: auto;
    display: block;
    filter: drop-shadow(0 2px 10px rgba(229,9,20,0.35));
    transition: filter 0.2s, transform 0.2s;
}
.auth-header-logo:hover img {
    filter: drop-shadow(0 4px 14px rgba(229,9,20,0.55));
    transform: scale(1.03);
}

/* ── Kontainer Utama Card ── */
.auth-card {
    position: relative;
    z-index: 10;
    width: 900px;
    height: 580px;
    border-radius: 22px;
    /*
     * overflow:hidden WAJIB untuk efek sliding (menyembunyikan
     * panel yang di luar batas), namun kita pastikan input
     * di panel aktif tidak pernah tertimpa overlay.
     */
    overflow: hidden;
    box-shadow:
        0 0 0 1px rgba(255,255,255,0.06),
        0 24px 80px rgba(0,0,0,0.7),
        0 4px 24px rgba(0,0,0,0.4);
}

/* ─────────────────────────────────────────────────────────────
   PANEL FORM — Posisi absolut tetap, tidak bergerak.
   Overlay yang bergerak ke atas mereka.
   Setiap panel: 50% lebar container = 450px.
   z-index: 2 (di bawah overlay z-index:10)

   Interaksi:
   - Panel aktif (tidak ditutup overlay) → bisa diklik ✓
   - Panel tidak aktif (ditutup overlay) → tidak bisa diklik (ok)
   ───────────────────────────────────────────────────────────── */
.panel-form {
    position: absolute;
    top: 0;
    width: 50%;           /* 450px */
    height: 100%;
    z-index: 2;
    background: rgba(12, 12, 20, 0.98);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 38px;
    overflow-y: auto;
}

/* Panel login di kiri */
.panel-form.left  { left: 0; }

/* Panel register di kanan */
.panel-form.right { right: 0; }

/* ─────────────────────────────────────────────────────────────
   PANEL OVERLAY — Panel merah yang geser kiri↔kanan via GSAP.
   Posisi default: RIGHT side (menutup panel register).
   Geser ke LEFT untuk mode register (menutup panel login).

   Posisi:
   - Mode Login    → left: 50% (menutup register, right radius)
   - Mode Register → left: 0   (menutup login, left radius)
   ───────────────────────────────────────────────────────────── */
.panel-overlay {
    position: absolute;
    top: 0;
    left: 50%;            /* Default: di kanan (menutup register) */
    width: 50%;           /* 450px */
    height: 100%;
    z-index: 10;          /* Di atas kedua panel form */
    will-change: transform;  /* Hint GPU untuk GSAP */

    /* Layout konten overlay */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 44px 36px;

    /* Gradient merah sinematik */
    background: linear-gradient(145deg,
        #ff1a1a 0%,
        #cc0000 35%,
        #8B0000 70%,
        #1a0000 100%
    );

    /* Radius: sisi kanan saja (saat di posisi kanan) */
    border-radius: 0 22px 22px 0;
}

/* Efek film grain di overlay */
.panel-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    opacity: 0.2;
}

/* Konten di dalam overlay */
.overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    z-index: 1;
}

.overlay-icon {
    width: 52px;
    height: 52px;
    margin-bottom: 20px;
    color: rgba(255,255,255,0.88);
    flex-shrink: 0;
}

.overlay-heading {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 12px;
}

.overlay-body {
    font-size: 13px;
    color: rgba(255,255,255,0.68);
    line-height: 1.75;
    margin-bottom: 32px;
}

/* Tombol ghost overlay */
.btn-ghost {
    display: inline-block;
    padding: 11px 32px;
    border: 2px solid rgba(255,255,255,0.8);
    border-radius: 100px;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    background: transparent;
    transition: background 0.22s ease, border-color 0.22s ease, transform 0.18s ease;
    letter-spacing: 0.2px;
    will-change: transform;
}
.btn-ghost:hover {
    background: rgba(255,255,255,0.14);
    border-color: #fff;
    transform: scale(1.04);
}

/* ── Form Styling ── */

/* Logo FILMKU di atas judul form */
.form-logo {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    line-height: 0;
}
.form-logo img {
    height: 28px;
    width: auto;
    /* Fallback jika gambar gagal load */
}
/* Fallback teks jika logo gagal */
.form-logo-fallback {
    font-family: 'Montserrat', sans-serif;
    font-size: 17px;
    font-weight: 900;
    color: #E50914;
    letter-spacing: 1.5px;
    display: none; /* Disembunyikan default, ditampilkan via JS onerror */
}

.form-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 5px;
}

.form-subtitle {
    font-size: 12.5px;
    color: rgba(255,255,255,0.38);
    margin-bottom: 22px;
    line-height: 1.5;
}

/* Alert box */
.auth-alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 13px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
    margin-bottom: 14px;
}
.auth-alert svg { flex-shrink: 0; margin-top: 1px; }
.auth-alert.error   { background: rgba(229,9,20,0.1);  border: 1px solid rgba(229,9,20,0.28); color: #ff7070; }
.auth-alert.success { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.28); color: #6ee7b7; }

/* Field label + input */
.auth-field {
    margin-bottom: 13px;
}

.auth-field label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: rgba(255,255,255,0.36);
    letter-spacing: 0.7px;
    text-transform: uppercase;
    margin-bottom: 6px;
    user-select: none;
}

.auth-input {
    display: block;
    width: 100%;
    padding: 11px 14px;
    background: rgba(255,255,255,0.045);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    color: #f0f0f0;
    font-size: 13.5px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition:
        border-color 0.22s ease,
        background   0.22s ease,
        box-shadow   0.22s ease;
}
.auth-input::placeholder { color: rgba(255,255,255,0.18); }
.auth-input:focus {
    border-color: rgba(229,9,20,0.65);
    background: rgba(229,9,20,0.035);
    box-shadow: 0 0 0 3px rgba(229,9,20,0.1);
}

/* Tombol submit */
.btn-submit {
    display: block;
    width: 100%;
    padding: 12px 16px;
    background: #E50914;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 6px;
    position: relative;
    overflow: hidden;
    transition:
        background 0.22s ease,
        box-shadow  0.22s ease,
        transform   0.16s ease;
    letter-spacing: 0.2px;
}
.btn-submit:hover {
    background: #c0060f;
    box-shadow: 0 8px 24px rgba(229,9,20,0.42);
    transform: translateY(-1px);
}
/* Shimmer hover effect */
.btn-submit::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.13) 50%, transparent 65%);
    transform: translateX(-130%);
    transition: transform 0.5s ease;
}
.btn-submit:hover::after { transform: translateX(130%); }
.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Demo hint */
.demo-hint {
    margin-top: 15px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.022);
    border: 1px solid rgba(255,255,255,0.055);
    border-radius: 8px;
    font-size: 11px;
    color: rgba(255,255,255,0.28);
    line-height: 1.9;
}
.demo-hint strong {
    color: rgba(255,255,255,0.42);
    font-weight: 700;
}
.demo-hint code {
    color: #E50914;
    font-size: 10.5px;
    font-family: 'Courier New', monospace;
}

/* ── Responsive: mobile → stack vertikal ── */
@media (max-width: 940px) {
    .auth-card {
        width: calc(100vw - 24px);
        height: auto;
        border-radius: 16px;
        overflow: visible;   /* Stack vertikal, tidak perlu clip */
    }
    .panel-form {
        position: relative;
        width: 100%;
        left: auto; right: auto;
    }
    .panel-overlay { display: none; }
    .panel-form.right { display: none; }  /* Sembunyikan register di mobile default */
    .auth-header-logo img { height: 36px; }
}
</style>
</head>
<body class="auth-page">

<!-- Background WebGL (SideRays) -->
<div id="side-rays-bg"></div>
<div class="auth-vignette"></div>

<!--
    Header: HANYA logo gambar asli, tanpa teks "FILMKU" duplikat.
    Ukuran diperbesar ke 42px via CSS.
-->
<a href="/FILMKU_PHP/index.php" class="auth-header-logo" aria-label="Kembali ke Beranda FILMKU">
    <img src="/FILMKU_PHP/static/images/logo.png" alt="FILMKU Logo">
</a>

<!--
    ═══════════════════════════════════════════════════════════════
     AUTH CARD — 900px × 580px, overflow:hidden

     Posisi elemen di dalam card:
     ┌────────────────────┬─────────────────────┐
     │   PANEL LOGIN      │   PANEL REGISTER    │  ← z-index: 2
     │   (0 → 450px)      │   (450 → 900px)     │     (always here)
     ├────────────────────┴─────────────────────┤
     │   PANEL OVERLAY (merah)                  │  ← z-index: 10
     │   Mode Login    = right (450 → 900px)    │     (bergerak)
     │   Mode Register = left  (0   → 450px)    │
     └──────────────────────────────────────────┘

     Input di panel aktif selalu dapat diakses karena overlay
     berada di sisi yang BERLAWANAN dari panel aktif.
    ═══════════════════════════════════════════════════════════════
-->
<div class="auth-card" id="authCard">

    <!-- ══════════════════════════════════
         PANEL LOGIN — Kiri (z-index: 2)
         Posisi: 0px – 450px
         Aktif saat overlay ada di kanan
         ══════════════════════════════════ -->
    <div class="panel-form left" id="panelLogin">

        <!-- Logo asli FILMKU (bukan teks "FILMKU") -->
        <div class="form-logo">
            <img
                src="/FILMKU_PHP/static/images/logo.png"
                alt="FILMKU"
                style="height:28px; width:auto;"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            >
            <span class="form-logo-fallback">FILMKU</span>
        </div>

        <h1 class="form-title">Selamat Datang</h1>
        <p class="form-subtitle">Masuk untuk melanjutkan pengalaman bioskop Anda</p>

        <!-- Alert error login (dari PHP) -->
        <?php if ($login_error): ?>
        <div class="auth-alert error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <?= htmlspecialchars($login_error) ?>
        </div>
        <?php endif; ?>

        <!-- Form Login (POST ke diri sendiri) -->
        <form action="/FILMKU_PHP/login.php" method="POST" id="loginForm" novalidate>
            <input type="hidden" name="action" value="login">

            <!-- Field Email -->
            <div class="auth-field">
                <label for="l_email">
                    <!-- Icon: Mail (SVG) -->
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    Email
                </label>
                <input
                    type="email"
                    id="l_email"
                    name="email"
                    class="auth-input"
                    placeholder="nama@email.com"
                    value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
                    autocomplete="email"
                    required
                >
            </div>

            <!-- Field Password -->
            <div class="auth-field">
                <label for="l_password">
                    <!-- Icon: Lock (SVG) -->
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Password
                </label>
                <input
                    type="password"
                    id="l_password"
                    name="password"
                    class="auth-input"
                    placeholder="Masukkan password"
                    autocomplete="current-password"
                    required
                >
            </div>

            <button type="submit" class="btn-submit" id="btnLogin">Masuk</button>
        </form>

        <!-- Demo credentials -->
        <div class="demo-hint">
            <strong>
                <!-- Icon: Key (SVG) -->
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:3px;" aria-hidden="true">
                    <circle cx="7.5" cy="15.5" r="5.5"/>
                    <path d="m21 2-9.6 9.6"/>
                    <path d="m15.5 7.5 3 3L22 7l-3-3"/>
                </svg>
                Akun Demo:
            </strong><br>
            Admin: <code>angra@admin.com</code> / admin123<br>
            User: <code>syukur@gmail.com</code> / syukur123
        </div>
    </div><!-- /panel-login -->


    <!-- ══════════════════════════════════
         PANEL REGISTER — Kanan (z-index: 2)
         Posisi: 450px – 900px
         Aktif saat overlay ada di kiri
         ══════════════════════════════════ -->
    <div class="panel-form right" id="panelRegister">

        <!-- Logo asli FILMKU -->
        <div class="form-logo">
            <img
                src="/FILMKU_PHP/static/images/logo.png"
                alt="FILMKU"
                style="height:28px; width:auto;"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            >
            <span class="form-logo-fallback">FILMKU</span>
        </div>

        <h1 class="form-title">Buat Akun Baru</h1>
        <p class="form-subtitle">Gratis, mudah, dan langsung bisa memesan tiket</p>

        <!-- Alert error / success register (dari PHP) -->
        <?php if ($register_error): ?>
        <div class="auth-alert error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <?= htmlspecialchars($register_error) ?>
        </div>
        <?php endif; ?>

        <?php if ($register_success): ?>
        <div class="auth-alert success" role="status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <?= htmlspecialchars($register_success) ?>
        </div>
        <?php endif; ?>

        <!-- Form Register (POST ke diri sendiri) -->
        <form action="/FILMKU_PHP/login.php" method="POST" id="registerForm" novalidate>
            <input type="hidden" name="action" value="register">

            <!-- Field Nama -->
            <div class="auth-field">
                <label for="r_nama">
                    <!-- Icon: User (SVG) -->
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Nama Lengkap
                </label>
                <input
                    type="text"
                    id="r_nama"
                    name="reg_nama"
                    class="auth-input"
                    placeholder="Nama Anda"
                    value="<?= htmlspecialchars($_POST['reg_nama'] ?? '') ?>"
                    autocomplete="name"
                    required
                >
            </div>

            <!-- Field Email -->
            <div class="auth-field">
                <label for="r_email">
                    <!-- Icon: Mail (SVG) -->
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    Email
                </label>
                <input
                    type="email"
                    id="r_email"
                    name="reg_email"
                    class="auth-input"
                    placeholder="nama@email.com"
                    value="<?= htmlspecialchars($_POST['reg_email'] ?? '') ?>"
                    autocomplete="email"
                    required
                >
            </div>

            <!-- Field Password -->
            <div class="auth-field">
                <label for="r_password">
                    <!-- Icon: Lock (SVG) -->
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Password
                </label>
                <input
                    type="password"
                    id="r_password"
                    name="reg_password"
                    class="auth-input"
                    placeholder="Min. 6 karakter"
                    autocomplete="new-password"
                    required
                >
            </div>

            <button type="submit" class="btn-submit" id="btnRegister">Buat Akun</button>
        </form>
    </div><!-- /panel-register -->


    <!-- ══════════════════════════════════════════════════════
         PANEL OVERLAY MERAH — Bergeser via GSAP
         ══════════════════════════════════════════════════════
         Default   : left: 50%  (kanan, border-radius kanan)
         Mode Reg  : translateX(-100%) = bergeser ke kiri (left: 0)

         Cara kerja: transform hanya menggeser visual, tidak
         mengubah posisi 'left' di DOM. GSAP menganimasikan
         property 'x' (translateX), bukan 'left', sehingga
         GPU yang menghandle — zero layout recalculation.
         ══════════════════════════════════════════════════════ -->
    <div class="panel-overlay" id="panelOverlay">

        <!-- Konten Mode LOGIN (overlay ada di kanan, CTA ke register) -->
        <div class="overlay-content" id="ovLogin">
            <!-- Icon: Film reel -->
            <svg class="overlay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <path d="M7 2v20"/><path d="M17 2v20"/>
                <path d="M2 12h20"/><path d="M2 7h5"/>
                <path d="M2 17h5"/><path d="M17 17h5"/><path d="M17 7h5"/>
            </svg>

            <h2 class="overlay-heading">Belum punya akun?</h2>
            <p class="overlay-body">
                Bergabung dengan jutaan penonton<br>
                dan nikmati pengalaman bioskop premium
            </p>
            <button class="btn-ghost" id="btnGoRegister">Daftar Sekarang</button>
        </div>

        <!-- Konten Mode REGISTER (overlay ada di kiri, CTA ke login) -->
        <div class="overlay-content" id="ovRegister" style="display:none;">
            <!-- Icon: Ticket -->
            <svg class="overlay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
            </svg>

            <h2 class="overlay-heading">Sudah punya akun?</h2>
            <p class="overlay-body">
                Masuk dan lanjutkan perjalanan<br>
                sinematik Anda bersama FILMKU
            </p>
            <button class="btn-ghost" id="btnGoLogin">Masuk Sekarang</button>
        </div>

    </div><!-- /panel-overlay -->

</div><!-- /auth-card -->


<!-- ═══════════════════════════════════════════════════════════
     GSAP — Logika Animasi Sliding Dual-Panel
     ═══════════════════════════════════════════════════════════
     Cara kerja matematis:
     - Overlay width = 450px (50% dari 900px container)
     - Mode Register: gsap.to(overlay, { x: -450 })
       → translateX(-450px) → overlay pindah dari [450–900] ke [0–450]
     - Mode Login   : gsap.to(overlay, { x: 0 })
       → kembali ke posisi asal [450–900]
     ═══════════════════════════════════════════════════════════ -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script>
(function () {
    'use strict';

    // ── Referensi DOM ──────────────────────────────────────────
    const overlay       = document.getElementById('panelOverlay');
    const ovLogin       = document.getElementById('ovLogin');
    const ovRegister    = document.getElementById('ovRegister');
    const btnGoRegister = document.getElementById('btnGoRegister');
    const btnGoLogin    = document.getElementById('btnGoLogin');

    // ── Config animasi ─────────────────────────────────────────
    const DUR_SLIDE = 0.72;           // Durasi geser overlay (detik)
    const DUR_FADE  = 0.28;           // Durasi fade konten overlay
    const EASE_SLIDE = 'expo.inOut';  // Elegan: lambat → cepat → lambat
    const EASE_FADE  = 'power2.out';

    // Lebar overlay dalam piksel (setengah lebar container 900px)
    const OVERLAY_WIDTH = overlay.offsetWidth; // 450px

    // State saat ini
    let isRegisterMode = <?= $open_register ? 'true' : 'false' ?>;

    // ── Fungsi: Ganti konten overlay dengan fade ───────────────
    function swapOverlayContent(hideEl, showEl) {
        // 1. Fade out konten yang sedang tampil
        gsap.to(hideEl, {
            opacity: 0,
            y: -6,              // Sedikit naik saat hilang
            duration: DUR_FADE,
            ease: EASE_FADE,
            onComplete: function () {
                hideEl.style.display = 'none';
                // 2. Tampilkan konten baru, lalu fade in
                showEl.style.display = 'flex';
                showEl.style.flexDirection = 'column';
                showEl.style.alignItems = 'center';
                gsap.fromTo(showEl,
                    { opacity: 0, y: 10 },                // Dari bawah
                    { opacity: 1, y: 0, duration: DUR_FADE + 0.1, ease: EASE_FADE }
                );
            }
        });
    }

    // ── Fungsi: Geser ke mode REGISTER ─────────────────────────
    function activateRegister() {
        if (isRegisterMode) return;
        isRegisterMode = true;

        // Geser overlay ke KIRI: dari x=0 ke x=-450px
        // (visual: overlay berpindah dari kanan ke kiri container)
        gsap.to(overlay, {
            x: -OVERLAY_WIDTH,          // Pindah 450px ke kiri
            duration: DUR_SLIDE,
            ease: EASE_SLIDE,
            onStart: function () {
                // Ubah radius: kanan → kiri (karena overlay kini di kiri)
                overlay.style.borderRadius = '22px 0 0 22px';
            }
        });

        // Ganti konten teks overlay
        swapOverlayContent(ovLogin, ovRegister);
    }

    // ── Fungsi: Geser kembali ke mode LOGIN ────────────────────
    function activateLogin() {
        if (!isRegisterMode) return;
        isRegisterMode = false;

        // Kembalikan overlay ke kanan: dari x=-450px ke x=0
        gsap.to(overlay, {
            x: 0,
            duration: DUR_SLIDE,
            ease: EASE_SLIDE,
            onStart: function () {
                // Ubah radius: kiri → kanan (overlay kembali ke kanan)
                overlay.style.borderRadius = '0 22px 22px 0';
            }
        });

        // Ganti konten teks overlay
        swapOverlayContent(ovRegister, ovLogin);
    }

    // ── Event Listener Tombol ──────────────────────────────────
    if (btnGoRegister) btnGoRegister.addEventListener('click', activateRegister);
    if (btnGoLogin)    btnGoLogin.addEventListener('click', activateLogin);

    // ── Inisialisasi: jika PHP kirim mode=register ─────────────
    // Set posisi awal langsung (tanpa animasi) saat halaman dimuat
    if (isRegisterMode) {
        gsap.set(overlay, { x: -OVERLAY_WIDTH });
        overlay.style.borderRadius = '22px 0 0 22px';
        ovLogin.style.display    = 'none';
        ovRegister.style.display = 'flex';
        ovRegister.style.flexDirection = 'column';
        ovRegister.style.alignItems = 'center';
    }

    // ── Loading state tombol submit ────────────────────────────
    function setLoadingState(formId, btnId, loadingText) {
        const form = document.getElementById(formId);
        if (!form) return;
        form.addEventListener('submit', function () {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled    = true;
                btn.textContent = loadingText;
            }
        });
    }

    setLoadingState('loginForm',    'btnLogin',    'Memeriksa...');
    setLoadingState('registerForm', 'btnRegister', 'Mendaftarkan...');

})(); // IIFE — tidak mencemari global scope
</script>

<!-- LightRays WebGL Background (ES Module) -->
<script type="module">
    /**
     * LightRays — menggantikan SideRays sebagai background login page.
     * Import dari file Vanilla JS hasil konversi React Bits component.
     */
    import { initLightRays } from '/FILMKU_PHP/static/js/light-rays.js';

    initLightRays('side-rays-bg', {
        raysOrigin:     'top-center', // Ray memancar dari tengah atas
        raysColor:      '#E50914',    // Merah sinematik ikonik FILMKU
        raysSpeed:      2.0,          // Animasi lebih intens (dari 1.5)
        lightSpread:    1.8,          // Lebar kipas sedikit diperbesar
        rayLength:      1.5,          // Ray mencapai bawah layar
        pulsating:      true,         // Aktifkan efek denyut dramatis
        fadeDistance:   1.0,          // Jarak fade dari sumber
        saturation:     1.8,          // Warna merah lebih membara
        followMouse:    true,         // Ray mengikuti kursor mouse
        mouseInfluence: 0.15,         // Pengaruh kursor sedikit ditambah
        noiseAmount:    0.15,         // Grain noise sinematik (vintage feel)
        distortion:     0.08,         // Gelombang cahaya lebih organik
    });
</script>

</body>
</html>
