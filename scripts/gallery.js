'use strict';

const photoViewer = document.querySelector('.photo-viewer');

if (typeof photoViewer?.showModal === 'function') {
  const photos = [...document.querySelectorAll('[data-photo]')];
  const image = photoViewer.querySelector('img');
  const caption = photoViewer.querySelector('.photo-viewer-caption');
  const counter = photoViewer.querySelector('.photo-viewer-counter');
  const status = photoViewer.querySelector('.photo-viewer-status');
  const closeButton = photoViewer.querySelector('.photo-viewer-close');
  let activePhoto = 0;
  let trigger;

  function showPhoto(index) {
    activePhoto = (index + photos.length) % photos.length;
    const link = photos[activePhoto];
    const preview = link.querySelector('img');
    image.alt = preview.alt;
    image.width = Number(preview.getAttribute('width'));
    image.height = Number(preview.getAttribute('height'));
    image.src = link.href;
    caption.textContent = link.parentElement.querySelector('figcaption')?.textContent ?? '';
    caption.hidden = !caption.textContent;
    counter.textContent = `${activePhoto + 1} of ${photos.length}`;
    status.textContent = `Photo ${counter.textContent}. ${preview.alt}`;
  }

  photos.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      showPhoto(index);
      photoViewer.showModal();
      document.body.classList.add('dialog-open');
    });
  });

  photoViewer.querySelector('[data-previous]').addEventListener('click', () => showPhoto(activePhoto - 1));
  photoViewer.querySelector('[data-next]').addEventListener('click', () => showPhoto(activePhoto + 1));
  closeButton.addEventListener('click', () => photoViewer.close());
  photoViewer.addEventListener('click', event => {
    if (event.target === photoViewer) photoViewer.close();
  });
  photoViewer.addEventListener('keydown', event => {
    if (photos.length === 1 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    showPhoto(activePhoto + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  photoViewer.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    trigger?.focus({ preventScroll: true });
  });
}
