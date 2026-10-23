// =====================================================================
//  PORTADA 3D — adaptación de bienvenida_celulares_optimizada.html
//
//  Se conservan del archivo original:
//   · La Tierra (img/Earth_1_12756.glb), sus luces, estrellas y cámaras.
//   · Arrastrar gira la Tierra; un toque sobre ella inicia el acercamiento.
//   · El acercamiento de 3,2 s y el fundido hacia la escena del robot.
//   · El robot (img/archivo_robot.glb) bailando (desde 2026-10-23 en el suelo, sin
//     img/plataforma.glb, más grande y con una sombra y un anillo de luz bajo los pies),
//     con las luces azul y violeta y la música img/../audio/pista_robot.mp3.
//   · La sincronización: el baile se coloca en  tiempo de la música % duración.
//   · Las optimizaciones móviles: resolución 1,25 (Tierra) y 1,1 (robot) en
//     pantallas de hasta 600 px y dibujar solo la escena visible.
//
//  Mejoras añadidas sin reducir la calidad:
//   · El robot se descarga después de la Tierra (antes se
//     descargaban los 37 MB a la vez y la Tierra tardaba más en aparecer).
//   · El bucle se detiene por completo en la bienvenida, fuera de la portada
//     o con la pestaña oculta; al salir se liberan los recursos gráficos.
//   · Si se toca la Tierra antes de que el robot termine de cargar, la
//     escena espera con un indicador en lugar de quedar vacía.
// =====================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MOBILE = '(max-width: 600px)';
const cache = new Map();
const cargador = new GLTFLoader();
function cargar(url) {
  if (!cache.has(url)) {
    const p = cargador.loadAsync(url);
    cache.set(url, p);
    p.catch(() => cache.delete(url));
  }
  return cache.get(url);
}

export function crearPortada({ espacio, pista, canvasBaile, musica, avisos }) {
  const movil = () => window.matchMedia(MOBILE).matches;
  let estado = 'inicio';   // inicio | acercando | pista | volviendo | bienvenida
  let liberado = false;

  // Resolución: la de siempre (1,25 / 1,1 en celular; 2 / 1,5 en computador) multiplicada por
  // «escala», que baja solo si el equipo no alcanza a moverse fluido (nunca por debajo de 1).
  let escala = 1;
  const resolucionTierra = () => Math.max(1, (movil() ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio, 2)) * escala);
  const resolucionBaile = () => Math.max(1, (movil() ? Math.min(devicePixelRatio, 1.1) : Math.min(devicePixelRatio, 1.5)) * escala);

  /* =====================================================
     PARTE 1: TIERRA
  ===================================================== */
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x020713);
  const camara = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 2000);
  camara.position.z = 5;

  const renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderizador.setPixelRatio(resolucionTierra());
  renderizador.setSize(innerWidth, innerHeight);
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping;
  renderizador.toneMappingExposure = 1.1;
  const lienzo = renderizador.domElement;
  lienzo.className = 'portada__tierra';
  lienzo.tabIndex = 0;
  lienzo.setAttribute('role', 'button');
  lienzo.setAttribute('aria-label', 'Tierra en 3D. Arrastra para girarla; pulsa Intro o tócala para acercarte.');
  espacio.appendChild(lienzo);

  escena.add(new THREE.AmbientLight(0xffffff, 2));
  const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.7);
  luzPrincipal.position.set(5, 3, 6);
  escena.add(luzPrincipal);
  const luzAzul = new THREE.PointLight(0x168cff, 25, 30);
  luzAzul.position.set(-5, -2, -2);
  escena.add(luzAzul);

  const posiciones = [];
  for (let i = 0; i < 2400; i++) {
    posiciones.push((Math.random() - 0.5) * 180, (Math.random() - 0.5) * 110, -10 - Math.random() * 100);
  }
  const geometriaEstrellas = new THREE.BufferGeometry();
  geometriaEstrellas.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  const materialEstrellas = new THREE.PointsMaterial({ color: 0xb9dfff, size: 0.075, transparent: true, opacity: 0.85 });
  const estrellas = new THREE.Points(geometriaEstrellas, materialEstrellas);
  escena.add(estrellas);

  const grupoTierra = new THREE.Group();
  escena.add(grupoTierra);
  let tierra = null;
  let cargada = false;

  function ajustarCamaraTierra() {
    const relacion = (espacio.clientWidth || innerWidth) / (espacio.clientHeight || innerHeight);
    camara.aspect = relacion;
    if (relacion < 0.7) { camara.fov = 48; camara.position.set(0, 0, 5.35); }
    else if (relacion > 2.0) { camara.fov = 41; camara.position.set(0, 0, 5.45); }
    else { camara.fov = 45; camara.position.set(0, 0, 5); }
    camara.updateProjectionMatrix();
  }
  ajustarCamaraTierra();

  cargar('img/Earth_1_12756.glb').then((modelo) => {
    if (liberado) return;
    tierra = modelo.scene;
    tierra.position.set(0, 0, 0);
    tierra.scale.setScalar(1);
    tierra.rotation.set(0, 0, 0);
    const caja = new THREE.Box3().setFromObject(tierra);
    const maximo = Math.max(...caja.getSize(new THREE.Vector3()).toArray());
    if (!maximo) { avisos.error('El modelo de la Tierra no tiene un tamaño válido.'); return; }
    tierra.position.sub(caja.getCenter(new THREE.Vector3()));
    tierra.scale.setScalar(2.1 / maximo);
    // Los efectos de la Tierra se preparan sin bloquear la página antes de mostrarla.
    const preparada = renderizador.compileAsync ? renderizador.compileAsync(tierra, camara, escena).catch(() => {}) : Promise.resolve();
    return preparada.then(() => {
      if (liberado) return;
      // Sus texturas suben a la tarjeta de video antes de aparecer (solo se ven las estrellas).
      tierra.traverse((o) => {
        const materiales = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
        materiales.forEach((m) => Object.values(m).forEach((v) => { if (v && v.isTexture) renderizador.initTexture(v); }));
      });
      grupoTierra.add(tierra);
      cargada = true;
      avisos.tierraLista?.();
      cargarEscenario();          // el robot se descarga después de la Tierra
    });
  }).catch((fallo) => {
    console.error(fallo);
    if (!liberado) avisos.error('No se pudo cargar la Tierra (img/Earth_1_12756.glb).');
  });

  /* =====================================================
     PARTE 2: PLATAFORMA Y ROBOT 3D
  ===================================================== */
  const escenaBaile = new THREE.Scene();
  const camaraBaile = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 1000);
  const renderBaile = new THREE.WebGLRenderer({ canvas: canvasBaile, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderBaile.setPixelRatio(resolucionBaile());
  renderBaile.setSize(innerWidth, innerHeight);
  renderBaile.outputColorSpace = THREE.SRGBColorSpace;
  renderBaile.toneMapping = THREE.ACESFilmicToneMapping;
  renderBaile.toneMappingExposure = 1.15;

  escenaBaile.add(new THREE.HemisphereLight(0xc9eaff, 0x10102c, 2.2));
  const luzBlancaBaile = new THREE.DirectionalLight(0xffffff, 3);
  luzBlancaBaile.position.set(3, 7, 5);
  escenaBaile.add(luzBlancaBaile);
  // Luces azules y violetas del proyecto original.
  const luzAzulBaile = new THREE.PointLight(0x00bfff, 18, 25);
  luzAzulBaile.position.set(-4, 3, 3);
  escenaBaile.add(luzAzulBaile);
  const luzVioletaBaile = new THREE.PointLight(0x7c3cff, 22, 25);
  luzVioletaBaile.position.set(4, 2, -3);
  escenaBaile.add(luzVioletaBaile);

  const grupoPiso = new THREE.Group();
  const grupoRobot = new THREE.Group();
  escenaBaile.add(grupoPiso, grupoRobot);

  let mezcladorRobot = null;
  let duracionBaile = 1;
  let baileIniciado = false;
  const relojBaile = new THREE.Clock();
  let escenarioPromesa = null;
  let escenarioListo = false;

  /* ---------------- Robot en el suelo (sin la plataforma 3D) ----------------
     El robot baila sobre el piso de la imagen de fondo. Bajo sus pies hay una sombra
     suave y un anillo tenue de luz cian, hechos con código (no se descarga ningún modelo). */
  const ALTO_ROBOT = 4.7;      // unidades de la escena; el tamaño en pantalla lo da la cámara
  let anchoRobot = ALTO_ROBOT * 0.6;

  function texturaRadial(dibujar) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    dibujar(c.getContext('2d'), 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function discoPiso(radio, textura, altura) {
    const disco = new THREE.Mesh(
      new THREE.CircleGeometry(radio, 64),
      new THREE.MeshBasicMaterial({ map: textura, transparent: true, depthWrite: false, toneMapped: false })
    );
    disco.rotation.x = -Math.PI / 2;
    disco.position.y = altura;
    return disco;
  }
  // Anillo de luz cian, como los círculos del piso de la sala de bienvenida
  grupoPiso.add(discoPiso(ALTO_ROBOT * 0.62, texturaRadial((g, m) => {
    const halo = g.createRadialGradient(m, m, m * 0.2, m, m, m);
    halo.addColorStop(0, 'rgba(30, 107, 255, 0.10)');
    halo.addColorStop(0.72, 'rgba(30, 107, 255, 0.16)');
    halo.addColorStop(1, 'rgba(30, 107, 255, 0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, m * 2, m * 2);
    g.strokeStyle = 'rgba(102, 230, 255, 0.55)';
    g.lineWidth = 3;
    g.shadowColor = 'rgba(102, 230, 255, 0.9)';
    g.shadowBlur = 12;
    g.beginPath(); g.arc(m, m, m * 0.84, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5;
    g.strokeStyle = 'rgba(102, 230, 255, 0.3)';
    g.beginPath(); g.arc(m, m, m * 0.62, 0, Math.PI * 2); g.stroke();
  }), 0.005));
  // Sombra suave bajo los pies: hace que el robot pise el suelo y no flote; sigue su cadera
  // cuando da pasos durante el baile (ver «animar»).
  let caderaRobot = null;
  const posicionCadera = new THREE.Vector3();
  const sombraRobot = discoPiso(ALTO_ROBOT * 0.24, texturaRadial((g, m) => {
    const sombra = g.createRadialGradient(m, m, 0, m, m, m);
    sombra.addColorStop(0, 'rgba(0, 0, 8, 0.75)');
    sombra.addColorStop(0.55, 'rgba(0, 0, 8, 0.35)');
    sombra.addColorStop(1, 'rgba(0, 0, 8, 0)');
    g.fillStyle = sombra;
    g.fillRect(0, 0, m * 2, m * 2);
  }), 0.01);
  grupoPiso.add(sombraRobot);

  // Cámara: el robot ocupa ≈66 % del alto en pantallas horizontales y ≈50 % en las verticales
  // o casi cuadradas (ahí deja espacio abajo para el globo del diálogo y manda el ancho de sus
  // brazos), con margen abajo para los pasos hacia adelante.
  function ajustarCamaraBaile() {
    const relacion = (pista.clientWidth || innerWidth) / (pista.clientHeight || innerHeight);
    const vertical = relacion < 1.25;   // mismo límite que el globo en css/portada.css
    camaraBaile.aspect = relacion;
    camaraBaile.fov = vertical ? 44 : 40;
    const tangente = 2 * Math.tan(THREE.MathUtils.degToRad(camaraBaile.fov / 2));
    const fraccionAlto = vertical ? 0.5 : 0.66;
    const distanciaAlto = ALTO_ROBOT / (fraccionAlto * tangente);
    const distanciaAncho = anchoRobot / (0.95 * tangente * relacion);
    const distancia = Math.max(distanciaAlto, distanciaAncho);
    camaraBaile.position.set(0, ALTO_ROBOT * 0.6, distancia);
    camaraBaile.lookAt(0, ALTO_ROBOT * 0.45, 0);
    camaraBaile.updateProjectionMatrix();
  }
  ajustarCamaraBaile();

  function cargarEscenario() {
    if (escenarioPromesa) return escenarioPromesa;
    escenarioPromesa = cargar('img/archivo_robot.glb').then((modRobot) => {
      if (liberado) return;
      // Robot: 4,7 unidades de alto, con su punto más bajo apoyado en el suelo (y = 0).
      const robot = modRobot.scene;
      robot.position.set(0, 0, 0);
      robot.scale.setScalar(1);
      robot.updateMatrixWorld(true);
      const dimRobot = new THREE.Box3().setFromObject(robot).getSize(new THREE.Vector3());
      if (!Number.isFinite(dimRobot.y) || dimRobot.y <= 0) throw new Error('El robot no tiene dimensiones válidas.');
      robot.scale.multiplyScalar(ALTO_ROBOT / dimRobot.y);
      robot.updateMatrixWorld(true);
      const caja = new THREE.Box3().setFromObject(robot);
      const centroRobot = caja.getCenter(new THREE.Vector3());
      robot.position.x -= centroRobot.x;
      robot.position.z -= centroRobot.z;
      robot.position.y -= caja.min.y;
      // En reposo el modelo tiene los brazos abiertos (más ancho que al bailar): se limita.
      anchoRobot = THREE.MathUtils.clamp(caja.max.x - caja.min.x, ALTO_ROBOT * 0.6, ALTO_ROBOT * 0.8);
      robot.traverse((o) => { if (!caderaRobot && o.isBone && /hip|pelvis/i.test(o.name)) caderaRobot = o; });
      grupoRobot.add(robot);
      grupoRobot.position.set(0, 0, 0);

      if (modRobot.animations?.length) {
        mezcladorRobot = new THREE.AnimationMixer(robot);
        modRobot.animations.forEach((clip) => { mezcladorRobot.clipAction(clip).enabled = true; });
      } else {
        console.warn('El GLB del robot no contiene animaciones.');
      }
      escenarioListo = true;
      ajustarCamaraBaile();
      avisos.escenarioListo?.();
      precalentar();
    }).catch((fallo) => {
      console.error(fallo);
      escenarioPromesa = null;
      if (!liberado) avisos.error('No se pudo cargar el robot. Puedes continuar igualmente.');
    });
    return escenarioPromesa;
  }

  /* ---------------- Robot preparado por adelantado ----------------
     La primera vez que se dibuja una escena, la tarjeta de video debe preparar sus efectos
     y recibir sus texturas: eso congelaba el acercamiento ≈0,35 s justo al aparecer el robot.
     Ahora se hace mientras se ve la Tierra, por partes y en los momentos libres. */
  // Espera un momento libre y, si la persona está girando la Tierra, a que la suelte.
  const enReposo = async () => {
    do {
      await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 500 }) : setTimeout(r, 50)));
    } while (arrastrando && !liberado);
  };
  let precalentado = null;
  function precalentar() {
    if (precalentado) return precalentado;
    precalentado = (async () => {
      try {
        if (renderBaile.compileAsync) await renderBaile.compileAsync(escenaBaile, camaraBaile);
        else renderBaile.compile(escenaBaile, camaraBaile);
        const texturas = new Set();
        escenaBaile.traverse((o) => {
          const materiales = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
          materiales.forEach((m) => Object.values(m).forEach((v) => { if (v && v.isTexture) texturas.add(v); }));
        });
        for (const textura of texturas) {
          await enReposo();
          if (liberado) return;
          renderBaile.initTexture(textura);
        }
        await enReposo();
        // Primer dibujo con el lienzo todavía invisible: sube los modelos a la tarjeta de video.
        if (!liberado && estado === 'inicio') renderBaile.render(escenaBaile, camaraBaile);
      } catch (fallo) {
        console.warn('No se pudo preparar el robot por adelantado:', fallo);
      }
    })();
    return precalentado;
  }

  /* ---------------- Música y baile sincronizados (lógica original) ---------------- */
  function prepararBaileSincronizado() {
    if (!mezcladorRobot) return;
    mezcladorRobot.stopAllAction();
    mezcladorRobot._actions.forEach((accion) => {
      accion.reset();
      accion.enabled = true;
      accion.setEffectiveTimeScale(1);
      accion.setEffectiveWeight(1);
      accion.play();
    });
    const duraciones = mezcladorRobot._actions.map((a) => a.getClip().duration).filter(Number.isFinite);
    duracionBaile = duraciones.length ? Math.max(...duraciones) : 1;
    mezcladorRobot.setTime(0);
    relojBaile.start();
    baileIniciado = true;
  }

  async function iniciarMusicaRobot() {
    try {
      musica.currentTime = 0;
      prepararBaileSincronizado();
      await musica.play();
      avisos.musicaBloqueada?.(false);
    } catch (falloAudio) {
      console.warn('El navegador requiere activar el audio manualmente.', falloAudio);
      if (mezcladorRobot) { mezcladorRobot.stopAllAction(); mezcladorRobot._actions.forEach((a) => a.stop()); }
      baileIniciado = false;
      avisos.musicaBloqueada?.(true);
    }
  }

  function detenerMusica() {
    musica.pause();
    musica.currentTime = 0;
    if (mezcladorRobot) mezcladorRobot.stopAllAction();
    baileIniciado = false;
    avisos.musicaBloqueada?.(false);
  }

  /* =====================================================
     TRANSICIÓN TIERRA -> ROBOT (3,2 s, como el original)
  ===================================================== */
  function animarTransicion() {
    if (!cargada || estado !== 'inicio') return;
    estado = 'acercando';
    avisos.mensaje('Acercándonos a la Tierra…');
    avisos.estado?.('acercando');
    const zInicial = camara.position.z;
    const escalaInicial = grupoTierra.scale.x;
    const inicio = performance.now();
    const duracion = 3200;
    function paso(tiempo) {
      if (estado !== 'acercando' || liberado) return;
      const p = Math.min((tiempo - inicio) / duracion, 1);
      const suave = p * p * (3 - 2 * p);
      camara.position.z = THREE.MathUtils.lerp(zInicial, 2.0, suave);
      grupoTierra.scale.setScalar(THREE.MathUtils.lerp(escalaInicial, escalaInicial * 3.8, suave));
      if (p > 0.58) {
        pista.classList.add('visible');
        espacio.style.opacity = String(Math.max(0, 1 - (p - 0.58) / 0.42));
      }
      if (p < 1) requestAnimationFrame(paso);
      else llegarAlRobot();
    }
    requestAnimationFrame(paso);
  }

  async function llegarAlRobot() {
    estado = 'pista';
    espacio.style.opacity = '0';
    if (!escenarioListo) { avisos.mensaje('Preparando el escenario del robot…'); await cargarEscenario(); }
    if (liberado || estado !== 'pista') return;
    avisos.mensaje(null);
    avisos.estado?.('pista');
    iniciarMusicaRobot();
  }

  function volverAlEspacio() {
    if (estado !== 'pista') return;
    estado = 'volviendo';
    avisos.estado?.('volviendo');
    avisos.mensaje('Regresando al espacio…');
    detenerMusica();                      // la música no sigue sonando en el espacio
    const inicio = performance.now();
    const duracion = 1800;
    const escalaInicial = grupoTierra.scale.x;
    const zInicial = camara.position.z;
    espacio.style.opacity = '1';
    function paso(tiempo) {
      if (estado !== 'volviendo' || liberado) return;
      const p = Math.min((tiempo - inicio) / duracion, 1);
      const suave = p * p * (3 - 2 * p);
      grupoTierra.scale.setScalar(THREE.MathUtils.lerp(escalaInicial, 1, suave));
      const relacion = innerWidth / Math.max(innerHeight, 1);
      const zDestino = relacion < 0.7 ? 5.35 : (relacion > 2.0 ? 5.45 : 5);
      camara.position.z = THREE.MathUtils.lerp(zInicial, zDestino, suave);
      pista.style.opacity = String(1 - suave);
      if (p < 1) { requestAnimationFrame(paso); return; }
      grupoTierra.scale.setScalar(1);
      ajustarCamaraTierra();
      pista.classList.remove('visible');
      pista.style.opacity = '';
      espacio.style.opacity = '1';
      estado = 'inicio';
      avisos.mensaje(null);
      avisos.estado?.('inicio');
      lienzo.focus({ preventScroll: true });
    }
    requestAnimationFrame(paso);
  }

  /** Sí, continuar: se cierra la escena del robot y se detiene la música. */
  function abrirBienvenida() {
    estado = 'bienvenida';
    detenerMusica();
    pista.classList.remove('visible');
    espacio.style.opacity = '0';
    detenerBucle();                       // la bienvenida no necesita dibujar 3D
  }

  /** Flecha de la bienvenida: regresa al robot y vuelve a empezar la música y el baile. */
  async function volverAlRobot() {
    estado = 'pista';
    espacio.style.opacity = '0';
    grupoTierra.scale.setScalar(3.8);
    pista.style.opacity = '';
    pista.classList.add('visible');
    iniciarBucle();
    if (!escenarioListo) { avisos.mensaje('Preparando el escenario del robot…'); await cargarEscenario(); avisos.mensaje(null); }
    if (liberado || estado !== 'pista') return;
    avisos.estado?.('pista');
    iniciarMusicaRobot();
  }

  /* ---------------- Interacción con la Tierra (original) ---------------- */
  let arrastrando = false, seArrastro = false, inicioX = 0, inicioY = 0, punteroActivo = null, ultimaInteraccion = 0;
  const alPresionar = (e) => {
    if (!cargada || estado !== 'inicio') return;
    arrastrando = true; seArrastro = false; punteroActivo = e.pointerId;
    inicioX = e.clientX; inicioY = e.clientY; ultimaInteraccion = performance.now();
    lienzo.setPointerCapture(e.pointerId);
  };
  const alMover = (e) => {
    if (!arrastrando || e.pointerId !== punteroActivo || !tierra || estado !== 'inicio') return;
    const dx = e.clientX - inicioX, dy = e.clientY - inicioY;
    if (Math.abs(dx) + Math.abs(dy) > 2) seArrastro = true;
    if (seArrastro) {
      tierra.rotation.y += dx * 0.006;
      tierra.rotation.x = THREE.MathUtils.clamp(tierra.rotation.x + dy * 0.006, -1.25, 1.25);
      avisos.interaccion?.();
    }
    inicioX = e.clientX; inicioY = e.clientY;
  };
  const alSoltar = (e) => {
    if (e.pointerId !== punteroActivo) return;
    arrastrando = false; punteroActivo = null;
    const fueClic = !seArrastro;
    seArrastro = false;
    if (fueClic && estado === 'inicio' && performance.now() - ultimaInteraccion < 500) animarTransicion();
  };
  const alCancelar = () => { arrastrando = false; punteroActivo = null; seArrastro = false; };
  // Teclado: flechas giran la Tierra, Intro o espacio inician el acercamiento.
  const alTeclear = (e) => {
    if (estado !== 'inicio') return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); animarTransicion(); return; }
    if (!tierra) return;
    const giro = { ArrowLeft: [0, -0.15], ArrowRight: [0, 0.15], ArrowUp: [-0.12, 0], ArrowDown: [0.12, 0] }[e.key];
    if (!giro) return;
    e.preventDefault();
    tierra.rotation.x = THREE.MathUtils.clamp(tierra.rotation.x + giro[0], -1.25, 1.25);
    tierra.rotation.y += giro[1];
  };
  lienzo.addEventListener('pointerdown', alPresionar);
  lienzo.addEventListener('pointermove', alMover);
  lienzo.addEventListener('pointerup', alSoltar);
  lienzo.addEventListener('pointercancel', alCancelar);
  lienzo.addEventListener('keydown', alTeclear);

  const alRedimensionar = () => {
    if (estado === 'inicio' || estado === 'pista') ajustarCamaraTierra();
    renderizador.setSize(innerWidth, innerHeight);
    renderizador.setPixelRatio(resolucionTierra());
    renderBaile.setSize(pista.clientWidth || innerWidth, pista.clientHeight || innerHeight);
    renderBaile.setPixelRatio(resolucionBaile());
    ajustarCamaraBaile();
  };
  window.addEventListener('resize', alRedimensionar);

  /* =====================================================
     BUCLE: solo dibuja la escena que está a la vista
  ===================================================== */
  let raf = 0;
  let activo = false;

  // Fluidez en cualquier equipo: se mide el tiempo de los cuadros mientras la escena está quieta
  // (Tierra o robot, no durante las transiciones) y, si el promedio pasa de 25 ms (< 40 cuadros
  // por segundo), se baja un poco la resolución. Nunca baja de la resolución normal de la pantalla.
  let anterior = 0, suma = 0, muestras = 0;
  function medirFluidez(t) {
    const dt = anterior ? t - anterior : 0;
    anterior = t;
    if (!dt || dt > 250 || (estado !== 'inicio' && estado !== 'pista')) return;
    suma += dt; muestras++;
    if (muestras < 90) return;
    const promedio = suma / muestras;
    suma = 0; muestras = 0;
    if (promedio > 25 && escala > 0.6) {
      escala = Math.max(0.6, escala - 0.15);
      renderizador.setPixelRatio(resolucionTierra());
      renderBaile.setPixelRatio(resolucionBaile());
    }
  }

  function animar(t) {
    raf = requestAnimationFrame(animar);
    medirFluidez(t);
    if (tierra && !arrastrando && estado === 'inicio') tierra.rotation.y += 0.0012;

    // Al final del acercamiento la Tierra ya es invisible: no se dibuja.
    const tierraOculta = estado === 'acercando' && parseFloat(espacio.style.opacity || '1') < 0.02;
    const tierraActiva = (estado === 'inicio' || estado === 'acercando' || estado === 'volviendo') && !tierraOculta;
    const robotVisible = pista.classList.contains('visible') && estado !== 'bienvenida';

    if (tierraActiva) {
      estrellas.rotation.y += 0.000025;
      renderizador.render(escena, camara);
    }
    if (mezcladorRobot && baileIniciado) {
      // Sincronización original: la música manda; el baile nunca se adelanta ni se atrasa.
      if (!musica.paused && Number.isFinite(musica.currentTime)) mezcladorRobot.setTime(musica.currentTime % duracionBaile);
      else mezcladorRobot.update(Math.min(relojBaile.getDelta(), 0.05));
    }
    if (robotVisible) {
      const t = performance.now();
      luzAzulBaile.position.x = -4 + Math.sin(t * 0.0007) * 1.5;
      luzVioletaBaile.position.x = 4 + Math.sin(t * 0.0006) * 1.5;
      if (caderaRobot) {
        caderaRobot.getWorldPosition(posicionCadera);
        sombraRobot.position.x = posicionCadera.x;
        sombraRobot.position.z = posicionCadera.z;
      }
      renderBaile.render(escenaBaile, camaraBaile);
    }
  }
  function iniciarBucle() { if (activo || liberado) return; activo = true; raf = requestAnimationFrame(animar); }
  function detenerBucle() { activo = false; cancelAnimationFrame(raf); anterior = 0; }

  iniciarBucle();

  if (/[?&]debug3d\b/.test(location.search)) {
    window.__portada = {
      get estado() { return estado; }, get escenarioListo() { return escenarioListo; },
      get precalentado() { return precalentado; }, get escala() { return escala; }, get tierraLista() { return cargada; },
      get baile() { return mezcladorRobot ? mezcladorRobot.time : null; }, duracionBaile: () => duracionBaile,
      foto: (cual) => new Promise((r) => {
        if (cual === 'robot') { renderBaile.render(escenaBaile, camaraBaile); canvasBaile.toBlob(r, 'image/png'); }
        else { renderizador.render(escena, camara); lienzo.toBlob(r, 'image/jpeg', 0.85); }
      })
    };
  }

  return {
    get estado() { return estado; },
    acercar: animarTransicion,
    volverAlEspacio,
    abrirBienvenida,
    volverAlRobot,
    activarMusica: iniciarMusicaRobot,
    pausar() { detenerBucle(); },
    reanudar() { if (estado !== 'bienvenida') iniciarBucle(); },
    liberar() {
      if (liberado) return;
      liberado = true;
      detenerBucle();
      detenerMusica();
      lienzo.removeEventListener('pointerdown', alPresionar);
      lienzo.removeEventListener('pointermove', alMover);
      lienzo.removeEventListener('pointerup', alSoltar);
      lienzo.removeEventListener('pointercancel', alCancelar);
      lienzo.removeEventListener('keydown', alTeclear);
      window.removeEventListener('resize', alRedimensionar);
      geometriaEstrellas.dispose();
      materialEstrellas.dispose();
      // Los modelos quedan en memoria para volver rápido; se separan de las escenas.
      grupoTierra.clear();
      grupoPiso.clear();
      grupoRobot.clear();
      renderizador.dispose();
      renderizador.forceContextLoss();
      renderBaile.dispose();
      renderBaile.forceContextLoss();
      lienzo.remove();
      pista.classList.remove('visible');
      pista.style.opacity = '';
      espacio.style.opacity = '';
    }
  };
}
