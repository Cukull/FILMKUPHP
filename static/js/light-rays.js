/**
 * ============================================================
 *  LightRays — Vanilla JS + Raw WebGL (v3, No Dependencies)
 *  Konversi dari React Bits LightRays component
 *  Fix: Tidak pakai IntersectionObserver, init langsung
 * ============================================================
 */

// ── Helper: hex → [r, g, b] float 0–1 ────────────────────
function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
        : [1, 0.05, 0.05];
}

// ── Helper: origin string → {anchor, dir} dalam piksel ───
function getAnchorAndDir(origin, w, h) {
    const o = 0.2;
    switch (origin) {
        case 'top-left':     return { anchor: [0,         -o * h],     dir: [0,  1] };
        case 'top-right':    return { anchor: [w,         -o * h],     dir: [0,  1] };
        case 'left':         return { anchor: [-o * w,    h * 0.5],    dir: [1,  0] };
        case 'right':        return { anchor: [(1+o)*w,   h * 0.5],    dir: [-1, 0] };
        case 'bottom-left':  return { anchor: [0,         (1+o)*h],    dir: [0, -1] };
        case 'bottom-center':return { anchor: [w * 0.5,  (1+o)*h],    dir: [0, -1] };
        case 'bottom-right': return { anchor: [w,         (1+o)*h],    dir: [0, -1] };
        default:             return { anchor: [w * 0.5,  -o * h],      dir: [0,  1] };
    }
}

// ══════════════════════════════════════════════════════════
//  GLSL SHADERS
// ══════════════════════════════════════════════════════════

const VERT = `
attribute vec2 a_pos;
void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform vec2  uRes;
uniform vec2  uRayPos;
uniform vec2  uRayDir;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uSpread;
uniform float uLength;
uniform float uPulsating;
uniform float uFade;
uniform float uSaturation;
uniform vec2  uMouse;
uniform float uMouseInf;
uniform float uNoise;
uniform float uDistortion;

/* Noise sederhana */
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/* Kekuatan satu berkas ray di titik 'coord' */
float rayStr(vec2 src, vec2 refDir, vec2 coord, float sA, float sB, float spd) {
    vec2  v    = coord - src;
    float dist = length(v);
    if (dist < 0.001) return 0.0;

    vec2  dn   = normalize(v);
    float ca   = dot(dn, refDir);

    /* Distorsi gelombang organik */
    float da = ca + uDistortion * sin(uTime * 2.0 + dist * 0.01) * 0.2;

    /* Lebar pancaran */
    float sf = pow(max(da, 0.0), 1.0 / max(uSpread, 0.001));

    /* Falloff jarak */
    float maxD  = uRes.x * uLength;
    float lfall = clamp((maxD - dist) / maxD, 0.0, 1.0);
    float ffall = clamp((uRes.x * uFade - dist) / (uRes.x * uFade), 0.5, 1.0);

    /* Denyut (pulsating) */
    float pulse = uPulsating > 0.5 ? (0.8 + 0.2 * sin(uTime * spd * 3.0)) : 1.0;

    /* Kekuatan dasar — dua gelombang sinus dijumlahkan */
    float base = clamp(
        (0.45 + 0.15 * sin(da * sA + uTime * spd)) +
        (0.30 + 0.20 * cos(-da * sB + uTime * spd)),
        0.0, 1.0
    );

    return base * lfall * ffall * sf * pulse;
}

void main() {
    /* Konversi: GLSL origin kiri-bawah → kita pakai kiri-atas */
    vec2 coord = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);

    /* Arah ray final (terpengaruh mouse) */
    vec2 dir = uRayDir;
    if (uMouseInf > 0.0) {
        vec2 mPx = uMouse * uRes;
        dir = normalize(mix(uRayDir, normalize(mPx - uRayPos), uMouseInf));
    }

    /* Dua layer ray dengan seed berbeda */
    float r1 = rayStr(uRayPos, dir, coord, 36.2214, 21.11349, 1.5 * uSpeed);
    float r2 = rayStr(uRayPos, dir, coord, 22.3991, 18.0234,  1.1 * uSpeed);

    float strength = r1 * 0.55 + r2 * 0.45;

    /* Noise / grain sinematik */
    if (uNoise > 0.0) {
        float n = hash(coord * 0.008 + uTime * 0.07);
        strength *= (1.0 - uNoise * 0.5 + uNoise * n);
    }

    /* Gradien vertikal: lebih terang di dekat sumber, jangkauan diperluas */
    float gy = 1.0 - (coord.y / uRes.y);
    float gx = 1.0 - abs(coord.x / uRes.x - 0.5) * 0.3; /* lebih lebar secara horizontal */
    float glow = strength * (0.15 + gy * 0.85) * gx;

    vec3 col = uColor * glow * 1.6;

    /* Saturasi */
    if (uSaturation != 1.0) {
        float gray = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(gray), col, uSaturation);
    }

    float alpha = clamp(glow * 2.4, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
}`;

// ══════════════════════════════════════════════════════════
//  WebGL Helpers
// ══════════════════════════════════════════════════════════

function makeShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('[LightRays] Shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
    }
    return s;
}

function makeProgram(gl) {
    const vs = makeShader(gl, gl.VERTEX_SHADER,   VERT);
    const fs = makeShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('[LightRays] Link error:', gl.getProgramInfoLog(p));
        return null;
    }
    return p;
}

// ══════════════════════════════════════════════════════════
//  EXPORT: initLightRays
// ══════════════════════════════════════════════════════════
/**
 * @param {string} id      - ID container element (tanpa '#')
 * @param {object} opts    - Konfigurasi (semua opsional)
 * @returns {Function}     - destroy() untuk cleanup
 */
export function initLightRays(id, opts = {}) {

    const cfg = {
        raysOrigin:     opts.raysOrigin     ?? 'top-center',
        raysColor:      opts.raysColor      ?? '#E50914',
        raysSpeed:      opts.raysSpeed      ?? 2.0,
        lightSpread:    opts.lightSpread    ?? 1.8,
        rayLength:      opts.rayLength      ?? 1.5,
        pulsating:      opts.pulsating      ?? true,
        fadeDistance:   opts.fadeDistance   ?? 1.0,
        saturation:     opts.saturation     ?? 1.8,
        followMouse:    opts.followMouse    ?? true,
        mouseInfluence: opts.mouseInfluence ?? 0.15,
        noiseAmount:    opts.noiseAmount    ?? 0.15,
        distortion:     opts.distortion     ?? 0.08,
    };

    const container = document.getElementById(id);
    if (!container) {
        console.warn('[LightRays] container #' + id + ' tidak ditemukan');
        return () => {};
    }

    // ── State ───────────────────────────────────────────────
    let canvas, gl, prog, vbuf, uloc;
    let rafId  = null;
    let alive  = false;
    const mouse = { x: 0.5, y: 0.5 };
    const smMouse = { x: 0.5, y: 0.5 };

    // ── Init WebGL ──────────────────────────────────────────
    function init() {
        canvas = document.createElement('canvas');

        /* Canvas menutupi seluruh container */
        canvas.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;' +
            'display:block;pointer-events:none;';

        /* Bersihkan container & tambah canvas */
        container.innerHTML = '';
        container.appendChild(canvas);

        /* Ambil WebGL context */
        const ctxOpts = { alpha: true, premultipliedAlpha: false,
                          antialias: false, depth: false, stencil: false };
        gl = canvas.getContext('webgl', ctxOpts)
          || canvas.getContext('experimental-webgl', ctxOpts);

        if (!gl) { console.warn('[LightRays] WebGL tidak tersedia'); return false; }

        /* Compile shaders */
        prog = makeProgram(gl);
        if (!prog) return false;

        /* Full-screen triangle: 3 vertex mengisi clip space [-1,1]² */
        const verts = new Float32Array([-1,-1, 3,-1, -1,3]);
        vbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        /* Attribute */
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        /* Cache uniform locations */
        const uNames = ['uTime','uRes','uRayPos','uRayDir','uColor','uSpeed',
                         'uSpread','uLength','uPulsating','uFade','uSaturation',
                         'uMouse','uMouseInf','uNoise','uDistortion'];
        uloc = {};
        gl.useProgram(prog);
        uNames.forEach(n => { uloc[n] = gl.getUniformLocation(prog, n); });

        /* Set uniform statis */
        const rgb = hexToRgb(cfg.raysColor);
        gl.uniform3f(uloc.uColor,     rgb[0], rgb[1], rgb[2]);
        gl.uniform1f(uloc.uSpeed,     cfg.raysSpeed);
        gl.uniform1f(uloc.uSpread,    cfg.lightSpread);
        gl.uniform1f(uloc.uLength,    cfg.rayLength);
        gl.uniform1f(uloc.uPulsating, cfg.pulsating ? 1.0 : 0.0);
        gl.uniform1f(uloc.uFade,      cfg.fadeDistance);
        gl.uniform1f(uloc.uSaturation,cfg.saturation);
        gl.uniform1f(uloc.uMouseInf,  cfg.followMouse ? cfg.mouseInfluence : 0.0);
        gl.uniform1f(uloc.uNoise,     cfg.noiseAmount);
        gl.uniform1f(uloc.uDistortion,cfg.distortion);
        gl.uniform2f(uloc.uMouse,     0.5, 0.5);

        /* Alpha blending */
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        resize();
        return true;
    }

    // ── Resize canvas & update resolution uniform ───────────
    function resize() {
        if (!canvas || !gl) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w   = Math.max(container.clientWidth,  window.innerWidth);
        const h   = Math.max(container.clientHeight, window.innerHeight);

        canvas.width  = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(prog);
        gl.uniform2f(uloc.uRes, canvas.width, canvas.height);

        const { anchor, dir } = getAnchorAndDir(cfg.raysOrigin, canvas.width, canvas.height);
        gl.uniform2f(uloc.uRayPos, anchor[0], anchor[1]);
        gl.uniform2f(uloc.uRayDir, dir[0],    dir[1]);
    }

    // ── Render loop ─────────────────────────────────────────
    function loop(ts) {
        if (!alive || !gl) return;

        gl.useProgram(prog);
        gl.uniform1f(uloc.uTime, ts * 0.001);

        /* Smooth mouse lerp */
        if (cfg.followMouse) {
            smMouse.x += (mouse.x - smMouse.x) * 0.08;
            smMouse.y += (mouse.y - smMouse.y) * 0.08;
            gl.uniform2f(uloc.uMouse, smMouse.x, smMouse.y);
        }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rafId = requestAnimationFrame(loop);
    }

    // ── Mouse listener ──────────────────────────────────────
    function onMouse(e) {
        const r = container.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) / r.width;
        mouse.y = (e.clientY - r.top)  / r.height;
    }

    // ── Cleanup ─────────────────────────────────────────────
    function destroy() {
        alive = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        window.removeEventListener('resize',    resize);
        window.removeEventListener('mousemove', onMouse);
        if (gl) {
            if (vbuf)  gl.deleteBuffer(vbuf);
            if (prog)  gl.deleteProgram(prog);
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
        }
        if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
        canvas = gl = prog = vbuf = uloc = null;
    }

    // ── START: init setelah satu frame agar DOM layout siap ─
    requestAnimationFrame(() => {
        const ok = init();
        if (!ok) return;

        alive = true;
        window.addEventListener('resize',    resize,  { passive: true });
        if (cfg.followMouse) {
            window.addEventListener('mousemove', onMouse, { passive: true });
        }
        rafId = requestAnimationFrame(loop);
    });

    return destroy;
}
