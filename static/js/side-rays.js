/**
 * ============================================================
 *  SideRays — Vanilla JS WebGL (Konversi dari React Bits)
 *  FILMKU Cinema — Cinematic Red Theme
 *  Library: ogl (via ES Module CDN)
 * ============================================================
 *
 *  Cara pakai:
 *    import { initSideRays } from './side-rays.js';
 *    initSideRays('side-rays-bg', { speed: 2.5, ... });
 * ============================================================
 */

// ── Import library OGL via CDN ES Module ──────────────────────────────────────
// OGL adalah WebGL micro-library ringan tanpa dependensi eksternal lain.
import { Renderer, Program, Triangle, Mesh } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.9/src/index.js';

// ── Helper: Konversi warna HEX → Array [R, G, B] ber-range 0.0–1.0 ──────────
// GLSL shader membutuhkan nilai float normalized (0-1), bukan integer (0-255).
function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
        : [1, 1, 1]; // Fallback ke warna putih jika format tidak valid
}

// ── Helper: Tentukan flip sumbu X/Y berdasarkan prop 'origin' ────────────────
// Cahaya ray memancar dari salah satu sudut kanvas. Flip dilakukan di GLSL.
function originToFlip(origin) {
    switch (origin) {
        case 'top-left':     return [1, 0]; // Flip sumbu X agar pancar dari kiri
        case 'bottom-right': return [0, 1]; // Flip sumbu Y agar pancar dari bawah
        case 'bottom-left':  return [1, 1]; // Flip keduanya
        default:             return [0, 0]; // 'top-right' = tidak ada flip (default)
    }
}

// ── GLSL Vertex Shader ────────────────────────────────────────────────────────
// Full-screen triangle yang menutup seluruh kanvas (1 triangle = lebih efisien dari quad).
const VERT = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`;

// ── GLSL Fragment Shader (Inti Efek SideRays) ────────────────────────────────
// Setiap piksel dihitung berdasarkan sudut ke sumber cahaya + fungsi ray sinusoidal.
const FRAG = `precision highp float;

uniform float iTime;           /* Waktu animasi (detik) — berubah setiap frame */
uniform vec2  iResolution;     /* Ukuran kanvas dalam piksel */
uniform float iSpeed;          /* Kecepatan animasi ray */
uniform vec3  iRayColor1;      /* Warna layer ray pertama (RGB 0-1) */
uniform vec3  iRayColor2;      /* Warna layer ray kedua (RGB 0-1) */
uniform float iIntensity;      /* Kecerahan keseluruhan efek */
uniform float iSpread;         /* Lebar sudut antar-dua ray layer */
uniform float iFlipX;          /* 1 = balik sumbu horizontal */
uniform float iFlipY;          /* 1 = balik sumbu vertikal */
uniform float iTilt;           /* Rotasi keseluruhan ray fan (derajat) */
uniform float iSaturation;     /* Saturasi warna (0=abu, >1=lebih vivid) */
uniform float iBlend;          /* Rasio campur ray1:ray2 (0=all ray1, 1=all ray2) */
uniform float iFalloff;        /* Kecuraman redaman jarak dari sumber */
uniform float iOpacity;        /* Opasitas akhir seluruh efek */

/* Fungsi hitung kekuatan satu layer ray di koordinat tertentu */
float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
    vec2  sourceToCoord = coord - raySource;
    /* Hitung cosine sudut antara koordinat dan arah referensi ray */
    float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
    /* Kombinasi dua gelombang sinus untuk variasi organik */
    return clamp(
        (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
        (0.30 + 0.20 * cos(-cosAngle * seedB + iTime * speed)),
        0.0, 1.0) *
        /* Redaman berdasarkan jarak dari tepi kanvas */
        clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    /* Terapkan flip horizontal/vertikal berdasarkan prop 'origin' */
    if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
    if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

    /* Konversi koordinat: GLSL origin bawah-kiri → kita butuh atas-kiri */
    vec2 coord  = vec2(fragCoord.x, iResolution.y - fragCoord.y);

    /* Posisi sumber cahaya: sedikit di luar pojok kanan-atas layar */
    vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

    /* Terapkan rotasi tilt (menggunakan matriks rotasi 2D manual) */
    float tiltRad = iTilt * 3.14159265 / 180.0;
    float cs = cos(tiltRad);
    float sn = sin(tiltRad);
    vec2 rel         = coord - rayPos;
    vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

    /* Hitung dua arah referensi ray berdasarkan spread (lebar kipas) */
    float halfSpread  = iSpread * 0.275;
    vec2 rayRefDir1   = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
    vec2 rayRefDir2   = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

    /* Render masing-masing layer ray dengan seed berbeda agar tidak sinkron */
    vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214,  21.11349, iSpeed);
    vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991,  18.0234,  iSpeed * 0.2);

    /* Campur dua layer berdasarkan nilai 'blend' */
    vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

    /* Hitung kecerahan berbasis jarak dari sumber + falloff */
    float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
    float brightness      = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
    color.rgb *= brightness;

    /* Kontrol saturasi warna: mix antara grayscale dan warna asli */
    float gray    = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb     = mix(vec3(gray), color.rgb, iSaturation);

    /* Alpha diturunkan dari kecerahan maksimum channel RGB × opasitas */
    color.a       = max(color.r, max(color.g, color.b)) * iOpacity;
    gl_FragColor  = color;
}`;

// ── Fungsi Utama: initSideRays ───────────────────────────────────────────────
/**
 * Inisialisasi efek SideRays WebGL pada sebuah elemen container.
 *
 * @param {string} containerId - ID elemen HTML target (tanpa '#')
 * @param {object} config      - Objek konfigurasi efek (semua bersifat opsional)
 */
export function initSideRays(containerId, config = {}) {

    // ── Gabungkan config user dengan nilai default tema FILMKU ────────────────
    const cfg = Object.assign({
        speed:      2.5,
        rayColor1:  '#ff0000',  // Merah khas FILMKU
        rayColor2:  '#c9e3ff',  // Cahaya putih kebiruan
        intensity:  2,
        spread:     2,
        origin:     'top-right',
        tilt:       0,
        saturation: 1.5,
        blend:      0.75,
        falloff:    1.6,
        opacity:    1.0,
    }, config);

    // Cari elemen container di DOM
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[SideRays] Container "#${containerId}" tidak ditemukan di DOM.`);
        return;
    }

    // ── State internal modul ini (menggantikan useRef di React) ───────────────
    let renderer       = null;  // Instance OGL Renderer
    let uniforms       = null;  // Referensi ke objek uniforms GLSL
    let mesh           = null;  // OGL Mesh (geometry + shader)
    let animationId    = null;  // ID dari requestAnimationFrame aktif
    let isRunning      = false; // Flag agar tidak dobel-start

    // ── Fungsi: Inisialisasi Renderer WebGL ───────────────────────────────────
    function initWebGL() {
        if (isRunning) return; // Jangan start ulang jika sudah berjalan
        isRunning = true;

        // Buat renderer OGL dengan alpha=true (latar belakang transparan)
        renderer = new Renderer({
            dpr:   Math.min(window.devicePixelRatio, 2), // Batasi DPR max 2x (hemat VRAM)
            alpha: true,                                 // Kanvas transparan agar bg page terlihat
        });

        const gl = renderer.gl;

        // Atur ukuran canvas secara CSS agar mengisi container sepenuhnya
        gl.canvas.style.width    = '100%';
        gl.canvas.style.height   = '100%';
        gl.canvas.style.display  = 'block';

        // Kosongkan container dari child sebelumnya lalu masukkan canvas baru
        container.innerHTML = '';
        container.appendChild(gl.canvas);

        // Hitung flip berdasarkan prop 'origin'
        const [flipX, flipY] = originToFlip(cfg.origin);

        // ── Buat objek uniforms (variabel yang dikirim dari JS → GLSL) ────────
        uniforms = {
            iTime:       { value: 0 },
            iResolution: { value: [1, 1] },
            iSpeed:      { value: cfg.speed },
            iRayColor1:  { value: hexToRgb(cfg.rayColor1) },
            iRayColor2:  { value: hexToRgb(cfg.rayColor2) },
            iIntensity:  { value: cfg.intensity },
            iSpread:     { value: cfg.spread },
            iFlipX:      { value: flipX },
            iFlipY:      { value: flipY },
            iTilt:       { value: cfg.tilt },
            iSaturation: { value: cfg.saturation },
            iBlend:      { value: cfg.blend },
            iFalloff:    { value: cfg.falloff },
            iOpacity:    { value: cfg.opacity },
        };

        // Buat geometry full-screen triangle & compile shader program
        const geometry = new Triangle(gl);
        const program  = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
        mesh           = new Mesh(gl, { geometry, program });

        // ── Fungsi resize: update ukuran renderer saat window berubah ─────────
        function updateSize() {
            if (!container || !renderer) return;
            renderer.dpr = Math.min(window.devicePixelRatio, 2);
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            // Kirim resolusi aktual (termasuk DPR) ke GLSL
            uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
        }

        // ── Render loop utama (dipanggil setiap frame oleh RAF) ───────────────
        function loop(timestamp) {
            if (!renderer || !uniforms || !mesh) return;
            // Update waktu animasi (dalam detik, bukan milidetik)
            uniforms.iTime.value = timestamp * 0.001;
            try {
                renderer.render({ scene: mesh }); // Render 1 frame
                animationId = requestAnimationFrame(loop); // Minta frame berikutnya
            } catch (e) {
                // Hentikan loop jika terjadi error WebGL (misalnya context lost)
                console.warn('[SideRays] Render error, loop dihentikan.', e);
            }
        }

        // Pasang listener resize dan langsung jalankan sekali
        window.addEventListener('resize', updateSize);
        updateSize();

        // Simpan referensi updateSize untuk cleanup
        renderer._updateSize = updateSize;

        // Mulai render loop!
        animationId = requestAnimationFrame(loop);
    }

    // ── Fungsi: Bersihkan semua resource WebGL dari memori ───────────────────
    function cleanup() {
        if (animationId) {
            cancelAnimationFrame(animationId); // Hentikan RAF
            animationId = null;
        }

        if (renderer) {
            window.removeEventListener('resize', renderer._updateSize);

            try {
                // Beritahu browser untuk melepaskan konteks WebGL dari GPU
                const loseCtx = renderer.gl.getExtension('WEBGL_lose_context');
                if (loseCtx) loseCtx.loseContext();

                // Hapus elemen canvas dari DOM
                const canvas = renderer.gl.canvas;
                if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
            } catch (e) { /* abaikan error saat cleanup */ }

            renderer = null;
        }

        uniforms  = null;
        mesh      = null;
        isRunning = false;
    }

    // ── IntersectionObserver: Aktif/Nonaktif berdasarkan visibilitas ──────────
    // Ini adalah optimasi kritis: render loop HANYA berjalan saat terlihat di layar.
    // Ketika user scroll menjauh, CPU/GPU dibebaskan sepenuhnya (0% usage).
    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                // Container MASUK ke viewport → mulai render
                initWebGL();
            } else {
                // Container KELUAR dari viewport → hentikan render & bebaskan memori
                cleanup();
            }
        },
        { threshold: 0.1 } // Trigger saat minimal 10% container terlihat
    );

    // Mulai pantau elemen container
    observer.observe(container);

    // ── Return fungsi destroy untuk membersihkan dari luar (opsional) ─────────
    return function destroy() {
        observer.disconnect();
        cleanup();
    };
}
