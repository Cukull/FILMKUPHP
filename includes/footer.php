
        <!-- Minimalist Transparent Footer -->
        <footer class="app-footer-info">
            <div class="footer-container">
                <div class="footer-left">
                    <div class="footer-links">
                        <span class="copyright">© 2026 FILMKU Entertainment Inc.</span>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Use</a>
                    </div>
                    <div class="footer-disclaimer">
                        FILMKU is a trademark or registered trademark of FILMKU Entertainment Inc. Any other trademarks are the property of their respective owners. Unless otherwise noted, use of third party logos does not imply endorsement of, sponsorship of, or affiliation with FILMKU.
                        <br><br>
                        FILMKU is a cinema technology platform, providing semantic web data for the ultimate cinematic experience.
                    </div>
                </div>
                <div class="footer-right">
                    <a href="#" class="social-icon">
                        <!-- X/Twitter -->
                        <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="#" class="social-icon">
                        <!-- LinkedIn -->
                        <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="#" class="social-icon">
                        <!-- Facebook/Meta -->
                        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                    </a>
                </div>
            </div>
        </footer>
    </main><!-- /.app-main -->
</div><!-- /.app-wrapper -->

<!-- Ambient Cursor Glow Effect -->
<div class="cursor-glow" id="cursorGlow"></div>

<script>


/* ── Splash Screen & Page Transitions (Foolproof) ── */
function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash && !splash.classList.contains('hidden')) {
        splash.classList.add('hidden');
        // Hapus elemen dari DOM setelah animasi fade selesai (menghemat memori)
        setTimeout(() => {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 500);
    }
}

// Event load untuk sembunyikan ketika asset utama sudah termuat
window.addEventListener('load', hideSplashScreen);

// Fallback Darurat: Jika ada error js/asset lambat, paksakan hilang maksimal dalam 2 detik
setTimeout(hideSplashScreen, 2000);

// Fade out on link click (except hash links or target="_blank")
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && !link.href.includes('#') && link.target !== '_blank' && link.hostname === window.location.hostname && !link.classList.contains('dropdown-item')) {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = link.href;
        }, 400); // match CSS transition duration
    }
});

// Perbaikan untuk navigasi tombol Back di Browser (bfcache)
window.addEventListener('pageshow', (event) => {
    // Hapus kelas fade-out agar halaman tidak blank saat di-back
    document.body.classList.remove('fade-out');
    // Pastikan splash screen disembunyikan
    hideSplashScreen();
});

/* ── Interactive UI Components ── */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('appSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const profileDropdown = document.getElementById('profileDropdown');

    // Sidebar Toggle
    if (toggleBtn && sidebar && overlay) {
        const toggleSidebar = () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        };

        toggleBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
    }

    // Profile Dropdown Toggle
    if (profileDropdown) {
        const dropdownBtn = profileDropdown.querySelector('.profile-dropdown-btn');
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            profileDropdown.classList.remove('active');
        });
    }

    // Ambient Cursor Glow Tracker — throttled via RAF to avoid layout thrashing
    const glow = document.getElementById('cursorGlow');
    if (glow) {
        let glowRafId = null;
        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!glowRafId) {
                glowRafId = requestAnimationFrame(() => {
                    // Offset by half element size (450/2=225) to center the glow on cursor
                    glow.style.transform = `translate(${mouseX - 225}px, ${mouseY - 225}px)`;
                    glow.style.opacity = '1';
                    glowRafId = null;
                });
            }
        }, { passive: true });
        window.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        }, { passive: true });
    }

    // Scroll Navbar Effect
    const header = document.querySelector('.app-header.header-transparent');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Live Search Autocomplete Logic
    const searchInput = document.getElementById('liveSearchInput');
    const searchResults = document.getElementById('liveSearchResults');
    let searchTimeout;

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);
            
            if (query.length < 3) {
                searchResults.classList.add('hidden');
                searchResults.innerHTML = '';
                return;
            }

            // Tampilkan loading skeleton atau biarkan debounce bekerja
            searchTimeout = setTimeout(() => {
                fetch(`/FILMKU_PHP/api_search.php?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.results.length > 0) {
                            searchResults.innerHTML = '';
                            data.results.forEach(movie => {
                                const a = document.createElement('a');
                                a.href = `/FILMKU_PHP/detail.php?film=${encodeURIComponent(movie.id)}`;
                                a.className = 'live-search-item';
                                a.innerHTML = `
                                    <img src="${movie.poster}" alt="${movie.title}">
                                    <div class="info">
                                        <div class="title">${movie.title}</div>
                                        <div class="year" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${movie.synopsis}</div>
                                    </div>
                                `;
                                searchResults.appendChild(a);
                            });
                            searchResults.classList.remove('hidden');
                        } else {
                            searchResults.innerHTML = '<div class="no-results">Film tidak ditemukan</div>';
                            searchResults.classList.remove('hidden');
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching live search:', err);
                    });
            }, 300); // Debounce 300ms
        });

        // Sembunyikan hasil saat klik di luar
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    // ── Magnetic Button Effect (GSAP) ──
    // Berjalan setelah GSAP tersedia. Cek dulu agar tidak error jika GSAP belum load.
    function initMagneticButtons() {
        if (typeof gsap === 'undefined') return; // Keluar jika GSAP belum siap

        // Cari semua tombol dengan atribut [data-magnetic]
        document.querySelectorAll('[data-magnetic]').forEach(btn => {
            const strength = 0.35; // Kekuatan daya tarik magnet (0.0 - 1.0)

            // Saat kursor bergerak DI DALAM area tombol
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                // Hitung posisi kursor relatif terhadap pusat tombol
                const centerX = rect.left + rect.width  / 2;
                const centerY = rect.top  + rect.height / 2;
                const deltaX  = (e.clientX - centerX) * strength;
                const deltaY  = (e.clientY - centerY) * strength;

                // Geser tombol mengikuti kursor secara halus via GSAP
                gsap.to(btn, {
                    x: deltaX, y: deltaY,
                    duration: 0.4,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });

            // Saat kursor KELUAR dari area tombol — kembalikan ke posisi semula
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0, y: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.4)', // Membal seperti pegas
                    overwrite: 'auto'
                });
            });
        });
    }

    // Tunggu GSAP selesai load baru jalankan (GSAP ada di bawah script ini)
    window.addEventListener('load', initMagneticButtons);
});
</script>

<!-- AOS Animation JS -->
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script>
    AOS.init({
        once: true,    // Animasi hanya sekali, tidak reset saat scroll balik
        offset: 80,
        duration: 500, // Dikurangi dari 800ms → lebih ringan, tidak "berat"
        easing: 'ease-out-cubic'
    });
</script>

<!-- GSAP Core Library & Plugins -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script>
(function() {
    const loader = document.getElementById('filmku-loader');
    if (!loader) return;

    // 1. Variabel gsap.timeline() untuk mengatur antrean
    const introTl = gsap.timeline();
    
    // Gerakan Awal: Progress bar meluncur dari 0% ke 100%
    introTl.to('.filmku-progress', {
        scaleX: 1,
        duration: 1.0,
        ease: 'power3.inOut'
    })
    // Teks logo FILMKU hurufnya membal muncul satu per satu (Stagger) + Neon Glow
    .fromTo('.filmku-logo-text span', 
        { y: 30, scale: 0.5, opacity: 0, textShadow: '0 0 0px rgba(229, 9, 20, 0)' }, 
        { 
            y: 0, 
            scale: 1, 
            opacity: 1, 
            textShadow: '0 0 20px rgba(229, 9, 20, 0.9), 0 0 40px rgba(229, 9, 20, 0.5)',
            duration: 0.6, 
            ease: 'back.out(2)', 
            stagger: 0.08 
        }, 
        "-=0.5" // Mulai lebih awal saat progress bar masih jalan
    );

    // 2. Logika JavaScript & Sistem Keamanan Mutlak (Fail-Safe)
    let hasExited = false;

    // Gerakan Keluar (Exit Animation)
    function playExit() {
        if (hasExited) return;
        hasExited = true;

        const exitTl = gsap.timeline({
            onComplete: () => {
                // Hancurkan DOM secara permanen setelah tirai terangkat
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }
        });

        // Logo mengecil dan hilang satu per satu dengan sangat cepat
        exitTl.to('.filmku-logo-text span', {
            y: -20,
            scale: 0.2,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            stagger: 0.04 
        })
        // Background memudar (Fade Out) alih-alih bergeser ke atas
        .to(loader, {
            opacity: 0, 
            duration: 0.8,
            ease: 'power2.inOut'
        }, "-=0.1"); // Mulai sedikit tumpang tindih
    }

    // Flag manajemen status loading
    let pageReady = false;
    let minTimePassed = false;

    // Paksa intro tampil minimal 1.5 detik agar cantik
    setTimeout(() => {
        minTimePassed = true;
        if (pageReady) playExit();
    }, 1500);

    // Pemicu window.onload (Menunggu seluruh data/gambar siap)
    window.addEventListener('load', () => {
        pageReady = true;
        if (minTimePassed) playExit();
    });

    // Fail-Safe Independen: Fungsi cadangan mutlak maksimal 2 detik 
    // Mencegah stuck jika koneksi lambat atau event load gagal
    setTimeout(() => {
        pageReady = true;
        playExit(); // Paksa memutar animasi exit (.play)
    }, 2000);
})();
</script>

<!-- Lenis Smooth Scroll (Studio Freight) -->
<script src="https://unpkg.com/@studio-freight/lenis@1.0.34/dist/lenis.min.js"></script>
<script>
    // 1. Inisialisasi Instance Lenis — ultra-smooth cinematic feel
    const lenis = new Lenis({
        duration: 1.4,           // Lebih panjang = lebih halus & sinematik (seperti Apple.com)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        wheelMultiplier: 0.7     // Sedikit lebih lambat = rasa premium & tidak terburu-buru
    });

    // 2. Sinkronisasi Lenis dengan GSAP ScrollTrigger (KRITIS)
    // Tanpa ini, ScrollTrigger membuat scroll listener sendiri = double rendering = lag
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0); // Matikan lag compensation GSAP yang mengganggu Lenis
    } else {
        // Fallback jika GSAP tidak ada
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
</script>

</body>
</html>
