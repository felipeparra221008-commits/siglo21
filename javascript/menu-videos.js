// =====================================================================
//  Videos de las tarjetas del menú (html/explorar.html)
//  Cada video se descarga solo cuando su tarjeta está por aparecer en pantalla
//  y se pausa cuando sale; mientras tanto se ve su imagen de respaldo.
//  Con «reducir movimiento» o «ahorro de datos» se quedan las imágenes fijas.
// =====================================================================
(function () {
    const videos = [...document.querySelectorAll('.tarjeta_video[data-src]')];
    if (!videos.length) return;

    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ahorro = navigator.connection && navigator.connection.saveData;
    if (reducido || ahorro || !('IntersectionObserver' in window)) return;

    const reproducir = (v) => {
        if (!v.src) { v.src = v.dataset.src; v.load(); }
        const p = v.play();
        if (p && p.catch) p.catch(() => {});       // si el navegador no deja reproducir, queda la imagen
    };

    const enPantalla = new Set();
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (e.isIntersecting) { enPantalla.add(e.target); reproducir(e.target); }
            else { enPantalla.delete(e.target); if (e.target.src) e.target.pause(); }
        });
    }, { rootMargin: '150px 0px' });

    videos.forEach((v) => {
        v.addEventListener('error', () => v.remove());   // sin video: se ve la imagen de fondo de la tarjeta
        observador.observe(v);
    });

    // Al volver a la pestaña, se reanudan solo los que están en pantalla.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) videos.forEach((v) => v.pause());
        else enPantalla.forEach(reproducir);
    });
})();
