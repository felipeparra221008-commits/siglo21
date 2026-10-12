document.addEventListener('click', function (e) {
  const enlace = e.target.closest('a');
  if (!enlace) return;

  const destino = enlace.getAttribute('href');
  if (!destino || destino.startsWith('#') || enlace.target === '_blank') return;
  if (e.ctrlKey || e.metaKey || e.shiftKey) return;

  e.preventDefault();
  document.body.classList.add('saliendo');

  setTimeout(function () {
    window.location.href = enlace.href;
  }, 500);
});

window.addEventListener('pageshow', function () {
  document.body.classList.remove('saliendo');
});