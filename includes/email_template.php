<?php
// ============================================================
//  FILMKU — Email HTML Template Generator
// ============================================================

/**
 * Menghasilkan string HTML untuk E-Tiket Email
 */
function generateETicketHTML($filmTitle, $tanggal_tayang, $jam_sesi, $kursi_str, $total_bayar, $poster_url, $is_local = false) {
    // Generate QR Code dinamis menggunakan api.qrserver.com
    $qr_data = urlencode("FILMKU-TICKET-" . $filmTitle . "-" . $tanggal_tayang . "-" . $kursi_str);
    // Kita tidak menggunakan URL QR langsung di src agar tidak diblokir Spam
    // Kita akan generate file URL dan minta mailer.php untuk mendownload & attach (embed)
    $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . $qr_data . "&bgcolor=ffffff&color=000000";
    
    // SELALU gunakan Content-ID (CID) untuk semua gambar agar aman dari filter Spam Gmail
    $img_src = "cid:poster_img";
    $qr_src  = "cid:qr_img";

    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>FILMKU E-Ticket</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #080810; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">

    <div style="max-width: 500px; margin: 0 auto; background-color: #12121d; border-radius: 16px; border: 1px dashed #e50914; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        
        <!-- Header Tiket -->
        <div style="padding: 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <h2 style="margin: 0; color: #e50914; letter-spacing: 4px; font-weight: 900; font-size: 24px; text-transform: uppercase;">FILMKU E-TICKET</h2>
        </div>

        <!-- Konten Tiket -->
        <div style="padding: 24px;">
            <!-- Poster -->
            <div style="text-align: center; margin-bottom: 24px;">
                <img src="{$img_src}" alt="Poster Film" style="width: 140px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            </div>

            <!-- Judul Film -->
            <div style="margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Judul Film</p>
                <h3 style="margin: 4px 0 0 0; font-size: 22px; color: #ffffff; font-weight: 800;">{$filmTitle}</h3>
            </div>

            <!-- Grid Info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Tanggal Tayang</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; color: #ffffff; font-weight: 700;">{$tanggal_tayang}</p>
                    </td>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Studio</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; color: #ffffff; font-weight: 700;">Studio 1</p>
                    </td>
                </tr>
                <tr>
                    <td width="50%" valign="top">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Jam Sesi</p>
                        <p style="margin: 4px 0 0 0; font-size: 16px; color: #e50914; font-weight: 700;">{$jam_sesi}</p>
                    </td>
                    <td width="50%" valign="top">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Nomor Kursi</p>
                        <p style="margin: 4px 0 0 0; font-size: 18px; color: #ffffff; font-weight: 800;">{$kursi_str}</p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer Tiket dengan QR Code -->
        <div style="padding: 24px; background-color: #0b0b14; border-top: 1px dashed rgba(255,255,255,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td valign="middle">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total Pembayaran</p>
                        <p style="margin: 4px 0 0 0; font-size: 20px; color: #ffffff; font-weight: 800;">{$total_bayar}</p>
                    </td>
                    <td align="right" valign="middle">
                        <div style="background: #fff; padding: 6px; border-radius: 8px; display: inline-block;">
                            <img src="{$qr_src}" alt="QR Code" width="80" height="80" style="display: block;">
                        </div>
                    </td>
                </tr>
            </table>
            
            <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">Tunjukkan QR Code ini kepada petugas bioskop saat kedatangan.</p>
        </div>

    </div>

</body>
</html>
HTML;
}
