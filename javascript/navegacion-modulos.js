// =====================================================================
//  Navegación entre módulos con flechas laterales y transición de página
//  Orden: Contexto → Antecedentes → Eventos → Inventores → Futuro → Actividad
//  - Flechas fijas a los lados (también funcionan las teclas ← y →).
//  - Navegadores con transiciones entre páginas (Chrome, Edge, Safari):
//    la página completa se desvanece y se desliza hacia el lado de la flecha.
//  - Resto de navegadores: desvanecimiento propio antes y después de cambiar.
// =====================================================================
(function () {
    const MODULOS = [
        { pagina: 'contexto.html', nombre: 'Contexto' },
        { pagina: 'sigloxx.html', nombre: 'Antecedentes' },
        { pagina: 'eventos.html', nombre: 'Eventos importantes del siglo XXI' },
        { pagina: 'inventores.html', nombre: 'Inventores' },
        { pagina: 'futuro.html', nombre: 'Futuro' },
        { pagina: 'actividad.html', nombre: 'Actividad' }
    ];
    const CLAVE = 'siglo21-direccion';
    const archivo = location.pathname.split('/').pop();
    const indice = MODULOS.findIndex((m) => m.pagina === archivo);
    if (indice < 0) return;

    const reducido = matchMedia('(prefers-reduced-motion: reduce)');
    const transicionNativa = 'onpagereveal' in window && CSS.supports('view-transition-name: nm');
    const raiz = document.documentElement;

    const leerDireccion = () => { try { return sessionStorage.getItem(CLAVE); } catch (e) { return null; } };
    const guardarDireccion = (d) => { try { sessionStorage.setItem(CLAVE, d); } catch (e) { /* sin almacenamiento */ } };
    const borrarDireccion = () => { try { sessionStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ } };

    /* ---------- Llegada a la página: dirección de la animación ---------- */
    // Transición nativa: la dirección se comunica como «tipo» de la transición.
    window.addEventListener('pagereveal', (e) => {
        const dir = leerDireccion();
        borrarDireccion();
        if (!e.viewTransition) return;
        raiz.classList.add('nm-transicion', 'nm-llegada');   // evita que el aparecer propio de la página se sume (ni ahora ni al terminar)
        if (dir && e.viewTransition.types) e.viewTransition.types.add(dir);
        const terminar = () => raiz.classList.remove('nm-transicion');
        e.viewTransition.finished.then(terminar, terminar);
        e.viewTransition.ready.catch(() => {});      // si el navegador omite la transición, no es un error
        if (e.viewTransition.updateCallbackDone) e.viewTransition.updateCallbackDone.catch(() => {});
    });
    // Respaldo: si no hay transición nativa, la página entra con su propio desvanecimiento.
    if (!transicionNativa) {
        const dir = leerDireccion();
        borrarDireccion();
        if (dir && !reducido.matches) {
            raiz.classList.add('nm-entrando', 'nm-' + dir);
            setTimeout(() => raiz.classList.remove('nm-entrando', 'nm-' + dir), 600);
        }
    }

    // Este archivo se carga en <head> (sin «defer») para escuchar «pagereveal» a tiempo;
    // las flechas se crean cuando el cuerpo de la página ya existe.
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();

    function iniciar() {
        /* ---------- Flechas ---------- */
        // En el primer módulo, la flecha izquierda («Inicio del recorrido») lleva al menú principal.
        const MENU = { pagina: 'explorar.html', nombre: 'Inicio del recorrido', etiqueta: 'Ir al menú principal', menu: true };
        const anterior = MODULOS[indice - 1] || (indice === 0 ? MENU : undefined);
        const siguiente = MODULOS[indice + 1];
        const icono = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        function crearFlecha(lado, destino) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `nm-flecha nm-flecha--${lado}`;
            const etiqueta = destino && destino.etiqueta ? destino.etiqueta : destino ? `${lado === 'izq' ? 'Anterior' : 'Siguiente'}: ${destino.nombre}` : (lado === 'izq' ? 'Este es el primer módulo' : 'Este es el último módulo');
            b.setAttribute('aria-label', etiqueta);
            b.title = etiqueta;
            b.innerHTML = icono(lado === 'izq' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7')
                + `<span class="nm-flecha__texto">${destino ? destino.nombre : (lado === 'izq' ? 'Inicio del recorrido' : 'Fin del recorrido')}</span>`;
            if (!destino) { b.disabled = true; b.classList.add('nm-flecha--fin'); }
            else b.addEventListener('click', () => ir(destino, lado === 'izq' ? 'atras' : 'adelante'));
            return b;
        }

        const contenedor = document.createElement('nav');
        contenedor.className = 'nm-flechas';
        contenedor.setAttribute('aria-label', `Módulo ${indice + 1} de ${MODULOS.length}: ${MODULOS[indice].nombre}`);
        contenedor.append(crearFlecha('izq', anterior), crearFlecha('der', siguiente));
        // Las flechas van dentro del recuadro del módulo (o fijas a los lados si una página no lo tiene).
        const recuadro = document.querySelector('.recuadro-modulo, .recorrido__escena');
        if (recuadro) { contenedor.classList.add('nm-flechas--recuadro'); recuadro.appendChild(contenedor); }
        else document.body.appendChild(contenedor);
        raiz.classList.add('nm-con-flechas');

        // Pantallas táctiles: un toque en la imagen del recuadro la muestra en color (sin mantener el dedo)
        // y vuelve sola a oscuro a los pocos segundos o al tocar fuera. Los botones de flecha no la activan.
        const conImagen = document.querySelector('.recuadro-modulo--imagen');
        if (conImagen && matchMedia('(hover: none)').matches) {
            let espera = 0;
            const apagar = () => { conImagen.classList.remove('activo'); clearTimeout(espera); };
            conImagen.addEventListener('click', (e) => {
                if (e.target.closest('button, a')) return;
                if (conImagen.classList.contains('activo')) { apagar(); return; }
                conImagen.classList.add('activo');
                clearTimeout(espera);
                espera = setTimeout(apagar, 4000);
            });
            document.addEventListener('pointerdown', (e) => { if (!conImagen.contains(e.target)) apagar(); }, { passive: true });
        }

        // Con «reducir movimiento», el video del recuadro se queda quieto en su primera imagen.
        if (reducido.matches) document.querySelectorAll('.recuadro-modulo__video').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });

        // Las páginas vecinas se piden por adelantado para que el cambio sea inmediato.
        [anterior, siguiente].forEach((m) => {
            if (!m) return;
            const l = document.createElement('link');
            l.rel = 'prefetch';
            l.href = m.pagina;
            document.head.appendChild(l);
        });

        /* ---------- Cambio de módulo (una sola transición a la vez) ---------- */
        let navegando = false;
        function ir(destino, dir) {
            if (navegando) return;
            navegando = true;
            contenedor.classList.add('nm-ocupado');
            guardarDireccion(dir);
            // Cuenta como visita para «Tu recorrido» (mismo registro que usa el menú).
            if (!destino.menu) try {
                const v = new Set(JSON.parse(localStorage.getItem('siglo21-modulos-vistos')) || []);
                v.add(destino.pagina === 'sigloxx.html' ? 'sigloxx' : destino.pagina.replace('.html', ''));
                localStorage.setItem('siglo21-modulos-vistos', JSON.stringify([...v]));
            } catch (e) { /* sin almacenamiento */ }

            if (transicionNativa || reducido.matches) { location.href = destino.pagina; return; }
            raiz.classList.add('nm-saliendo', 'nm-' + dir);
            setTimeout(() => { location.href = destino.pagina; }, 280);
        }

        // Si se vuelve con «atrás» y el navegador muestra la página guardada, las flechas quedan listas otra vez.
        window.addEventListener('pageshow', () => {
            navegando = false;
            contenedor.classList.remove('nm-ocupado');
            raiz.classList.remove('nm-saliendo', 'nm-adelante', 'nm-atras');
        });

        /* ---------- Teclado: ← y → ---------- */
        document.addEventListener('keydown', (e) => {
            if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            const foco = document.activeElement;
            // No interfiere con campos de texto, listas, controles deslizantes ni zonas que se desplazan de lado.
            if (foco && (foco.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(foco.tagName) || foco.closest('[role="slider"], [role="tablist"], [role="listbox"]'))) return;
            const destino = e.key === 'ArrowLeft' ? anterior : siguiente;
            if (!destino) return;
            e.preventDefault();
            ir(destino, e.key === 'ArrowLeft' ? 'atras' : 'adelante');
        });
    }
})();
