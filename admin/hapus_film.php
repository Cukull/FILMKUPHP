<?php
// ============================================================
//  FILMKU — Hapus Film
// ============================================================
session_start();
if (empty($_SESSION['user_name']) || $_SESSION['current_role'] !== 'admin') {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

require_once __DIR__ . '/../config/sparql.php';

$id = trim($_GET['id'] ?? '');
if (!$id) {
    header('Location: /FILMKU_PHP/admin/kelola_film.php');
    exit;
}

$id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $id));

// Hapus film dan semua relasinya (termasuk jadwal dan kursi jika terhubung dengan urutan yang benar)
// Untuk simplicity, kita hapus triples yang subject-nya adalah film tersebut.
// Jika ingin menghapus jadwal dan kursi, butuh query tambahan.
$query = "
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    DELETE {
        f:$id_safe ?p ?o .
    }
    WHERE {
        f:$id_safe ?p ?o .
    }
";

if (sparql_update($query)) {
    header('Location: /FILMKU_PHP/admin/kelola_film.php?msg=Film berhasil dihapus');
} else {
    header('Location: /FILMKU_PHP/admin/kelola_film.php?msg=Gagal menghapus film');
}
exit;
