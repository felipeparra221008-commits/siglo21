const contenedor = document.querySelector('.contenedor_video');
const video = document.querySelector('.video_fondo');
let iniciado = false;

function iniciar() {
if (iniciado) return;
iniciado = true;
contenedor.classList.add('listo');
}

video.addEventListener('playing', iniciar);

if (!video.paused && video.readyState >= 3) {
iniciar();
}

setTimeout(iniciar, 4000);
