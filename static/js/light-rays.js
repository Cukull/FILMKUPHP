/**
 * ============================================================
 *  LightRays — Vanilla JS WebGL (Konversi dari React Bits)
 *  FILMKU Cinema — Cinematic Theme
 *
 *  Cara pakai (ES Module):
 *    import { initLightRays } from './light-rays.js';
 *    const destroy = initLightRays('container-id', { ...config });
 *    // Untuk membersihkan: destroy();
 *
 *  Library: ogl (via ES Module CDN)
 * ============================================================
 */

// ── Import OGL micro-library via CDN ES Module ────────────
import { Renderer, Program, Triangle, Mesh } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.9/+esm';

// ── Helper: Hex "#RRGGBB" → [R, G, B] float 0–1 ──────────
function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
        : [1, 1, 1];
}

// ── Helper: Hitung posisi anchor & arah ray dari string origin ──
// Mengembalikan { anchor: [x, y], dir: [dx, dy] } dalam koordinat piksel
function getAnchorAndDir(origin, w, h) {
    // outside = seberapa jauh sumber ray berada di luar batas kanvas
    const outside = 0.2;
    switch (origin) {
        case 'top-left':
            return { anchor: [0, -outside * h],            dir: [0,  1] };
        case 'top-right':
            return { anchor: [w, -outside * h],            dir: [0,  1] };
        case 'left':
            return { anchor: [-outside * w, 0.5 * h],      dir: [1,  0] };
        case 'right':
            return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
        case 'bottom-left':
            return { anchor: [0,       (1 + outside) * h], dir: [0, -1] };
        case 'bottom-center':
            return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-right':
            return { anchor: [w,       (1 + outside) * h], dir: [0, -1] };
        default: // 'top-center'
            return { anchor: [0.5 * w, -outside * h],      dir: [0,  1] };
    }
}

// ── GLSL Vertex Shader ────────────────────────────────────
// Full-screen triangle (lebih efisien dari quad) + pass UV ke fragment
const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    /* Konversi clip-space [-1,1] ke UV [0,1] */
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

// ── GLSL Fragment Shader — Inti Efek LightRays ───────────
const FRAG = `precision highp float;

/* ── Uniforms: dikirim dari JS setiap frame / saat config berubah ── */
uniform float iTime;          /* Waktu animasi (detik) */
uniform vec2  iResolution;    /* Ukuran kanvas (px × DPR) */

uniform vec2  rayPos;         /* Posisi sumber ray (anchor point, px) */
uniform vec2  rayDir;         /* Arah utama ray (unit vector) */
uniform vec3  raysColor;      /* Warna ray (RGB float 0-1) */
uniform float raysSpeed;      /* Kecepatan animasi */
uniform float lightSpread;    /* Lebar sudut spread ray */
uniform float rayLength;      /* Panjang maksimum ray (× lebar kanvas) */
uniform float pulsating;      /* 1.0 = aktif, 0.0 = mati */
uniform float fadeDistance;   /* Jarak fade-out dari sumber */
uniform float saturation;     /* Saturasi warna (1.0 = normal) */
uniform vec2  mousePos;       /* Posisi mouse normalize [0,1] */
uniform float mouseInfluence; /* Seberapa kuat mouse memengaruhi arah */
uniform float noiseAmount;    /* Intensitas grain/noise (0-1) */
uniform float distortion;     /* Amplitudo distorsi gelombang (0-1) */

varying vec2 vUv;

/* ── Fungsi noise sederhana (hash-based) ── */
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

/* ── Fungsi hitung kekuatan satu ray di koordinat tertentu ── */
float rayStrength(
    vec2  raySource,       /* Posisi sumber cahaya */
    vec2  rayRefDirection, /* Arah referensi (sudah terpengaruh mouse) */
    vec2  coord,           /* Koordinat piksel yang dihitung */
    float seedA,           /* Seed noise gelombang A */
    float seedB,           /* Seed noise gelombang B */
    float speed            /* Kecepatan waktu gelombang ini */
) {
    vec2  sourceToCoord = coord - raySource;
    vec2  dirNorm = normalize(sourceToCoord);
    float cosAngle = dot(dirNorm, rayRefDirection);

    /* Distorsi gelombang pada sudut — efek bergoyang organik */
    float distortedAngle = cosAngle + distortion
        * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

    /* Spread factor: semakin tinggi lightSpread, semakin lebar kipas */
    float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

    /* Falloff berdasarkan jarak (rayLength membatasi panjang maksimum) */
    float distance    = length(sourceToCoord);
    float maxDistance = iResolution.x * rayLength;
    float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

    /* Fadeout tambahan dari fadeDistance uniform */
    float fadeFalloff = clamp(
        (iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance),
        0.5, 1.0
    );

    /* Efek pulsating (denyut): modulasi sinusoidal jika aktif */
    float pulse = pulsating > 0.5
        ? (0.8 + 0.2 * sin(iTime * speed * 3.0))
        : 1.0;

    /* Kekuatan dasar ray: kombinasi dua gelombang sinusoidal */
    float baseStrength = clamp(
        (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
        (0.30 + 0.20 * cos(-distortedAngle * seedB + iTime * speed)),
        0.0, 1.0
    );

    return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

/* ── Main: hitung warna tiap piksel ── */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    /* Konversi koordinat: GLSL origin bawah-kiri → kita pakai atas-kiri */
    vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

    /* Hitung arah final ray (terpengaruh mouse jika mouseInfluence > 0) */
    vec2 finalRayDir = rayDir;
    if (mouseInfluence > 0.0) {
        /* Posisi mouse dalam koordinat piksel kanvas */
        vec2 mouseScreenPos = mousePos * iResolution.xy;
        vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
        /* Interpolasi antara arah default dan arah ke mouse */
        finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
    }

    /* Render dua layer ray dengan seed berbeda agar tidak sinkron */
    vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
    vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,  1.1 * raysSpeed);

    /* Campur dua layer */
    fragColor = rays1 * 0.5 + rays2 * 0.4;

    /* Tambahkan grain/noise jika diaktifkan */
    if (noiseAmount > 0.0) {
        float n = noise(coord * 0.01 + iTime * 0.1);
        fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
    }

    /* Modulasi warna berdasarkan posisi vertikal (efek langit sinematik) */
    float brightness = 1.0 - (coord.y / iResolution.y);
    fragColor.x *= 0.1 + brightness * 0.8;
    fragColor.y *= 0.3 + brightness * 0.6;
    fragColor.z *= 0.5 + brightness * 0.5;

    /* Kontrol saturasi: mix antara grayscale dan warna penuh */
    if (saturation != 1.0) {
        float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
        fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
    }

    /* Terapkan warna ray ke output — alpha otomatis dari kecerahan */
    fragColor.rgb *= raysColor;
}

void main() {
    vec4 color;
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}`;

// ─────────────────────────────────────────────────────────────
//  FUNGSI UTAMA: initLightRays
// ─────────────────────────────────────────────────────────────
/**
 * Inisialisasi efek LightRays WebGL pada elemen HTML.
 *
 * @param {string} containerId  - ID elemen container (tanpa '#')
 * @param {object} config       - Konfigurasi efek (semua opsional)
 * @returns {Function}          - Fungsi destroy() untuk cleanup manual
 */
export function initLightRays(containerId, config = {}) {

    // ── Gabung config user + default FILMKU ──────────────────
    const cfg = Object.assign({
        raysOrigin:     'top-center', // Asal ray
        raysColor:      '#fedbdb',    // Warna merah muda hangat
        raysSpeed:      1.5,          // Kecepatan animasi
        lightSpread:    1.5,          // Lebar kipas
        rayLength:      1.2,          // Panjang ray
        pulsating:      true,         // Efek denyut
        fadeDistance:   1.0,          // Jarak fade
        saturation:     1.5,          // Saturasi warna
        followMouse:    true,         // Ray mengikuti mouse
        mouseInfluence: 0.1,          // Seberapa kuat pengaruh mouse
        noiseAmount:    0.1,          // Grain noise
        distortion:     0.05,         // Distorsi gelombang
    }, config);

    // Cari elemen container
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[LightRays] Container "#${containerId}" tidak ditemukan.`);
        return () => {};
    }

    // ── State internal (pengganti useRef React) ───────────────
    let renderer    = null;  // OGL Renderer instance
    let uniforms    = null;  // Objek uniforms GLSL
    let mesh        = null;  // OGL Mesh (geometry + shader)
    let animId      = null;  // ID requestAnimationFrame aktif
    let isRunning   = false; // Flag: sudah berjalan atau belum

    // State mouse: posisi raw & posisi smooth (lerp)
    const mouse       = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };

    // ── Mouse move handler (untuk followMouse) ────────────────
    function onMouseMove(e) {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        // Normalisasi posisi kursor ke [0, 1]
        mouse.x = (e.clientX - rect.left) / rect.width;
        mouse.y = (e.clientY - rect.top)  / rect.height;
    }

    // ── Inisialisasi Renderer WebGL ───────────────────────────
    function initWebGL() {
        if (isRunning) return;
        isRunning = true;

        // Buat renderer OGL: alpha=true agar transparan
        renderer = new Renderer({
            dpr:   Math.min(window.devicePixelRatio, 2),
            alpha: true,
        });

        const gl = renderer.gl;

        // Atur canvas: 100% container, non-blocking untuk klik
        gl.canvas.style.width        = '100%';
        gl.canvas.style.height       = '100%';
        gl.canvas.style.display      = 'block';
        gl.canvas.style.pointerEvents = 'none';

        // Kosongkan container dan masukkan canvas baru
        container.innerHTML = '';
        container.appendChild(gl.canvas);

        // ── Buat uniforms awal ────────────────────────────────
        uniforms = {
            iTime:          { value: 0 },
            iResolution:    { value: [1, 1] },
            rayPos:         { value: [0, 0] },
            rayDir:         { value: [0, 1] },
            raysColor:      { value: hexToRgb(cfg.raysColor) },
            raysSpeed:      { value: cfg.raysSpeed },
            lightSpread:    { value: cfg.lightSpread },
            rayLength:      { value: cfg.rayLength },
            pulsating:      { value: cfg.pulsating ? 1.0 : 0.0 },
            fadeDistance:   { value: cfg.fadeDistance },
            saturation:     { value: cfg.saturation },
            mousePos:       { value: [0.5, 0.5] },
            mouseInfluence: { value: cfg.followMouse ? cfg.mouseInfluence : 0.0 },
            noiseAmount:    { value: cfg.noiseAmount },
            distortion:     { value: cfg.distortion },
        };

        // Buat geometry + compile shader
        const geometry = new Triangle(gl);
        const program  = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
        mesh           = new Mesh(gl, { geometry, program });

        // ── Fungsi resize ─────────────────────────────────────
        function updatePlacement() {
            if (!container || !renderer) return;

            renderer.dpr = Math.min(window.devicePixelRatio, 2);
            const wCSS = container.clientWidth;
            const hCSS = container.clientHeight;
            renderer.setSize(wCSS, hCSS);

            const dpr = renderer.dpr;
            const w   = wCSS * dpr;
            const h   = hCSS * dpr;

            // Update resolusi ke shader
            uniforms.iResolution.value = [w, h];

            // Hitung ulang anchor & direction dari origin config
            const { anchor, dir } = getAnchorAndDir(cfg.raysOrigin, w, h);
            uniforms.rayPos.value = anchor;
            uniforms.rayDir.value = dir;
        }

        // ── Render loop (RAF) ─────────────────────────────────
        function loop(timestamp) {
            if (!renderer || !uniforms || !mesh) return;

            // Update waktu (ms → detik)
            uniforms.iTime.value = timestamp * 0.001;

            // Smooth mouse (lerp untuk gerakan halus)
            if (cfg.followMouse && cfg.mouseInfluence > 0) {
                const smoothing = 0.92; // Semakin tinggi = semakin lambat responsnya
                smoothMouse.x = smoothMouse.x * smoothing + mouse.x * (1 - smoothing);
                smoothMouse.y = smoothMouse.y * smoothing + mouse.y * (1 - smoothing);
                uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
            }

            try {
                renderer.render({ scene: mesh });
                animId = requestAnimationFrame(loop);
            } catch (e) {
                // Hentikan loop saat WebGL context lost
                console.warn('[LightRays] Render error, loop dihentikan.', e);
            }
        }

        // Pasang listener & jalankan
        window.addEventListener('resize', updatePlacement);
        if (cfg.followMouse) {
            window.addEventListener('mousemove', onMouseMove);
        }
        renderer._updatePlacement = updatePlacement; // Simpan referensi untuk cleanup

        updatePlacement();
        animId = requestAnimationFrame(loop);
    }

    // ── Fungsi cleanup (bebaskan GPU & memory) ────────────────
    function cleanup() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }

        if (renderer) {
            window.removeEventListener('resize', renderer._updatePlacement);
            window.removeEventListener('mousemove', onMouseMove);

            try {
                const ext = renderer.gl.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext(); // Paksa GPU release context
                const canvas = renderer.gl.canvas;
                if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
            } catch (_) { /* abaikan */ }

            renderer = null;
        }

        uniforms  = null;
        mesh      = null;
        isRunning = false;
    }

    // ── IntersectionObserver: hemat GPU saat tidak terlihat ──
    // RAF hanya berjalan saat container masuk viewport (10%+),
    // otomatis berhenti dan membersihkan GPU saat keluar viewport.
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            initWebGL(); // Container terlihat → mulai render
        } else {
            cleanup();   // Container keluar → hentikan & bebaskan GPU
        }
    }, { threshold: 0.1 });

    observer.observe(container);

    // ── Return destroy() untuk cleanup dari luar ──────────────
    return function destroy() {
        observer.disconnect();
        cleanup();
    };
}
