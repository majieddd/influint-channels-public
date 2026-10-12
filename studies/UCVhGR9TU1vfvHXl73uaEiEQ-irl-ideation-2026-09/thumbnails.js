(() => {
  const links = [...document.querySelectorAll('[data-thumbnail-id]')];
  const dialog = document.querySelector('.thumbnail-viewer');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.thumbnail-large');
  const title = dialog.querySelector('#thumbnail-title');
  const position = dialog.querySelector('#thumbnail-position');
  const download = dialog.querySelector('[data-download-thumbnail]');
  let active = 0;
  let opener = null;
  function show(index) {
    active = (index + links.length) % links.length;
    const link = links[active];
    const card = link.closest('.idea');
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    title.textContent = card.querySelector('.t').textContent;
    position.textContent = 'Concept #' + link.dataset.thumbnailId + ' of ' + links.length;
    const source = card.querySelector('.thumbnail-actions a[download]');
    download.href = source.href;
    download.download = source.download;
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    show(index);
    dialog.showModal();
    document.body.classList.add('thumbnail-open');
  }));
  dialog.querySelector('[data-close-thumbnail]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-previous-thumbnail]').addEventListener('click', () => show(active - 1));
  dialog.querySelector('[data-next-thumbnail]').addEventListener('click', () => show(active + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {event.preventDefault(); show(active - 1);}
    if (event.key === 'ArrowRight') {event.preventDefault(); show(active + 1);}
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('thumbnail-open');
    opener?.focus({preventScroll:true});
  });
})();
