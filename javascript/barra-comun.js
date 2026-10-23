// =====================================================================
//  Botón de menú para celulares (css/barra-comun.css)
//  Antecedentes y Eventos ya traen su botón y su código: ahí no se hace nada.
//  En las demás páginas se crea el mismo botón y se abre/cierra igual.
// =====================================================================
// Sección actual: su enlace queda marcado (texto blanco y línea cian debajo) en todas las páginas,
// aunque el HTML de la página no lo indique.
(function () {
    const actual = location.pathname.split('/').pop();
    document.querySelectorAll('.barra .barra2 a').forEach((a) => {
        if (a.getAttribute('href') !== actual) return;
        a.classList.add('activo');
        a.setAttribute('aria-current', 'page');
    });
})();

(function () {
    const barra = document.querySelector('.barra');
    const menu = barra && barra.querySelector('.barra2');
    if (!menu || barra.querySelector('.menu-toggle')) return;

    if (!menu.id) menu.id = 'menu-principal';
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'menu-toggle';
    boton.setAttribute('aria-label', 'Abrir menú de navegación');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', menu.id);
    boton.innerHTML = '<span></span><span></span><span></span>';
    menu.before(boton);

    function abrir(si) {
        menu.classList.toggle('menu-abierto', si);
        boton.classList.toggle('menu-activo', si);
        boton.setAttribute('aria-expanded', String(si));
        boton.setAttribute('aria-label', si ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        document.body.classList.toggle('menu-bloqueado', si);
    }

    boton.addEventListener('click', () => abrir(!menu.classList.contains('menu-abierto')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => abrir(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('menu-abierto')) { abrir(false); boton.focus(); } });
    // Si la pantalla pasa a tamaño de computador con el menú abierto, se cierra.
    matchMedia('(min-width: 721px)').addEventListener('change', (e) => { if (e.matches) abrir(false); });
})();

// =====================================================================
//  Subtítulos de cada sección en la barra superior (css/barra-comun.css)
//  - Computador: al pasar el mouse (o llegar con el teclado) aparece un panel
//    con los subtítulos de esa sección; en pantallas táctiles grandes, el primer
//    toque lo abre y el segundo entra a la sección.
//  - Celular: dentro del menú, el primer toque en una sección despliega su lista
//    y el segundo entra a la sección.
//  - En la página actual, cada subtítulo baja suavemente a su apartado;
//    en otra página, la abre directamente en ese apartado.
//  Solo en las seis secciones (el menú principal no lo usa).
// =====================================================================
(function () {
    const SECCIONES = {
        'contexto.html': { apartados: [
            ['intro-titulo', '¿Qué es el siglo XXI?'],
            ['tecnologias-titulo', 'Las tecnologías que transforman el siglo XXI'],
            ['dato-titulo', 'Dato curioso']
        ] },
        'sigloxx.html': { apartados: [
            ['titulo-historia', 'Historia'],
            ['titulo-acontecimientos', 'Acontecimientos más importantes'],
            ['titulo-inventos', 'Inventos que cambiaron el siglo']
        ] },
        'eventos.html': { apartados: [
            ['titulo-hitos', 'Hitos que transformaron el siglo XXI'],
            ['titulo-sociedad', '¿Cómo está organizada nuestra sociedad actual?']
        ] },
        'inventores.html': { apartados: [
            ['titulo-inventores', 'Las mentes que están transformando el futuro']
        ] },
        'futuro.html': { apartados: [
            ['titulo-futuro', 'Avances que definirán el mañana'],
            ['futuro-ia', 'Inteligencia artificial', 'tema'],
            ['futuro-medicina', 'Medicina personalizada', 'tema'],
            ['futuro-cuanticos', 'Computadores cuánticos', 'tema'],
            ['futuro-energia', 'Energía sostenible', 'tema'],
            ['futuro-robotica', 'Robótica', 'tema'],
            ['futuro-espacio', 'Exploración espacial', 'tema'],
            ['titulo-conclusion', 'Conclusión']
        ] },
        'actividad.html': { apartados: [
            ['actividad-preguntas', 'Pon a prueba lo que has aprendido']
        ] }
    };

    const barra = document.querySelector('.barra');
    const menu = barra && barra.querySelector('.barra2');
    const actual = location.pathname.split('/').pop();
    if (!menu || !SECCIONES[actual]) return;

    const celular = matchMedia('(max-width: 720px)');
    const sinMouse = matchMedia('(hover: none)');
    const reducido = matchMedia('(prefers-reduced-motion: reduce)');
    const toggle = barra.querySelector('.menu-toggle');
    let abierto = null;
    let espera = 0;

    /* ---------- Paneles ---------- */
    [...menu.children].forEach((enlace, i) => {
        if (enlace.tagName !== 'A') return;
        const pagina = enlace.getAttribute('href');
        const datos = SECCIONES[pagina];
        if (!datos) return;

        const item = document.createElement('span');
        item.className = 'bc-item';
        enlace.before(item);
        item.append(enlace);

        const panel = document.createElement('span');
        panel.className = 'bc-sub';
        panel.id = 'bc-sub-' + i;
        const lista = document.createElement('span');
        lista.className = 'bc-sub__lista';
        datos.apartados.forEach(([id, texto, tipo]) => {
            const a = document.createElement('a');
            a.className = 'bc-sub__enlace' + (tipo ? ' bc-sub__enlace--' + tipo : '');
            a.textContent = texto;
            a.href = pagina === actual ? '#' + id : pagina + (id ? '#' + id : '');
            a.dataset.destino = id;
            lista.append(a);
        });
        panel.append(lista);
        item.append(panel);

        enlace.setAttribute('aria-expanded', 'false');
        enlace.setAttribute('aria-controls', panel.id);

        // Mouse: se abre al entrar y espera un instante al salir, para poder bajar hasta el panel.
        item.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !celular.matches) abrir(item); });
        item.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !celular.matches) cerrarLuego(item); });
        // Teclado
        item.addEventListener('focusin', () => { if (!celular.matches) abrir(item); });
        item.addEventListener('focusout', (e) => { if (!celular.matches && !item.contains(e.relatedTarget)) cerrar(item); });
    });

    function abrir(item) {
        clearTimeout(espera);
        if (abierto && abierto !== item) cerrar(abierto);
        abierto = item;
        item.classList.add('bc-abierto');
        item.firstElementChild.setAttribute('aria-expanded', 'true');
        if (!celular.matches) ajustar(item.querySelector('.bc-sub'));
    }

    function cerrar(item) {
        item.classList.remove('bc-abierto');
        item.firstElementChild.setAttribute('aria-expanded', 'false');
        if (abierto === item) abierto = null;
    }

    function cerrarLuego(item) {
        clearTimeout(espera);
        espera = setTimeout(() => cerrar(item), 220);
    }

    // El panel se centra bajo su sección, sin salirse de la pantalla.
    function ajustar(panel) {
        panel.style.setProperty('--bc-ajuste', '0px');
        const r = panel.querySelector('.bc-sub__lista').getBoundingClientRect();
        const margen = 12;
        let mover = 0;
        if (r.right > innerWidth - margen) mover = innerWidth - margen - r.right;
        if (r.left + mover < margen) mover = margen - r.left;
        panel.style.setProperty('--bc-ajuste', Math.round(mover) + 'px');
    }

    // Los paneles cerrados también ocupan su lugar: se acomodan desde el inicio
    // (y al cambiar el tamaño) para que ninguno cree desplazamiento horizontal.
    function ajustarTodos() {
        menu.querySelectorAll('.bc-sub').forEach((panel) => {
            if (celular.matches) panel.style.removeProperty('--bc-ajuste');
            else ajustar(panel);
        });
    }
    ajustarTodos();
    // Las animaciones de los paneles se activan después del primer ajuste (así no se deslizan al cargar).
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('bc-listo')));
    let marco = 0;
    window.addEventListener('resize', () => { cancelAnimationFrame(marco); marco = requestAnimationFrame(ajustarTodos); });
    if (document.fonts) document.fonts.ready.then(ajustarTodos);

    function cerrarMenuCelular() {
        if (toggle && menu.classList.contains('menu-abierto')) toggle.click();
    }

    // Baja suavemente al apartado (los desplegables de Futuro se abren primero).
    function irA(id, suave) {
        const destino = id ? document.getElementById(id) : document.querySelector('.recuadro-modulo');
        if (!destino) return;
        if (destino.tagName === 'DETAILS') destino.open = true;
        destino.scrollIntoView({ behavior: suave && !reducido.matches ? 'smooth' : 'auto', block: 'start' });
        history.replaceState(null, '', id ? '#' + id : location.pathname);
    }

    /* ---------- Clics y toques (en captura, antes que los demás scripts de la barra) ---------- */
    menu.addEventListener('click', (e) => {
        const seccion = e.target.closest('.bc-item > a');
        if (seccion) {
            const item = seccion.parentElement;
            // Celular y pantallas táctiles: el primer toque muestra los subtítulos.
            if ((celular.matches || sinMouse.matches) && !item.classList.contains('bc-abierto')) {
                e.preventDefault();
                e.stopPropagation();
                abrir(item);
                return;
            }
            // Con la lista ya abierta, el segundo toque entra a la sección.
            return;
        }

        const sub = e.target.closest('.bc-sub__enlace');
        if (!sub) return;
        if (abierto) cerrar(abierto);
        if (!sub.getAttribute('href').startsWith('#')) { cerrarMenuCelular(); return; }   // otra página
        e.preventDefault();
        e.stopPropagation();
        cerrarMenuCelular();
        requestAnimationFrame(() => irA(sub.dataset.destino, true));
    }, true);

    document.addEventListener('pointerdown', (e) => { if (abierto && !abierto.contains(e.target)) cerrar(abierto); }, { passive: true });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && abierto && !celular.matches) {
            const enlace = abierto.firstElementChild;
            cerrar(abierto);
            enlace.focus();
        }
    });
    celular.addEventListener('change', () => { if (abierto) cerrar(abierto); });

    // Al llegar desde otra página con un apartado (por ejemplo futuro.html#futuro-robotica),
    // se abre el desplegable correspondiente y se ubica en él.
    function llegada() {
        const id = decodeURIComponent(location.hash.slice(1));
        const destino = id && document.getElementById(id);
        if (destino && destino.tagName === 'DETAILS' && !destino.open) {
            destino.open = true;
            destino.scrollIntoView({ block: 'start' });
        }
    }
    llegada();
    window.addEventListener('hashchange', llegada);
})();
