<?php
// ============================================================
//  FILMKU — SMTP Mailer Utility
// ============================================================

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Hanya require autoloader jika dipanggil dari luar lingkungan yang sudah punya autoloader
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

/**
 * Mengirimkan Email E-Tiket menggunakan SMTP Gmail
 * 
 * PENTING: Untuk menggunakan Gmail, Anda HARUS mengaktifkan 2-Step Verification 
 * dan membuat "App Password" (Sandi Aplikasi).
 * 
 * @param string $toEmail Alamat email tujuan
 * @param string $subject Subjek email
 * @param string $htmlBody Isi email dalam format HTML
 * @param string|null $posterUrl Path lokal ATAU URL external untuk poster
 * @param string|null $qrUrl URL external dari QR code
 * @return bool True jika berhasil, False jika gagal
 */
function sendETicketEmail($toEmail, $subject, $htmlBody, $posterUrl = null, $qrUrl = null) {
    $mail = new PHPMailer(true);

    try {
        // Konfigurasi Server SMTP
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';             // Server SMTP Gmail
        $mail->SMTPAuth   = true;                         // Aktifkan autentikasi SMTP
        
        // ==========================================================
        //  TODO: MASUKKAN EMAIL & APP PASSWORD GMAIL ANDA DI SINI
        // ==========================================================
        $mail->Username   = 'didosyukur123@gmail.com';       // Ganti dengan email Gmail Anda
        $mail->Password   = 'elcn npfv ftrt bspm';   // Ganti dengan 16-digit App Password Gmail
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Enkripsi TLS
        $mail->Port       = 587;                          // Port TCP SMTP

        // Pengirim & Penerima
        $mail->setFrom($mail->Username, 'FILMKU Ticketing'); // Menggunakan email yang diautentikasi
        $mail->addAddress($toEmail);                      // Tambahkan penerima

        // Konten Email
        $mail->isHTML(true);                              // Set format email ke HTML
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        
        // Attach Poster as Embedded Image
        if ($posterUrl) {
            // Jika poster URL adalah path lokal Windows (karena di-set dari __DIR__)
            if (file_exists($posterUrl)) {
                $mail->addEmbeddedImage($posterUrl, 'poster_img', 'poster.jpg');
            } else if (strpos($posterUrl, 'http') === 0) {
                // Jika poster adalah link remote, download dan embed sebagai string
                $imgData = @file_get_contents($posterUrl);
                if ($imgData !== false) {
                    $mail->addStringEmbeddedImage($imgData, 'poster_img', 'poster.jpg');
                }
            }
        }

        // Attach QR Code as Embedded Image
        if ($qrUrl) {
            $qrData = @file_get_contents($qrUrl);
            if ($qrData !== false) {
                $mail->addStringEmbeddedImage($qrData, 'qr_img', 'qrcode.png');
            }
        }
        
        // Alternatif teks polos jika email client menolak HTML
        $mail->AltBody = strip_tags(str_replace(['<br>', '</div>', '</p>'], "\n", $htmlBody));

        // Kirim
        $mail->send();
        return true;
    } catch (Exception $e) {
        // Log error atau debug
        error_log("Email tidak dapat dikirim. Pesan Error Mailer: {$mail->ErrorInfo}");
        return false;
    }
}
