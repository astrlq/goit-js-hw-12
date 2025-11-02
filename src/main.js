import './css/styles.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  initLightbox,
  showLoadMoreButton,
  hideLoadMoreButton,
  showEndMessage,
  hideEndMessage,
} from './js/render-functions';

// --- Елементи DOM ---
const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.loader');
const endMessage = document.querySelector('.end-message');

// --- Змінні стану ---
const perPage = 15; // Кількість зображень на сторінку (з pixabay-api.js)
let query = '';
let page = 1;
let totalHits = 0;

// --- Ініціалізація Lightbox ---
const lightbox = initLightbox();

// --- Функція прокрутки сторінки (для зручності) ---
function scrollGallery() {
  const galleryItemHeight =
    gallery.firstElementChild.getBoundingClientRect().height;
  window.scrollBy({
    top: galleryItemHeight * 2, // Прокрутка на дві висоти елемента
    behavior: 'smooth',
  });
}

// --- Головна функція пошуку ---
async function fetchImages() {
  showLoader();
  hideEndMessage();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;
    const images = data.hits;

    if (images.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      clearGallery();
      return;
    }

    createGallery(images);

    // Логіка керування кнопкою "Load More"
    const loadedImagesCount = page * perPage;

    if (loadedImagesCount >= totalHits) {
      showEndMessage();
    } else {
      showLoadMoreButton();
    }

    // Прокрутка для завантаження Load More
    if (page > 1) {
      scrollGallery();
    }
  } catch (error) {
    iziToast.error({
      message: `Error fetching images: ${error.message}`,
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

// --- Обробник відправки форми ---
async function onSearch(event) {
  event.preventDefault();

  const newQuery = input.value.trim();

  if (newQuery === '') {
    // Не дозволяти пустий пошук
    iziToast.warning({
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  if (newQuery === query) {
    // Якщо запит той самий, не робимо повторний пошук
    return;
  }

  query = newQuery;
  page = 1; // Скидаємо сторінку на першу
  clearGallery(); // Очищаємо галерею перед новим пошуком
  hideEndMessage();

  await fetchImages();
}

// --- Обробник кнопки "Load More" ---
async function onLoadMore() {
  page += 1;
  hideLoadMoreButton();
  await fetchImages();
}

// --- Прив'язка обробників подій ---
if (form) form.addEventListener('submit', onSearch);
if (loadMoreBtn) loadMoreBtn.addEventListener('click', onLoadMore);
