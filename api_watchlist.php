<?php
// ============================================================
//  FILMKU — API Watchlist (AJAX)
//  Menyimpan atau menghapus relasi f:menyimpanWatchlist
// ============================================================
header('Content-Type: application/json');

require_once __DIR__ . '/config/sparql.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['user_name'])) {
    echo json_encode(['success' => false, 'message' => 'Belum login']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $film_id = trim($_POST['film_id'] ?? '');

    if (empty($film_id) || !in_array($action, ['add', 'remove', 'check'])) {
        echo json_encode(['success' => false, 'message' => 'Parameter tidak valid']);
        exit;
    }

    $user_name_safe = addslashes($_SESSION['user_name']);
    $film_id_safe = addslashes($film_id);

    // Cari User URI terlebih dahulu
    $q_user = "
        PREFIX f: <" . ONTOLOGY_PREFIX . ">
        SELECT ?userURI WHERE {
            ?userURI a f:Pengguna ;
                     f:nama_pengguna \"$user_name_safe\" .
        } LIMIT 1
    ";
    $res_user = sparql_query($q_user);
    $bindings = get_bindings($res_user ?? []);
    
    if (empty($bindings)) {
        echo json_encode(['success' => false, 'message' => 'User tidak ditemukan']);
        exit;
    }
    
    // Ambil full URI user, format <http://.../User_Syukur>
    $user_uri_full = "<" . $bindings[0]['userURI']['value'] . ">";

    if ($action === 'check') {
        $q_check = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            ASK {
                $user_uri_full f:menyimpanWatchlist f:$film_id_safe .
            }
        ";
        $res_check = sparql_query($q_check);
        $is_saved = get_boolean($res_check ?? []);
        
        echo json_encode(['success' => true, 'is_saved' => $is_saved]);
        exit;
    }

    if ($action === 'add') {
        $q_add = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            INSERT DATA {
                $user_uri_full f:menyimpanWatchlist f:$film_id_safe .
            }
        ";
        $ok = sparql_update($q_add);
        echo json_encode(['success' => $ok]);
        exit;
    }

    if ($action === 'remove') {
        $q_remove = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE DATA {
                $user_uri_full f:menyimpanWatchlist f:$film_id_safe .
            }
        ";
        $ok = sparql_update($q_remove);
        echo json_encode(['success' => $ok]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
