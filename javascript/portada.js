// =====================================================================
//  Portada de Siglo XXI — controlador de las tres escenas
//   1. Tierra en el espacio  →  2. Robot bailando  →  3. Sala de bienvenida
//  bienvenida.html            → empieza en la Tierra
//  bienvenida.html#bienvenida → abre directamente la sala de bienvenida
//  La escena 3D (portada3d.js) solo se descarga si el navegador tiene WebGL.
// =====================================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);

function hayWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

const root = $('#portada');
const espacio = $('[data-espacio]', root);
const pista = $('[data-pista]', root);
const creditos = $('[data-creditos]', root);
const mensaje = $('[data-mensaje]', root);
const error = $('[data-error]', root);
const flecha = $('[data-accion="espacio"].portada__flecha', root);
const sonido = $('[data-sonido]', root);
const btnMusica = $('[data-accion="musica"]', root);
const btnSilencio = $('[data-accion="silencio"]', root);
const dialogo = $('[data-dialogo]', root);
const bienvenida = $('[data-bienvenida]', root);
const holograma = $('[data-holograma]', root);
const audio = $('[data-audio]', root);

let portada = null;
let promesa = null;
let vista = null;              // 'espacio' | 'robot' | 'bienvenida'
const webgl = hayWebGL();
if (!webgl) root.classList.add('sin-webgl');

/* ---------------- Avisos que envía la escena 3D ---------------- */
const avisos = {
  mensaje(texto) {
    if (texto) { mensaje.textContent = texto; mensaje.classList.add('visible'); }
    else { mensaje.classList.remove('visible'); }
  },
  error(texto) {
    error.textContent = texto;
    error.hidden = false;
    setTimeout(() => { error.hidden = true; }, 7000);
  },
  estado(e) {
    if (e === 'acercando' || e === 'volviendo') {
      creditos.classList.add('oculto');
      flecha.hidden = true;
      cerrarDialogo();
      sonido.hidden = true;
    } else if (e === 'pista') {
      vista = 'robot';
      flecha.hidden = false;
      sonido.hidden = false;
      abrirDialogo();
      precargarHolograma();
    } else if (e === 'inicio') {
      vista = 'espacio';
      creditos.classList.remove('oculto');
    }
  },
  musicaBloqueada(bloqueada) { btnMusica.hidden = !bloqueada; }
};

function cargarPortada() {
  if (!webgl) return Promise.resolve(null);
  if (portada) return Promise.resolve(portada);
  if (promesa) return promesa;
  promesa = import('./portada3d.js')
    .then(({ crearPortada }) => crearPortada({ espacio, pista, canvasBaile: $('[data-baile]', pista), musica: audio, avisos }))
    .then((p) => { portada = p; return p; })
    .catch((fallo) => {
      console.error('No se pudo iniciar la portada 3D:', fallo);
      root.classList.add('sin-webgl');
      promesa = null;
      return null;
    });
  return promesa;
}

/* ---------------- Globo del robot ----------------
   Mientras baila dice la frase del meme, luego introduce el tema y al final pregunta.
   Tocar el globo salta directo a la pregunta. */
const textoDialogo = $('[data-dialogo-texto]', dialogo);
const botonesDialogo = $('[data-dialogo-botones]', dialogo);
const FRASES = [
  { texto: 'Yo cuando me toca empezar la exposición del siglo XXI:', dura: 4000 },
  { texto: 'Bueno, ya en serio… El siglo XXI está lleno de inventos, hechos e ideas que están cambiando el mundo.', dura: 4500 },
  { texto: '¿Me acompañas a descubrirlos?', dura: 0 }   // la pregunta: se queda con los botones
];
let pasoDialogo = 0;
let esperaDialogo = 0;

function mostrarFrase(i) {
  clearTimeout(esperaDialogo);
  pasoDialogo = i;
  const final = i === FRASES.length - 1;
  dialogo.classList.add('cambiando');
  setTimeout(() => {
    textoDialogo.textContent = FRASES[i].texto;
    botonesDialogo.hidden = !final;
    dialogo.classList.toggle('pregunta', final);
    dialogo.classList.remove('cambiando');
    if (final) $('[data-accion="continuar"]', dialogo).focus({ preventScroll: true });
    else esperaDialogo = setTimeout(() => mostrarFrase(i + 1), FRASES[i].dura);
  }, i === 0 ? 0 : 220);
}

function abrirDialogo() {
  dialogo.hidden = false;
  requestAnimationFrame(() => {
    dialogo.classList.add('visible');
    mostrarFrase(0);
  });
}
function cerrarDialogo() {
  clearTimeout(esperaDialogo);
  dialogo.classList.remove('visible');
  setTimeout(() => { if (!dialogo.classList.contains('visible')) dialogo.hidden = true; }, 400);
}
// Tocar el globo (fuera de los botones) adelanta hasta la pregunta.
dialogo.addEventListener('click', (e) => {
  if (e.target.closest('button') || pasoDialogo === FRASES.length - 1) return;
  mostrarFrase(FRASES.length - 1);
});

// El título animado pesa 8,6 MB: se descarga cuando el robot ya está en pantalla.
function precargarHolograma() {
  if (!holograma.getAttribute('src')) holograma.src = holograma.dataset.src;
}

/* ---------------- Cambios de vista ---------------- */
function mostrarEspacio() {
  vista = 'espacio';
  bienvenida.classList.remove('visible');
  creditos.classList.remove('oculto');
  flecha.hidden = true;
  sonido.hidden = true;
  cerrarDialogo();
  if (!webgl) { pista.classList.remove('visible'); return; }
  cargarPortada().then((p) => { if (p) { p.reanudar(); $('.portada__tierra', espacio)?.focus({ preventScroll: true }); } });
}

function mostrarBienvenida() {
  vista = 'bienvenida';
  portada?.abrirBienvenida();
  cerrarDialogo();
  flecha.hidden = true;
  sonido.hidden = true;
  creditos.classList.add('oculto');
  pista.classList.remove('visible');
  precargarHolograma();
  bienvenida.classList.add('visible');
  requestAnimationFrame(() => $('[data-titulo-bienvenida]', root).focus({ preventScroll: true }));
}

async function volverAlRobot() {
  vista = 'robot';
  bienvenida.classList.remove('visible');
  creditos.classList.add('oculto');
  if (!webgl) { pista.classList.add('visible'); flecha.hidden = false; abrirDialogo(); return; }
  const p = await cargarPortada();
  p?.volverAlRobot();
}

// La sala de bienvenida tiene su propia dirección (#bienvenida), así el botón «atrás» del navegador funciona.
function aplicarRuta() {
  if (location.hash === '#bienvenida') mostrarBienvenida();
  else if (vista === 'bienvenida') volverAlRobot();
  else if (vista !== 'robot') mostrarEspacio();
}
function irA(hash) {
  if (hash) location.hash = hash;
  else { history.pushState(null, '', location.pathname + location.search); aplicarRuta(); }
}
window.addEventListener('hashchange', aplicarRuta);

/* ---------------- Botones ---------------- */
root.addEventListener('click', (e) => {
  const b = e.target.closest('[data-accion]');
  if (!b) {
    // Sin WebGL: tocar la foto de la Tierra lleva al escenario del robot.
    if (!webgl && vista === 'espacio' && e.target.closest('[data-espacio]')) {
      vista = 'robot'; creditos.classList.add('oculto'); pista.classList.add('visible'); flecha.hidden = false; abrirDialogo();
    }
    return;
  }
  const accion = b.dataset.accion;
  if (accion === 'continuar') irA('bienvenida');
  else if (accion === 'espacio') {
    cerrarDialogo();
    if (portada) portada.volverAlEspacio();
    else { pista.classList.remove('visible'); mostrarEspacio(); }
  }
  else if (accion === 'robot') irA('');
  else if (accion === 'musica') portada?.activarMusica();
  else if (accion === 'silencio') {
    audio.muted = !audio.muted;
    btnSilencio.setAttribute('aria-pressed', String(audio.muted));
    btnSilencio.setAttribute('aria-label', audio.muted ? 'Activar el sonido' : 'Silenciar la música');
    btnSilencio.title = btnSilencio.getAttribute('aria-label');
  }
});

root.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (vista === 'bienvenida') irA('');
  else if (vista === 'robot') { cerrarDialogo(); portada?.volverAlEspacio(); }
});

/* ---------------- Pestaña oculta / salida de la página ---------------- */
document.addEventListener('visibilitychange', () => {
  if (!portada) return;
  if (document.hidden) portada.pausar(); else portada.reanudar();
});
// Al ir al recorrido se detiene la música; si se vuelve con «atrás», la escena sigue donde estaba.
window.addEventListener('pagehide', () => { audio.pause(); portada?.pausar(); });
window.addEventListener('pageshow', (e) => { if (e.persisted && vista !== 'bienvenida') portada?.reanudar(); });

aplicarRuta();
