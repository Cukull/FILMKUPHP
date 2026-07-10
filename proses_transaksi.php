<?php
// ============================================================
//  FILMKU — Proses Transaksi
// ============================================================
session_start();
require_once __DIR__ . '/config/sparql.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id = trim($_POST['film_id'] ?? '');
$tanggal = trim($_POST['tanggal'] ?? '');
$jam     = trim($_POST['jam']     ?? '');
$kursi   = trim($_POST['kursi']   ?? '');

if (!$film_id || !$tanggal || !$jam || !$kursi) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$kursi_list = array_filter(explode(',', $kursi));
if (empty($kursi_list)) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $film_id));
$tanggal_safe = addslashes($tanggal);
$jam_safe     = addslashes($jam);
$clean_tgl    = str_replace(' ', '_', $tanggal);
$clean_jam    = str_replace(':', '', $jam);

foreach ($kursi_list as $k) {
    $k_safe    = addslashes(trim($k));
    $random    = rand(100, 999);
    $kursi_uri = "Kursi_{$film_id_safe}_{$clean_tgl}_{$clean_jam}_{$k_safe}_{$random}";
    
    $query_update = "
        PREFIX f: <" . ONTOLOGY_PREFIX . ">
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        INSERT {
            f:$kursi_uri rdf:type f:Kursi ;
                         f:nomor_kursi \"$k_safe\" ;
                         f:status \"Terisi\" .
            
            ?jadwal f:memiliki f:$kursi_uri .
        }
        WHERE {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:tanggal \"\"\"$tanggal_safe\"\"\" ;
                    f:jam \"\"\"$jam_safe\"\"\" .
        }
    ";
    
    sparql_update($query_update);
}

$email = trim($_POST['email'] ?? 'didosyukur123@gmail.com');

// Save to history session for mockup
if (!isset($_SESSION['histori_tiket'])) {
    $_SESSION['histori_tiket'] = [];
}
$_SESSION['histori_tiket'][] = [
    'film_id' => $film_id,
    'tanggal' => $tanggal,
    'jam'     => $jam,
    'kursi'   => $kursi,
    'email'   => $email,
    'waktu_beli' => date('Y-m-d H:i:s')
];

// Redirect ke halaman sukses membawa parameter
$params = http_build_query([
    'film_id' => $film_id,
    'tanggal' => $tanggal,
    'jam'     => $jam,
    'kursi'   => $kursi,
    'email'   => $email
]);

header("Location: /FILMKU_PHP/sukses.php?$params");
exit;
