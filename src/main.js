import './css/styles.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
} from './js/render-functions';

// селекторы
const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.loader');
const endMessage = document.querySelector('.end-message'); // <-- Добавили

// если каких-то элементов нет
if (!form || !input || !gallery || !loader || !loadMoreBtn || !endMessage) {
  console.error(
    'Missing required DOM elements. Check that .form, input[name="search-text"], .gallery, .loader, .load-more and .end-message exist in index.html'
  );
}

let query = '';
let page = 1;
let totalHits = 0;
const perPage = 15;

// Подвешиваем обработчики
if (form) form.addEventListener('submit', onSearch);
if (loadMoreBtn) loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(event) {
  event.preventDefault();

  if (!input) return;

  query = input.value.trim();
  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  // сбрасываем состояние
  page = 1;
  totalHits = 0;
  clearGallery();
  hideLoadMoreButton();
  hideEndMessage(); // <-- Добавили
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    if (!data || !Array.isArray(data.hits)) {
      throw new Error('Unexpected API response');
    }

    if (data.hits.length === 0) {
      iziToast.info({
        message: 'No images found for your request.',
        position: 'topRight',
      });
      hideLoadMoreButton();
      return;
    }

    createGallery(data.hits);
    totalHits = data.totalHits || 0;

    if (totalHits > perPage) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      showEndMessage(); // <-- Заменили iziToast
    }
  } catch (error) {
    console.error('Search error:', error);
    iziToast.error({
      message: 'Something went wrong! Try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  if (!query) return;

  page += 1;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(query, page);

    if (!data || !Array.isArray(data.hits)) {
      throw new Error('Unexpected API response');
    }

    if (data.hits.length === 0) {
      showEndMessage(); // <-- Заменили iziToast
      hideLoadMoreButton();
      return;
    }

    createGallery(data.hits);
    smoothScroll();

    const totalLoaded = page * perPage;
    if (totalLoaded >= totalHits) {
      hideLoadMoreButton();
      showEndMessage(); // <-- Заменили iziToast
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    console.error('Load more error:', error);
    iziToast.error({
      message: 'Something went wrong! Try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

function showLoadMoreButton() {
  if (loadMoreBtn) loadMoreBtn.classList.remove('is-hidden');
}

function hideLoadMoreButton() {
  if (loadMoreBtn) loadMoreBtn.classList.add('is-hidden');
}

// ----- 👇 Новые функции 👇 -----
function showEndMessage() {
  if (endMessage) endMessage.classList.remove('is-hidden');
}

function hideEndMessage() {
  if (endMessage) endMessage.classList.add('is-hidden');
}
// ----- 👆 Новые функции 👆 -----

function smoothScroll() {
  if (!gallery) return;
  const firstCard =
    gallery.querySelector('.photo-card') || gallery.firstElementChild;
  if (!firstCard) return;
  const { height } = firstCard.getBoundingClientRect();
  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
