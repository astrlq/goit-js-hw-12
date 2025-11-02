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

// селекторы — убедись, что такие элементы есть в index.html
const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('.loader');

// если каких-то элементов нет — сообщим в консоль и прекратим (чтобы не ломать логику)
if (!form || !input || !gallery || !loader) {
  console.error(
    'Missing required DOM elements. Check that .form, input[name="search-text"], .gallery and .loader exist in index.html'
  );
}

let query = '';
let page = 1;
let totalHits = 0;
const perPage = 15;

// Подвешиваем обработчики только если форма есть
if (form) form.addEventListener('submit', onSearch);
// loadMoreBtn может быть null (если в html не добавили) — поэтому проверяем
if (loadMoreBtn) loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(event) {
  event.preventDefault();

  // защитимся от ситуации, когда селектор не найден
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
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    // если структура ответа неожидана
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

    // показываем кнопку только если есть ещё результаты
    if (totalHits > perPage) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
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
  // защитимся если нет query
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
      // ничего не пришло — конец коллекции
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
      hideLoadMoreButton();
      return;
    }

    createGallery(data.hits);
    smoothScroll();

    const totalLoaded = page * perPage;
    if (totalLoaded >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
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

function smoothScroll() {
  if (!gallery) return;
  // возьмём последнюю добавленную карточку (чтобы прокрутка корректно работала при разных разметках)
  const firstCard =
    gallery.querySelector('.photo-card') || gallery.firstElementChild;
  if (!firstCard) return;
  const { height } = firstCard.getBoundingClientRect();
  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
