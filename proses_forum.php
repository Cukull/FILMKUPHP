<?php
// ============================================================
//  FILMKU — Proses Forum (AJAX handler)
// ============================================================
require_once __DIR__ . '/config/sparql.php';
if (session_status() === PHP_SESSION_NONE) session_start();

header('Content-Type: application/json');

$action = $_POST['action'] ?? '';

if ($action === 'new_thread') {
    if (empty($_SESSION['user_name'])) {
        echo json_encode(['success' => false, 'message' => 'Harus login']);
        exit;
    }
    $judul   = trim($_POST['judul'] ?? '');
    $konten  = trim($_POST['konten'] ?? '');
    $film    = trim($_POST['film_related'] ?? '');
    $penulis = $_SESSION['user_name'];
    $tanggal = date('Y-m-d');
    $id      = 'ForumPost_' . uniqid();

    if (empty($judul) || empty($konten)) {
        echo json_encode(['success' => false, 'message' => 'Judul dan konten wajib diisi']);
        exit;
    }

    $judul   = addslashes($judul);
    $konten  = addslashes($konten);
    $penulis = addslashes($penulis);
    $film_triple = $film ? "f:{$id} f:relatedFilm \"" . addslashes($film) . "\" ." : '';

    $q = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
    INSERT DATA {
        f:{$id} a f:ForumPost ;
            f:judulPost \"{$judul}\" ;
            f:kontenPost \"{$konten}\" ;
            f:penulisPost \"{$penulis}\" ;
            f:tanggalPost \"{$tanggal}\" ;
            f:likesPost \"0\" .
        {$film_triple}
    }";

    $ok = sparql_update($q);
    if ($ok) {
        echo json_encode(['success' => true]);
        header('Location: /FILMKU_PHP/community.php?tab=forum');
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menyimpan post']);
    }
    exit;
}

if ($action === 'like') {
    $post_id = $_POST['post_id'] ?? '';
    if (empty($post_id)) { echo json_encode(['success' => false]); exit; }

    // Ambil likes saat ini
    $decoded = urldecode($post_id);
    $local   = str_replace(ONTOLOGY_PREFIX, 'f:', $decoded);

    $q = "PREFIX f: <" . ONTOLOGY_PREFIX . "> SELECT ?likes WHERE { <{$decoded}> f:likesPost ?likes }";
    $res = sparql_query($q);
    $bindings = get_bindings($res ?? []);
    $current_likes = intval($bindings[0]['likes']['value'] ?? 0);
    $new_likes = $current_likes + 1;

    $uq = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
    DELETE { <{$decoded}> f:likesPost ?old }
    INSERT { <{$decoded}> f:likesPost \"{$new_likes}\" }
    WHERE  { <{$decoded}> f:likesPost ?old }";

    $ok = sparql_update($uq);
    echo json_encode(['success' => $ok, 'likes' => $new_likes]);
    exit;
}

// Jika POST form biasa (new_thread redirect)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['judul'])) {
    // Handle form post tanpa AJAX
    $judul   = trim($_POST['judul'] ?? '');
    $konten  = trim($_POST['konten'] ?? '');
    $film    = trim($_POST['film_related'] ?? '');
    $penulis = $_SESSION['user_name'] ?? 'Anonim';
    $tanggal = date('Y-m-d');
    $id      = 'ForumPost_' . uniqid();

    $judul   = addslashes($judul);
    $konten  = addslashes($konten);
    $penulis = addslashes($penulis);
    $film_triple = $film ? "f:{$id} f:relatedFilm \"" . addslashes($film) . "\" ." : '';

    $q = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
    INSERT DATA {
        f:{$id} a f:ForumPost ;
            f:judulPost \"{$judul}\" ;
            f:kontenPost \"{$konten}\" ;
            f:penulisPost \"{$penulis}\" ;
            f:tanggalPost \"{$tanggal}\" ;
            f:likesPost \"0\" .
        {$film_triple}
    }";

    sparql_update($q);
    header('Content-Type: text/html');
    header('Location: /FILMKU_PHP/community.php?tab=forum');
    exit;
}

echo json_encode(['success' => false, 'message' => 'Aksi tidak dikenali']);
