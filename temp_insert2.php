<?php
require_once __DIR__ . '/config/sparql.php';

$films = [
    // 1. Pesona Asia & K-Drama (6)
    ["Film_SquidGame3", "Squid Game 3", "Puncak permainan mematikan telah tiba; Gi-hun kini harus menghancurkan sistem dari dalam sebelum ia sendiri tereliminasi.", "Pesona Asia & K-Drama", "https://image.tmdb.org/t/p/w500/y0eMxzFkbcxlD7Eiv7N78iW4i9R.jpg", "8.9"],
    ["Film_AllOfUsAreDead2", "All of Us Are Dead 2", "Para penyintas SMA Hyosan menghadapi ancaman baru ketika virus berevolusi, menciptakan mutan yang berbaur di antara manusia.", "Pesona Asia & K-Drama", "https://image.tmdb.org/t/p/w500/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg", "8.6"],
    ["Film_AliceInBorderland3", "Alice in Borderland 3", "Arisu dan Usagi terpaksa ditarik kembali ke Borderland untuk menghadapi rentetan permainan mental yang melampaui batas realita.", "Pesona Asia & K-Drama", "https://image.tmdb.org/t/p/w500/20mOwAAPwZ1vLQkw0fvnQFoD7vd.jpg", "8.8"],
    ["Film_Suzume2", "Suzume: The Next Journey", "Suzume kembali mengelilingi Jepang demi menyegel pintu dimensi yang terbuka akibat gempa tektonik aneh yang mengancam Tokyo.", "Pesona Asia & K-Drama", "https://image.tmdb.org/t/p/w500/vIeu8WysZvHAG6B7v6bmsH8R9fN.jpg", "8.7"],
    ["Film_Moving2", "Moving - Musim 2", "Anak-anak berkekuatan super kini diburu secara global oleh agen rahasia lintas negara, memaksa para orang tua kembali turun tangan.", "Pesona Asia & K-Drama", "https://image.tmdb.org/t/p/w500/z0T0v5a7Bv65wY1G3GgU9W5pXgR.jpg", "9.0"],
    ["Film_GodzillaMinusOneRebirth", "Godzilla Minus One: Rebirth", "Teror sang monster raksasa kembali bangkit dari abu nuklir, memaksa Jepang untuk mengerahkan senjata eksperimental terakhir mereka.", "Pesona Asia & K-Drama", "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKGWb.jpg", "8.5"],

    // 2. Sorotan Layar Utama (3)
    ["Film_ProjectHailMary", "Project Hail Mary", "Ryland Grace terbangun dari koma di luar angkasa dengan amnesia; ia adalah satu-satunya harapan umat manusia untuk mencegah kepunahan akibat pendinginan matahari.", "Sorotan Layar Utama", "https://image.tmdb.org/t/p/w500/vuzG3WwL33b8sID5d3fXfM1h1a5.jpg", "9.1"],
    ["Film_SpiderMan4", "Spider-Man 4", "Peter Parker yang kini hidup dalam bayang-bayang kesendirian, harus berhadapan dengan sindikat kejahatan baru yang mengambil alih jalanan New York.", "Sorotan Layar Utama", "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1ZrsNdGGLZbbY.jpg", "8.8"],
    ["Film_AvatarFireAndAsh", "Avatar: Fire and Ash", "Jake Sully dan Neytiri harus menjelajahi wilayah vulkanik Pandora yang dikuasai oleh Suku Abu yang agresif demi mempertahankan kedamaian keluarga mereka.", "Sorotan Layar Utama", "https://image.tmdb.org/t/p/w500/t6HIqrNDIGGLt7jA3YBPcgT5x8g.jpg", "8.9"],

    // 3. Rilisan Tersegar (6)
    ["Film_TheBatman2", "The Batman - Part II", "Sang Ksatria Kegelapan menyelidiki konspirasi pembunuhan berantai yang mengancam fondasi kota Gotham dan mengungkap rahasia kelam keluarga Wayne.", "Rilisan Tersegar", "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", "8.7"],
    ["Film_Superman2025", "Superman (2025)", "Clark Kent muda berjuang menyeimbangkan warisan Krypton-nya dengan didikan manusiawinya di tengah dunia yang masih mempertanyakan keberadaan pahlawan super.", "Rilisan Tersegar", "https://image.tmdb.org/t/p/w500/pA2kY522Wq79X2n0F9d38XWcW9t.jpg", "8.5"],
    ["Film_FantasticFourFirstSteps", "Fantastic Four: First Steps", "Keluarga superhero pertama Marvel memulai petualangan kosmik mereka melawan ancaman galaksi kuno yang dapat melahap tata surya.", "Rilisan Tersegar", "https://image.tmdb.org/t/p/w500/7s9D9B7pE1QvW7oT5z5vU6D6w8H.jpg", "8.4"],
    ["Film_JurassicWorldRebirth", "Jurassic World: Rebirth", "Satu dekade setelah manusia berdampingan dengan dinosaurus, muncul spesies hibrida liar yang mengambil alih pedalaman Eropa.", "Rilisan Tersegar", "https://image.tmdb.org/t/p/w500/q3m1F8tC8wE5Wf9YfK2w5J0C7R.jpg", "8.1"],
    ["Film_TronAres", "TRON: Ares", "Sebuah program kecerdasan buatan bernama Ares berhasil menembus batasan dunia digital untuk masuk ke dunia nyata umat manusia.", "Rilisan Tersegar", "https://image.tmdb.org/t/p/w500/9b0a7B5z4Y1G3GgU9W5pXgR.jpg", "8.0"],
    ["Film_MortalKombat2", "Mortal Kombat 2", "Turnamen mematikan kembali berlanjut; Cole Young dan para petarung Earthrealm harus menghadapi kemurkaan penuh dari pasukan Outworld.", "Rilisan Tersegar", "https://image.tmdb.org/t/p/w500/8tT9w9z5C4V6Wf9YfK2w5J0C7R.jpg", "7.9"],

    // 4. Lagi Viral Nih (4)
    ["Film_FNAF2", "Five Nights at Freddy's 2", "Teror animatronik kembali menghantui ketika restoran cabang baru dibuka dengan robot-robot yang telah ditingkatkan kemampuannya.", "Lagi Viral Nih", "https://image.tmdb.org/t/p/w500/2O7R7h2bZ0o9u6a8h5Z3y9Y9kL.jpg", "7.8"],
    ["Film_M3GAN2", "M3GAN 2.0", "Kecerdasan buatan M3GAN yang berhasil lolos ke dalam jaringan internet global kini menciptakan kekacauan siber tanpa batas.", "Lagi Viral Nih", "https://image.tmdb.org/t/p/w500/7aZ3D2c9Y1O4g6C9x7v5B9f6a7.jpg", "7.6"],
    ["Film_DeadpoolWolverine2", "Deadpool & Wolverine 2", "Pasangan mutan tak terduga ini terlempar ke semesta paralel menghindari kejaran Time Variance Authority.", "Lagi Viral Nih", "https://image.tmdb.org/t/p/w500/8cdWjvZ33u1UTc27NzIwUs9YpI5.jpg", "8.6"],
    ["Film_VenomLastStand", "Venom: The Last Stand", "Eddie Brock dan symbiote-nya menghadapi ancaman terkuat ketika sesama spesies symbiote dari planet Klyntar menyerbu Bumi.", "Lagi Viral Nih", "https://image.tmdb.org/t/p/w500/vQ9xT2r9H4a6K5b8N4d5B9f6w4.jpg", "7.5"],

    // 5. Tangga Teratas Box Office (5)
    ["Film_AvengersDoomsday", "Avengers: Doomsday", "Para pahlawan terkuat di bumi harus bersatu kembali untuk menghadapi ancaman multiverse dari sang jenius lalim, Doctor Doom.", "Tangga Teratas Box Office", "https://image.tmdb.org/t/p/w500/r0T5Y3d9N2M4g6C9x7v5B9f6z3.jpg", "9.2"],
    ["Film_Zootopia2", "Zootopia 2", "Judy dan Nick mendapatkan misi penyamaran berbahaya untuk mengungkap sindikat kriminal yang menculik hewan-hewan eksotis.", "Tangga Teratas Box Office", "https://image.tmdb.org/t/p/w500/zT9xY2r9H4a6K5b8N4d5B9f6q2.jpg", "8.9"],
    ["Film_MI8", "Mission: Impossible - Final Reckoning", "Ethan Hunt menghadapi konfrontasi pamungkas melawan kecerdasan buatan The Entity dalam misi bunuh diri yang mempertaruhkan nyawa timnya.", "Tangga Teratas Box Office", "https://image.tmdb.org/t/p/w500/q3m1F8tC8wE5Wf9YfK2w5J0C7R.jpg", "8.8"],
    ["Film_CapAmBraveNewWorld", "Captain America: Brave New World", "Sam Wilson terseret ke dalam insiden internasional yang melibatkan presiden Amerika Serikat saat menyandang tameng secara penuh.", "Tangga Teratas Box Office", "https://image.tmdb.org/t/p/w500/5O7R7h2bZ0o9u6a8h5Z3y9Y9v1.jpg", "8.3"],
    ["Film_Thunderbolts", "Thunderbolts*", "Sekelompok antihero dan mantan penjahat super disatukan pemerintah untuk menjalankan misi rahasia kotor.", "Tangga Teratas Box Office", "https://image.tmdb.org/t/p/w500/7tT9w9z5C4V6Wf9YfK2w5J0C7X.jpg", "8.1"],

    // 6. Karya Anak Bangsa (6)
    ["Film_MencuriRadenSaleh2", "Mencuri Raden Saleh 2", "Piko dan komplotannya merencanakan pencurian artefak sejarah terbesar di luar negeri untuk menyelamatkan nyawa rekan mereka.", "Karya Anak Bangsa", "https://image.tmdb.org/t/p/w500/4c3WjvZ33u1UTc27NzIwUs9YpC4.jpg", "8.5"],
    ["Film_PengabdiSetan3", "Pengabdi Setan 3", "Rahasia sekte penyembah iblis semakin terang benderang ketika Rini menemukan akar kutukan keluarga mereka di masa penjajahan.", "Karya Anak Bangsa", "https://image.tmdb.org/t/p/w500/t6HIqrNDIGGLt7jA3YBPcgT5x9q.jpg", "8.6"],
    ["Film_AgakLaen2", "Agak Laen 2", "Kuartet penjaga rumah hantu ini tak sengaja terseret dalam kasus pembunuhan berantai saat membuka wahana baru.", "Karya Anak Bangsa", "https://image.tmdb.org/t/p/w500/9b0a7B5z4Y1G3GgU9W5pXgR.jpg", "8.7"],
    ["Film_GadisKretekMovie", "Gadis Kretek: The Movie", "Mengungkap lapisan baru dari perjalanan Dasiyah dalam mempertahankan racikan kreteknya dari bayang-bayang kelam masa lalu keluarga Idroes.", "Karya Anak Bangsa", "https://image.tmdb.org/t/p/w500/7aZ3D2c9Y1O4g6C9x7v5B9f6a7.jpg", "8.9"],
    ["Film_PetualanganSherina3", "Petualangan Sherina 3", "Sherina dan Sadam kembali bersatu mengarungi hutan lebat Sumatra demi menyelamatkan spesies harimau langka dari perburuan ilegal.", "Karya Anak Bangsa", "https://image.tmdb.org/t/p/w500/z0T0v5a7Bv65wY1G3GgU9W5pXgR.jpg", "8.4"],
    ["Film_NgeriNgeriSedap2", "Ngeri-Ngeri Sedap 2", "Keluarga Pak Domu harus menghadapi drama baru yang mengocok perut ketika sang anak pertama membawa calon istri dari luar suku Batak.", "Karya Anak Bangsa", "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKGWb.jpg", "8.5"]
];

