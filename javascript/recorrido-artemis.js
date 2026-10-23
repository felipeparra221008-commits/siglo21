// =====================================================================
//  Recorrido de la misión Artemis: el scroll (rueda, teclado, dedo) avanza
//  140 cuadros dibujados en el recuadro de Futuro.
//  Celular (pantalla vertical): cuadros de 540×960. Computador: 1280×720.
//  Los cuadros se cargan por pasadas (gruesa → fina) para que se pueda
//  recorrer desde el principio sin esperar a que lleguen todos.
// =====================================================================
(function () {
    const seccion = document.querySelector('[data-recorrido]');
    if (!seccion) return;

    const TOTAL = 140;
    const INICIO_ETAPAS = [0, 31, 66, 87, 116];          // primer cuadro de cada escena (para el modo de movimiento reducido)
    const lienzo = seccion.querySelector('canvas');
    const ctx = lienzo.getContext('2d', { alpha: false });
    const avance = seccion.querySelector('.recorrido__avance span');

    const vertical = matchMedia('(max-aspect-ratio: 1/1)');
    const reducido = matchMedia('(prefers-reduced-motion: reduce)');
    const ahorro = navigator.connection && navigator.connection.saveData;
    const carpeta = () => '../img/artemis/' + (vertical.matches ? 'celular' : 'escritorio') + '/';
    const nombre = (i) => carpeta() + String(i + 1).padStart(3, '0') + '.webp';

    let cuadros = [];          // Image por índice (o undefined)
    let listos = [];           // true cuando ya se puede dibujar
    let actual = -1;           // posición (con decimales) dibujada por última vez
    let pendiente = false;

    /* ---------------- Carga por pasadas ---------------- */
    function ordenDeCarga() {
        // Movimiento reducido o ahorro de datos: solo un cuadro por etapa.
        if (reducido.matches || ahorro) return INICIO_ETAPAS.map((s, e) => Math.round((s + (INICIO_ETAPAS[e + 1] ?? TOTAL) - 1) / 2));
        const orden = [], visto = new Set();
        for (const paso of [12, 4, 2, 1]) {
            for (let i = 0; i < TOTAL; i += paso) if (!visto.has(i)) { visto.add(i); orden.push(i); }
        }
        if (!visto.has(TOTAL - 1)) orden.push(TOTAL - 1);
        return orden;
    }

    function cargar() {
        cuadros = new Array(TOTAL);
        listos = new Array(TOTAL).fill(false);
        const cola = ordenDeCarga();
        const generacion = (cargar.gen = (cargar.gen || 0) + 1);
        let enCurso = 0;
        const siguiente = () => {
            if (generacion !== cargar.gen) return;            // cambió la orientación: se reinicia
            while (enCurso < 4 && cola.length) {
                const i = cola.shift();
                const img = new Image();
                img.decoding = 'async';
                enCurso++;
                img.onload = () => {
                    enCurso--;
                    if (generacion !== cargar.gen) return;
                    cuadros[i] = img; listos[i] = true;
                    if (Math.abs(i - actual) < 14) pedirDibujo(true);
                    siguiente();
                };
                img.onerror = () => { enCurso--; siguiente(); };
                img.src = nombre(i);
            }
        };
        siguiente();
    }

    /* ---------------- Dibujo ---------------- */
    function ajustarLienzo() {
        const caja = lienzo.getBoundingClientRect();
        const escala = Math.min(window.devicePixelRatio || 1, vertical.matches ? 1.5 : 1.75);
        const w = Math.round(caja.width * escala), h = Math.round(caja.height * escala);
        if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; actual = -1; }
    }

    function cercano(i) {
        if (listos[i]) return i;
        for (let d = 1; d < TOTAL; d++) {
            if (i - d >= 0 && listos[i - d]) return i - d;
            if (i + d < TOTAL && listos[i + d]) return i + d;
        }
        return -1;
    }

    function pintar(img, alfa) {
        const W = lienzo.width, H = lienzo.height;
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const w = img.naturalWidth * s, h = img.naturalHeight * s;
        ctx.globalAlpha = alfa;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        ctx.globalAlpha = 1;
    }

    function progreso() {
        const caja = seccion.getBoundingClientRect();
        const recorrible = seccion.offsetHeight - lienzo.parentElement.offsetHeight;
        const arriba = parseFloat(getComputedStyle(lienzo.parentElement).top) || 0;
        return Math.min(1, Math.max(0, (arriba - caja.top) / Math.max(1, recorrible)));
    }

    function etapaDe(f) {
        let e = 0;
        INICIO_ETAPAS.forEach((s, k) => { if (f >= s - 2) e = k; });
        return e;
    }

    function dibujar(forzar) {
        pendiente = false;
        const p = progreso();
        let f = p * (TOTAL - 1);
        if (reducido.matches || ahorro) {                    // una imagen fija por etapa
            const e = etapaDe(f);
            f = Math.round((INICIO_ETAPAS[e] + (INICIO_ETAPAS[e + 1] ?? TOTAL) - 1) / 2);
        }
        avance.style.transform = 'scaleX(' + p.toFixed(4) + ')';

        if (!forzar && Math.abs(f - actual) < 0.01) return;
        const a = Math.floor(f), b = Math.min(TOTAL - 1, a + 1), mezcla = f - a;
        const ia = cercano(a);
        if (ia < 0) return;                                  // aún no hay cuadros: se ve el fondo con el primer cuadro
        ajustarLienzo();
        pintar(cuadros[ia], 1);
        // Mezcla con el cuadro siguiente para que el movimiento se vea continuo.
        if (mezcla > 0.02 && ia === a && listos[b]) pintar(cuadros[b], mezcla);
        actual = f;
    }

    function pedirDibujo(forzar) {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => dibujar(forzar));
    }

    /* ---------------- Eventos ---------------- */
    // En captura: así llegan tanto el scroll de la ventana como el del <body>.
    document.addEventListener('scroll', () => pedirDibujo(false), { passive: true, capture: true });

    // Mientras el recorrido está en pantalla se revisa la posición en cada cuadro de animación
    // (los saltos con teclado o clic no siempre disparan «scroll»); fuera de pantalla no gasta nada.
    let visible = false, ultimo = -1;
    function latido() {
        if (!visible) return;
        const p = progreso();
        if (Math.abs(p - ultimo) > 0.0004) { ultimo = p; dibujar(false); }
        requestAnimationFrame(latido);
    }
    new IntersectionObserver(([e]) => {
        const antes = visible;
        visible = e.isIntersecting;
        if (visible && !antes) requestAnimationFrame(latido);
    }).observe(seccion);
    // El recuadro se fija justo debajo de la barra real (en celular la barra es más alta).
    const barra = document.querySelector('.barra');
    const medirBarra = () => { if (barra) seccion.style.setProperty('--alto-barra', barra.offsetHeight + 'px'); };
    medirBarra();
    window.addEventListener('resize', () => { medirBarra(); ajustarLienzo(); pedirDibujo(true); });
    vertical.addEventListener('change', () => { cargar(); pedirDibujo(true); });

    ajustarLienzo();
    cargar();
    pedirDibujo(true);
})();
