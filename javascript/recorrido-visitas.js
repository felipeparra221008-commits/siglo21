// =====================================================================
//  Recorrido de los módulos: recuerda en este navegador qué módulos se
//  han visitado y lo muestra en el menú (bloque «Tu recorrido» y etiqueta
//  «Visto» en cada tarjeta). Se incluye en el menú y en las páginas de
//  los módulos; en cada módulo solo marca la visita.
// =====================================================================
(function () {
    const MODULOS = [
        { id: 'contexto', pagina: 'contexto.html', nombre: 'Contexto' },
        { id: 'sigloxx', pagina: 'sigloxx.html', nombre: 'Antecedentes' },
        { id: 'eventos', pagina: 'eventos.html', nombre: 'Eventos' },
        { id: 'inventores', pagina: 'inventores.html', nombre: 'Inventores' },
        { id: 'futuro', pagina: 'futuro.html', nombre: 'Futuro' },
        { id: 'actividad', pagina: 'actividad.html', nombre: 'Actividad' }
    ];
    const CLAVE = 'siglo21-modulos-vistos';

    const leer = () => {
        try { return new Set(JSON.parse(localStorage.getItem(CLAVE)) || []); } catch (e) { return new Set(); }
    };
    const guardar = (vistos) => {
        try { localStorage.setItem(CLAVE, JSON.stringify([...vistos])); } catch (e) { /* sin almacenamiento: no se recuerda */ }
    };
    const moduloDe = (url) => {
        const archivo = (url || '').split(/[?#]/)[0].split('/').pop();
        return MODULOS.find((m) => m.pagina === archivo);
    };
    const marcar = (m) => { if (!m) return; const v = leer(); v.add(m.id); guardar(v); };

    // En la página de un módulo: se marca como visto.
    marcar(moduloDe(location.pathname));

    const avance = document.querySelector('[data-avance]');
    if (!avance) return;

    // Si se llegó al menú desde un módulo (por la barra o el botón «atrás»), también cuenta.
    if (document.referrer.startsWith(location.origin)) marcar(moduloDe(document.referrer));

    function pintar() {
        const vistos = leer();
        const total = MODULOS.length;
        const hechos = MODULOS.filter((m) => vistos.has(m.id)).length;
        const siguiente = MODULOS.find((m) => !vistos.has(m.id));

        const conteo = avance.querySelector('[data-conteo]');
        conteo.textContent = `${hechos} de ${total}`;
        conteo.setAttribute('aria-label', `${hechos} de ${total} módulos explorados`);

        avance.querySelectorAll('[data-modulo]').forEach((li) => {
            const visto = vistos.has(li.dataset.modulo);
            li.classList.toggle('visto', visto);
            li.querySelector('.sr-solo').textContent = `${li.title}: ${visto ? 'visto' : 'por explorar'}`;
        });

        // Pie de la tarjeta: solo informa el avance (al completar, permite reiniciar).
        const pie = avance.querySelector('[data-pie]');
        if (siguiente) pie.textContent = `${Math.round(hechos / total * 100)} % del recorrido completado.`;
        else pie.innerHTML = 'Recorrido completado. <button type="button" class="avance_reiniciar" data-reiniciar>Reiniciar</button>';

        // Etiqueta «Visto» en las tarjetas del menú.
        document.querySelectorAll('.tarjeta_padre > a').forEach((tarjeta) => {
            const m = moduloDe(tarjeta.getAttribute('href'));
            let chip = tarjeta.querySelector('.tarjeta_visto');
            if (m && vistos.has(m.id)) {
                if (!chip) {
                    chip = document.createElement('span');
                    chip.className = 'tarjeta_visto';
                    chip.textContent = 'Visto';
                    tarjeta.appendChild(chip);
                }
            } else if (chip) chip.remove();
        });
    }

    // Al entrar a un módulo desde el menú, se marca antes de salir.
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-reiniciar]')) { guardar(new Set()); pintar(); return; }
        const enlace = e.target.closest('a[href]');
        if (enlace) marcar(moduloDe(enlace.getAttribute('href')));
    });

    // Al volver con «atrás», el navegador puede mostrar la página guardada: se actualiza.
    window.addEventListener('pageshow', pintar);
    pintar();
})();
