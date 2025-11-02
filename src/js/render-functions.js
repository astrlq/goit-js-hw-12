import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let lightbox = null;

export function initLightbox() {
  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
  }
  return lightbox;
}

export function createGallery(images) {
  const gallery = document.querySelector('.gallery');

  const markup = images
    .map(
      img => `
      <li class="gallery-item">
        <a href="${img.largeImageURL}">
          <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p><b>Likes</b> ${img.likes}</p>
          <p><b>Views</b> ${img.views}</p>
          <p><b>Comments</b> ${img.comments}</p>
          <p><b>Downloads</b> ${img.downloads}</p>
        </div>
      </li>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  if (lightbox) {
    lightbox.refresh();
  }
}

export function clearGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
}

export function showLoader() {
  const loader = document.querySelector('.loader');
  if (loader) loader.classList.add('visible');
}

export function hideLoader() {
  const loader = document.querySelector('.loader');
  if (loader) loader.classList.remove('visible');
}

const loadMoreBtn = document.querySelector('.load-more');
const endMessage = document.querySelector('.end-message');

export function showLoadMoreButton() {
  if (loadMoreBtn) loadMoreBtn.classList.remove('is-hidden');
}

export function hideLoadMoreButton() {
  if (loadMoreBtn) loadMoreBtn.classList.add('is-hidden');
}

export function showEndMessage() {
  if (endMessage) endMessage.classList.remove('is-hidden');
}

export function hideEndMessage() {
  if (endMessage) endMessage.classList.add('is-hidden');
}
