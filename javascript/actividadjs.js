// ============================================================
//  BANCO DE PREGUNTAS (28)
//  Cada pregunta tiene:
//    p = la pregunta
//    o = las 3 opciones  (la PRIMERA es la correcta; el codigo
//        las mezcla solo, asi la correcta cambia de lugar)
//    e = explicacion que se muestra despues de responder
//  Para agregar una pregunta, copia un bloque { ... }, pegalo
//  al final de la lista (con coma) y cambia los textos.
// ============================================================
const banco = [
  { p: "¿Quién descubrió la penicilina en 1928?",
    o: ["Alexander Fleming", "Louis Pasteur", "Marie Curie"],
    e: "Su hallazgo llevó a la creación de otros antibióticos y hizo más seguros muchos procedimientos médicos." },

  { p: "¿Qué inventaron Bardeen, Brattain y Shockley en 1947?",
    o: ["El transistor", "El microscopio electrónico", "El láser"],
    e: "El transistor es más pequeño y eficiente que las tecnologías anteriores y permitió crear dispositivos electrónicos más compactos." },

  { p: "¿Qué descubrieron Watson y Crick en 1953?",
    o: ["La estructura de doble hélice del ADN", "El primer antibiótico", "La estructura del átomo"],
    e: "Fue clave para entender cómo se transmite la información genética e impulsó la genética, la biología molecular y la biotecnología." },

  { p: "¿Qué institución impulsó el desarrollo de Internet, que comenzó en 1969?",
    o: ["El Departamento de Defensa de EE. UU.", "La NASA", "Una empresa de telefonía móvil"],
    e: "Internet permitió conectar computadoras y compartir información entre lugares distintos. Se popularizó en el siglo XXI, pero sus bases se crearon antes." },

  { p: "¿Qué hermanos son recordados por inventar el avión?",
    o: ["Los hermanos Wright", "Los hermanos Lumière", "Los hermanos Montgolfier"],
    e: "Su primer vuelo fue en 1903. La aviación redujo los viajes entre continentes de semanas a horas y facilitó la globalización." },

  { p: "Según la exposición, ¿para qué se usan hoy los satélites?",
    o: ["Comunicaciones, GPS, pronóstico del clima y observación de la Tierra", "Solo para ver televisión", "Solo para fines militares"],
    e: "Nacieron de la tecnología espacial del siglo XX y hoy están presentes en la vida diaria." },

  { p: "¿Qué significa la «convergencia de tecnologías» en el siglo XXI?",
    o: ["Que varias tecnologías se combinan, como la IA con la robótica y la medicina", "Que todas las tecnologías se vuelven iguales", "Que las tecnologías antiguas desaparecen"],
    e: "Combinar tecnologías permite lograr resultados que antes no eran posibles." },

  { p: "¿Qué científicas desarrollaron CRISPR-Cas9, una herramienta de edición genética?",
    o: ["Jennifer Doudna y Emmanuelle Charpentier", "Katalin Karikó y Rosalind Franklin", "Marie Curie y Lise Meitner"],
    e: "Su trabajo revolucionó la investigación biológica y abrió posibilidades para estudiar y tratar enfermedades genéticas." },

  { p: "¿Qué investigación de Karikó y Weissman fue clave para las vacunas contra la COVID-19?",
    o: ["La del ARN mensajero (ARNm)", "La de los antibióticos", "La de los rayos X"],
    e: "Las vacunas basadas en ARNm adquirieron enorme importancia durante la pandemia." },

  { p: "¿Con qué empresa de inteligencia artificial se relaciona Demis Hassabis?",
    o: ["DeepMind", "SpaceX", "Tesla"],
    e: "Es un científico británico cuyo trabajo incluye sistemas de IA capaces de resolver problemas científicos complejos." },

  { p: "¿En qué área trabaja David Baker?",
    o: ["Diseño computacional de proteínas", "Exploración espacial", "Energías renovables"],
    e: "Gracias a su trabajo, los científicos usan herramientas computacionales para intentar diseñar proteínas con funciones determinadas." },

  { p: "¿Qué desarrolló Omar Yaghi, ganador del Nobel de Química 2025?",
    o: ["Estructuras metal-orgánicas (MOF)", "Baterías de litio", "Plásticos biodegradables"],
    e: "Las estructuras metal-orgánicas se conocen por sus siglas: MOF." },

  { p: "¿Cuál de estos hechos ocurrió en 2008?",
    o: ["Una crisis financiera mundial", "La pandemia de COVID-19", "La firma del Acuerdo de París"],
    e: "La pandemia de COVID-19 fue en 2020 y el Acuerdo de París en 2015." },

  { p: "¿Qué acuerdo internacional busca enfrentar el cambio climático?",
    o: ["El Acuerdo de París", "El Tratado de Versalles", "Los Convenios de Ginebra"],
    e: "El Acuerdo de París es uno de los eventos importantes del siglo XXI en materia ambiental." },

  { p: "¿Cuál de estos hechos pertenece al siglo XX?",
    o: ["La llegada del hombre a la Luna", "La llegada del iPhone", "El auge de la inteligencia artificial"],
    e: "El hombre llegó a la Luna en 1969. El iPhone y el auge de la IA son del siglo XXI." },

  { p: "¿Qué factores influyen en la complejidad de nuestra sociedad actual?",
    o: ["La tecnología, la globalización y la diversidad cultural", "Solo la agricultura", "Solo el comercio local"],
    e: "Además, nuestra sociedad enfrenta problemas ambientales y crisis climáticas." },

  { p: "En el mapa de la sociedad actual, ¿cuál es una «característica principal»?",
    o: ["La sostenibilidad", "El ámbito laboral", "La economía"],
    e: "Las características principales son tecnología y globalización, sostenibilidad y participación ciudadana. El ámbito laboral es un cambio relevante y la economía está entre los aspectos más importantes." },

  { p: "¿Qué desafíos traen los avances tecnológicos, según la conclusión?",
    o: ["Privacidad, desigualdad, medio ambiente y uso responsable de la ciencia", "Solo la falta de dinero para investigar", "Que ya no quedan inventos por hacer"],
    e: "El futuro requiere no solo crear nuevas tecnologías, sino usarlas de forma responsable y beneficiosa para la sociedad." },

  { p: "¿Cuál es el gran desafío del siglo XXI, según la conclusión?",
    o: ["Lograr una innovación más avanzada, segura, sostenible y accesible para todos", "Fabricar más máquinas cada año", "Reducir el uso de Internet"],
    e: "No basta con avanzar: la innovación tiene que ser segura, sostenible y accesible para todos." },

  { p: "¿Qué dispositivo presentó Steve Jobs en 2007?",
    o: ["El iPhone", "El primer computador personal", "El primer satélite de comunicaciones"],
    e: "La llegada del iPhone popularizó los teléfonos inteligentes, una de las fuerzas del siglo XXI." },

  { p: "¿Qué tecnología usa Bitcoin para registrar transacciones sin un banco central?",
    o: ["Blockchain (cadena de bloques)", "Wi-Fi", "GPS"],
    e: "Las criptomonedas usan un registro compartido y protegido llamado blockchain." },

  { p: "¿Cómo fabrica un objeto una impresora 3D?",
    o: ["Añadiendo material capa por capa", "Cortando un bloque de material", "Fundiendo metal en un molde"],
    e: "Es fabricación aditiva: el objeto se construye capa sobre capa." },

  { p: "¿Hacia qué astro viajan las misiones Artemis de la NASA?",
    o: ["La Luna", "Marte", "Júpiter"],
    e: "Artemis II (abril de 2026) llevó a cuatro astronautas alrededor de la Luna." },

  { p: "¿Qué premio ganó John Martinis en 2025?",
    o: ["El Nobel de Física", "El Nobel de Química", "El Nobel de Medicina"],
    e: "Lo recibió por investigaciones sobre fenómenos cuánticos en circuitos eléctricos, base de los computadores cuánticos." },

  { p: "¿Para qué podrían ser útiles los computadores cuánticos?",
    o: ["Para ciertos problemas científicos y tecnológicos difíciles de resolver con computadores tradicionales", "Para reemplazar todos los celulares", "Para generar electricidad"],
    e: "Procesan información de maneras diferentes a las computadoras tradicionales." },

  { p: "¿Qué se espera desarrollar para tener una energía más sostenible?",
    o: ["Mejores baterías, energías renovables y sistemas de almacenamiento", "Motores de gasolina más potentes", "Cables eléctricos más largos"],
    e: "Es uno de los grandes temas del futuro, junto con la inteligencia artificial y la robótica." },

  { p: "¿Qué combinación podría permitir tratamientos cada vez más adaptados a cada persona?",
    o: ["Genética, inteligencia artificial y biotecnología", "Física, geografía e historia", "Robótica, astronomía y economía"],
    e: "Es lo que se conoce como medicina personalizada." },

  { p: "¿Qué empresa de exploración espacial privada dirige Elon Musk?",
    o: ["SpaceX", "Blue Origin", "NVIDIA"],
    e: "La exploración espacial privada es una de las fuerzas que definen el siglo XXI." }
];

// ============================================================
//  CODIGO DEL QUIZ
// ============================================================
const TOTAL = 5; // cuantas preguntas ve cada persona

const juego = document.getElementById("quiz_juego");
const resultado = document.getElementById("quiz_resultado");
const contador = document.getElementById("quiz_contador");
const progreso = document.getElementById("quiz_progreso");
const textoPregunta = document.getElementById("quiz_pregunta");
const cajaOpciones = document.getElementById("quiz_opciones");
const feedback = document.getElementById("quiz_feedback");
const botonSiguiente = document.getElementById("quiz_siguiente");
const textoPuntaje = document.getElementById("quiz_puntaje");
const textoMensaje = document.getElementById("quiz_mensaje");
const botonReiniciar = document.getElementById("quiz_reiniciar");

let ronda = [];      // las 5 preguntas de esta partida
let indice = 0;      // en cual pregunta va
let puntaje = 0;     // cuantas ha acertado
let yaVistas = [];   // preguntas de partidas anteriores (para no repetirlas)

// Mezcla una lista al azar sin dañar la original
function mezclar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const guardada = copia[i];
    copia[i] = copia[j];
    copia[j] = guardada;
  }
  return copia;
}

// Escoge 5 preguntas al azar, evitando las de la partida anterior
function elegirRonda() {
  let disponibles = banco.filter(function (q) {
    return !yaVistas.includes(q);
  });
  if (disponibles.length < TOTAL) {
    yaVistas = [];
    disponibles = banco.slice();
  }
  ronda = mezclar(disponibles).slice(0, TOTAL);
  yaVistas = yaVistas.concat(ronda);
}

function mostrarPregunta() {
  const q = ronda[indice];

  contador.textContent = "Pregunta " + (indice + 1) + " de " + TOTAL;
  progreso.style.width = (indice / TOTAL) * 100 + "%";
  textoPregunta.textContent = q.p;
  feedback.textContent = "";
  feedback.className = "quiz_feedback";
  botonSiguiente.hidden = true;
  cajaOpciones.innerHTML = "";

  mezclar(q.o).forEach(function (texto) {
    const boton = document.createElement("button");
    boton.className = "quiz_opcion";
    boton.textContent = texto;
    boton.addEventListener("click", function () {
      responder(boton, texto === q.o[0]);
    });
    cajaOpciones.appendChild(boton);
  });
}

function responder(botonElegido, acerto) {
  const q = ronda[indice];
  const botones = cajaOpciones.querySelectorAll(".quiz_opcion");

  // bloquea todas las opciones y marca la correcta en verde
  botones.forEach(function (b) {
    b.disabled = true;
    if (b.textContent === q.o[0]) {
      b.classList.add("correcta");
    }
  });

  if (acerto) {
    puntaje++;
    feedback.textContent = "¡Correcto! " + q.e;
    feedback.className = "quiz_feedback bien";
  } else {
    botonElegido.classList.add("incorrecta");
    feedback.textContent = "No es esa. La respuesta correcta es «" + q.o[0] + "». " + q.e;
    feedback.className = "quiz_feedback mal";
  }

  progreso.style.width = ((indice + 1) / TOTAL) * 100 + "%";
  botonSiguiente.textContent = indice === TOTAL - 1 ? "Ver resultado →" : "Siguiente pregunta →";
  botonSiguiente.hidden = false;
  botonSiguiente.focus();
}

function mostrarResultado() {
  juego.classList.add("oculto");
  resultado.classList.remove("oculto");
  textoPuntaje.textContent = puntaje + " / " + TOTAL;

  if (puntaje === TOTAL) {
    textoMensaje.textContent = "¡Experto del siglo XXI!";
  } else if (puntaje >= 3) {
    textoMensaje.textContent = "¡Muy bien! Casi lo tienes.";
  } else {
    textoMensaje.textContent = "Repasa el recorrido y vuelve a intentarlo.";
  }
}

function empezar() {
  elegirRonda();
  indice = 0;
  puntaje = 0;
  resultado.classList.add("oculto");
  juego.classList.remove("oculto");
  mostrarPregunta();
}

botonSiguiente.addEventListener("click", function () {
  indice++;
  if (indice < TOTAL) {
    mostrarPregunta();
  } else {
    mostrarResultado();
  }
});

botonReiniciar.addEventListener("click", empezar);

empezar();
