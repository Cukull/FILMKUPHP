<?php
// ============================================================
//  FILMKU - Proses Transaksi F&B
// ============================================================
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /FILMKU_PHP/cafe.php');
    exit;
}

$cart_data_json = $_POST['cart_data'] ?? '[]';
$cart_data = json_decode($cart_data_json, true);
$email = trim($_POST['email'] ?? 'didosyukur123@gmail.com');

if (!is_array($cart_data) || count($cart_data) === 0) {
    header('Location: /FILMKU_PHP/cafe.php');
    exit;
}

$total_harga = 0;
foreach ($cart_data as $item) {
    $total_harga += ($item['harga'] * $item['qty']);
}

// Generate Order ID
$order_id = "FNB-" . strtoupper(uniqid());

// Save to history session
if (!isset($_SESSION['histori_fnb'])) {
    $_SESSION['histori_fnb'] = [];
}

$_SESSION['histori_fnb'][] = [
    'order_id'   => $order_id,
    'items'      => $cart_data,
    'total'      => $total_harga,
    'email'      => $email,
    'waktu_beli' => date('Y-m-d H:i:s')
];

// Redirect ke halaman sukses membawa parameter
$params = http_build_query([
    'order_id' => $order_id,
    'email'    => $email
]);

header("Location: /FILMKU_PHP/sukses_fnb.php?$params");
exit;
