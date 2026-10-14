document.addEventListener('click', function (e) {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

  const enlace = e.target.closest('a');
  if (!enlace) return;

  const destino = enlace.getAttribute('href');
  if (!destino || destino.startsWith('#')) return;
  if (enlace.target === '_blank' || enlace.hasAttribute('download')) return;
  if (enlace.origin !== window.location.origin) return;
  if (enlace.href === window.location.href) return;

  e.preventDefault();
  document.body.classList.add('saliendo');

  setTimeout(function () {
    window.location.href = enlace.href;
  }, 500);
});

window.addEventListener('pageshow', function () {
  document.body.classList.remove('saliendo');
});